import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    useTable,
    useSortBy,
    usePagination,
    useGlobalFilter,
} from "react-table";
import { PopupContext } from "../../PopupContext";
import { resolveLookupOptions } from "./utils/tableHelpers";
import TableHeader from "./components/TableHeader";
import FilterSection from "./components/FilterSection";
import TableBody from "./components/TableBody";
import TableActions from "./components/TableActions";
import Pagination from "./components/Pagination";
import CandidateButtonPopup from "../../CandidateButtonPopup";
import { router } from "@inertiajs/react";
import axios from "axios";
import useTableData from "./hooks/useTableData";

const Table = ({
    columns: initialColumns,
    data: rawData,
    viewForm,
    buttons,
    popups,
    structuredFormFields,
    formSettings = {},
    disableRowClick = true,
    singleSelectMode = true,
    vsetts = {},
    updateInterval = 30000,
}) => {
    // ... other state declarations remain the same ...
    const [activePopup, setActivePopup] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCells, setSelectedCells] = useState([]);
    const [selectedCellData, setSelectedCellData] = useState([]); // Add this line
    const [selectedToggleValues, setSelectedToggleValues] = useState([]); // New state for toggle values
    const [parsedButtons, setParsedButtons] = useState([]);
    const [parsedPopups, setParsedPopups] = useState({});
    const [searchValue, setSearchValue] = useState("");
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [filterValues, setFilterValues] = useState({});
    const [selectedDates, setSelectedDates] = useState({});
    const [visibleColumns, setVisibleColumns] = useState(() =>
        initialColumns.map((col) =>
            typeof col === "string" ? col : col.Header
        )
    );
    const [massCellSelect, setMassCellSelect] = useState(false);

    const {
        tableData,
        currentData,
        isLoading,
        error,
        lastUpdateTime,
        pollingEnabled,
        setPollingEnabled,
        refreshData,
    } = useTableData(
        rawData,
        initialColumns,
        vsetts,
        updateInterval,
        filterValues,
        searchValue
    );

    const columns = useMemo(
        () =>
            initialColumns.map((col) => ({
                Header: typeof col === "string" ? col : col.Header,
                accessor: (row) => {
                    // Check both the exact case and lowercase version of the key
                    const value = row[col] || row[col?.toLowerCase()];
                    // Return empty string if value is null/undefined to avoid rendering issues
                    return value ?? "";
                },
            })),
        [initialColumns]
    );

    // Calculate dependent column values
    const dependentColumnValues = useMemo(() => {
        const dataset = currentData
            ? Array.isArray(currentData)
                ? currentData
                : Object.values(currentData)
            : [];

        const filteredData = dataset.filter((row) => {
            if (!filterValues || Object.keys(filterValues).length === 0) {
                return true;
            }

            return Object.entries(filterValues).every(
                ([columnId, selectedValues]) => {
                    if (!selectedValues || selectedValues.length === 0)
                        return true;
                    const value = row[columnId] || row[columnId?.toLowerCase()];
                    return value && selectedValues.includes(value.toString());
                }
            );
        });

        const availableOptions = {};
        Object.keys(filterValues).forEach((columnName) => {
            const uniqueValues = new Set();
            filteredData.forEach((row) => {
                const value = row[columnName] || row[columnName?.toLowerCase()];
                if (value) uniqueValues.add(value.toString());
            });
            availableOptions[columnName] = Array.from(uniqueValues).sort();
        });

        return availableOptions;
    }, [currentData, filterValues]);

    const parseCellValue = useCallback((value) => {
        if (!value || typeof value !== "string") return null;

        const toggleSelectMatch = value.match(/toggleSelect\('([^']+)'\)/);
        if (toggleSelectMatch) {
            return {
                type: "toggleSelect",
                value: toggleSelectMatch[1],
            };
        }

        const runPopButtonMatch = value.match(
            /runPopButton\('([^']+)',\s*'([^']+)',\s*'([^']+)'\s*(?:,\s*'([^']+)')?\s*(?:,\s*'([^']+)')?\)/
        );
        if (runPopButtonMatch) {
            return {
                type: "runPopButton",
                data: {
                    popupId: runPopButtonMatch[1],
                    fieldsString: runPopButtonMatch[2],
                    valuesString: runPopButtonMatch[3],
                    saveUrl: runPopButtonMatch[4],
                    saveData: runPopButtonMatch[5],
                },
            };
        }

        return null;
    }, []);

    const handleRowClick = useCallback(
        (row) => {
            const candidateData = row.original;
            const id = candidateData.id || candidateData.DocID;
            router.get(
                route("candidates.edit", {
                    viewForm: viewForm,
                    id: id,
                }),
                {
                    preserveState: true,
                    preserveScroll: true,
                }
            );
        },
        [viewForm]
    );

    // Table instance setup
    const tableInstance = useTable(
        {
            columns,
            data: currentData || [],
            initialState: {
                pageIndex: 0,
                pageSize: 10,
            },
            autoResetPage: false,
            autoResetSortBy: false,
            autoResetFilters: false,
        },
        useGlobalFilter,
        useSortBy,
        usePagination
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
        setGlobalFilter,
    } = tableInstance;

    const findCellByToggleValue = useCallback(
        (value) => {
            for (const row of page) {
                for (const cell of row.cells) {
                    const parsedCell = parseCellValue(cell.value);
                    if (
                        parsedCell?.type === "toggleSelect" &&
                        parsedCell.value === value
                    ) {
                        return { cell, row, column: cell.column };
                    }
                }
            }
            return null;
        },
        [page, parseCellValue]
    );

    const isCellSelected = useCallback(
        (cellInfo) => {
            if (!massCellSelect) return false;
            const cellId = `${cellInfo.row.id}-${cellInfo.column.id}`;
            return selectedCells.includes(cellId);
        },
        [selectedCells, massCellSelect]
    );

    const handleCellClick = useCallback(
        (cellInfo) => {
            if (!cellInfo?.cell) return;

            const parsedCell = parseCellValue(cellInfo.cell.value);
            console.log("Cell Click Debug:", {
                parsedCell,
                disableRowClick,
                massCellSelect,
                cellValue: cellInfo.cell.value,
            });

            // Handle the four conditions:
            // 1. massCellSelect false & disableRowClick true
            if (!massCellSelect && disableRowClick) {
                if (parsedCell?.type === "runPopButton") {
                    const {
                        popupId,
                        fieldsString,
                        valuesString,
                        saveUrl,
                        saveData,
                    } = parsedCell.data;
                    const fields = fieldsString.split("~");
                    const values = valuesString.split("~");
                    const initialData = {};
                    fields.forEach((field, index) => {
                        initialData[field] = values[index] || "";
                    });

                    const popupConfig = parsedPopups[popupId];
                    if (popupConfig) {
                        setActivePopup({
                            ...popupConfig,
                            initialData,
                            saveUrl: saveUrl || formSettings?.saveURL || "",
                            saveData: saveData || formSettings?.saveData || "",
                        });
                    }
                }
                return;
            }

            // 2. massCellSelect false & disableRowClick false
            if (!massCellSelect && !disableRowClick) {
                if (handleRowClick) {
                    handleRowClick(cellInfo.row);
                }
                return;
            }

            // 3 & 4. massCellSelect true (handle both row and cell selection)
            if (massCellSelect && parsedCell?.type === "toggleSelect") {
                const toggleValue = parsedCell.value;
                console.log("Toggle value found:", toggleValue);

                setSelectedToggleValues((prev) => {
                    const newValues = prev.includes(toggleValue)
                        ? prev.filter((v) => v !== toggleValue)
                        : [...prev, toggleValue];
                    console.log("Updated selected toggle values:", newValues);
                    return newValues;
                });

                // Also update visual selection state
                setSelectedCells((prev) => {
                    const cellId = `${cellInfo.row.id}-${cellInfo.column.id}`;
                    return prev.includes(cellId)
                        ? prev.filter((id) => id !== cellId)
                        : [...prev, cellId];
                });
            }
        },
        [
            massCellSelect,
            disableRowClick,
            handleRowClick, // Include handleRowClick in the dependency array
            parsedPopups,
            formSettings,
            parseCellValue,
        ]
    );

    const handleSearch = (value) => {
        setSearchValue(value);
        setGlobalFilter(value || undefined);
    };

    const clearAllFilters = () => {
        setFilterValues({});
        setSearchValue("");
        setGlobalFilter(undefined);
    };

    const handleFilterChange = (columnId, values) => {
        setFilterValues((prev) => {
            const newFilters = { ...prev };
            if (values.length === 0) {
                delete newFilters[columnId];
            } else {
                newFilters[columnId] = values;
            }

            if (columnId === "Location") {
                delete newFilters["Job Type"];
            }

            return newFilters;
        });
    };

    const handleDropdownChange = async (button, value) => {
        try {
            setIsSubmitting(true);
            const popupConfig = parsedPopups[button.popupId];

            if (!popupConfig) return;

            const submitButton = popupConfig.buttons.find(
                (btn) =>
                    btn.name.toLowerCase() === "change" ||
                    btn.name.toLowerCase() === "submit" ||
                    btn.updates
            );

            if (!submitButton) return;

            const field = popupConfig.fields[0];
            const updates = {
                ...submitButton.updates,
                [field]: value,
            };

            await router.post(route("candidates.store"), {
                changes: updates,
                saveUrl: button.saveUrl || formSettings?.saveURL || "",
                saveData: button.saveData || formSettings?.saveData || "",
            });
        } catch (error) {
            console.error("Error handling dropdown change:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCalendarChange = async (button, date) => {
        try {
            setIsSubmitting(true);
            const popupConfig = parsedPopups[button.popupId];
            if (!popupConfig) return;

            const submitButton = popupConfig.buttons.find(
                (btn) =>
                    btn.updates ||
                    btn.name.toLowerCase() === "submit" ||
                    btn.name.toLowerCase() === "update"
            );

            if (!submitButton) return;

            setSelectedDates((prev) => ({
                ...prev,
                [button.name]: date,
            }));

            const updates = {
                ...submitButton.updates,
                datelookup: date,
            };

            await router.post(route("candidates.store"), {
                changes: updates,
                saveUrl: button.saveUrl || formSettings?.saveURL || "",
                saveData: button.saveData || formSettings?.saveData || "",
            });
        } catch (error) {
            console.error("Error handling calendar change:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePopupSubmit = async (updates) => {
        try {
            setIsSubmitting(true);

            const submissionData = {
                ...updates,
                selectedToggleValues: selectedToggleValues,
            };

            await router.post(route("candidates.store"), {
                changes: submissionData,
                saveUrl: activePopup?.saveUrl || formSettings?.saveURL || "",
                saveData: activePopup?.saveData || formSettings?.saveData || "",
            });

            setActivePopup(null);
            setSelectedCells([]);
            setSelectedToggleValues([]);
        } catch (error) {
            console.error("Popup submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Use memo for popup context value
    const popupContextValue = useMemo(
        () => ({
            setActivePopup,
            formFields: structuredFormFields,
            formSettings: {
                ...popups,
                saveUrl: formSettings?.saveURL || "",
                saveData: formSettings?.saveData || "",
            },
            handlePopupSubmit: async (updates) => {
                try {
                    setIsSubmitting(true);
                    await handlePopupSubmit(updates);
                } catch (error) {
                    console.error("Error submitting popup:", error);
                } finally {
                    setIsSubmitting(false);
                }
            },
            selectedToggleValues: [],
            massCellSelect,
        }),
        [popups, formSettings, structuredFormFields, massCellSelect]
    );

    // Log selectedToggleValues whenever it changes
    useEffect(() => {
        console.log("Selected Toggle Values:", selectedToggleValues);
    }, [selectedToggleValues]);

    // Setup global toggleSelect function
    useEffect(() => {
        window.toggleSelect = (value) => {
            console.log("Global toggleSelect called with:", value);
            setSelectedToggleValues((prev) => {
                const newValues = prev.includes(value)
                    ? prev.filter((v) => v !== value)
                    : [...prev, value];
                console.log(
                    "Updated selected toggle values (global):",
                    newValues
                );
                return newValues;
            });

            // Update visual selection state as well
            const matchingCell = findCellByToggleValue(value);
            if (matchingCell) {
                setSelectedCells((prev) => {
                    const cellId = `${matchingCell.row.id}-${matchingCell.column.id}`;
                    return prev.includes(cellId)
                        ? prev.filter((id) => id !== cellId)
                        : [...prev, cellId];
                });
            }
        };

        return () => {
            delete window.toggleSelect;
        };
    }, []);

    useEffect(() => {
        if (buttons && popups) {
            const buttonsList = buttons.split("@@").map((buttonStr) => {
                const [
                    name,
                    icon,
                    popupId,
                    fieldString,
                    valueString,
                    saveUrl,
                    saveData,
                    type = "button",
                    style = "",
                ] = buttonStr.split(";");
                return {
                    name,
                    icon,
                    popupId: popupId?.replace("loadPop_", ""),
                    fields: fieldString ? fieldString.split("~") : [],
                    values: valueString ? valueString.split("~") : [],
                    saveUrl: saveUrl || "",
                    saveData: saveData || "",
                    type: type?.toLowerCase() || "button",
                    style: style || "",
                };
            });
            setParsedButtons(buttonsList);

            const popupsMap = {};
            popups.split("@@").forEach((popupStr) => {
                const [id, title, columns, fields, buttonStr] =
                    popupStr.split("~");
                popupsMap[id] = {
                    id,
                    title,
                    columns: parseInt(columns),
                    fields: fields.split(";"),
                    buttons: buttonStr.split("$$").map((btn) => {
                        const [name, ...actions] = btn.split(";");
                        if (
                            actions.length === 1 &&
                            actions[0] === "closePopup()"
                        ) {
                            return { name, action: "closePopup" };
                        }
                        const updates = {};
                        actions.forEach((update) => {
                            const [key, value] = update.split("=");
                            if (key && value) {
                                updates[key] = value.startsWith("$")
                                    ? value
                                    : value.trim();
                            }
                        });
                        return { name, updates };
                    }),
                };
            });
            setParsedPopups(popupsMap);
        }
    }, [buttons, popups]);

    return (
        <PopupContext.Provider value={popupContextValue}>
            <div className="flex flex-col h-full">
                <TableHeader
                    pollingEnabled={pollingEnabled}
                    setPollingEnabled={setPollingEnabled}
                    visibleColumns={visibleColumns}
                    setVisibleColumns={setVisibleColumns}
                    searchValue={searchValue}
                    setSearchValue={handleSearch}
                    showAdvancedSearch={showAdvancedSearch}
                    setShowAdvancedSearch={setShowAdvancedSearch}
                    initialColumns={initialColumns}
                    handleSearch={handleSearch}
                    clearAllFilters={clearAllFilters}
                    filterValues={filterValues}
                    showColumnSelector={showColumnSelector}
                    setShowColumnSelector={setShowColumnSelector}
                    massCellSelect={massCellSelect}
                    setMassCellSelect={setMassCellSelect}
                />

                <FilterSection
                    crucialFilters={vsetts.tablefilters?.split(";") || []}
                    parsedButtons={parsedButtons}
                    filterValues={filterValues}
                    handleFilterChange={handleFilterChange}
                    handleDropdownChange={handleDropdownChange}
                    handleCalendarChange={handleCalendarChange}
                    dependentColumnValues={dependentColumnValues}
                    isSubmitting={isSubmitting}
                    structuredFormFields={structuredFormFields}
                    parsedPopups={parsedPopups}
                    selectedDates={selectedDates}
                    resolveLookupOptions={resolveLookupOptions}
                    isLoading={isLoading}
                />

                <TableActions
                    parsedButtons={parsedButtons}
                    setActivePopup={setActivePopup}
                    parsedPopups={parsedPopups}
                    selectedCellData={selectedCellData}
                    isSubmitting={isSubmitting}
                />

                <TableBody
                    getTableProps={getTableProps}
                    getTableBodyProps={getTableBodyProps}
                    headerGroups={headerGroups}
                    prepareRow={prepareRow}
                    page={page}
                    disableRowClick={disableRowClick}
                    handleCellClick={handleCellClick}
                    isSubmitting={isSubmitting}
                    isCellSelected={isCellSelected}
                    massCellSelect={massCellSelect}
                    handleRowClick={handleRowClick}
                    isLoading={isLoading}
                />

                <Pagination
                    canPreviousPage={canPreviousPage}
                    canNextPage={canNextPage}
                    pageCount={pageCount}
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    gotoPage={gotoPage}
                    nextPage={nextPage}
                    previousPage={previousPage}
                    pageOptions={pageOptions}
                />

                {activePopup && (
                    <CandidateButtonPopup
                        isOpen={true}
                        onClose={() => setActivePopup(null)}
                        popup={activePopup}
                        formFields={structuredFormFields}
                        formSettings={formSettings}
                        handleSubmit={handlePopupSubmit}
                        isSubmitting={isSubmitting}
                    />
                )}
            </div>
        </PopupContext.Provider>
    );
};

export default Table;

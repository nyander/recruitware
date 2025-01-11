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
    // State Management
    const [activePopup, setActivePopup] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCells, setSelectedCells] = useState([]);
    const [selectedCellData, setSelectedCellData] = useState([]);
    const [parsedButtons, setParsedButtons] = useState([]);
    const [parsedPopups, setParsedPopups] = useState({});
    const [searchValue, setSearchValue] = useState("");
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [filterValues, setFilterValues] = useState({});
    const [visibleColumns, setVisibleColumns] = useState(() =>
        initialColumns.map((col) =>
            typeof col === "string" ? col : col.Header
        )
    );
    const [pollingEnabled, setPollingEnabled] = useState(true);
    const [tableData, setTableData] = useState(rawData);
    const [currentData, setCurrentData] = useState(rawData);
    const [selectedDates, setSelectedDates] = useState({});
    const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Memoized Values
    const columns = useMemo(
        () =>
            initialColumns.map((col) => ({
                Header: typeof col === "string" ? col : col.Header,
                accessor: (row) => {
                    const value = row[col] || row[col?.toLowerCase()];
                    return value ?? "";
                },
            })),
        [initialColumns]
    );

    // Extract unique column values for filters
    const uniqueColumnValues = useMemo(() => {
        const values = {};
        const processData = Array.isArray(currentData)
            ? currentData
            : Object.values(currentData);

        initialColumns.forEach((col) => {
            const columnId = typeof col === "string" ? col : col.Header;
            if (!values[columnId]) {
                const uniqueVals = new Set();
                processData.forEach((row) => {
                    let value = row[columnId] || row[columnId?.toLowerCase()];
                    if (value !== undefined && value !== null && value !== "") {
                        value = value.toString().replace(/<[^>]*>/g, "");
                        uniqueVals.add(value);
                    }
                });
                values[columnId] = Array.from(uniqueVals).sort();
            }
        });

        return values;
    }, [currentData, initialColumns]);

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

    // Table Instance
    const tableInstance = useTable(
        {
            columns,
            data: currentData,
            initialState: { pageIndex: 0, pageSize: 10 },
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

    // Event Handlers
    const handleCellClick = useCallback(
        ({ cell, row }) => {
            if (disableRowClick) {
                const cellValue = cell.value?.toString() || "";

                // Check for toggleSelect pattern
                const toggleSelectMatch = cellValue.match(
                    /toggleSelect\('([^']+)'\)/
                );
                if (toggleSelectMatch) {
                    console.log("picking up toggleSelect", {
                        value: toggleSelectMatch[1], // This will capture the ID passed to toggleSelect
                    });
                    return; // Exit early after handling toggleSelect
                }

                // Existing runPopButton logic
                const runPopButtonMatch = cellValue.match(
                    /runPopButton\('([^']+)',\s*'([^']+)',\s*'([^']+)'\s*(?:,\s*'([^']+)')?\s*(?:,\s*'([^']+)')?\)/
                );

                if (runPopButtonMatch) {
                    const [
                        _,
                        popupId,
                        fieldsString,
                        valuesString,
                        saveUrl,
                        saveData,
                    ] = runPopButtonMatch;

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
            } else {
                handleRowClick(row);
            }
        },
        [disableRowClick, parsedPopups, formSettings]
    );

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
            await router.post(route("candidates.store"), {
                changes: updates,
                saveUrl: activePopup?.saveUrl || formSettings?.saveURL || "",
                saveData: activePopup?.saveData || formSettings?.saveData || "",
            });
            setActivePopup(null);
            setSelectedCells([]);
            setSelectedCellData([]);
        } catch (error) {
            console.error("Popup submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
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

    const handleSearch = (value) => {
        setSearchValue(value);
        setGlobalFilter(value || undefined);
    };

    const clearAllFilters = () => {
        setFilterValues({});
        setSearchValue("");
        setGlobalFilter(undefined);
    };

    // Effects
    useEffect(() => {
        if (buttons && popups) {
            const parsedBtn = buttons.split("@@").map((buttonStr) => {
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

                const condition =
                    fieldString?.includes("=") || fieldString?.includes("!=")
                        ? fieldString
                        : null;

                return {
                    name,
                    icon,
                    popupId: popupId?.replace("loadPop_", ""),
                    fields:
                        !condition && fieldString ? fieldString.split("~") : [],
                    values: valueString ? valueString.split("~") : [],
                    saveUrl: saveUrl || "",
                    saveData: saveData || "",
                    type: type?.toLowerCase() || "button",
                    style: style || "",
                };
            });
            setParsedButtons(parsedBtn);

            const popupsMap = {};
            popups.split("@@").forEach((popupStr) => {
                const [id, title, columns, fields, buttonStr] =
                    popupStr.split("~");
                const popupButtons = buttonStr.split("$$").map((btn) => {
                    const [name, ...actions] = btn.split(";");

                    if (actions.length === 1 && actions[0] === "closePopup()") {
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
                });

                popupsMap[id] = {
                    id,
                    title,
                    columns: parseInt(columns),
                    fields: fields.split(";"),
                    buttons: popupButtons,
                };
            });
            setParsedPopups(popupsMap);
        }
    }, [buttons, popups]);

    // Data polling effect
    useEffect(() => {
        let intervalId;

        const pollForUpdates = async () => {
            if (!pollingEnabled || !vsetts?.viewform) return;

            try {
                const processedUrl = vsetts?.url?.replace(
                    /\[RND\]/g,
                    Math.random().toString(36).substring(7)
                );
                const processedQuery = vsetts?.query?.replace(/\^/g, ";");
                const processedReturn = vsetts?.["return-list"]?.replace(
                    /\^/g,
                    ";"
                );

                const response = await axios.get(route("candidates.poll"), {
                    params: {
                        call: vsetts?.viewform,
                        url: processedUrl,
                        query: processedQuery,
                        ret: processedReturn,
                    },
                });

                if (response.data?.data) {
                    const processedData = Array.isArray(response.data.data)
                        ? response.data.data
                        : Object.values(response.data.data || {});

                    if (processedData.length > 0) {
                        setTableData(processedData);
                        setCurrentData(processedData);
                        setLastUpdateTime(Date.now());
                    }
                }
            } catch (error) {
                console.error("Polling error:", error);
                setPollingEnabled(false);
            }
        };

        if (pollingEnabled) {
            pollForUpdates();
            intervalId = setInterval(pollForUpdates, updateInterval);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [pollingEnabled, vsetts?.viewform, updateInterval, vsetts]);

    // Apply filters effect
    useEffect(() => {
        const filteredData = Array.isArray(tableData)
            ? tableData
            : Object.values(tableData || {});

        let filtered = [...filteredData];

        // Apply filters
        Object.entries(filterValues).forEach(([columnId, selectedValues]) => {
            if (selectedValues && selectedValues.length > 0) {
                filtered = filtered.filter((row) => {
                    const value = row[columnId] || row[columnId?.toLowerCase()];
                    return selectedValues.includes(value?.toString());
                });
            }
        });

        // Apply search filter
        if (searchValue) {
            const searchLower = searchValue.toLowerCase();
            filtered = filtered.filter((row) =>
                Object.values(row).some((value) =>
                    String(value).toLowerCase().includes(searchLower)
                )
            );
        }

        setCurrentData(filtered);
    }, [tableData, filterValues, searchValue]);

    const popupContextValue = useMemo(
        () => ({
            setActivePopup,
            formFields: structuredFormFields,
            formSettings: {
                ...popups,
                saveUrl: formSettings?.saveURL || "",
                saveData: formSettings?.saveData || "",
            },
            handlePopupSubmit,
        }),
        [popups, formSettings, structuredFormFields]
    );

    // Extract crucial filters from vsetts
    useEffect(() => {
        if (vsetts.tablefilters) {
            const filters = vsetts.tablefilters
                .split(";")
                .map((filter) => filter.trim());
            console.log("Crucial Filters:", filters);
            console.log("Table Filters from vsetts:", vsetts.tablefilters);
        }
    }, [vsetts.tablefilters]);

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

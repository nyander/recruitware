import React, { useState, useMemo, useEffect, useRef } from "react";
import {
    useTable,
    useSortBy,
    usePagination,
    useGlobalFilter,
} from "react-table";
import { PopupContext } from "../PopupContext";
import CellRenderer from "./CellRenderer";
import ButtonPopup from "../CandidateButtonPopup";
import { router } from "@inertiajs/react";
import { Search, Filter, ChevronDown, X } from "lucide-react";
import axios from "axios";

// Update the MultiSelectDropdown component to handle disabled state
const MultiSelectDropdown = ({
    options,
    value = [],
    onChange,
    placeholder,
    unavailableSelections = [],
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const displayValue = value.length
        ? `${value.length} selected${
              unavailableSelections.length
                  ? ` (${unavailableSelections.length} filtered)`
                  : ""
          }`
        : placeholder;

    return (
        <div className="relative">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full border rounded-md p-2 cursor-pointer flex justify-between items-center bg-white
                    ${
                        unavailableSelections.length > 0
                            ? "border-yellow-300"
                            : ""
                    }`}
            >
                <span className="text-sm truncate">{displayValue}</span>
                <ChevronDown
                    className={`w-4 h-4 transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </div>
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                    {options.length === 0 && (
                        <div className="p-2 text-sm text-gray-500 italic">
                            No options available with current filters
                        </div>
                    )}
                    {options.map((option, index) => (
                        <label
                            key={index}
                            className="flex items-center p-2 hover:bg-gray-50"
                        >
                            <input
                                type="checkbox"
                                checked={value.includes(option)}
                                onChange={(e) => {
                                    const newValue = e.target.checked
                                        ? [...value, option]
                                        : value.filter((v) => v !== option);
                                    onChange(newValue);
                                }}
                                className="mr-2"
                            />
                            <span className="text-sm">{option}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

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
    const [activePopup, setActivePopup] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCells, setSelectedCells] = useState([]);
    const [selectedCellData, setSelectedCellData] = useState([]);
    const [parsedButtons, setParsedButtons] = useState([]);
    const [parsedPopups, setParsedPopups] = useState({});
    const [searchValue, setSearchValue] = useState("");
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState(() =>
        initialColumns.map((col) =>
            typeof col === "string" ? col : col.Header
        )
    );
    const [filterValues, setFilterValues] = useState({});
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [crucialFilters, setCrucialFilters] = useState([]);
    const [pollingEnabled, setPollingEnabled] = useState(true);
    const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
    const pollingInterval = useRef(null);
    const [tableData, setTableData] = useState(rawData);
    const [currentData, setCurrentData] = useState(rawData);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        console.log("Hello world:", vsetts?.url, vsetts?.query);
        const pollForUpdates = async () => {
            try {
                const processedUrl = vsetts?.url?.replace(
                    /\[RND\]/g,
                    Math.random().toString(36).substring(7)
                );
                console.log("HERE IS THE PROCESSED QUERY: ", vsetts?.query);
                const processedQuery = vsetts?.query?.replace(/\^/g, ";");
                const processedReturn = vsetts?.["return-list"]?.replace(
                    /\^/g,
                    ";"
                );

                console.log("Polling request details:", {
                    url: processedUrl,
                    query: processedQuery,
                    viewform: vsetts?.viewform,
                    raw_vsetts: vsetts,
                    ret: processedReturn,
                });

                const response = await axios.get(route("candidates.poll"), {
                    params: {
                        call: vsetts?.viewform,
                        url: processedUrl,
                        query: processedQuery,
                        ret: processedReturn,
                    },
                });

                console.log("Polling response:", response.data);

                if (response.data?.data) {
                    // Process the data and ensure it's in the correct format
                    const processedData = Array.isArray(response.data.data)
                        ? response.data.data
                        : Object.values(response.data.data || {});

                    if (processedData.length > 0) {
                        // Update both tableData and currentData states
                        setTableData(processedData);
                        setCurrentData(processedData);
                        setLastUpdateTime(Date.now());
                        console.log("Updated table data:", processedData);
                    }
                }

                // ... rest of the code
            } catch (error) {
                console.error("Polling error details:", {
                    message: error.message,
                    response: error.response?.data,
                    request_config: {
                        url: error.config?.url,
                        params: error.config?.params,
                        headers: error.config?.headers,
                    },
                });
                setPollingEnabled(false);
            }
        };

        let intervalId;
        if (pollingEnabled) {
            // Initial poll
            pollForUpdates();
            // Set up interval
            intervalId = setInterval(pollForUpdates, updateInterval);
        }

        // Cleanup function
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [pollingEnabled, vsetts?.viewform, updateInterval]);

    const togglePolling = () => {
        setPollingEnabled((prev) => !prev);
    };

    // Parse crucial filters from vsetts on mount
    useEffect(() => {
        if (vsetts.tablefilters) {
            const filters = vsetts.tablefilters
                .split(";")
                .map((filter) => filter.trim());
            console.log("Crucial Filters:", filters);
            console.log("Table Filters from vsetts:", vsetts.tablefilters);
            setCrucialFilters(filters);
        }
    }, [vsetts.tablefilters]);

    const renderCrucialFilters = () => {
        if (!crucialFilters.length) return null;

        return (
            <div className="flex flex-wrap gap-4 mt-4">
                {crucialFilters.map((filterName) => {
                    const availableOptions =
                        dependentColumnValues[filterName] || [];
                    const selectedValues = filterValues[filterName] || [];

                    // Calculate unavailable options (options that were previously selected but are no longer available)
                    const unavailableSelections = selectedValues.filter(
                        (value) => !availableOptions.includes(value)
                    );

                    return (
                        <div key={filterName} className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {filterName}
                                <span className="text-xs text-gray-500 ml-2">
                                    ({availableOptions.length} available)
                                </span>
                            </label>
                            <MultiSelectDropdown
                                options={availableOptions}
                                value={selectedValues}
                                onChange={(values) =>
                                    handleFilterChange(filterName, values)
                                }
                                placeholder={`Select ${filterName}`}
                                unavailableSelections={unavailableSelections}
                            />

                            {/* Show selected values as tags */}
                            {selectedValues.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                    {selectedValues.map((value) => (
                                        <span
                                            key={value}
                                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                                ${
                                                    unavailableSelections.includes(
                                                        value
                                                    )
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-blue-100 text-blue-800"
                                                }`}
                                        >
                                            {value}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newValues =
                                                        selectedValues.filter(
                                                            (v) => v !== value
                                                        );
                                                    handleFilterChange(
                                                        filterName,
                                                        newValues
                                                    );
                                                }}
                                                className="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-blue-200 focus:outline-none"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Extract unique values for each column for filters
    // Enhance uniqueColumnValues to handle HTML content
    const uniqueColumnValues = useMemo(() => {
        const values = {};
        const processData = Array.isArray(rawData)
            ? rawData
            : Object.values(rawData);

        console.log("Processing columns for filters:", initialColumns);
        console.log("Crucial filters to process:", crucialFilters);

        // First process crucial filters to ensure they're included
        crucialFilters.forEach((filterName) => {
            const uniqueVals = new Set();
            processData.forEach((row) => {
                // Try both direct and lowercase key
                let value = row[filterName] || row[filterName?.toLowerCase()];
                if (value !== undefined && value !== null && value !== "") {
                    // Remove HTML tags if present
                    value = value.toString().replace(/<[^>]*>/g, "");
                    uniqueVals.add(value);
                }
            });
            values[filterName] = Array.from(uniqueVals).sort();
            console.log(`Values for ${filterName}:`, values[filterName]);
        });

        // Then process remaining columns
        initialColumns.forEach((col) => {
            const columnId = typeof col === "string" ? col : col.Header;
            if (!values[columnId]) {
                const uniqueVals = new Set();
                processData.forEach((row) => {
                    let value = row[columnId] || row[columnId?.toLowerCase()];
                    if (value !== undefined && value !== null && value !== "") {
                        // Remove HTML tags if present
                        value = value.toString().replace(/<[^>]*>/g, "");
                        uniqueVals.add(value);
                    }
                });
                values[columnId] = Array.from(uniqueVals).sort();
            }
        });

        return values;
    }, [rawData, initialColumns, crucialFilters]);

    // Replace the existing dependentColumnValues useMemo with this fixed version
    const dependentColumnValues = useMemo(() => {
        // Early return if no crucial filters defined
        if (!crucialFilters || !crucialFilters.length) {
            return {};
        }

        console.log("Calculating dependent values with filters:", filterValues);

        // Get the base dataset and ensure it's an array
        const dataset = currentData
            ? Array.isArray(currentData)
                ? currentData
                : Object.values(currentData)
            : [];

        // Apply filters to get filtered dataset
        const filteredData = dataset.filter((row) => {
            // If no filters, include all rows
            if (!filterValues || Object.keys(filterValues).length === 0) {
                return true;
            }

            // Check each filter
            return Object.entries(filterValues).every(
                ([columnId, selectedValues]) => {
                    // Skip if no selected values
                    if (!selectedValues || !selectedValues.length) {
                        return true;
                    }

                    // Get value from row (try both case variations)
                    const value = row[columnId] || row[columnId?.toLowerCase()];
                    // Convert value to string for comparison
                    const strValue = value?.toString();

                    return strValue && selectedValues.includes(strValue);
                }
            );
        });

        console.log("Filtered dataset length:", filteredData.length);

        // Calculate available options for each crucial filter
        const availableOptions = {};

        crucialFilters.forEach((columnName) => {
            if (!columnName) return;

            const uniqueValues = new Set();

            filteredData.forEach((row) => {
                const value = (
                    row[columnName] || row[columnName?.toLowerCase()]
                )?.toString();
                if (value) {
                    uniqueValues.add(value);
                }
            });

            availableOptions[columnName] = Array.from(uniqueValues).sort();
        });

        console.log("Available options for filters:", availableOptions);

        return availableOptions;
    }, [currentData, filterValues, crucialFilters]);

    // Parse buttons and popups on mount
    useEffect(() => {
        if (buttons && popups) {
            parseButtonsAndPopups(buttons, popups);
        }
    }, [buttons, popups]);

    const extractPopupParams = (onClickAttr) => {
        if (!onClickAttr) return null;

        const match = onClickAttr.match(
            /runPopButton\('([^']+)',\s*'([^']+)',\s*'([^']+)'\)/
        );
        if (!match) return null;

        const [_, popupId, fieldsString, valuesString] = match;
        const fields = fieldsString.split("~");
        const values = valuesString.split("~");

        const initialData = {};
        fields.forEach((field, index) => {
            initialData[field] = values[index] || "";
        });

        return {
            popupId,
            fields,
            values,
            initialData,
        };
    };

    const parseButtonsAndPopups = (buttonString, popupString) => {
        // Parse buttons
        const buttonsList = buttonString.split("@@").map((buttonStr) => {
            const [
                name,
                icon,
                popupId,
                fieldString,
                valueString,
                saveUrl,
                saveData,
            ] = buttonStr.split(";");
            return {
                name,
                icon,
                popupId: popupId?.replace("loadPop_", ""),
                fields: fieldString ? fieldString.split("~") : [],
                values: valueString ? valueString.split("~") : [],
                saveUrl: saveUrl || "",
                saveData: saveData || "",
            };
        });
        setParsedButtons(buttonsList);

        // Parse popups
        const popupsMap = {};
        popupString.split("@@").forEach((popupStr) => {
            const [id, title, columns, fields, buttonStr] = popupStr.split("~");

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
    };

    const handleRowClick = (row) => {
        if (disableRowClick) return;

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
    };

    // Update the handleCellClick function in your Table component
    const handleCellClick = (cellInfo) => {
        if (!disableRowClick) {
            handleRowClick(cellInfo.row);
            return;
        }

        const cell = cellInfo.cell;
        let cellValue = cell.value || "";

        // Decode URL-encoded characters if present
        if (typeof cellValue === "string") {
            cellValue = cellValue.replace(/%7E/g, "~");

            // Extract runPopButton parameters
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

                console.log("Popup Parameters:", {
                    popupId,
                    fieldsString,
                    valuesString,
                    saveUrl,
                    saveData,
                });

                // Split fields and values
                const fields = fieldsString.split("~");
                const values = valuesString.split("~");

                // Create initial data object
                const initialData = {};
                fields.forEach((field, index) => {
                    let value = values[index] || "";
                    const fieldInfo = structuredFormFields?.[field];
                    const fieldType = fieldInfo?.type?.toLowerCase();

                    switch (fieldType) {
                        case "select":
                            const options = getSelectOptions(
                                field,
                                fieldInfo,
                                structuredFormFields
                            );
                            const matchingOption = options.find(
                                (opt) => opt.value === value
                            );
                            initialData[field] = matchingOption
                                ? matchingOption.value
                                : value;
                            break;

                        case "checkbox":
                            initialData[field] = value
                                ? value.split(";").filter(Boolean)
                                : [];
                            break;

                        default:
                            initialData[field] = value;
                    }
                });

                // Get popup configuration
                const popupConfig = parsedPopups[popupId];
                if (popupConfig) {
                    console.log(
                        "Found popup config for:",
                        popupId,
                        popupConfig
                    );

                    const mergedPopup = {
                        ...popupConfig,
                        initialData,
                        saveUrl: saveUrl || formSettings?.saveURL || "",
                        saveData: saveData
                            ? saveData.replace(/\$/g, "|")
                            : formSettings?.saveData || "",
                    };

                    setActivePopup(mergedPopup);

                    const cellKey = `${cellInfo.row.id}-${cellInfo.column.id}`;
                    setSelectedCells(singleSelectMode ? [cellKey] : [cellKey]);
                    setSelectedCellData([
                        {
                            cellKey,
                            popupParams: {
                                popupId,
                                fields,
                                values,
                                initialData,
                                saveUrl,
                                saveData,
                            },
                            content: cellValue,
                            originalCell: cell,
                        },
                    ]);
                } else {
                    console.error(
                        `Popup configuration not found for ID: ${popupId}`
                    );
                }
            }
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

    const toggleColumnVisibility = (columnId) => {
        setVisibleColumns((prev) => {
            if (prev.includes(columnId)) {
                return prev.filter((id) => id !== columnId);
            }
            return [...prev, columnId];
        });
    };

    const handleSearch = (value) => {
        setSearchValue(value);
        setGlobalFilter(value);
    };

    const handleFilterChange = (columnId, values) => {
        setFilterValues((prev) => {
            const newFilters = {
                ...prev,
                [columnId]: values,
            };

            // If Location is changed, clear Job Type filter
            if (columnId === "Location") {
                newFilters["Job Type"] = [];
            }

            return newFilters;
        });
    };

    const clearAllFilters = () => {
        setFilterValues({});
        setSearchValue("");
        setGlobalFilter("");
    };

    // Apply filters to data
    const filteredData = useMemo(() => {
        let filtered = Array.isArray(tableData)
            ? tableData
            : Object.values(tableData);

        Object.entries(filterValues).forEach(([columnId, selectedValues]) => {
            if (selectedValues && selectedValues.length > 0) {
                filtered = filtered.filter((row) => {
                    const value = row[columnId] || row[columnId?.toLowerCase()];
                    return selectedValues.includes(value?.toString());
                });
            }
        });

        return filtered;
    }, [tableData, filterValues]);

    const columns = useMemo(
        () =>
            initialColumns
                .filter((col) =>
                    visibleColumns.includes(
                        typeof col === "string" ? col : col.Header
                    )
                )
                .map((col) => ({
                    Header: typeof col === "string" ? col : col.Header,
                    accessor: (row) => {
                        // Preserve the raw value exactly as it comes from the data
                        const value = row[col] || row[col?.toLowerCase()];
                        return value ?? "";
                    },
                    Cell: ({ value }) => <CellRenderer value={value} />,
                })),
        [initialColumns, visibleColumns]
    );

    const tableInstance = useTable(
        {
            columns,
            data: filteredData,
            initialState: {
                pageIndex: 0,
                pageSize: 10,
            },
            autoResetPage: false, // Prevent page reset on data change
            autoResetSortBy: false, // Prevent sort reset on data change
            autoResetFilters: false, // Prevent filter reset on data change
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
        setGlobalFilter,
        state: { pageIndex, pageSize },
    } = tableInstance;

    const popupContextValue = {
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
                const selectedData = selectedCellData[0];
                const mergedUpdates = {
                    ...updates,
                    ...(selectedData?.popupParams?.initialData || {}),
                };
                await handlePopupSubmit(mergedUpdates);
            } catch (error) {
                console.error("Error submitting popup:", error);
            } finally {
                setIsSubmitting(false);
            }
        },
    };

    return (
        <PopupContext.Provider value={popupContextValue}>
            <div className="flex flex-col h-full">
                {/* Table Controls */}
                <div className="bg-white px-4 py-3 border-b border-gray-200">
                    <div className="flex flex-col space-y-2">
                        {/* Top Row Controls */}
                        <div className="flex items-center space-x-4">
                            {/* Column Selector */}
                            <div className="relative">
                                <button
                                    onClick={() =>
                                        setShowColumnSelector(
                                            !showColumnSelector
                                        )
                                    }
                                    className="px-3 py-2 border rounded-md text-sm flex items-center space-x-2 hover:bg-gray-50"
                                >
                                    <span>Columns</span>
                                    <ChevronDown className="w-4 h-4" />
                                </button>

                                {showColumnSelector && (
                                    <div className="absolute z-10 mt-1 w-56 bg-white border rounded-md shadow-lg">
                                        <div className="p-2 space-y-1">
                                            {initialColumns.map((col) => {
                                                const columnId =
                                                    typeof col === "string"
                                                        ? col
                                                        : col.Header;
                                                return (
                                                    <label
                                                        key={columnId}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={visibleColumns.includes(
                                                                columnId
                                                            )}
                                                            onChange={() =>
                                                                toggleColumnVisibility(
                                                                    columnId
                                                                )
                                                            }
                                                            className="rounded border-gray-300"
                                                        />
                                                        <span className="text-sm">
                                                            {columnId}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Search Bar */}
                            <div className="flex-1 max-w-md relative">
                                <input
                                    type="text"
                                    value={searchValue}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    placeholder="Search..."
                                    className="w-full px-4 py-2 border rounded-md pl-10"
                                />
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                {searchValue && (
                                    <button
                                        onClick={() => handleSearch("")}
                                        className="absolute right-3 top-2.5"
                                    >
                                        <X className="w-4 h-4 text-gray-400" />
                                    </button>
                                )}
                            </div>

                            {/* Add the polling toggle button here */}
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={togglePolling}
                                    className={`px-3 py-2 rounded-md text-sm flex items-center space-x-2 ${
                                        pollingEnabled
                                            ? "bg-green-100 text-green-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                    {pollingEnabled ? (
                                        <>
                                            <div className="animate-ping h-2 w-2 rounded-full bg-green-400 mr-2" />
                                            Live Updates On
                                        </>
                                    ) : (
                                        <>
                                            <div className="h-2 w-2 rounded-full bg-gray-400 mr-2" />
                                            Live Updates Off
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center">
                                {pollingEnabled && (
                                    <div className="flex items-center mr-4">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                                        <span className="text-sm text-gray-500">
                                            Live Updates
                                        </span>
                                    </div>
                                )}
                                {/* Rest of your table controls */}
                            </div>

                            {/* Advanced Search Toggle */}
                            <button
                                onClick={() =>
                                    setShowAdvancedSearch(!showAdvancedSearch)
                                }
                                className={`px-3 py-2 border rounded-md text-sm flex items-center space-x-2 hover:bg-gray-50 ${
                                    showAdvancedSearch
                                        ? "bg-blue-50 border-blue-200"
                                        : ""
                                }`}
                            >
                                <Filter className="w-4 h-4" />
                                <span>Advanced</span>
                            </button>

                            {/* Clear Filters Button */}
                            {(Object.keys(filterValues).length > 0 ||
                                searchValue) && (
                                <button
                                    onClick={clearAllFilters}
                                    className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>

                        {renderCrucialFilters()}

                        {/* Advanced Search Panel */}
                        {showAdvancedSearch && (
                            <div className="p-4 border rounded-md bg-gray-50 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {columns
                                        .filter(
                                            (column) =>
                                                !crucialFilters.includes(
                                                    column.Header
                                                )
                                        )
                                        .map((column) => (
                                            <div
                                                key={column.Header}
                                                className="space-y-1"
                                            >
                                                <label className="text-sm font-medium text-gray-700">
                                                    {column.Header}
                                                </label>
                                                <MultiSelectDropdown
                                                    options={
                                                        uniqueColumnValues[
                                                            column.Header
                                                        ] || []
                                                    }
                                                    value={
                                                        filterValues[
                                                            column.Header
                                                        ] || []
                                                    }
                                                    onChange={(values) =>
                                                        handleFilterChange(
                                                            column.Header,
                                                            values
                                                        )
                                                    }
                                                    placeholder={`Select ${column.Header}`}
                                                />
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Buttons Section */}
                {parsedButtons.length > 0 && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                        <div className="flex gap-2 justify-end">
                            {parsedButtons.map((button, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        const popupConfig =
                                            parsedPopups[button.popupId];
                                        if (popupConfig) {
                                            const mergedPopup = {
                                                ...popupConfig,
                                                initialData:
                                                    selectedCellData[0]
                                                        ?.popupParams
                                                        ?.initialData || {},
                                                saveUrl:
                                                    button.saveUrl ||
                                                    popupConfig.saveUrl ||
                                                    "",
                                                saveData:
                                                    button.saveData ||
                                                    popupConfig.saveData ||
                                                    "",
                                            };
                                            setActivePopup(mergedPopup);
                                        }
                                    }}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {button.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Table Section */}
                <div className="flex-grow overflow-auto p-4">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
                            <table
                                {...getTableProps()}
                                className="min-w-full divide-y divide-gray-200"
                            >
                                <thead className="bg-[#f8fafc] border-b-2 border-[#213341]">
                                    {headerGroups.map((headerGroup, i) => {
                                        const { key, ...headerGroupProps } =
                                            headerGroup.getHeaderGroupProps();
                                        return (
                                            <tr key={key} {...headerGroupProps}>
                                                {headerGroup.headers.map(
                                                    (column, j) => {
                                                        const {
                                                            key,
                                                            ...columnProps
                                                        } =
                                                            column.getHeaderProps(
                                                                column.getSortByToggleProps()
                                                            );
                                                        return (
                                                            <th
                                                                key={key}
                                                                {...columnProps}
                                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                            >
                                                                <div className="flex items-center space-x-1">
                                                                    <span>
                                                                        {column.render(
                                                                            "Header"
                                                                        )}
                                                                    </span>
                                                                    <span className="text-gray-400">
                                                                        {column.isSorted
                                                                            ? column.isSortedDesc
                                                                                ? " ▼"
                                                                                : " ▲"
                                                                            : ""}
                                                                    </span>
                                                                </div>
                                                            </th>
                                                        );
                                                    }
                                                )}
                                            </tr>
                                        );
                                    })}
                                </thead>
                                <tbody
                                    {...getTableBodyProps()}
                                    className="bg-white"
                                >
                                    {page.map((row, i) => {
                                        prepareRow(row);
                                        const { key, ...rowProps } =
                                            row.getRowProps();
                                        return (
                                            <tr
                                                key={key}
                                                {...rowProps}
                                                onClick={() =>
                                                    !disableRowClick &&
                                                    handleRowClick(row)
                                                }
                                                className={`${
                                                    !disableRowClick
                                                        ? "even:bg-gray-100 hover:bg-gray-200 cursor-pointer"
                                                        : ""
                                                }`}
                                            >
                                                {row.cells.map((cell, j) => {
                                                    const {
                                                        key,
                                                        ...cellProps
                                                    } = cell.getCellProps();
                                                    return (
                                                        <td
                                                            key={key}
                                                            {...cellProps}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCellClick(
                                                                    {
                                                                        cell: cell,
                                                                        row: row,
                                                                        column: cell.column,
                                                                    }
                                                                );
                                                            }}
                                                            className={`px-4 py-3 whitespace-nowrap border-r border-gray-200 ${
                                                                disableRowClick
                                                                    ? "cursor-pointer hover:bg-gray-100"
                                                                    : ""
                                                            } ${
                                                                selectedCells.includes(
                                                                    `${row.id}-${cell.column.id}`
                                                                )
                                                                    ? "bg-blue-100"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {cell.render(
                                                                "Cell"
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => previousPage()}
                            disabled={!canPreviousPage}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                                !canPreviousPage
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => nextPage()}
                            disabled={!canNextPage}
                            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                                !canNextPage
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }`}
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div className="flex gap-x-2 items-center">
                            <span className="text-sm text-gray-700">
                                Page{" "}
                                <span className="font-medium">
                                    {pageIndex + 1}
                                </span>{" "}
                                of{" "}
                                <span className="font-medium">{pageCount}</span>
                            </span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                }}
                                className="ml-2 border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {[10, 20, 30, 40, 50].map((size) => (
                                    <option key={size} value={size}>
                                        Show {size}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <nav
                                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                aria-label="Pagination"
                            >
                                <button
                                    onClick={() => gotoPage(0)}
                                    disabled={!canPreviousPage}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                                        !canPreviousPage
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    <span className="sr-only">First</span>
                                    {"<<"}
                                </button>
                                <button
                                    onClick={() => previousPage()}
                                    disabled={!canPreviousPage}
                                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                                        !canPreviousPage
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    <span className="sr-only">Previous</span>
                                    {"<"}
                                </button>
                                <button
                                    onClick={() => nextPage()}
                                    disabled={!canNextPage}
                                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                                        !canNextPage
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    <span className="sr-only">Next</span>
                                    {">"}
                                </button>
                                <button
                                    onClick={() => gotoPage(pageCount - 1)}
                                    disabled={!canNextPage}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                                        !canNextPage
                                            ? "opacity-50 cursor-not-allowed"
                                            : ""
                                    }`}
                                >
                                    <span className="sr-only">Last</span>
                                    {">>"}
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Popup */}
                {activePopup && (
                    <ButtonPopup
                        isOpen={!!activePopup}
                        onClose={() => setActivePopup(null)}
                        popup={activePopup}
                        formFields={structuredFormFields}
                        handleSubmit={handlePopupSubmit}
                        isSubmitting={isSubmitting}
                    />
                )}
            </div>
        </PopupContext.Provider>
    );
};

export default Table;

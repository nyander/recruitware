import React, { useState } from "react";
import { Search, Filter, ChevronDown, X } from "lucide-react";

const TableHeader = ({
    pollingEnabled,
    setPollingEnabled,
    visibleColumns,
    setVisibleColumns,
    searchValue,
    setSearchValue,
    showAdvancedSearch,
    setShowAdvancedSearch,
    initialColumns,
    handleSearch,
    clearAllFilters,
    filterValues,
    massCellSelect, // Add this prop
    setMassCellSelect, // Add this prop
}) => {
    const [showColumnSelector, setShowColumnSelector] = useState(false);

    const toggleColumnVisibility = (columnId) => {
        setVisibleColumns((prev) => {
            if (prev.includes(columnId)) {
                return prev.filter((id) => id !== columnId);
            }
            return [...prev, columnId];
        });
    };

    const togglePolling = () => {
        setPollingEnabled((prev) => !prev);
    };

    return (
        <div className="bg-white px-4 py-3 border-b border-gray-200">
            <div className="flex flex-col space-y-2">
                {/* Top Row Controls */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={massCellSelect}
                                onChange={() =>
                                    setMassCellSelect(!massCellSelect)
                                }
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-700">
                                Multi Select
                            </span>
                        </label>
                    </div>
                    {/* Column Selector */}
                    <div className="relative">
                        <button
                            onClick={() =>
                                setShowColumnSelector(!showColumnSelector)
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
                            onChange={(e) => handleSearch(e.target.value)}
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

                    {/* Live Updates Toggle */}
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
                    {(Object.keys(filterValues).length > 0 || searchValue) && (
                        <button
                            onClick={clearAllFilters}
                            className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
                        >
                            Clear All Filters
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TableHeader;

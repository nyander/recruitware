import { useState, useMemo } from "react";

const useTableFilters = (initialColumns, rawData, crucialFilters = []) => {
    const [filterValues, setFilterValues] = useState({});
    const [searchValue, setSearchValue] = useState("");
    const [visibleColumns, setVisibleColumns] = useState(() =>
        initialColumns.map((col) =>
            typeof col === "string" ? col : col.Header
        )
    );
    const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

    // Extract unique values for each column for filters
    const uniqueColumnValues = useMemo(() => {
        const values = {};
        const processData = Array.isArray(rawData)
            ? rawData
            : Object.values(rawData);

        // First process crucial filters
        crucialFilters.forEach((filterName) => {
            const uniqueVals = new Set();
            processData.forEach((row) => {
                let value = row[filterName] || row[filterName?.toLowerCase()];
                if (value !== undefined && value !== null && value !== "") {
                    value = value.toString().replace(/<[^>]*>/g, "");
                    uniqueVals.add(value);
                }
            });
            values[filterName] = Array.from(uniqueVals).sort();
        });

        // Then process remaining columns
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
    }, [rawData, initialColumns, crucialFilters]);

    // Calculate dependent column values based on current filters
    const dependentColumnValues = useMemo(() => {
        if (!crucialFilters || !crucialFilters.length) {
            return {};
        }

        const dataset = Array.isArray(rawData)
            ? rawData
            : Object.values(rawData);

        // Apply existing filters to get filtered dataset
        const filteredData = dataset.filter((row) => {
            if (!filterValues || Object.keys(filterValues).length === 0) {
                return true;
            }

            return Object.entries(filterValues).every(
                ([columnId, selectedValues]) => {
                    if (!selectedValues || !selectedValues.length) {
                        return true;
                    }

                    const value = row[columnId] || row[columnId?.toLowerCase()];
                    const strValue = value?.toString();
                    return strValue && selectedValues.includes(strValue);
                }
            );
        });

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

        return availableOptions;
    }, [rawData, filterValues, crucialFilters]);

    const handleFilterChange = (columnId, values) => {
        setFilterValues((prev) => {
            const newFilters = { ...prev };
            if (values.length === 0) {
                delete newFilters[columnId];
            } else {
                newFilters[columnId] = values;
            }

            // Handle dependent filters (e.g., resetting related filters)
            if (columnId === "Location") {
                delete newFilters["Job Type"];
            }

            return newFilters;
        });
    };

    const handleSearch = (value) => {
        setSearchValue(value);
    };

    const clearAllFilters = () => {
        setFilterValues({});
        setSearchValue("");
    };

    return {
        filterValues,
        searchValue,
        visibleColumns,
        showAdvancedSearch,
        uniqueColumnValues,
        dependentColumnValues,
        setVisibleColumns,
        setShowAdvancedSearch,
        handleFilterChange,
        handleSearch,
        clearAllFilters,
    };
};

export default useTableFilters;

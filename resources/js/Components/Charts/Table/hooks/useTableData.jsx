import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useTableData = (
    initialData,
    initialColumns, // Add this parameter
    vsetts = {},
    updateInterval = 30000,
    filterValues = {},
    searchValue = ""
) => {
    const [tableData, setTableData] = useState(initialData);
    const [currentData, setCurrentData] = useState(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
    const [pollingEnabled, setPollingEnabled] = useState(true);

    // Process data helper
    const processData = useCallback(
        (responseData) => {
            if (!responseData) return [];

            // Handle nested data structure
            const rawData =
                responseData?.data?.data || responseData?.data || responseData;

            // Ensure we have an array
            const dataArray = Array.isArray(rawData)
                ? rawData
                : Object.values(rawData || {});

            return dataArray.map((row) => {
                // Process each row to ensure all required fields exist
                const processedRow = { ...row };
                initialColumns.forEach((col) => {
                    const columnKey =
                        typeof col === "string" ? col : col.Header;
                    if (!processedRow.hasOwnProperty(columnKey)) {
                        processedRow[columnKey] = "";
                    }
                });
                return processedRow;
            });
        },
        [initialColumns]
    );

    // Apply filters
    const applyFilters = useCallback(
        (data) => {
            if (!data) return [];

            let filtered = [...data];

            // Apply search filter
            if (searchValue) {
                const searchLower = searchValue.toLowerCase();
                filtered = filtered.filter((row) =>
                    Object.values(row).some((value) =>
                        String(value).toLowerCase().includes(searchLower)
                    )
                );
            }

            // Apply column filters
            Object.entries(filterValues).forEach(
                ([columnId, selectedValues]) => {
                    if (selectedValues?.length > 0) {
                        filtered = filtered.filter((row) => {
                            const value =
                                row[columnId] || row[columnId?.toLowerCase()];
                            return selectedValues.includes(String(value));
                        });
                    }
                }
            );

            return filtered;
        },
        [filterValues, searchValue]
    );

    // Single polling effect
    useEffect(() => {
        const pollForUpdates = async () => {
            if (!vsetts?.viewform) return;

            try {
                setIsLoading(true);

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

                if (response.data) {
                    console.log("Raw response data:", response.data); // Debug log
                    const processedData = processData(response.data);
                    console.log("Processed data:", processedData); // Debug log

                    if (processedData.length > 0) {
                        setTableData(processedData);
                        setLastUpdateTime(Date.now());
                    }
                }
                setError(null);
            } catch (error) {
                console.error("Polling error details:", {
                    message: error.message,
                    response: error.response?.data,
                    config: error.config,
                });
                setError(error.message);
                setPollingEnabled(false);
            } finally {
                setIsLoading(false);
            }
        };

        let intervalId;
        if (pollingEnabled && vsetts?.viewform) {
            pollForUpdates();
            intervalId = setInterval(pollForUpdates, updateInterval);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [pollingEnabled, vsetts, updateInterval, processData]);

    // Effect for applying filters
    useEffect(() => {
        const filteredData = applyFilters(tableData);
        setCurrentData(filteredData);
    }, [tableData, applyFilters]);

    return {
        tableData,
        currentData,
        isLoading,
        error,
        lastUpdateTime,
        pollingEnabled,
        setPollingEnabled,
        refreshData: async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(route("candidates.poll"), {
                    params: {
                        call: vsetts?.viewform,
                        url: vsetts?.url,
                        query: vsetts?.query,
                        ret: vsetts?.["return-list"],
                    },
                });
                if (response.data) {
                    const processedData = processData(response.data);
                    if (processedData.length > 0) {
                        setTableData(processedData);
                        setLastUpdateTime(Date.now());
                    }
                }
            } catch (error) {
                console.error("Refresh error:", error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        },
    };
};

export default useTableData;

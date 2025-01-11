import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useTableData = (
    initialData,
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

    // Memoize poll function to prevent recreation on every render
    const pollForUpdates = useCallback(async () => {
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

            if (response.data?.data) {
                const processedData = Array.isArray(response.data.data)
                    ? response.data.data
                    : Object.values(response.data.data || {});

                if (processedData.length > 0) {
                    setTableData(processedData);
                    setLastUpdateTime(Date.now());
                }
            }
            setError(null);
        } catch (error) {
            console.error("Polling error:", error);
            setError(error.message);
            setPollingEnabled(false);
        } finally {
            setIsLoading(false);
        }
    }, [vsetts]);

    // Apply filters to data
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
                    if (selectedValues && selectedValues.length > 0) {
                        filtered = filtered.filter((row) => {
                            const value =
                                row[columnId] || row[columnId?.toLowerCase()];
                            return selectedValues.includes(value?.toString());
                        });
                    }
                }
            );

            return filtered;
        },
        [filterValues, searchValue]
    );

    // Effect for polling
    useEffect(() => {
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
    }, [pollingEnabled, vsetts?.viewform, updateInterval, pollForUpdates]);

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
        refreshData: pollForUpdates,
    };
};

export default useTableData;

import { createContext, useContext } from "react";

// Define the default context value with TypeScript-like comments for better documentation
const TableContext = createContext({
    // Data state
    tableData: [],
    currentData: [],
    isLoading: false,
    error: null,

    // Filter state
    filterValues: {},
    searchValue: "",
    visibleColumns: [],
    showAdvancedSearch: false,

    // Selection state
    selectedCells: [],
    selectedCellData: [],

    // Popup state
    activePopup: null,
    parsedButtons: [],
    parsedPopups: {},

    // Table settings
    disableRowClick: true,
    formSettings: {},
    structuredFormFields: {},

    // Polling state
    pollingEnabled: true,
    lastUpdateTime: null,

    // Functions for data management
    setTableData: () => {},
    setCurrentData: () => {},
    refreshData: () => {},

    // Functions for filter management
    setFilterValues: () => {},
    handleSearch: () => {},
    handleFilterChange: () => {},
    clearAllFilters: () => {},
    setVisibleColumns: () => {},
    setShowAdvancedSearch: () => {},

    // Functions for selection management
    handleCellClick: () => {},
    handleRowClick: () => {},

    // Functions for popup management
    setActivePopup: () => {},
    handlePopupSubmit: () => {},

    // Functions for polling management
    setPollingEnabled: () => {},
});

// Create a TableProvider component
export const TableProvider = ({ children, value }) => {
    return (
        <TableContext.Provider value={value}>{children}</TableContext.Provider>
    );
};

// Create a custom hook to use the table context
export const useTable = () => {
    const context = useContext(TableContext);
    if (!context) {
        throw new Error("useTable must be used within a TableProvider");
    }
    return context;
};

// Create a custom hook for table data operations
export const useTableOperations = () => {
    const {
        tableData,
        currentData,
        isLoading,
        error,
        setTableData,
        setCurrentData,
        refreshData,
    } = useTable();

    return {
        tableData,
        currentData,
        isLoading,
        error,
        setTableData,
        setCurrentData,
        refreshData,
    };
};

// Create a custom hook for filter operations
export const useTableFilters = () => {
    const {
        filterValues,
        searchValue,
        visibleColumns,
        showAdvancedSearch,
        setFilterValues,
        handleSearch,
        handleFilterChange,
        clearAllFilters,
        setVisibleColumns,
        setShowAdvancedSearch,
    } = useTable();

    return {
        filterValues,
        searchValue,
        visibleColumns,
        showAdvancedSearch,
        setFilterValues,
        handleSearch,
        handleFilterChange,
        clearAllFilters,
        setVisibleColumns,
        setShowAdvancedSearch,
    };
};

// Create a custom hook for selection operations
export const useTableSelection = () => {
    const { selectedCells, selectedCellData, handleCellClick, handleRowClick } =
        useTable();

    return {
        selectedCells,
        selectedCellData,
        handleCellClick,
        handleRowClick,
    };
};

// Create a custom hook for popup operations
export const useTablePopups = () => {
    const {
        activePopup,
        parsedButtons,
        parsedPopups,
        setActivePopup,
        handlePopupSubmit,
    } = useTable();

    return {
        activePopup,
        parsedButtons,
        parsedPopups,
        setActivePopup,
        handlePopupSubmit,
    };
};

// Create a utility function to create the initial context value
export const createTableContextValue = (initialState = {}) => {
    return {
        // Data state
        tableData: initialState.tableData || [],
        currentData: initialState.currentData || [],
        isLoading: initialState.isLoading || false,
        error: initialState.error || null,

        // Filter state
        filterValues: initialState.filterValues || {},
        searchValue: initialState.searchValue || "",
        visibleColumns: initialState.visibleColumns || [],
        showAdvancedSearch: initialState.showAdvancedSearch || false,

        // Selection state
        selectedCells: initialState.selectedCells || [],
        selectedCellData: initialState.selectedCellData || [],

        // Popup state
        activePopup: initialState.activePopup || null,
        parsedButtons: initialState.parsedButtons || [],
        parsedPopups: initialState.parsedPopups || {},

        // Table settings
        disableRowClick: initialState.disableRowClick ?? true,
        formSettings: initialState.formSettings || {},
        structuredFormFields: initialState.structuredFormFields || {},

        // Polling state
        pollingEnabled: initialState.pollingEnabled ?? true,
        lastUpdateTime: initialState.lastUpdateTime || null,

        // Functions should be provided in initialState
        ...initialState,
    };
};

export default TableContext;

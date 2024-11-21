import React, { useState, useMemo } from "react";
import { useTable, useSortBy, usePagination } from "react-table";
import { PopupContext } from "../PopupContext";
import CellRenderer from "./CellRenderer";
import ButtonPopup from "../CandidateButtonPopup";
import { router } from "@inertiajs/react";

const Table = ({
    columns: initialColumns,
    data: rawData,
    viewForm,
    buttons,
    popups,
    structuredFormFields,
    formSettings = {}, // Add this with a default empty object
    disableRowClick = false,
    singleSelectMode = true,
}) => {
    const [activePopup, setActivePopup] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCells, setSelectedCells] = useState([]);
    const [selectedCellData, setSelectedCellData] = useState([]); // Store onclick data
    const [parsedButtons, setParsedButtons] = useState([]);
    const [parsedPopups, setParsedPopups] = useState({});

    // Parse buttons and popups on mount
    React.useEffect(() => {
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
                saveUrl: saveUrl || "", // Add saveUrl
                saveData: saveData || "", // Add saveData
            };
        });
        setParsedButtons(buttonsList);

        // Parse popups
        const popupsMap = {};
        popupString.split("@@").forEach((popupStr) => {
            const [id, title, columns, fields, buttonStr] = popupStr.split("~");

            // Parse popup buttons
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

    // Handle row clicks
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

    // Handle cell clicks
    // Handle cell selection
    const handleCellClick = (cellInfo) => {
        if (!disableRowClick) {
            handleRowClick(cellInfo.row);
            return;
        }

        const cell = cellInfo.cell;
        const cellValue = cell.value || "";

        // Check if the cell content contains a runPopButton function call
        if (typeof cellValue === "string") {
            const runPopButtonMatch = cellValue.match(
                /runPopButton\('([^']+)',\s*'([^']+)',\s*'([^']+)'\)/
            );

            if (runPopButtonMatch) {
                const [_, popupId, fieldsString, valuesString] =
                    runPopButtonMatch;
                const fields = fieldsString.split("~");
                const values = valuesString.split("~");

                // Create initial data object mapping fields to values
                const initialData = {};
                fields.forEach((field, index) => {
                    let value = values[index] || "";
                    const fieldInfo = structuredFormFields?.[field];
                    const fieldType = fieldInfo?.type?.toLowerCase();

                    // Align with FormFields.jsx type handling
                    switch (fieldType) {
                        case "select":
                            // Use the same logic as FormFields select component
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
                                : "";
                            break;

                        case "checkbox":
                            // Handle checkbox values as array/multiple selection
                            initialData[field] = value
                                ? value.split(";").filter(Boolean)
                                : [];
                            break;

                        case "html":
                            // Preserve HTML content
                            initialData[field] = value;
                            break;

                        case "readonly":
                            // Handle readonly fields
                            initialData[field] = value;
                            break;

                        case "attach":
                            // Handle attachment fields
                            initialData[field] = value;
                            break;

                        default:
                            // Default handling for text and other types
                            initialData[field] = value;
                    }
                });

                // Helper function to get select options (copied from FormFields.jsx)
                const getSelectOptions = (field, fieldInfo, formFields) => {
                    if (fieldInfo?.options?.length) {
                        const firstOption = fieldInfo.options[0]?.value;

                        if (
                            typeof firstOption === "string" &&
                            firstOption.startsWith("[LOOKUP-")
                        ) {
                            const lookupName = firstOption.slice(8, -1);
                            const lookupField = formFields[lookupName];

                            if (lookupField?.type === "Lookup") {
                                return lookupField.options || [];
                            }
                        }
                    }
                    return fieldInfo.options || [];
                };

                // Find the popup configuration and open it
                const popupConfig = parsedPopups[popupId];
                if (popupConfig) {
                    const mergedPopup = {
                        ...popupConfig,
                        initialData,
                        saveUrl: formSettings?.saveURL || "",
                        saveData: formSettings?.saveData || "",
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
                            },
                            content: cellValue,
                            originalCell: cell,
                        },
                    ]);
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

    const columns = useMemo(
        () =>
            initialColumns.map((col) => ({
                Header: col,
                accessor: (row) => row[col] || row[col.toLowerCase()] || "",
                Cell: ({ value }) => <CellRenderer value={value} />,
            })),
        [initialColumns]
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
    } = useTable(
        {
            columns,
            data: Array.isArray(rawData) ? rawData : Object.values(rawData),
            initialState: { pageIndex: 0, pageSize: 10 },
        },
        useSortBy,
        usePagination
    );

    const popupContextValue = {
        setActivePopup,
        formFields: structuredFormFields,
        formSettings: {
            ...popups,
            // Safely access saveURL and saveData
            saveUrl: formSettings?.saveURL || "",
            saveData: formSettings?.saveData || "",
        },
        handlePopupSubmit: async (updates) => {
            try {
                setIsSubmitting(true);

                // Include the selected cell's data in updates
                const selectedData = selectedCellData[0];
                const mergedUpdates = {
                    ...updates,
                    ...(selectedData?.popupParams?.initialData || {}),
                };

                await handlePopupSubmit(mergedUpdates);

                // Clear selections after successful submission
                setSelectedCells([]);
                setSelectedCellData([]);
                setActivePopup(null);
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
                {/* Buttons section */}
                {parsedButtons.length > 0 && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 mb-4">
                        <div className="flex gap-2 justify-end">
                            {parsedButtons.map((button, index) => {
                                const selectedData = selectedCellData[0]; // Check the first selection
                                const hasValidSelection =
                                    selectedData &&
                                    selectedData.popupParams &&
                                    selectedData.popupParams.popupId ===
                                        button.popupId;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            const popupConfig =
                                                parsedPopups[button.popupId];
                                            if (popupConfig) {
                                                const mergedPopup = {
                                                    ...popupConfig,
                                                    initialData: selectedData
                                                        ? selectedData
                                                              .popupParams
                                                              .initialData
                                                        : {}, // Default to empty object if no selection
                                                    saveUrl:
                                                        button.saveUrl ||
                                                        popupConfig.saveUrl ||
                                                        "", // Pass saveUrl
                                                    saveData:
                                                        button.saveData ||
                                                        popupConfig.saveData ||
                                                        "", // Pass saveData
                                                };
                                                setActivePopup(mergedPopup);
                                            }
                                        }}
                                        className={`
                    inline-flex items-center px-4 py-2 border border-transparent 
                    text-sm font-medium rounded-md text-white 
                    bg-indigo-600 hover:bg-indigo-700 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 
                    focus:ring-indigo-500
                `}
                                    >
                                        {button.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Table section */}
                <div className="flex-grow overflow-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
                            <table
                                {...getTableProps()}
                                className="min-w-full divide-y divide-gray-200"
                            >
                                <thead className="bg-gray-50">
                                    {headerGroups.map((headerGroup) => (
                                        <tr
                                            {...headerGroup.getHeaderGroupProps()}
                                        >
                                            {headerGroup.headers.map(
                                                (column) => (
                                                    <th
                                                        {...column.getHeaderProps(
                                                            column.getSortByToggleProps()
                                                        )}
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    >
                                                        {column.render(
                                                            "Header"
                                                        )}
                                                        <span>
                                                            {column.isSorted
                                                                ? column.isSortedDesc
                                                                    ? " 🔽"
                                                                    : " 🔼"
                                                                : ""}
                                                        </span>
                                                    </th>
                                                )
                                            )}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody
                                    {...getTableBodyProps()}
                                    className="bg-white divide-y divide-gray-200"
                                >
                                    {page.map((row) => {
                                        prepareRow(row);
                                        return (
                                            <tr
                                                {...row.getRowProps()}
                                                onClick={() =>
                                                    !disableRowClick &&
                                                    handleRowClick(row)
                                                }
                                                className={`${
                                                    !disableRowClick
                                                        ? "cursor-pointer hover:bg-gray-50"
                                                        : ""
                                                }`}
                                            >
                                                {row.cells.map((cell) => (
                                                    <td
                                                        {...cell.getCellProps()}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCellClick({
                                                                cell: cell,
                                                                row: row,
                                                                column: cell.column,
                                                            });
                                                        }}
                                                        className={`px-6 py-4 whitespace-nowrap ${
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
                                                        {cell.render("Cell")}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between">
                    <div>
                        <button
                            onClick={() => gotoPage(0)}
                            disabled={!canPreviousPage}
                            className="mr-2 px-4 py-2 border rounded"
                        >
                            {"<<"}
                        </button>
                        <button
                            onClick={() => previousPage()}
                            disabled={!canPreviousPage}
                            className="mr-2 px-4 py-2 border rounded"
                        >
                            {"<"}
                        </button>
                        <button
                            onClick={() => nextPage()}
                            disabled={!canNextPage}
                            className="mr-2 px-4 py-2 border rounded"
                        >
                            {">"}
                        </button>
                        <button
                            onClick={() => gotoPage(pageCount - 1)}
                            disabled={!canNextPage}
                            className="px-4 py-2 border rounded"
                        >
                            {">>"}
                        </button>
                    </div>
                    <span>
                        Page{" "}
                        <strong>
                            {pageIndex + 1} of {pageOptions.length}
                        </strong>
                    </span>
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

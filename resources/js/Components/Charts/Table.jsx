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
    disableRowClick = false,
}) => {
    const [activePopup, setActivePopup] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCells, setSelectedCells] = useState([]);
    const [parsedButtons, setParsedButtons] = useState([]);
    const [parsedPopups, setParsedPopups] = useState({});

    // Parse buttons and popups on mount
    React.useEffect(() => {
        if (buttons && popups) {
            parseButtonsAndPopups(buttons, popups);
        }
    }, [buttons, popups]);

    const parseButtonsAndPopups = (buttonString, popupString) => {
        // Parse buttons
        const buttonsList = buttonString.split("@@").map((buttonStr) => {
            const [name, icon, popupId] = buttonStr.split(";");
            return {
                name,
                icon,
                popupId: popupId?.replace("loadPop_", ""),
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
    const handleCellClick = (cellInfo) => {
        if (!disableRowClick) {
            handleRowClick(cellInfo.row);
            return;
        }

        setSelectedCells((prev) => {
            const cellKey = `${cellInfo.row.id}-${cellInfo.column.id}`;
            const isCellSelected = prev.includes(cellKey);

            if (isCellSelected) {
                return prev.filter((key) => key !== cellKey);
            } else {
                return [...prev, cellKey];
            }
        });
    };

    const handlePopupSubmit = async (updates) => {
        try {
            setIsSubmitting(true);
            await router.post(route("candidates.store"), {
                changes: updates,
                saveUrl: activePopup?.saveUrl || formSettings?.saveURL,
                saveData: activePopup?.saveData || formSettings?.saveData,
            });
            setActivePopup(null);
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
        formSettings: popups,
        handlePopupSubmit,
    };

    return (
        <PopupContext.Provider value={popupContextValue}>
            <div className="flex flex-col h-full">
                {/* Buttons section */}
                {parsedButtons.length > 0 && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 mb-4">
                        <div className="flex gap-2 justify-end">
                            {parsedButtons.map((button, index) => (
                                <button
                                    key={index}
                                    onClick={() =>
                                        setActivePopup(
                                            parsedPopups[button.popupId]
                                        )
                                    }
                                    disabled={isSubmitting}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {button.name}
                                </button>
                            ))}
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
                                                                row,
                                                                column: cell.column,
                                                            });
                                                        }}
                                                        className={`px-6 py-4 whitespace-nowrap 
                                                            ${
                                                                disableRowClick
                                                                    ? "cursor-pointer hover:bg-gray-100"
                                                                    : ""
                                                            } 
                                                            ${
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

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useTable, useSortBy, usePagination } from "react-table";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { router } from "@inertiajs/react";
import ButtonPopup from "../CandidateButtonPopup";
import CellRenderer from "./CellRenderer";

const Table = ({
    columns: initialColumns,
    data: rawData,
    viewForm,
    buttons,
    popups,
    structuredFormFields,
    disableRowClick = false,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPopup, setSelectedPopup] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState(initialColumns);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [parsedButtons, setParsedButtons] = useState([]);
    const [parsedPopups, setParsedPopups] = useState({});
    const [selectedCells, setSelectedCells] = useState([]); // New state for tracking selected cells

    useEffect(() => {
        if (buttons && popups) {
            parseButtonsAndPopups(buttons, popups);
        }
    }, [buttons, popups]);

    const handleCellClick = useCallback(
        (cellInfo) => {
            if (!disableRowClick) {
                // If row clicks are enabled, use the existing row click behavior
                handleRowClick(cellInfo.row);
                return;
            }

            // Handle cell selection
            setSelectedCells((prev) => {
                const cellKey = `${cellInfo.row.id}-${cellInfo.column.id}`;
                const isCellSelected = prev.includes(cellKey);

                if (isCellSelected) {
                    return prev.filter((key) => key !== cellKey);
                } else {
                    return [...prev, cellKey];
                }
            });
        },
        [disableRowClick]
    );

    const handleRowClick = useCallback(
        (row) => {
            if (disableRowClick) return; // Don't handle row clicks if disabled

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
        [viewForm, disableRowClick]
    );

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

        // handling Cancel buttons to be a simple cancel
        const popupsMap = {};
        popupString.split("@@").forEach((popupStr) => {
            const [id, title, columns, fields, buttonStr] = popupStr.split("~");
            const popupButtons = buttonStr.split("$$").map((btn) => {
                const [name, action] = btn.split(";");

                // Special handling for Cancel buttons
                if (name === "Cancel") {
                    return { name, action: "closePopup" };
                }

                if (action === "closePopup()") {
                    return { name, action: "closePopup" };
                }

                const updates = {};
                if (action) {
                    action.split(";").forEach((update) => {
                        const [key, value] = update.split("=");
                        if (key && value) {
                            updates[key] = value.startsWith("$")
                                ? value
                                : value.trim();
                        }
                    });
                }
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

    const handlePopupSubmit = async (updates) => {
        try {
            setIsSubmitting(true);
            await router.post(route("candidates.store"), {
                changes: updates,
                saveUrl: selectedPopup?.saveUrl || formSettings?.saveURL,
                saveData: selectedPopup?.saveData || formSettings?.saveData,
            });
            setIsModalOpen(false);
        } catch (error) {
            console.error("Popup submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const data = useMemo(() => {
        console.log("Raw Data:", rawData); // Debug log
        return Array.isArray(rawData) ? rawData : Object.values(rawData);
    }, [rawData]);

    const columns = useMemo(
        () =>
            initialColumns.map((col) => ({
                Header: col,
                accessor: (row) => row[col] || row[col.toLowerCase()] || "",
                // Add cell renderer for all columns
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
            data,
            initialState: { pageIndex: 0, pageSize: 10 },
        },
        useSortBy,
        usePagination
    );

    return (
        <div className="flex flex-col h-full">
            <div className="mb-4 flex justify-between items-center">
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Columns
                        <ChevronDownIcon
                            className="-mr-1 ml-2 h-5 w-5"
                            aria-hidden="true"
                        />
                    </button>

                    {isDropdownOpen && (
                        <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                            <div className="py-1">
                                {initialColumns.map((column) => (
                                    <div
                                        key={column}
                                        className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            setSelectedColumns((prev) =>
                                                prev.includes(column)
                                                    ? prev.filter(
                                                          (col) =>
                                                              col !== column
                                                      )
                                                    : [...prev, column]
                                            );
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedColumns.includes(
                                                column
                                            )}
                                            onChange={() => {}}
                                            className="mr-2"
                                        />
                                        {column}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    {parsedButtons.map((button, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setSelectedPopup(parsedPopups[button.popupId]);
                                setIsModalOpen(true);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {button.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Existing table markup here */}
            <div className="flex-grow overflow-auto">
                <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
                        <table
                            {...getTableProps()}
                            className="min-w-full divide-y divide-gray-200"
                        >
                            <thead className="bg-gray-50">
                                {headerGroups.map((headerGroup, i) => (
                                    <tr
                                        {...headerGroup.getHeaderGroupProps()}
                                        key={i}
                                    >
                                        {headerGroup.headers.map(
                                            (column, j) => (
                                                <th
                                                    {...column.getHeaderProps(
                                                        column.getSortByToggleProps()
                                                    )}
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                    key={j}
                                                >
                                                    {column.render("Header")}
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
                                {page.map((row, i) => {
                                    prepareRow(row);
                                    return (
                                        <tr
                                            {...row.getRowProps()}
                                            className={`${
                                                disableRowClick
                                                    ? ""
                                                    : "cursor-pointer hover:bg-gray-50"
                                            }`}
                                            onClick={() =>
                                                !disableRowClick &&
                                                handleRowClick(row)
                                            }
                                            key={i}
                                        >
                                            {row.cells.map((cell, j) => (
                                                <td
                                                    {...cell.getCellProps()}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCellClick({
                                                            row,
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
                                                    key={j}
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

            {/* Pagination controls */}
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

            <ButtonPopup
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                popup={selectedPopup}
                formFields={structuredFormFields}
                handleSubmit={handlePopupSubmit}
                isSubmitting={isSubmitting}
                isTablePopup={true}
            />
        </div>
    );
};

Table.propTypes = {
    columns: PropTypes.array.isRequired,
    data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    viewForm: PropTypes.string,
    buttons: PropTypes.string,
    popups: PropTypes.string,
    structuredFormFields: PropTypes.object,
    disableRowClick: PropTypes.bool,
};

export default Table;

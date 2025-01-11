import React from "react";
import CellRenderer from "../../Charts/CellRenderer";

const TableBody = ({
    tableData,
    columns,
    disableRowClick,
    handleCellClick,
    isSubmitting,
    prepareRow,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
}) => {
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

    return (
        <div className="overflow-x-auto flex-grow">
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
                                                const { key, ...columnProps } =
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
                        <tbody {...getTableBodyProps()} className="bg-white">
                            {page.map((row, i) => {
                                prepareRow(row);
                                const { key, ...rowProps } = row.getRowProps();
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
                                            const { key, ...cellProps } =
                                                cell.getCellProps();
                                            return (
                                                <td
                                                    key={key}
                                                    {...cellProps}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCellClick({
                                                            cell: cell,
                                                            row: row,
                                                            column: cell.column,
                                                        });
                                                    }}
                                                    className={`px-4 py-3 whitespace-nowrap border-r border-gray-200 ${
                                                        disableRowClick
                                                            ? "cursor-pointer hover:bg-gray-100"
                                                            : ""
                                                    }`}
                                                >
                                                    <CellRenderer
                                                        value={cell.value}
                                                    />
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
    );
};

export default TableBody;

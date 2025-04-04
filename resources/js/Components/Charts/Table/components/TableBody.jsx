import React from "react";
import CellRenderer from "../../CellRenderer"; // Make sure this import path is correct

const TableBody = ({
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    disableRowClick,
    handleCellClick,
    isSubmitting,
    isCellSelected,
    massCellSelect,
}) => {
    return (
        <div className="overflow-x-auto flex-grow">
            <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
                    <table
                        {...getTableProps()}
                        className="min-w-full divide-y divide-gray-200"
                    >
                        <thead className="bg-[#f8fafc] border-b-2 border-[#213341]">
                            {headerGroups.map((headerGroup) => {
                                const {
                                    key: headerGroupKey,
                                    ...headerGroupProps
                                } = headerGroup.getHeaderGroupProps();
                                return (
                                    <tr
                                        key={headerGroupKey}
                                        {...headerGroupProps}
                                    >
                                        {headerGroup.headers.map((column) => {
                                            const {
                                                key: headerKey,
                                                ...headerProps
                                            } = column.getHeaderProps(
                                                column.getSortByToggleProps()
                                            );
                                            return (
                                                <th
                                                    key={headerKey}
                                                    {...headerProps}
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
                                        })}
                                    </tr>
                                );
                            })}
                        </thead>
                        <tbody {...getTableBodyProps()} className="bg-white">
                            {page.map((row) => {
                                prepareRow(row);
                                const { key: rowKey, ...rowProps } =
                                    row.getRowProps();
                                return (
                                    <tr
                                        key={rowKey}
                                        {...rowProps}
                                        className={`${
                                            !disableRowClick
                                                ? "even:bg-gray-100 hover:bg-gray-200 cursor-pointer"
                                                : ""
                                        }`}
                                    >
                                        {row.cells.map((cell) => {
                                            const {
                                                key: cellKey,
                                                ...cellProps
                                            } = cell.getCellProps();
                                            const isSelected =
                                                massCellSelect &&
                                                isCellSelected({
                                                    row: row,
                                                    column: cell.column,
                                                });

                                            const cellStyle = isSelected
                                                ? {
                                                      opacity: 0.85,
                                                      transform: "scale(0.98)",
                                                      boxShadow:
                                                          "0 0 8px rgba(0, 0, 0, 0.3)",
                                                      border: "2px solid #4F46E5",
                                                      backgroundColor:
                                                          "#EEF2FF",
                                                  }
                                                : {};

                                            return (
                                                <td
                                                    key={cellKey}
                                                    {...cellProps}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCellClick({
                                                            cell,
                                                            row,
                                                            column: cell.column,
                                                        });
                                                    }}
                                                    className={`px-4 py-3 whitespace-nowrap border-r border-gray-200 ${
                                                        disableRowClick
                                                            ? "cursor-pointer hover:bg-gray-100"
                                                            : ""
                                                    }`}
                                                    style={cellStyle}
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

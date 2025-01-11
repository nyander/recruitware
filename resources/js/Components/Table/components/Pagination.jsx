import React from "react";

const Pagination = ({
    canPreviousPage,
    canNextPage,
    pageCount,
    pageIndex,
    pageSize,
    setPageSize,
    gotoPage,
    nextPage,
    previousPage,
    pageOptions,
}) => {
    return (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
                <button
                    onClick={() => previousPage()}
                    disabled={!canPreviousPage}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                        !canPreviousPage ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    Previous
                </button>
                <button
                    onClick={() => nextPage()}
                    disabled={!canNextPage}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                        !canNextPage ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div className="flex gap-x-2 items-center">
                    <span className="text-sm text-gray-700">
                        Page{" "}
                        <span className="font-medium">{pageIndex + 1}</span> of{" "}
                        <span className="font-medium">{pageCount}</span>
                    </span>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                        }}
                        className="border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {[10, 20, 30, 40, 50].map((size) => (
                            <option key={size} value={size}>
                                Show {size}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                    >
                        <button
                            onClick={() => gotoPage(0)}
                            disabled={!canPreviousPage}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                                !canPreviousPage
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }`}
                        >
                            <span className="sr-only">First</span>
                            {"<<"}
                        </button>
                        <button
                            onClick={() => previousPage()}
                            disabled={!canPreviousPage}
                            className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                                !canPreviousPage
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }`}
                        >
                            <span className="sr-only">Previous</span>
                            {"<"}
                        </button>
                        <button
                            onClick={() => nextPage()}
                            disabled={!canNextPage}
                            className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                                !canNextPage
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }`}
                        >
                            <span className="sr-only">Next</span>
                            {">"}
                        </button>
                        <button
                            onClick={() => gotoPage(pageCount - 1)}
                            disabled={!canNextPage}
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                                !canNextPage
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }`}
                        >
                            <span className="sr-only">Last</span>
                            {">>"}
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Pagination;

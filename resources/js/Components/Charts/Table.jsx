import React, { useState, useMemo } from 'react';
import { useTable, useSortBy, usePagination } from 'react-table';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

const Table = ({ columns: initialColumns, data }) => {
  const [selectedColumns, setSelectedColumns] = useState(
    initialColumns.map(column => column.accessor)
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleColumn = (accessor) => {
    setSelectedColumns(prev => 
      prev.includes(accessor)
        ? prev.filter(col => col !== accessor)
        : [...prev, accessor]
    );
  };

  const columns = useMemo(
    () => initialColumns.filter(column => selectedColumns.includes(column.accessor)),
    [initialColumns, selectedColumns]
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
    <div>
      <div className="mb-4 relative">
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
        >
          Columns
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </button>

        {isDropdownOpen && (
          <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
            <div className="py-1">
              {initialColumns.map((column) => (
                <div
                  key={column.accessor}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => toggleColumn(column.accessor)}
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column.accessor)}
                    onChange={() => {}}
                    className="mr-2"
                  />
                  {column.Header}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="mr-4">
          Show 
          <select
            value={pageSize}
            onChange={e => {
              setPageSize(Number(e.target.value));
            }}
            className="mx-2 form-select"
          >
            {[5, 10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
          entries
        </label>
      </div>

      <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.render('Header')}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
          {page.map((row, i) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap">{cell.render('Cell')}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} className="mr-2 px-4 py-2 border rounded">
            {'<<'}
          </button>
          <button onClick={() => previousPage()} disabled={!canPreviousPage} className="mr-2 px-4 py-2 border rounded">
            {'<'}
          </button>
          <button onClick={() => nextPage()} disabled={!canNextPage} className="mr-2 px-4 py-2 border rounded">
            {'>'}
          </button>
          <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} className="px-4 py-2 border rounded">
            {'>>'}
          </button>
        </div>
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{' '}
        </span>
      </div>
    </div>
  );
};

export default Table;
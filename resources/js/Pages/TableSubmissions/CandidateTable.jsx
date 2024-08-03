import React, { useState, useMemo } from 'react';
import { useTable, useSortBy, usePagination } from 'react-table';

const CandidateTable = ({ candidates }) => {
  const allColumns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'full_name',
      },
      {
        Header: 'Job Type',
        accessor: 'job_type',
      },
      {
        Header: 'Branch',
        accessor: 'branch',
      },
      {
        Header: 'Shift Pattern',
        accessor: 'shift_pattern',
      },
      {
        Header: 'Classification',
        accessor: 'classification',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Phone',
        accessor: 'phone',
      },
    ],
    []
  );

  const [selectedColumns, setSelectedColumns] = useState(
    allColumns.map(column => column.accessor)
  );

  const toggleColumn = (accessor) => {
    setSelectedColumns(prev => 
      prev.includes(accessor)
        ? prev.filter(col => col !== accessor)
        : [...prev, accessor]
    );
  };

  const columns = useMemo(
    () => allColumns.filter(column => selectedColumns.includes(column.accessor)),
    [allColumns, selectedColumns]
  );

  const data = useMemo(() => candidates || [], [candidates]);

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
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Select Columns:</h2>
        {allColumns.map(column => (
          <label key={column.accessor} className="inline-flex items-center mr-4">
            <input
              type="checkbox"
              checked={selectedColumns.includes(column.accessor)}
              onChange={() => toggleColumn(column.accessor)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2">{column.Header}</span>
          </label>
        ))}
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

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {headerGroups.map((headerGroup, i) => (
            <tr key={i}>
              {headerGroup.headers.map((column, j) => (
                <th
                  key={j}
                  onClick={column.getSortByToggleProps().onClick}
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
        <tbody className="bg-white divide-y divide-gray-200">
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr key={i}>
                {row.cells.map((cell, j) => (
                  <td key={j} className="px-6 py-4 whitespace-nowrap">
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
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

export default CandidateTable;
import React, { useState, useMemo, useCallback } from 'react';
import { useTable, useSortBy, usePagination } from 'react-table';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import CandidateFormModal from '@/Pages/Components/CandidateFormModal';

const Table = ({ columns: initialColumns, data: rawData, onRowClick }) => {

  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState(initialColumns);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);


  useEffect(() => {
    console.log("Table component mounted or updated");
    console.log("onRowClick type:", typeof onRowClick);
}, [onRowClick]);

  const data = useMemo(() => {
    if (typeof rawData !== 'object' || rawData === null) {
      console.error('Data prop must be an object');
      return [];
    }
    return Object.values(rawData);
  }, [rawData]);

  const toggleColumn = useCallback((columnName) => {
    setSelectedColumns(prev => 
      prev.includes(columnName)
        ? prev.filter(col => col !== columnName)
        : [...prev, columnName]
    );
  }, []);

  const columns = useMemo(
    () => selectedColumns.map(columnName => ({
      Header: columnName,
      accessor: columnName,
      id: columnName,
    })),
    [selectedColumns]
  );

  const handleRowClick = useCallback((row) => {
    console.log("Row clicked in Table component:", row.original);
    setSelectedCandidate(row.original);
    setIsModalOpen(true);
  }, []);
  

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
              {initialColumns.map((columnName) => (
                <div
                  key={columnName}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  onClick={() => toggleColumn(columnName)}
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(columnName)}
                    onChange={() => {}}
                    className="mr-2"
                  />
                  {columnName}
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

      <div className="flex-grow overflow-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border-b border-gray-200 shadow sm:rounded-lg">
            <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {headerGroups.map((headerGroup, groupIndex) => (
                  <tr {...headerGroup.getHeaderGroupProps()} key={`header-group-${groupIndex}`}>
                    {headerGroup.headers.map((column, columnIndex) => (
                      <th
                        {...column.getHeaderProps(column.getSortByToggleProps())}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10"
                        key={`header-${groupIndex}-${columnIndex}`}
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
                {page.map((row, rowIndex) => {
                  prepareRow(row);
                  return (
                    <tr 
                      {...row.getRowProps()} 
                      onClick={() => handleRowClick(row)}
                      className="cursor-pointer hover:bg-gray-50"
                      key={`row-${rowIndex}`}
                    >
                      {row.cells.map((cell, cellIndex) => (
                        <td 
                          {...cell.getCellProps()} 
                          className="px-6 py-4 whitespace-nowrap"
                          key={`cell-${rowIndex}-${cellIndex}`}
                        >
                          {cell.render('Cell')}
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

      <CandidateFormModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      candidate={selectedCandidate}
    />
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  onRowClick: PropTypes.func
};

export default Table;
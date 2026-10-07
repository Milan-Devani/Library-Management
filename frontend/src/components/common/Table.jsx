import React from 'react';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No records found',
  emptyDescription = 'There are no items matching your criteria.',
  onEmptyAction = null,
  emptyActionText = null,
  sort = null,
  order = 'desc',
  onSort = null,
  pagination = null,
  onPageChange = null,
  showRowNumber = false,
  rowKey = 'id',
  className = ''
}) => {
  const handleSortClick = (col) => {
    if (!col.sortable || !onSort) return;
    const newOrder = sort === col.key && order === 'asc' ? 'desc' : 'asc';
    onSort(col.key, newOrder);
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {showRowNumber && <th scope="col" className="py-3 px-4 w-12 text-center">#</th>}
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  onClick={() => handleSortClick(col)}
                  className={`py-3 px-4 ${col.className || ''} ${
                    col.sortable ? 'cursor-pointer select-none hover:text-slate-800' : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.label}</span>
                    {col.sortable && sort === col.key && (
                      order === 'asc' ? <FiArrowUp className="text-blue-600 text-xs" /> : <FiArrowDown className="text-blue-600 text-xs" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (showRowNumber ? 1 : 0)} className="p-0">
                  <Skeleton variant="table" count={5} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (showRowNumber ? 1 : 0)} className="py-12 px-4">
                  <EmptyState
                    title={emptyMessage}
                    description={emptyDescription}
                    actionText={emptyActionText}
                    onAction={onEmptyAction}
                  />
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const rowId = row[rowKey] || idx;
                const rowNum = pagination ? (pagination.page - 1) * pagination.limit + idx + 1 : idx + 1;
                return (
                  <tr key={rowId} className="hover:bg-slate-50/80 transition-colors">
                    {showRowNumber && (
                      <td className="py-3 px-4 text-xs text-slate-400 text-center font-mono">
                        {rowNum}
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={`py-3.5 px-4 text-slate-700 ${col.cellClassName || ''}`}>
                        {col.render ? col.render(row[col.key], row, idx) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && onPageChange && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default Table;

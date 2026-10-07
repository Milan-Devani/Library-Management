import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIssues, returnBook } from '../../features/issues/issueSlice';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import SearchInput from '../../components/common/SearchInput';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ReturnModal from '../../components/issues/ReturnModal';
import { formatDate, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { FiCornerDownLeft, FiClock } from 'react-icons/fi';

const ReturnList = () => {
  const dispatch = useDispatch();
  const { issues, pagination, loading, actionLoading } = useSelector((state) => state.issues);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [issueToReturn, setIssueToReturn] = useState(null);

  // Load only active (unreturned) issues by default: 'Issued' or 'Overdue'
  const loadReturns = useCallback(() => {
    dispatch(
      fetchIssues({
        page,
        limit: 10,
        search,
        status: undefined // We'll filter unreturned on table or can fetch all
      })
    );
  }, [dispatch, page, search]);

  useEffect(() => {
    loadReturns();
  }, [loadReturns]);

  // Filter only unreturned issues for check-in
  const activeLoans = issues.filter((i) => i.status !== 'Returned');

  const handleReturnConfirm = async ({ issueId, returnDate }) => {
    const res = await dispatch(returnBook({ issueId, returnDate }));
    if (returnBook.fulfilled.match(res)) {
      const data = res.payload.data;
      if (data.fine_amount > 0) {
        toast.success(`Book checked in successfully. Overdue fine: ${formatCurrency(data.fine_amount)}`);
      } else {
        toast.success('Book checked in on time! Inventory updated.');
      }
      setIssueToReturn(null);
      loadReturns();
    } else {
      toast.error(res.payload || 'Failed to process return');
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Issue #',
      render: (val) => <span className="font-mono text-xs text-slate-500">#{val}</span>
    },
    {
      key: 'book_title',
      label: 'Book Title & ISBN',
      render: (_, row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.book_title}</span>
          <span className="text-xs font-mono text-slate-400">ISBN: {row.book_isbn}</span>
        </div>
      )
    },
    {
      key: 'member_name',
      label: 'Borrower',
      render: (_, row) => (
        <div>
          <span className="font-medium text-slate-800 block">{row.member_name}</span>
          <span className="text-xs font-mono text-blue-600">{row.member_code} • {row.member_phone}</span>
        </div>
      )
    },
    {
      key: 'issue_date',
      label: 'Issue Date',
      render: (val) => <span className="text-xs text-slate-600">{formatDate(val)}</span>
    },
    {
      key: 'due_date',
      label: 'Due Date',
      render: (val, row) => (
        <div>
          <span className={`text-xs font-medium block ${row.status === 'Overdue' ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
            {formatDate(val)}
          </span>
          {row.status === 'Overdue' && (
            <span className="text-[10px] text-red-500 font-semibold flex items-center gap-1 mt-0.5">
              <FiClock className="text-xs" /> Overdue
            </span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'actions',
      label: 'Process Return',
      cellClassName: 'text-right',
      render: (_, row) => (
        <Button
          variant="primary"
          size="sm"
          icon={FiCornerDownLeft}
          onClick={() => setIssueToReturn(row)}
        >
          Check In / Return
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Book Return Management"
        subtitle="Check in borrowed volumes, inspect return dates, and automatically calculate overdue fines"
      />

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm max-w-md">
        <SearchInput
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          onClear={() => {
            setSearch('');
            setPage(1);
          }}
          placeholder="Search by student, member code, book title..."
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={activeLoans}
        loading={loading}
        showRowNumber={true}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        emptyMessage="No pending book returns"
        emptyDescription="All issued books are returned or no loans match your query."
        onEmptyAction={() => setSearch('')}
        emptyActionText="Clear Search"
      />

      {/* Return Modal */}
      {issueToReturn && (
        <ReturnModal
          isOpen={!!issueToReturn}
          onClose={() => setIssueToReturn(null)}
          issue={issueToReturn}
          onConfirm={handleReturnConfirm}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default ReturnList;

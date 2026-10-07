import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchIssues, createIssue, returnBook } from '../../features/issues/issueSlice';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import IssueFormModal from '../../components/issues/IssueFormModal';
import ReturnModal from '../../components/issues/ReturnModal';
import { formatDate, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { FiShare2, FiCornerDownLeft } from 'react-icons/fi';

const IssueList = () => {
  const dispatch = useDispatch();
  const { issues, pagination, loading, actionLoading } = useSelector((state) => state.issues);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueToReturn, setIssueToReturn] = useState(null);

  const loadIssues = useCallback(() => {
    dispatch(
      fetchIssues({
        page,
        limit: 10,
        search,
        status: selectedStatus || undefined
      })
    );
  }, [dispatch, page, search, selectedStatus]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const handleIssueSubmit = async (formData) => {
    const res = await dispatch(createIssue(formData));
    if (createIssue.fulfilled.match(res)) {
      toast.success('Book issued successfully!');
      setIsIssueModalOpen(false);
      loadIssues();
    } else {
      toast.error(res.payload || 'Failed to issue book');
    }
  };

  const handleReturnConfirm = async ({ issueId, returnDate }) => {
    const res = await dispatch(returnBook({ issueId, returnDate }));
    if (returnBook.fulfilled.match(res)) {
      const data = res.payload.data;
      if (data.fine_amount > 0) {
        toast.success(`Book returned with overdue fine: ${formatCurrency(data.fine_amount)}`);
      } else {
        toast.success('Book returned on time! No fine incurred.');
      }
      setIssueToReturn(null);
      loadIssues();
    } else {
      toast.error(res.payload || 'Failed to process return');
    }
  };

  const columns = [
    {
      key: 'book_title',
      label: 'Book Information',
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
          <span className="text-xs font-mono text-blue-600">{row.member_code}</span>
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
        <span className={`text-xs font-medium ${row.status === 'Overdue' ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
          {formatDate(val)}
        </span>
      )
    },
    {
      key: 'return_date',
      label: 'Returned On',
      render: (val) => <span className="text-xs text-slate-500">{formatDate(val)}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'fine_amount',
      label: 'Fine Info',
      render: (val, row) => {
        if (!val || Number(val) === 0) return <span className="text-xs text-slate-400">—</span>;
        return (
          <div className="text-xs">
            <span className="font-bold text-slate-800">{formatCurrency(val)}</span>
            <span className={`ml-1 text-[10px] font-semibold ${row.fine_status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
              ({row.fine_status || 'Pending'})
            </span>
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Action',
      cellClassName: 'text-right',
      render: (_, row) => {
        if (row.status === 'Returned') {
          return <span className="text-xs text-emerald-600 font-medium">✓ Settled</span>;
        }
        return (
          <Button
            variant="outline"
            size="sm"
            icon={FiCornerDownLeft}
            onClick={() => setIssueToReturn(row)}
          >
            Return
          </Button>
        );
      }
    }
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Book Issue & Loan Registry"
        subtitle="Manage ongoing book loans, return processing, and overdue tracking"
        actions={
          <div className="flex gap-2">
            <Button
              variant="primary"
              icon={FiShare2}
              onClick={() => setIsIssueModalOpen(true)}
            >
              Issue Book
            </Button>
            <Link to="/issues/create">
              <Button variant="secondary" size="md">
                Full Issue Page
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
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
              placeholder="Search by student name, code, book title, or ISBN..."
            />
          </div>

          <Select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            placeholder="All Issue Statuses"
            options={[
              { value: 'Issued', label: 'Active (Issued)' },
              { value: 'Overdue', label: 'Overdue Loans' },
              { value: 'Returned', label: 'Returned Books' }
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={issues}
        loading={loading}
        showRowNumber={true}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        emptyMessage="No loan records found"
        emptyDescription="There are no book issues matching your current filter criteria."
        onEmptyAction={() => {
          setSearch('');
          setSelectedStatus('');
        }}
        emptyActionText="Reset Filters"
      />

      {/* Issue Book Modal */}
      <IssueFormModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSubmit={handleIssueSubmit}
        loading={actionLoading}
      />

      {/* Return Book Modal */}
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

export default IssueList;

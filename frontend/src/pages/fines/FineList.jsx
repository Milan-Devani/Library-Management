import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFines, payFine } from '../../features/issues/issueSlice';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/common/StatCard';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { FiDollarSign, FiCheck, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const FineList = () => {
  const dispatch = useDispatch();
  const { fines, fineSummary, finePagination, finesLoading, actionLoading } = useSelector(
    (state) => state.issues
  );

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [fineToPay, setFineToPay] = useState(null);

  const loadFines = useCallback(() => {
    dispatch(
      fetchFines({
        page,
        limit: 10,
        search,
        status: selectedStatus || undefined
      })
    );
  }, [dispatch, page, search, selectedStatus]);

  useEffect(() => {
    loadFines();
  }, [loadFines]);

  const handlePayConfirm = async () => {
    if (!fineToPay) return;
    const res = await dispatch(payFine(fineToPay.id));
    if (payFine.fulfilled.match(res)) {
      toast.success(`Fine of ${formatCurrency(fineToPay.fine_amount)} marked as paid!`);
      setFineToPay(null);
      loadFines();
    } else {
      toast.error(res.payload || 'Failed to process payment');
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Fine #',
      render: (val) => <span className="font-mono text-xs text-slate-500">#{val}</span>
    },
    {
      key: 'member_name',
      label: 'Student / Borrower',
      render: (_, row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.member_name}</span>
          <span className="text-xs font-mono text-blue-600">{row.member_code} • {row.member_phone}</span>
        </div>
      )
    },
    {
      key: 'book_title',
      label: 'Book Involved',
      render: (_, row) => (
        <div>
          <span className="font-medium text-slate-800 block">{row.book_title}</span>
          <span className="text-xs font-mono text-slate-400">ISBN: {row.book_isbn}</span>
        </div>
      )
    },
    {
      key: 'due_date',
      label: 'Due Date',
      render: (val) => <span className="text-xs text-slate-600">{formatDate(val)}</span>
    },
    {
      key: 'overdue_days',
      label: 'Days Late',
      render: (val) => (
        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
          {val} days
        </span>
      )
    },
    {
      key: 'fine_amount',
      label: 'Fine Amount',
      render: (val) => <span className="font-bold text-slate-900 text-sm">{formatCurrency(val)}</span>
    },
    {
      key: 'payment_status',
      label: 'Status',
      render: (val, row) => (
        <div>
          <StatusBadge status={val} />
          {row.paid_date && (
            <span className="text-[10px] text-slate-400 block mt-0.5">Paid: {formatDate(row.paid_date)}</span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Action',
      cellClassName: 'text-right',
      render: (_, row) => {
        if (row.payment_status === 'Paid') {
          return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <FiCheck className="text-sm" /> Settled
            </span>
          );
        }
        return (
          <Button
            variant="success"
            size="sm"
            icon={FiCheck}
            onClick={() => setFineToPay(row)}
          >
            Mark as Paid
          </Button>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fine & Penalty Management"
        subtitle="Track calculated overdue fines, collect penalty dues, and audit settlement history"
      />

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Outstanding Fines"
          value={formatCurrency(fineSummary?.total_pending || 0)}
          subtitle={`${fineSummary?.pending_count || 0} unpaid overdue penalty notice(s)`}
          icon={FiAlertCircle}
          color="rose"
        />

        <StatCard
          title="Collected Fines"
          value={formatCurrency(fineSummary?.total_collected || 0)}
          subtitle="Successfully received by library counter"
          icon={FiCheckCircle}
          color="emerald"
        />

        <StatCard
          title="Fine Standard Policy"
          value="₹5.00 / Day"
          subtitle="Calculated automatically on book return"
          icon={FiDollarSign}
          color="blue"
        />
      </div>

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
              placeholder="Search by student name, roll number, or book title..."
            />
          </div>

          <Select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            placeholder="All Payment Statuses"
            options={[
              { value: 'Pending', label: 'Pending / Unpaid Fines' },
              { value: 'Paid', label: 'Paid / Settled Fines' }
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={fines}
        loading={finesLoading}
        showRowNumber={true}
        pagination={finePagination}
        onPageChange={(p) => setPage(p)}
        emptyMessage="No fines recorded"
        emptyDescription="There are currently no fines matching your selected filters."
        onEmptyAction={() => {
          setSearch('');
          setSelectedStatus('');
        }}
        emptyActionText="Clear Filters"
      />

      {/* Payment Confirmation Dialog */}
      {fineToPay && (
        <ConfirmDialog
          isOpen={!!fineToPay}
          onClose={() => setFineToPay(null)}
          onConfirm={handlePayConfirm}
          title="Settle Fine Payment?"
          message={`Confirm collection of ${formatCurrency(fineToPay.fine_amount)} from ${fineToPay.member_name} (${fineToPay.member_code}) for overdue book "${fineToPay.book_title}".`}
          confirmText="Confirm Payment Received"
          confirmVariant="success"
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default FineList;

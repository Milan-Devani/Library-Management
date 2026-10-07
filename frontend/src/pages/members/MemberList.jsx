import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchMembers, deleteMember } from '../../features/members/memberSlice';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import MemberDetailsModal from '../../components/members/MemberDetailsModal';
import toast from 'react-hot-toast';
import { FiPlus, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

const MemberList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { members, pagination, loading, actionLoading } = useSelector((state) => state.members);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);

  // Modals state
  const [selectedMemberForView, setSelectedMemberForView] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const loadMembers = useCallback(() => {
    dispatch(
      fetchMembers({
        page,
        limit: 10,
        search,
        status: selectedStatus || undefined
      })
    );
  }, [dispatch, page, search, selectedStatus]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    const res = await dispatch(deleteMember(memberToDelete.id));
    if (deleteMember.fulfilled.match(res)) {
      toast.success(res.payload.message || 'Member deleted successfully');
      setMemberToDelete(null);
      loadMembers();
    } else {
      toast.error(res.payload || 'Unable to delete member');
    }
  };

  const columns = [
    {
      key: 'full_name',
      label: 'Member Name & Code',
      render: (_, row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.full_name}</span>
          <span className="text-xs font-mono text-blue-600 font-semibold">{row.member_code}</span>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Contact Info',
      render: (_, row) => (
        <div className="text-xs">
          <p className="text-slate-800">{row.email}</p>
          <p className="text-slate-400 font-mono mt-0.5">{row.phone}</p>
        </div>
      )
    },
    {
      key: 'department',
      label: 'Department & Course',
      render: (_, row) => (
        <div className="text-xs">
          <p className="font-medium text-slate-700">{row.department || '—'}</p>
          <p className="text-slate-400">{row.course || '—'} ({row.year || 'N/A'})</p>
        </div>
      )
    },
    {
      key: 'active_issues_count',
      label: 'Active Loans',
      render: (val) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
          Number(val) > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'
        }`}>
          {val} books
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'actions',
      label: 'Actions',
      cellClassName: 'text-right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedMemberForView(row)}
            title="View details"
            aria-label="View member"
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FiEye className="text-base" />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/members/${row.id}/edit`)}
            title="Edit member"
            aria-label="Edit member"
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <FiEdit2 className="text-base" />
          </button>
          <button
            type="button"
            onClick={() => setMemberToDelete(row)}
            title="Delete member"
            aria-label="Delete member"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiTrash2 className="text-base" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Member / Student Management"
        subtitle="Manage student registrations, departments, borrowing privileges, and records"
        actions={
          <Link to="/members/create">
            <Button variant="primary" icon={FiPlus}>
              Add New Member
            </Button>
          </Link>
        }
      />

      {/* Filter and Search */}
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
              placeholder="Search by student name, roll number, email, or phone..."
            />
          </div>

          <Select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            placeholder="All Statuses"
            options={[
              { value: 'Active', label: 'Active Members' },
              { value: 'Inactive', label: 'Inactive Members' }
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={members}
        loading={loading}
        showRowNumber={true}
        pagination={pagination}
        onPageChange={(newPage) => setPage(newPage)}
        emptyMessage="No members found"
        emptyDescription="Try clearing filters or search to view student members."
        onEmptyAction={() => {
          setSearch('');
          setSelectedStatus('');
        }}
        emptyActionText="Reset Filters"
      />

      {/* View Member Modal */}
      {selectedMemberForView && (
        <MemberDetailsModal
          isOpen={!!selectedMemberForView}
          onClose={() => setSelectedMemberForView(null)}
          member={selectedMemberForView}
          onEdit={(m) => navigate(`/members/${m.id}/edit`)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {memberToDelete && (
        <ConfirmDialog
          isOpen={!!memberToDelete}
          onClose={() => setMemberToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Member Account?"
          message={`Are you sure you want to remove "${memberToDelete.full_name}" (${memberToDelete.member_code})? You can only delete members with zero outstanding book loans.`}
          confirmText="Delete Member"
          confirmVariant="danger"
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default MemberList;

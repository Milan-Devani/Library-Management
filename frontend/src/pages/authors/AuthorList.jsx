import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor
} from '../../features/authors/authorSlice';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import SearchInput from '../../components/common/SearchInput';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import FormField from '../../components/common/FormField';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiUserCheck, FiGlobe } from 'react-icons/fi';

const AuthorList = () => {
  const dispatch = useDispatch();
  const { authors, pagination, loading, actionLoading } = useSelector(
    (state) => state.authors
  );

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [authorForm, setAuthorForm] = useState({ name: '', country: '', biography: '' });
  const [formErrors, setFormErrors] = useState({});

  // Delete modal state
  const [authorToDelete, setAuthorToDelete] = useState(null);

  const loadData = useCallback(() => {
    dispatch(fetchAuthors({ page, limit: 10, search }));
  }, [dispatch, page, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingAuthor(null);
    setAuthorForm({ name: '', country: '', biography: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (author) => {
    setEditingAuthor(author);
    setAuthorForm({
      name: author.name,
      country: author.country || '',
      biography: author.biography || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!authorForm.name.trim()) {
      errs.name = 'Author name is required';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingAuthor) {
      const res = await dispatch(
        updateAuthor({ id: editingAuthor.id, data: authorForm })
      );
      if (updateAuthor.fulfilled.match(res)) {
        toast.success('Author updated successfully');
        setIsModalOpen(false);
        loadData();
      } else {
        toast.error(res.payload || 'Failed to update author');
      }
    } else {
      const res = await dispatch(createAuthor(authorForm));
      if (createAuthor.fulfilled.match(res)) {
        toast.success('Author registered successfully');
        setIsModalOpen(false);
        loadData();
      } else {
        toast.error(res.payload || 'Failed to create author');
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!authorToDelete) return;
    const res = await dispatch(deleteAuthor(authorToDelete.id));
    if (deleteAuthor.fulfilled.match(res)) {
      toast.success(res.payload.message || 'Author deleted successfully');
      setAuthorToDelete(null);
      loadData();
    } else {
      toast.error(res.payload || 'Unable to delete author');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Author Name',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <FiUserCheck className="text-lg" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 block">{val}</span>
            <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <FiGlobe className="text-[11px]" />
              {row.country || 'Country Unspecified'}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'biography',
      label: 'Biography / Notes',
      render: (val) => (
        <span className="text-slate-600 text-xs line-clamp-2 italic">
          {val ? `"${val}"` : 'No biography available.'}
        </span>
      )
    },
    {
      key: 'books_count',
      label: 'Catalog Volumes',
      render: (val) => (
        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          {val || 0} books
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      cellClassName: 'text-right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            title="Edit author"
            aria-label="Edit author"
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <FiEdit2 className="text-base" />
          </button>
          <button
            type="button"
            onClick={() => setAuthorToDelete(row)}
            title="Delete author"
            aria-label="Delete author"
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
        title="Author Directory"
        subtitle="Manage authors, biographies, and publications indexed in the library"
        actions={
          <Button variant="primary" icon={FiPlus} onClick={handleOpenCreate}>
            Add Author
          </Button>
        }
      />

      {/* Search */}
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
          placeholder="Search authors by name, country, biography..."
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={authors}
        loading={loading}
        showRowNumber={true}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        emptyMessage="No authors found"
        emptyDescription="Add authors to associate them with cataloged library books."
        onEmptyAction={handleOpenCreate}
        emptyActionText="Add First Author"
      />

      {/* Add / Edit Author Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAuthor ? 'Edit Author Profile' : 'Register New Author'}
        size="md"
        closeOnBackdrop={!actionLoading}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={authorForm.name}
            onChange={(e) => {
              setAuthorForm({ ...authorForm, name: e.target.value });
              if (formErrors.name) setFormErrors({ ...formErrors, name: null });
            }}
            error={formErrors.name}
            placeholder="e.g. Robert C. Martin"
            required
          />

          <Input
            label="Country / Origin"
            value={authorForm.country}
            onChange={(e) => setAuthorForm({ ...authorForm, country: e.target.value })}
            placeholder="e.g. United States"
          />

          <FormField label="Author Biography / Professional Background">
            <textarea
              rows="3"
              value={authorForm.biography}
              onChange={(e) => setAuthorForm({ ...authorForm, biography: e.target.value })}
              placeholder="Background, research area, notable accomplishments..."
              className="block w-full rounded-lg text-sm border border-slate-300 p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={actionLoading}>
              {editingAuthor ? 'Save Changes' : 'Register Author'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      {authorToDelete && (
        <ConfirmDialog
          isOpen={!!authorToDelete}
          onClose={() => setAuthorToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Author?"
          message={`Are you sure you want to delete author "${authorToDelete.name}"? This operation cannot be completed if books in the library are written by this author.`}
          confirmText="Delete Author"
          confirmVariant="danger"
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default AuthorList;

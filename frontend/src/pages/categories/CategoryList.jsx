import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../../features/categories/categorySlice';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import SearchInput from '../../components/common/SearchInput';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import FormField from '../../components/common/FormField';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiLayers } from 'react-icons/fi';

const CategoryList = () => {
  const dispatch = useDispatch();
  const { categories, pagination, loading, actionLoading } = useSelector(
    (state) => state.categories
  );

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({});

  // Delete modal state
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const loadData = useCallback(() => {
    dispatch(fetchCategories({ page, limit: 10, search }));
  }, [dispatch, page, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, description: cat.description || '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!categoryForm.name.trim()) {
      errs.name = 'Category name is required';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingCategory) {
      const res = await dispatch(
        updateCategory({ id: editingCategory.id, data: categoryForm })
      );
      if (updateCategory.fulfilled.match(res)) {
        toast.success('Category updated successfully');
        setIsModalOpen(false);
        loadData();
      } else {
        toast.error(res.payload || 'Failed to update category');
      }
    } else {
      const res = await dispatch(createCategory(categoryForm));
      if (createCategory.fulfilled.match(res)) {
        toast.success('Category created successfully');
        setIsModalOpen(false);
        loadData();
      } else {
        toast.error(res.payload || 'Failed to create category');
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    const res = await dispatch(deleteCategory(categoryToDelete.id));
    if (deleteCategory.fulfilled.match(res)) {
      toast.success(res.payload.message || 'Category deleted successfully');
      setCategoryToDelete(null);
      loadData();
    } else {
      toast.error(res.payload || 'Unable to delete category');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Category Name',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <FiLayers className="text-lg" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 block">{val}</span>
            <span className="text-xs text-slate-400">Created: {row.created_at?.split(' ')[0]}</span>
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (val) => (
        <span className="text-slate-600 text-xs line-clamp-2">{val || 'No description provided.'}</span>
      )
    },
    {
      key: 'books_count',
      label: 'Associated Books',
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
            title="Edit category"
            aria-label="Edit category"
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <FiEdit2 className="text-base" />
          </button>
          <button
            type="button"
            onClick={() => setCategoryToDelete(row)}
            title="Delete category"
            aria-label="Delete category"
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
        title="Category Management"
        subtitle="Organize books by academic discipline, genre, and subject classifications"
        actions={
          <Button variant="primary" icon={FiPlus} onClick={handleOpenCreate}>
            Add Category
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
          placeholder="Search categories..."
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={categories}
        loading={loading}
        showRowNumber={true}
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        emptyMessage="No categories found"
        emptyDescription="Create categories to organize your library books into subjects."
        onEmptyAction={handleOpenCreate}
        emptyActionText="Create First Category"
      />

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        size="md"
        closeOnBackdrop={!actionLoading}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            value={categoryForm.name}
            onChange={(e) => {
              setCategoryForm({ ...categoryForm, name: e.target.value });
              if (formErrors.name) setFormErrors({ ...formErrors, name: null });
            }}
            error={formErrors.name}
            placeholder="e.g. Artificial Intelligence"
            required
          />

          <FormField label="Description / Subject Details">
            <textarea
              rows="3"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              placeholder="What subject or department does this category cover?"
              className="block w-full rounded-lg text-sm border border-slate-300 p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={actionLoading}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      {categoryToDelete && (
        <ConfirmDialog
          isOpen={!!categoryToDelete}
          onClose={() => setCategoryToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Category?"
          message={`Are you sure you want to delete category "${categoryToDelete.name}"? This operation is only allowed if no books belong to this category.`}
          confirmText="Delete Category"
          confirmVariant="danger"
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default CategoryList;

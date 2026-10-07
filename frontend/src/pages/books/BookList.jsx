import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchBooks, deleteBook } from '../../features/books/bookSlice';
import { fetchCategories } from '../../features/categories/categorySlice';
import { fetchAuthors } from '../../features/authors/authorSlice';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/common/Table';
import SearchInput from '../../components/common/SearchInput';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import BookDetailsModal from '../../components/books/BookDetailsModal';
import toast from 'react-hot-toast';
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiBook } from 'react-icons/fi';

const BookList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { books, pagination, loading, actionLoading } = useSelector((state) => state.books);
  const { categories } = useSelector((state) => state.categories);
  const { authors } = useSelector((state) => state.authors);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sort, setSort] = useState('id');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Modals state
  const [selectedBookForView, setSelectedBookForView] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);

  const loadBooks = useCallback(() => {
    dispatch(
      fetchBooks({
        page,
        limit: 10,
        search,
        category_id: selectedCategory || undefined,
        author_id: selectedAuthor || undefined,
        status: selectedStatus || undefined,
        sort,
        order
      })
    );
  }, [dispatch, page, search, selectedCategory, selectedAuthor, selectedStatus, sort, order]);

  useEffect(() => {
    dispatch(fetchCategories({ limit: 100 }));
    dispatch(fetchAuthors({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const handleSort = (columnKey, newOrder) => {
    setSort(columnKey);
    setOrder(newOrder);
  };

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return;
    const res = await dispatch(deleteBook(bookToDelete.id));
    if (deleteBook.fulfilled.match(res)) {
      toast.success(res.payload.message || 'Book deleted successfully');
      setBookToDelete(null);
      loadBooks();
    } else {
      toast.error(res.payload || 'Unable to delete book');
    }
  };

  const columns = [
    {
      key: 'title',
      label: 'Book Title & ISBN',
      sortable: true,
      render: (_, row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.title}</span>
          <span className="text-xs font-mono text-slate-400">ISBN: {row.isbn}</span>
        </div>
      )
    },
    {
      key: 'author',
      label: 'Author',
      sortable: true,
      render: (_, row) => <span className="text-slate-700">{row.author_name}</span>
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (_, row) => (
        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
          {row.category_name}
        </span>
      )
    },
    {
      key: 'available_copies',
      label: 'Copies (Avail/Total)',
      sortable: true,
      render: (_, row) => (
        <div className="text-xs">
          <span className={`font-bold ${row.available_copies > 0 ? 'text-blue-600' : 'text-red-500'}`}>
            {row.available_copies}
          </span>
          <span className="text-slate-400"> / {row.total_copies}</span>
        </div>
      )
    },
    {
      key: 'shelf_number',
      label: 'Shelf',
      render: (val) => <span className="text-xs font-mono text-slate-500">{val || '—'}</span>
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
            onClick={() => setSelectedBookForView(row)}
            title="View details"
            aria-label="View book"
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <FiEye className="text-base" />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/books/${row.id}/edit`)}
            title="Edit book"
            aria-label="Edit book"
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <FiEdit2 className="text-base" />
          </button>
          <button
            type="button"
            onClick={() => setBookToDelete(row)}
            title="Delete book"
            aria-label="Delete book"
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
        title="Books Management"
        subtitle="Catalogue of all library volumes, search, categories, and inventory copies"
        actions={
          <Link to="/books/create">
            <Button variant="primary" icon={FiPlus}>
              Add New Book
            </Button>
          </Link>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
            placeholder="Search by Title, ISBN, Author..."
          />

          <Select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            placeholder="All Categories"
            options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
          />

          <Select
            value={selectedAuthor}
            onChange={(e) => {
              setSelectedAuthor(e.target.value);
              setPage(1);
            }}
            placeholder="All Authors"
            options={authors.map((a) => ({ value: String(a.id), label: a.name }))}
          />

          <Select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            placeholder="All Statuses"
            options={[
              { value: 'Available', label: 'Available' },
              { value: 'Unavailable', label: 'Unavailable' }
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={books}
        loading={loading}
        sort={sort}
        order={order}
        onSort={handleSort}
        showRowNumber={true}
        pagination={pagination}
        onPageChange={(newPage) => setPage(newPage)}
        emptyMessage="No books matching filters"
        emptyDescription="Try clearing filters or search terms to see available library books."
        onEmptyAction={() => {
          setSearch('');
          setSelectedCategory('');
          setSelectedAuthor('');
          setSelectedStatus('');
        }}
        emptyActionText="Reset Filters"
      />

      {/* View Book Modal */}
      {selectedBookForView && (
        <BookDetailsModal
          isOpen={!!selectedBookForView}
          onClose={() => setSelectedBookForView(null)}
          book={selectedBookForView}
          onEdit={(b) => navigate(`/books/${b.id}/edit`)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {bookToDelete && (
        <ConfirmDialog
          isOpen={!!bookToDelete}
          onClose={() => setBookToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Book Record?"
          message={`Are you sure you want to remove "${bookToDelete.title}"? This action cannot be undone if the book has no active loans.`}
          confirmText="Delete Book"
          confirmVariant="danger"
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default BookList;

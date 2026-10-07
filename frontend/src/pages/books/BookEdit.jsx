import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBookById, updateBook } from '../../features/books/bookSlice';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import BookForm from '../../components/books/BookForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import toast from 'react-hot-toast';

const BookEdit = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedBook, loading, actionLoading, error } = useSelector((state) => state.books);

  useEffect(() => {
    if (id) {
      dispatch(fetchBookById(id));
    }
  }, [id, dispatch]);

  const handleSubmit = async (bookData) => {
    const res = await dispatch(updateBook({ id, bookData }));
    if (updateBook.fulfilled.match(res)) {
      toast.success('Book updated successfully!');
      navigate('/books');
    } else {
      toast.error(res.payload || 'Failed to update book');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading book details..." className="py-20" />;
  }

  if (error || !selectedBook) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <ErrorState
          title="Book Not Found"
          message={error || 'Unable to locate the specified book record.'}
          onRetry={() => dispatch(fetchBookById(id))}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Edit: ${selectedBook.title}`}
        subtitle={`Updating ISBN ${selectedBook.isbn} and catalog attributes`}
      />

      <Card>
        <BookForm
          initialData={selectedBook}
          onSubmit={handleSubmit}
          loading={actionLoading}
          onCancel={() => navigate('/books')}
        />
      </Card>
    </div>
  );
};

export default BookEdit;

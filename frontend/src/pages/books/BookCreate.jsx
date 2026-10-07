import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createBook } from '../../features/books/bookSlice';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import BookForm from '../../components/books/BookForm';
import toast from 'react-hot-toast';

const BookCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { actionLoading } = useSelector((state) => state.books);

  const handleSubmit = async (bookData) => {
    const res = await dispatch(createBook(bookData));
    if (createBook.fulfilled.match(res)) {
      toast.success('Book created successfully!');
      navigate('/books');
    } else {
      toast.error(res.payload || 'Failed to create book');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Add New Book"
        subtitle="Catalog a new volume with author, category, copies, and location"
      />

      <Card>
        <BookForm
          onSubmit={handleSubmit}
          loading={actionLoading}
          onCancel={() => navigate('/books')}
        />
      </Card>
    </div>
  );
};

export default BookCreate;

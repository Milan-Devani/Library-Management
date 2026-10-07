import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import FormField from '../common/FormField';
import { fetchAuthors } from '../../features/authors/authorSlice';
import { fetchCategories } from '../../features/categories/categorySlice';
import { isValidISBN, isPositiveInt } from '../../utils/validation';

const BookForm = ({
  initialData = null,
  onSubmit,
  loading = false,
  onCancel = null
}) => {
  const dispatch = useDispatch();
  const { authors } = useSelector((state) => state.authors);
  const { categories } = useSelector((state) => state.categories);

  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    author_id: '',
    category_id: '',
    publisher: '',
    publication_year: new Date().getFullYear(),
    total_copies: 1,
    shelf_number: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchAuthors({ limit: 100 }));
    dispatch(fetchCategories({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        isbn: initialData.isbn || '',
        author_id: initialData.author_id ? String(initialData.author_id) : '',
        category_id: initialData.category_id ? String(initialData.category_id) : '',
        publisher: initialData.publisher || '',
        publication_year: initialData.publication_year || new Date().getFullYear(),
        total_copies: initialData.total_copies ?? 1,
        shelf_number: initialData.shelf_number || '',
        description: initialData.description || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.isbn.trim()) {
      newErrors.isbn = 'ISBN is required';
    } else if (!isValidISBN(formData.isbn)) {
      newErrors.isbn = 'Please enter a valid 10 or 13 digit ISBN';
    }
    if (!formData.author_id) newErrors.author_id = 'Author is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (!isPositiveInt(formData.total_copies)) {
      newErrors.total_copies = 'Total copies must be a positive integer';
    }
    const currentYear = new Date().getFullYear();
    if (
      formData.publication_year &&
      (isNaN(formData.publication_year) ||
        formData.publication_year < 1000 ||
        formData.publication_year > currentYear + 1)
    ) {
      newErrors.publication_year = 'Please enter a valid publication year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const authorOptions = authors.map((a) => ({ value: String(a.id), label: `${a.name} (${a.country || 'Unknown'})` }));
  const categoryOptions = categories.map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 2-column layout on desktop, 1-column on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Book Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="e.g. Clean Code: Agile Software"
          required
        />

        <Input
          label="ISBN"
          name="isbn"
          value={formData.isbn}
          onChange={handleChange}
          error={errors.isbn}
          placeholder="e.g. 978-0132350884"
          required
        />

        <Select
          label="Author"
          name="author_id"
          value={formData.author_id}
          onChange={handleChange}
          error={errors.author_id}
          options={authorOptions}
          placeholder="Select an Author"
          required
        />

        <Select
          label="Category"
          name="category_id"
          value={formData.category_id}
          onChange={handleChange}
          error={errors.category_id}
          options={categoryOptions}
          placeholder="Select a Category"
          required
        />

        <Input
          label="Publisher"
          name="publisher"
          value={formData.publisher}
          onChange={handleChange}
          placeholder="e.g. Prentice Hall"
        />

        <Input
          label="Publication Year"
          name="publication_year"
          type="number"
          value={formData.publication_year}
          onChange={handleChange}
          error={errors.publication_year}
          placeholder="e.g. 2024"
        />

        <Input
          label="Total Copies"
          name="total_copies"
          type="number"
          min="1"
          value={formData.total_copies}
          onChange={handleChange}
          error={errors.total_copies}
          required
        />

        <Input
          label="Shelf / Rack Number"
          name="shelf_number"
          value={formData.shelf_number}
          onChange={handleChange}
          placeholder="e.g. Rack A-102"
        />
      </div>

      <FormField label="Description">
        <textarea
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          placeholder="Brief summary or subject notes regarding this book..."
          className="block w-full rounded-lg text-sm border border-slate-300 p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </FormField>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          {initialData ? 'Update Book' : 'Add Book'}
        </Button>
      </div>
    </form>
  );
};

export default BookForm;

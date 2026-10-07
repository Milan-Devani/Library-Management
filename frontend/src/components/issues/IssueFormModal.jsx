import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Select from '../common/Select';
import DateInput from '../common/DateInput';
import FormField from '../common/FormField';
import Button from '../common/Button';
import api from '../../api/axios';

const IssueFormModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [fetchingData, setFetchingData] = useState(false);

  const getToday = () => new Date().toISOString().split('T')[0];
  const getDefaultDue = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    member_id: '',
    book_id: '',
    issue_date: getToday(),
    due_date: getDefaultDue(),
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        member_id: '',
        book_id: '',
        issue_date: getToday(),
        due_date: getDefaultDue(),
        notes: '',
      });
      setErrors({});

      const loadOptions = async () => {
        setFetchingData(true);
        try {
          const [mRes, bRes] = await Promise.all([
            api.get('/members', { params: { limit: 100, status: 'Active' } }),
            api.get('/books', { params: { limit: 100, status: 'Available' } }),
          ]);
          setMembers(mRes.data.data.members || []);
          setBooks(bRes.data.data.books || []);
        } catch {
          // Handled gracefully
        } finally {
          setFetchingData(false);
        }
      };

      loadOptions();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.member_id) newErrors.member_id = 'Please select a member';
    if (!formData.book_id) newErrors.book_id = 'Please select a book';
    if (!formData.issue_date) newErrors.issue_date = 'Issue date is required';
    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    } else if (formData.issue_date && formData.due_date < formData.issue_date) {
      newErrors.due_date = 'Due date cannot be before issue date';
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

  const memberOptions = members.map((m) => ({
    value: String(m.id),
    label: `${m.full_name} (${m.member_code}) — ${m.department || 'Student'}`
  }));

  const bookOptions = books
    .filter((b) => b.available_copies > 0)
    .map((b) => ({
      value: String(b.id),
      label: `${b.title} [Copies Available: ${b.available_copies}] (${b.isbn})`
    }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Book to Student / Member"
      size="md"
      closeOnBackdrop={!loading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Member / Student"
          name="member_id"
          value={formData.member_id}
          onChange={handleChange}
          options={memberOptions}
          error={errors.member_id}
          placeholder={fetchingData ? 'Loading members...' : 'Choose an active member'}
          disabled={fetchingData || loading}
          required
        />

        <Select
          label="Select Book"
          name="book_id"
          value={formData.book_id}
          onChange={handleChange}
          options={bookOptions}
          error={errors.book_id}
          placeholder={fetchingData ? 'Loading available books...' : 'Choose a book with available copies'}
          disabled={fetchingData || loading}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateInput
            label="Issue Date"
            name="issue_date"
            value={formData.issue_date}
            onChange={handleChange}
            error={errors.issue_date}
            required
          />

          <DateInput
            label="Due Date (14 Days Default)"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
            min={formData.issue_date}
            error={errors.due_date}
            required
          />
        </div>

        <FormField label="Librarian Notes (Optional)">
          <textarea
            name="notes"
            rows="2"
            value={formData.notes}
            onChange={handleChange}
            placeholder="e.g. Semester project reference, exam preparation..."
            className="block w-full rounded-lg text-sm border border-slate-300 p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Issue Book
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default IssueFormModal;

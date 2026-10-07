import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createIssue } from '../../features/issues/issueSlice';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import DateInput from '../../components/common/DateInput';
import FormField from '../../components/common/FormField';
import Button from '../../components/common/Button';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiShare2, FiAlertCircle } from 'react-icons/fi';

const IssueCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { actionLoading } = useSelector((state) => state.issues);

  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [fetchingData, setFetchingData] = useState(true);

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
    const loadOptions = async () => {
      try {
        const [mRes, bRes] = await Promise.all([
          api.get('/members', { params: { limit: 100, status: 'Active' } }),
          api.get('/books', { params: { limit: 100, status: 'Available' } }),
        ]);
        setMembers(mRes.data.data.members || []);
        setBooks(bRes.data.data.books || []);
      } catch {
        toast.error('Failed to load active members or books');
      } finally {
        setFetchingData(false);
      }
    };

    loadOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.member_id) newErrors.member_id = 'Please select a student / member';
    if (!formData.book_id) newErrors.book_id = 'Please select an available book';
    if (!formData.issue_date) newErrors.issue_date = 'Issue date is required';
    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    } else if (formData.issue_date && formData.due_date < formData.issue_date) {
      newErrors.due_date = 'Due date cannot be earlier than issue date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const res = await dispatch(createIssue(formData));
    if (createIssue.fulfilled.match(res)) {
      toast.success('Book issued successfully!');
      navigate('/issues');
    } else {
      toast.error(res.payload || 'Failed to issue book');
    }
  };

  const memberOptions = members.map((m) => ({
    value: String(m.id),
    label: `${m.full_name} (${m.member_code}) — ${m.department || 'Active Student'}`
  }));

  const bookOptions = books
    .filter((b) => b.available_copies > 0)
    .map((b) => ({
      value: String(b.id),
      label: `${b.title} [Copies Available: ${b.available_copies}] (${b.isbn})`
    }));

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Issue Book to Member"
        subtitle="Authorize and register an active book circulation transaction"
        actions={
          <Button variant="secondary" icon={FiArrowLeft} onClick={() => navigate('/issues')}>
            Back to Registry
          </Button>
        }
      />

      {/* Rules Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
        <FiAlertCircle className="text-blue-600 text-lg shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Circulation Guidelines & Validation Rules:</p>
          <ul className="list-disc list-inside mt-1 space-y-0.5 text-blue-800">
            <li>Member must have an active status with no exceeding loan limits.</li>
            <li>Book must possess at least one copy in available inventory.</li>
            <li>Default lending term is 14 days; late returns incur automatic fines upon check-in.</li>
            <li>Transactions update book inventory levels automatically via database commit.</li>
          </ul>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Select
            label="Select Borrower (Member)"
            name="member_id"
            value={formData.member_id}
            onChange={handleChange}
            options={memberOptions}
            error={errors.member_id}
            placeholder={fetchingData ? 'Loading members...' : 'Choose an active member'}
            disabled={fetchingData || actionLoading}
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
            disabled={fetchingData || actionLoading}
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
              label="Due Date (Default: 14 Days)"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              min={formData.issue_date}
              error={errors.due_date}
              required
            />
          </div>

          <FormField label="Circulation Notes (Optional)">
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Semester project reference, exam preparation..."
              className="block w-full rounded-lg text-sm border border-slate-300 p-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => navigate('/issues')} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={FiShare2}
              loading={actionLoading}
            >
              Issue Book
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default IssueCreate;

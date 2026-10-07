import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FiSettings, FiSave, FiInfo } from 'react-icons/fi';

const Settings = () => {
  const [settings, setSettings] = useState({
    library_name: 'College Central Library',
    fine_per_day: '5.00',
    max_issue_days: '14',
    max_books_per_member: '3',
    contact_email: 'library@college.edu',
    contact_phone: '+91 98765 43210',
    currency_symbol: '₹'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.data.settings) {
          setSettings((prev) => ({ ...prev, ...res.data.data.settings }));
        }
      } catch {
        toast.error('Failed to load library settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/settings', settings);
      if (res.data.success) {
        toast.success('Library settings updated successfully!');
      } else {
        toast.error(res.data.message || 'Failed to update settings');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading library configuration..." className="py-20" />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="System & Library Settings"
        subtitle="Configure institution rules, fine fees, loan limits, and desk contact details"
      />

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
        <FiInfo className="text-blue-600 text-lg shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Administrative Rule Engine:</p>
          <p className="mt-0.5 text-blue-800">
            Rules configured here directly enforce transaction constraints on book issue and return
            transactions, such as maximum simultaneous active borrows and penalty calculations.
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Library System Name"
              name="library_name"
              value={settings.library_name}
              onChange={handleChange}
              placeholder="e.g. Central University Library"
              required
            />

            <Input
              label="Default Overdue Fine (Per Day)"
              name="fine_per_day"
              type="number"
              step="0.5"
              min="0"
              value={settings.fine_per_day}
              onChange={handleChange}
              helperText="Fine charged per overdue day (in INR)"
              required
            />

            <Input
              label="Default Loan Term (Days)"
              name="max_issue_days"
              type="number"
              min="1"
              max="90"
              value={settings.max_issue_days}
              onChange={handleChange}
              helperText="Standard borrowing period before book is marked overdue"
              required
            />

            <Input
              label="Max Active Books Per Student"
              name="max_books_per_member"
              type="number"
              min="1"
              max="15"
              value={settings.max_books_per_member}
              onChange={handleChange}
              helperText="Maximum simultaneously unreturned books permitted per member"
              required
            />

            <Input
              label="Librarian Contact Email"
              name="contact_email"
              type="email"
              value={settings.contact_email}
              onChange={handleChange}
              placeholder="library@college.edu"
              required
            />

            <Input
              label="Helpdesk Phone Number"
              name="contact_phone"
              value={settings.contact_phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              required
            />

            <Input
              label="Currency Symbol"
              name="currency_symbol"
              value={settings.currency_symbol}
              onChange={handleChange}
              placeholder="₹"
              required
            />
          </div>

          <div className="flex items-center justify-end pt-5 border-t border-slate-100">
            <Button
              type="submit"
              variant="primary"
              icon={FiSave}
              loading={saving}
            >
              Save Configuration
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Settings;

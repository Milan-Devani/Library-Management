import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import FormField from '../common/FormField';
import DateInput from '../common/DateInput';
import { isValidEmail, isValidPhone } from '../../utils/validation';

const MemberForm = ({
  initialData = null,
  onSubmit,
  loading = false,
  onCancel = null
}) => {
  const [formData, setFormData] = useState({
    member_code: '',
    full_name: '',
    email: '',
    phone: '',
    department: '',
    course: '',
    year: '1st Year',
    address: '',
    status: 'Active',
    join_date: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        member_code: initialData.member_code || '',
        full_name: initialData.full_name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        department: initialData.department || '',
        course: initialData.course || '',
        year: initialData.year || '1st Year',
        address: initialData.address || '',
        status: initialData.status || 'Active',
        join_date: initialData.join_date || new Date().toISOString().split('T')[0],
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
    if (!formData.member_code.trim()) newErrors.member_code = 'Member Code / Student ID is required';
    if (!formData.full_name.trim()) newErrors.full_name = 'Full Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
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

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  const yearOptions = [
    { value: '1st Year', label: '1st Year' },
    { value: '2nd Year', label: '2nd Year' },
    { value: '3rd Year', label: '3rd Year' },
    { value: '4th Year', label: '4th Year' },
    { value: 'Faculty / Staff', label: 'Faculty / Staff' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Student / Member Code"
          name="member_code"
          value={formData.member_code}
          onChange={handleChange}
          error={errors.member_code}
          placeholder="e.g. STU001"
          required
        />

        <Input
          label="Full Name"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          error={errors.full_name}
          placeholder="e.g. Aarav Sharma"
          required
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="e.g. aarav.sharma@college.edu"
          required
        />

        <Input
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="e.g. 9876543201"
          required
        />

        <Input
          label="Department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          placeholder="e.g. Computer Science"
        />

        <Input
          label="Course / Degree"
          name="course"
          value={formData.course}
          onChange={handleChange}
          placeholder="e.g. B.Tech CSE"
        />

        <Select
          label="Academic Year"
          name="year"
          value={formData.year}
          onChange={handleChange}
          options={yearOptions}
        />

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
        />

        <DateInput
          label="Join Date"
          name="join_date"
          value={formData.join_date}
          onChange={handleChange}
        />
      </div>

      <FormField label="Campus Address / Hostel Info">
        <textarea
          name="address"
          rows="2"
          value={formData.address}
          onChange={handleChange}
          placeholder="Hostel block, room number, or residential address..."
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
          {initialData ? 'Update Member' : 'Add Member'}
        </Button>
      </div>
    </form>
  );
};

export default MemberForm;

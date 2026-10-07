import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import DateInput from '../common/DateInput';
import Button from '../common/Button';
import { formatDate, formatCurrency, calculateDaysDiff } from '../../utils/helpers';
import { FiCornerDownLeft, FiAlertCircle } from 'react-icons/fi';

const ReturnModal = ({ isOpen, onClose, issue, onConfirm, loading = false }) => {
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen) {
      setReturnDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  if (!issue) return null;

  // Calculate live preview of overdue days and fine
  const daysOverdue = Math.max(0, calculateDaysDiff(issue.due_date, returnDate));
  const fineRate = 5; // Default ₹5 per day
  const estimatedFine = daysOverdue * fineRate;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      issueId: issue.id,
      returnDate: returnDate
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Return Book & Settle Fine"
      size="md"
      closeOnBackdrop={!loading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Book & Member Info Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm space-y-2">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Book:</span>
            <p className="font-semibold text-slate-800 leading-tight">{issue.book_title}</p>
            <p className="text-xs font-mono text-slate-500">ISBN: {issue.book_isbn}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Borrower:</span>
            <p className="font-medium text-slate-800">{issue.member_name} ({issue.member_code})</p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
            <div>
              <span className="text-slate-400">Issue Date:</span>
              <p className="font-medium text-slate-700">{formatDate(issue.issue_date)}</p>
            </div>
            <div>
              <span className="text-slate-400">Due Date:</span>
              <p className="font-medium text-slate-700">{formatDate(issue.due_date)}</p>
            </div>
          </div>
        </div>

        <DateInput
          label="Return Date"
          value={returnDate}
          onChange={(e) => setReturnDate(e.target.value)}
          required
        />

        {/* Fine Preview Banner */}
        {daysOverdue > 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
            <FiAlertCircle className="text-amber-600 text-lg shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-bold">Overdue Fine Applicable</p>
              <p className="mt-0.5">
                Book is returned <strong className="text-amber-900">{daysOverdue} days</strong> after due date.
                Fine calculation: {daysOverdue} days × ₹{fineRate}/day = <strong className="text-amber-900 font-bold">{formatCurrency(estimatedFine)}</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 font-medium">
            ✓ Returned on time. No overdue fine will be incurred.
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="success"
            icon={FiCornerDownLeft}
            loading={loading}
          >
            Confirm Return
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReturnModal;

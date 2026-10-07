import React from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { formatDate } from '../../utils/helpers';
import { FiBook, FiUser, FiLayers, FiCalendar, FiMapPin, FiHash, FiClock } from 'react-icons/fi';

const BookDetailsModal = ({ isOpen, onClose, book, onEdit = null }) => {
  if (!book) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Information & Availability"
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <StatusBadge status={book.status} />
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(book);
                }}
              >
                Edit Book
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Title & Author Header */}
        <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FiBook className="text-2xl" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900 leading-snug">{book.title}</h4>
            <p className="text-sm text-slate-500 mt-0.5">By {book.author_name || 'Unknown Author'}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2.5 text-slate-600">
            <FiHash className="text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium">ISBN:</span>
            <span className="font-mono text-slate-800">{book.isbn}</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-600">
            <FiLayers className="text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium">Category:</span>
            <span className="text-slate-800 font-semibold">{book.category_name || 'General'}</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-600">
            <FiCalendar className="text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium">Year:</span>
            <span className="text-slate-800">{book.publication_year || 'N/A'}</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-600">
            <FiUser className="text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium">Publisher:</span>
            <span className="text-slate-800">{book.publisher || 'N/A'}</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-600">
            <FiMapPin className="text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium">Shelf:</span>
            <span className="text-slate-800 font-medium bg-slate-100 px-2 py-0.5 rounded text-xs">{book.shelf_number || 'Unassigned'}</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-600">
            <FiClock className="text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium">Copies:</span>
            <span className="text-slate-800 font-medium">
              <strong className="text-blue-600 font-bold">{book.available_copies}</strong> available / {book.total_copies} total
            </span>
          </div>
        </div>

        {/* Description */}
        {book.description && (
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Description / Notes</h5>
            <p className="text-sm text-slate-700 leading-relaxed">{book.description}</p>
          </div>
        )}

        {/* Recent Borrowing History */}
        {book.recent_issues && book.recent_issues.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Recent Borrowing Activity</h5>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Student</th>
                    <th className="py-2 px-3">Issue Date</th>
                    <th className="py-2 px-3">Due Date</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {book.recent_issues.map((rec) => (
                    <tr key={rec.id}>
                      <td className="py-2 px-3 font-medium text-slate-800">
                        {rec.member_name} ({rec.member_code})
                      </td>
                      <td className="py-2 px-3 text-slate-600">{formatDate(rec.issue_date)}</td>
                      <td className="py-2 px-3 text-slate-600">{formatDate(rec.due_date)}</td>
                      <td className="py-2 px-3">
                        <StatusBadge status={rec.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BookDetailsModal;

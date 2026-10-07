import React from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { FiUser, FiMail, FiPhone, FiBook, FiAward, FiCalendar, FiMapPin } from 'react-icons/fi';

const MemberDetailsModal = ({ isOpen, onClose, member, onEdit = null }) => {
  if (!member) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Member / Student Profile"
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <StatusBadge status={member.status} />
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(member);
                }}
              >
                Edit Profile
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
        {/* Header */}
        <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
          <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold">
            {member.full_name ? member.full_name.charAt(0).toUpperCase() : <FiUser />}
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900 leading-snug">{member.full_name}</h4>
            <p className="text-xs font-mono text-blue-600 font-semibold">{member.member_code}</p>
          </div>
        </div>

        {/* Member Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2.5 text-slate-600">
            <FiMail className="text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium">Email:</span>
            <span className="text-slate-800 break-all">{member.email}</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-600">
            <FiPhone className="text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium">Phone:</span>
            <span className="text-slate-800">{member.phone}</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-600">
            <FiAward className="text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium">Dept & Course:</span>
            <span className="text-slate-800">{member.department || 'N/A'} — {member.course || 'N/A'}</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-600">
            <FiCalendar className="text-slate-400 shrink-0" />
            <span className="text-slate-500 font-medium">Joined:</span>
            <span className="text-slate-800">{formatDate(member.join_date)} ({member.year || 'N/A'})</span>
          </div>

          {member.address && (
            <div className="flex items-center gap-2.5 text-slate-600 sm:col-span-2">
              <FiMapPin className="text-slate-400 shrink-0" />
              <span className="text-slate-500 font-medium">Address:</span>
              <span className="text-slate-800">{member.address}</span>
            </div>
          )}
        </div>

        {/* Pending Fine Alert */}
        {member.pending_fines > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 flex items-center justify-between text-xs">
            <div className="text-red-800">
              <span className="font-bold">Pending Fine Notice:</span> Member has an outstanding fine balance.
            </div>
            <span className="font-bold text-sm text-red-700">{formatCurrency(member.pending_fines)}</span>
          </div>
        )}

        {/* Issued Books History */}
        <div>
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Issued Books History ({member.issues ? member.issues.length : 0})
          </h5>
          {member.issues && member.issues.length > 0 ? (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Book</th>
                    <th className="py-2 px-3">Issue Date</th>
                    <th className="py-2 px-3">Due Date</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {member.issues.map((rec) => (
                    <tr key={rec.id}>
                      <td className="py-2 px-3 font-medium text-slate-800">{rec.book_title}</td>
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
          ) : (
            <p className="text-xs text-slate-400 italic">No borrowing records on file for this member.</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default MemberDetailsModal;

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchMemberById } from '../../features/members/memberSlice';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { FiEdit2, FiArrowLeft, FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiAward, FiBook } from 'react-icons/fi';

const MemberDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedMember, loading, error } = useSelector((state) => state.members);

  useEffect(() => {
    if (id) {
      dispatch(fetchMemberById(id));
    }
  }, [id, dispatch]);

  if (loading) {
    return <LoadingSpinner message="Loading member profile..." className="py-20" />;
  }

  if (error || !selectedMember) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <ErrorState
          title="Member Not Found"
          message={error || 'Unable to locate member profile.'}
          onRetry={() => dispatch(fetchMemberById(id))}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={selectedMember.full_name}
        subtitle={`Member Code: ${selectedMember.member_code} • ${selectedMember.department || 'Student'}`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={FiArrowLeft} onClick={() => navigate('/members')}>
              Back to Members
            </Button>
            <Link to={`/members/${id}/edit`}>
              <Button variant="primary" icon={FiEdit2}>
                Edit Profile
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card title="Student / Member Information">
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                <div className="h-14 w-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
                  {selectedMember.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-snug">{selectedMember.full_name}</h3>
                  <p className="text-xs font-mono font-semibold text-blue-600 mt-0.5">{selectedMember.member_code}</p>
                  <StatusBadge status={selectedMember.status} className="mt-2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Email Address</span>
                  <span className="text-slate-800 font-semibold">{selectedMember.email}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Phone</span>
                  <span className="text-slate-800 font-mono">{selectedMember.phone}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Department</span>
                  <span className="text-slate-800">{selectedMember.department || '—'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Course / Year</span>
                  <span className="text-slate-800">{selectedMember.course || '—'} ({selectedMember.year || 'N/A'})</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-slate-400 font-medium block">Address</span>
                  <span className="text-slate-800">{selectedMember.address || 'No campus address listed.'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Borrowing History */}
          <Card title="Circulation / Loan History">
            {selectedMember.issues && selectedMember.issues.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Book Title</th>
                      <th className="py-2.5 px-3">Issue Date</th>
                      <th className="py-2.5 px-3">Due Date</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedMember.issues.map((issue) => (
                      <tr key={issue.id}>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{issue.book_title}</td>
                        <td className="py-2.5 px-3 text-slate-600">{formatDate(issue.issue_date)}</td>
                        <td className="py-2.5 px-3 text-slate-600">{formatDate(issue.due_date)}</td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={issue.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">No past loan activity on record.</p>
            )}
          </Card>
        </div>

        {/* Sidebar Status Summary */}
        <div className="space-y-6">
          <Card title="Account Summary">
            <div className="text-center py-4 space-y-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Total Unsettled Fines</span>
              <h4 className={`text-2xl font-bold ${selectedMember.pending_fines > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                {formatCurrency(selectedMember.pending_fines || 0)}
              </h4>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs space-y-2.5">
              <div className="flex justify-between text-slate-600">
                <span>Registration Date:</span>
                <span className="font-semibold text-slate-800">{formatDate(selectedMember.join_date)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Account Status:</span>
                <StatusBadge status={selectedMember.status} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;

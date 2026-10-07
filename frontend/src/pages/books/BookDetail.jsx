import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchBookById } from '../../features/books/bookSlice';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/helpers';
import { FiEdit2, FiArrowLeft, FiBook, FiHash, FiLayers, FiCalendar, FiUser, FiMapPin, FiClock } from 'react-icons/fi';

const BookDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedBook, loading, error } = useSelector((state) => state.books);

  useEffect(() => {
    if (id) {
      dispatch(fetchBookById(id));
    }
  }, [id, dispatch]);

  if (loading) {
    return <LoadingSpinner message="Loading book details..." className="py-20" />;
  }

  if (error || !selectedBook) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <ErrorState
          title="Book Not Found"
          message={error || 'Unable to locate the specified book record.'}
          onRetry={() => dispatch(fetchBookById(id))}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={selectedBook.title}
        subtitle={`Detailed metadata, inventory numbers, and active student loans`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={FiArrowLeft} onClick={() => navigate('/books')}>
              Back to Books
            </Button>
            <Link to={`/books/${id}/edit`}>
              <Button variant="primary" icon={FiEdit2}>
                Edit Book
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <Card title="Book Overview">
            <div className="space-y-4">
              <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
                  <FiBook className="text-3xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 leading-snug">{selectedBook.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Written by <strong className="text-slate-700">{selectedBook.author_name}</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                <div>
                  <span className="text-xs text-slate-400 font-medium block">ISBN</span>
                  <span className="font-mono text-slate-800 font-semibold">{selectedBook.isbn}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Category</span>
                  <span className="text-slate-800 font-semibold">{selectedBook.category_name}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Publisher</span>
                  <span className="text-slate-800">{selectedBook.publisher || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Year Published</span>
                  <span className="text-slate-800">{selectedBook.publication_year || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Shelf / Location</span>
                  <span className="text-slate-800 font-medium bg-slate-100 px-2 py-0.5 rounded text-xs">
                    {selectedBook.shelf_number || 'Unassigned'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Catalog Status</span>
                  <StatusBadge status={selectedBook.status} className="mt-0.5" />
                </div>
              </div>

              {selectedBook.description && (
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Summary / Description
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {selectedBook.description}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Loans */}
          <Card title="Circulation / Loan History">
            {selectedBook.recent_issues && selectedBook.recent_issues.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Issue Date</th>
                      <th className="py-2.5 px-3">Due Date</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedBook.recent_issues.map((issue) => (
                      <tr key={issue.id}>
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {issue.member_name} ({issue.member_code})
                        </td>
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
              <p className="text-xs text-slate-400 italic py-2">No circulation activity recorded for this book.</p>
            )}
          </Card>
        </div>

        {/* Sidebar Cards (1 col) */}
        <div className="space-y-6">
          <Card title="Inventory Copies">
            <div className="text-center py-4 space-y-3">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 border-4 border-blue-100 text-blue-600 font-bold text-2xl">
                {selectedBook.available_copies}
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Available for Borrowing</p>
                <p className="text-sm font-medium text-slate-600 mt-1">
                  Out of <strong className="text-slate-800">{selectedBook.total_copies}</strong> physical copies
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Total Registered:</span>
                <span className="font-semibold text-slate-800">{selectedBook.total_copies}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Currently Issued:</span>
                <span className="font-semibold text-blue-600">{selectedBook.issued_copies || 0}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Available Copies:</span>
                <span className="font-semibold text-emerald-600">{selectedBook.available_copies}</span>
              </div>
            </div>
          </Card>

          {/* Author Card */}
          <Card title="Author Information">
            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-800 text-sm">{selectedBook.author_name}</p>
              <p className="text-slate-500">Origin: {selectedBook.author_country || 'Not specified'}</p>
              {selectedBook.author_biography && (
                <p className="text-slate-600 italic mt-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  "{selectedBook.author_biography}"
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;

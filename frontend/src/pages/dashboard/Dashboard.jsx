import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDashboardStats } from '../../features/dashboard/dashboardSlice';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import Skeleton from '../../components/common/Skeleton';
import ErrorState from '../../components/common/ErrorState';
import Button from '../../components/common/Button';
import { formatDate, formatCurrency } from '../../utils/helpers';
import {
  FiBook,
  FiUsers,
  FiShare2,
  FiAlertCircle,
  FiLayers,
  FiUserCheck,
  FiDollarSign,
  FiCheckCircle,
  FiPlus,
  FiTrendingUp,
  FiClock
} from 'react-icons/fi';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { counts, recent_issues, popular_books, overdue_books, loading, error } = useSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading && !counts.total_books) {
    return (
      <div className="space-y-6">
        <PageHeader title="Library Dashboard" subtitle="Overview of library activities, circulation, and metrics" />
        <Skeleton variant="card" count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Skeleton variant="table" count={5} />
          <Skeleton variant="table" count={5} />
        </div>
      </div>
    );
  }

  if (error && !counts.total_books) {
    return (
      <div className="space-y-6">
        <PageHeader title="Library Dashboard" subtitle="Overview of library activities, circulation, and metrics" />
        <ErrorState message={error} onRetry={() => dispatch(fetchDashboardStats())} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library Overview & Statistics"
        subtitle="Live catalog metrics, circulation tracking, and student borrow activity"
        actions={
          <div className="flex gap-2">
            <Link to="/issues">
              <Button variant="primary" icon={FiShare2} size="sm">
                Issue Book
              </Button>
            </Link>
            <Link to="/books/create">
              <Button variant="secondary" icon={FiPlus} size="sm">
                New Book
              </Button>
            </Link>
          </div>
        }
      />

      {/* 8 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Books"
          value={counts.total_books}
          subtitle={`${counts.total_book_copies} physical copies in stock`}
          icon={FiBook}
          color="blue"
        />

        <StatCard
          title="Available Books"
          value={counts.available_copies}
          subtitle="Ready on shelf for borrowing"
          icon={FiCheckCircle}
          color="emerald"
        />

        <StatCard
          title="Books Issued"
          value={counts.books_issued}
          subtitle="Currently in circulation"
          icon={FiShare2}
          color="indigo"
        />

        <StatCard
          title="Overdue Books"
          value={counts.overdue_books}
          subtitle="Past due return date"
          icon={FiAlertCircle}
          color="rose"
        />

        <StatCard
          title="Registered Members"
          value={counts.total_members}
          subtitle={`${counts.total_all_members} total students & faculty`}
          icon={FiUsers}
          color="purple"
        />

        <StatCard
          title="Book Categories"
          value={counts.total_categories}
          subtitle="Classification subjects"
          icon={FiLayers}
          color="amber"
        />

        <StatCard
          title="Registered Authors"
          value={counts.total_authors}
          subtitle="Authors in library catalog"
          icon={FiUserCheck}
          color="slate"
        />

        <StatCard
          title="Total Fines"
          value={formatCurrency(counts.total_fines)}
          subtitle={`${formatCurrency(counts.pending_fines)} pending / ${formatCurrency(counts.collected_fines)} collected`}
          icon={FiDollarSign}
          color="amber"
        />
      </div>

      {/* Main Tables Grid: Recent Issues & Popular Books */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Issues (2 Columns Wide on large screens) */}
        <div className="lg:col-span-2">
          <Card
            title="Recent Borrowing Activity"
            subtitle="Latest book circulation and return logs"
            headerAction={
              <Link to="/issues" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                View All Issues →
              </Link>
            }
            bodyClassName="p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Book</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {recent_issues && recent_issues.length > 0 ? (
                    recent_issues.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-800">
                          <div>{item.member_name}</div>
                          <span className="text-[11px] font-mono text-slate-400">{item.member_code}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 max-w-[200px] truncate" title={item.book_title}>
                          {item.book_title}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs">{formatDate(item.issue_date)}</td>
                        <td className="py-3 px-4 text-slate-500 text-xs">{formatDate(item.due_date)}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                        No recent issue logs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Popular Books (1 Column Wide) */}
        <div>
          <Card
            title="Popular Books"
            subtitle="Most frequently borrowed titles"
            headerAction={<FiTrendingUp className="text-blue-600 text-lg" />}
            bodyClassName="p-4"
          >
            <div className="space-y-3">
              {popular_books && popular_books.length > 0 ? (
                popular_books.map((book, idx) => (
                  <div
                    key={book.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-100/60 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3 overflow-hidden mr-2">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[11px]">
                        {idx + 1}
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 truncate" title={book.title}>
                          {book.title}
                        </p>
                        <p className="text-slate-400 text-[11px] truncate">By {book.author_name}</p>
                      </div>
                    </div>
                    <span className="shrink-0 font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {book.issue_count} issues
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No borrow records yet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Overdue Books Card */}
      <Card
        title="Overdue Books Attention List"
        subtitle="Unreturned books past due date with calculated pending fines"
        headerAction={
          <Link to="/returns" className="text-xs font-semibold text-rose-600 hover:text-rose-700">
            Process Returns →
          </Link>
        }
        bodyClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-rose-50/60 border-b border-rose-100 text-xs font-semibold text-rose-900 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Book Title</th>
                <th className="py-3 px-4">Borrower Member</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Days Overdue</th>
                <th className="py-3 px-4">Accrued Fine</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {overdue_books && overdue_books.length > 0 ? (
                overdue_books.map((item) => (
                  <tr key={item.id} className="hover:bg-rose-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <div>{item.book_title}</div>
                      <span className="text-[11px] font-mono text-slate-400">ISBN: {item.book_isbn}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div>{item.member_name}</div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {item.member_code} • {item.member_phone}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                      {formatDate(item.due_date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-red-600 text-xs bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        <FiClock className="text-xs" />
                        {item.days_overdue} days late
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 text-sm">
                      {formatCurrency(item.estimated_fine)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to="/returns">
                        <Button variant="outline" size="sm">
                          Return Book
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-emerald-600 text-xs font-medium">
                    ✓ Excellent! There are no overdue books at this time.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layout
import MainLayout from '../components/layout/MainLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Main Pages
import Dashboard from '../pages/dashboard/Dashboard';
import BookList from '../pages/books/BookList';
import BookCreate from '../pages/books/BookCreate';
import BookDetail from '../pages/books/BookDetail';
import BookEdit from '../pages/books/BookEdit';
import MemberList from '../pages/members/MemberList';
import MemberCreate from '../pages/members/MemberCreate';
import MemberDetail from '../pages/members/MemberDetail';
import MemberEdit from '../pages/members/MemberEdit';
import AuthorList from '../pages/authors/AuthorList';
import CategoryList from '../pages/categories/CategoryList';
import IssueList from '../pages/issues/IssueList';
import IssueCreate from '../pages/issues/IssueCreate';
import ReturnList from '../pages/returns/ReturnList';
import FineList from '../pages/fines/FineList';
import Settings from '../pages/settings/Settings';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Only Route Wrapper (redirects logged-in users away from /login)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Books */}
        <Route path="books" element={<BookList />} />
        <Route path="books/create" element={<BookCreate />} />
        <Route path="books/:id" element={<BookDetail />} />
        <Route path="books/:id/edit" element={<BookEdit />} />

        {/* Members */}
        <Route path="members" element={<MemberList />} />
        <Route path="members/create" element={<MemberCreate />} />
        <Route path="members/:id" element={<MemberDetail />} />
        <Route path="members/:id/edit" element={<MemberEdit />} />

        {/* Authors & Categories */}
        <Route path="authors" element={<AuthorList />} />
        <Route path="categories" element={<CategoryList />} />

        {/* Issues & Returns */}
        <Route path="issues" element={<IssueList />} />
        <Route path="issues/create" element={<IssueCreate />} />
        <Route path="returns" element={<ReturnList />} />

        {/* Fines */}
        <Route path="fines" element={<FineList />} />

        {/* Settings */}
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;

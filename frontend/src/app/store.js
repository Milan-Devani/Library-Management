import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import bookReducer from '../features/books/bookSlice';
import memberReducer from '../features/members/memberSlice';
import categoryReducer from '../features/categories/categorySlice';
import authorReducer from '../features/authors/authorSlice';
import issueReducer from '../features/issues/issueSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: bookReducer,
    members: memberReducer,
    categories: categoryReducer,
    authors: authorReducer,
    issues: issueReducer,
    dashboard: dashboardReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

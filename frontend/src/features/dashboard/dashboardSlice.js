import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { getErrorMessage } from '../../utils/helpers';

const initialState = {
  counts: {
    total_books: 0,
    total_book_copies: 0,
    available_copies: 0,
    total_members: 0,
    total_all_members: 0,
    total_categories: 0,
    total_authors: 0,
    books_issued: 0,
    overdue_books: 0,
    pending_fines: 0,
    collected_fines: 0,
    total_fines: 0
  },
  recent_issues: [],
  popular_books: [],
  overdue_books: [],
  loading: false,
  error: null
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to load dashboard data'));
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.counts = action.payload.data.counts;
        state.recent_issues = action.payload.data.recent_issues;
        state.popular_books = action.payload.data.popular_books;
        state.overdue_books = action.payload.data.overdue_books;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default dashboardSlice.reducer;

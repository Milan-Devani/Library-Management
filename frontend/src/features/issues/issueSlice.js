import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { getErrorMessage } from '../../utils/helpers';

const initialState = {
  issues: [],
  fines: [],
  fineSummary: {
    total_pending: 0,
    total_collected: 0,
    pending_count: 0
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  },
  finePagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  },
  loading: false,
  finesLoading: false,
  actionLoading: false,
  error: null,
  success: false,
  returnResult: null
};

export const fetchIssues = createAsyncThunk(
  'issues/fetchIssues',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/issues', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to fetch issue records'));
    }
  }
);

export const createIssue = createAsyncThunk(
  'issues/createIssue',
  async (issueData, { rejectWithValue }) => {
    try {
      const response = await api.post('/issues', issueData);
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to issue book'));
    }
  }
);

export const returnBook = createAsyncThunk(
  'issues/returnBook',
  async ({ issueId, returnDate }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/issues/${issueId}/return`, { return_date: returnDate });
      return { issueId, ...response.data };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to return book'));
    }
  }
);

export const fetchFines = createAsyncThunk(
  'issues/fetchFines',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/fines', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to fetch fines'));
    }
  }
);

export const payFine = createAsyncThunk(
  'issues/payFine',
  async (fineId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/fines/${fineId}/pay`);
      return { fineId, ...response.data };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to process fine payment'));
    }
  }
);

const issueSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    clearIssueError: (state) => {
      state.error = null;
      state.success = false;
      state.returnResult = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Issues
      .addCase(fetchIssues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIssues.fulfilled, (state, action) => {
        state.loading = false;
        state.issues = action.payload.data.issues;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Issue
      .addCase(createIssue.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createIssue.fulfilled, (state) => {
        state.actionLoading = false;
        state.success = true;
      })
      .addCase(createIssue.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Return Book
      .addCase(returnBook.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(returnBook.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        state.returnResult = action.payload.data;
        // Update issue in local list without page reload
        const index = state.issues.findIndex((i) => i.id === action.payload.issueId);
        if (index !== -1) {
          state.issues[index].status = 'Returned';
          state.issues[index].return_date = action.payload.data.return_date;
          state.issues[index].fine_amount = action.payload.data.fine_amount;
        }
      })
      .addCase(returnBook.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Fetch Fines
      .addCase(fetchFines.pending, (state) => {
        state.finesLoading = true;
        state.error = null;
      })
      .addCase(fetchFines.fulfilled, (state, action) => {
        state.finesLoading = false;
        state.fines = action.payload.data.fines;
        state.fineSummary = action.payload.data.summary;
        state.finePagination = action.payload.data.pagination;
      })
      .addCase(fetchFines.rejected, (state, action) => {
        state.finesLoading = false;
        state.error = action.payload;
      })
      // Pay Fine
      .addCase(payFine.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(payFine.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.success = true;
        const fine = state.fines.find((f) => f.id === action.payload.fineId);
        if (fine) {
          fine.payment_status = 'Paid';
          fine.paid_date = action.payload.data.paid_date;
          // Update local summary
          state.fineSummary.total_pending = Math.max(0, state.fineSummary.total_pending - Number(fine.fine_amount));
          state.fineSummary.total_collected += Number(fine.fine_amount);
          state.fineSummary.pending_count = Math.max(0, state.fineSummary.pending_count - 1);
        }
      })
      .addCase(payFine.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearIssueError } = issueSlice.actions;
export default issueSlice.reducer;

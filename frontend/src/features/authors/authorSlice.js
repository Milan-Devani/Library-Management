import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { getErrorMessage } from '../../utils/helpers';

const initialState = {
  authors: [],
  selectedAuthor: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  },
  loading: false,
  error: null,
  success: false,
  actionLoading: false
};

export const fetchAuthors = createAsyncThunk(
  'authors/fetchAuthors',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/authors', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to fetch authors'));
    }
  }
);

export const createAuthor = createAsyncThunk(
  'authors/createAuthor',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/authors', data);
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to create author'));
    }
  }
);

export const updateAuthor = createAsyncThunk(
  'authors/updateAuthor',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/authors/${id}`, data);
      return { id, ...response.data };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to update author'));
    }
  }
);

export const deleteAuthor = createAsyncThunk(
  'authors/deleteAuthor',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/authors/${id}`);
      return { id, message: response.data.message };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to delete author'));
    }
  }
);

const authorSlice = createSlice({
  name: 'authors',
  initialState,
  reducers: {
    clearAuthorError: (state) => {
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Authors
      .addCase(fetchAuthors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuthors.fulfilled, (state, action) => {
        state.loading = false;
        state.authors = action.payload.data.authors;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Author
      .addCase(createAuthor.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createAuthor.fulfilled, (state) => {
        state.actionLoading = false;
        state.success = true;
      })
      .addCase(createAuthor.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Update Author
      .addCase(updateAuthor.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateAuthor.fulfilled, (state) => {
        state.actionLoading = false;
        state.success = true;
      })
      .addCase(updateAuthor.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Delete Author
      .addCase(deleteAuthor.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteAuthor.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.authors = state.authors.filter((a) => a.id !== action.payload.id);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteAuthor.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearAuthorError } = authorSlice.actions;
export default authorSlice.reducer;

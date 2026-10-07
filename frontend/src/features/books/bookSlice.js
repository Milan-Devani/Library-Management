import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { getErrorMessage } from '../../utils/helpers';

const initialState = {
  books: [],
  selectedBook: null,
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

export const fetchBooks = createAsyncThunk(
  'books/fetchBooks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/books', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to fetch books'));
    }
  }
);

export const fetchBookById = createAsyncThunk(
  'books/fetchBookById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/books/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to fetch book details'));
    }
  }
);

export const createBook = createAsyncThunk(
  'books/createBook',
  async (bookData, { rejectWithValue }) => {
    try {
      const response = await api.post('/books', bookData);
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to create book'));
    }
  }
);

export const updateBook = createAsyncThunk(
  'books/updateBook',
  async ({ id, bookData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/books/${id}`, bookData);
      return { id, ...response.data };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to update book'));
    }
  }
);

export const deleteBook = createAsyncThunk(
  'books/deleteBook',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/books/${id}`);
      return { id, message: response.data.message };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to delete book'));
    }
  }
);

const bookSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    clearBookError: (state) => {
      state.error = null;
      state.success = false;
    },
    clearSelectedBook: (state) => {
      state.selectedBook = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Books
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload.data.books;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Book By Id
      .addCase(fetchBookById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBook = action.payload.data.book;
      })
      .addCase(fetchBookById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Book
      .addCase(createBook.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBook.fulfilled, (state) => {
        state.actionLoading = false;
        state.success = true;
      })
      .addCase(createBook.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Update Book
      .addCase(updateBook.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateBook.fulfilled, (state) => {
        state.actionLoading = false;
        state.success = true;
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Delete Book
      .addCase(deleteBook.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.books = state.books.filter((b) => b.id !== action.payload.id);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearBookError, clearSelectedBook } = bookSlice.actions;
export default bookSlice.reducer;

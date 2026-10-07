import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { getErrorMessage } from '../../utils/helpers';

const initialState = {
  categories: [],
  selectedCategory: null,
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

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/categories', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to fetch categories'));
    }
  }
);

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/categories', data);
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to create category'));
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/categories/${id}`, data);
      return { id, ...response.data };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to update category'));
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return { id, message: response.data.message };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to delete category'));
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data.categories;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.actionLoading = false;
        state.success = true;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.actionLoading = false;
        state.success = true;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.categories = state.categories.filter((c) => c.id !== action.payload.id);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { getErrorMessage } from '../../utils/helpers';

const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

let initialUser = null;
try {
  initialUser = storedUser ? JSON.parse(storedUser) : null;
} catch {
  initialUser = null;
}

const initialState = {
  user: initialUser,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  loading: false,
  error: null,
  success: false
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/login', credentials);
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to login'));
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to register'));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/logout');
      return true;
    } catch {
      // Even if network fails, logout locally
      return true;
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/me');
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
      state.success = false;
    },
    localLogout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        localStorage.setItem('user', JSON.stringify(action.payload.data.user));
        localStorage.setItem('token', action.payload.data.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        localStorage.setItem('user', JSON.stringify(action.payload.data.user));
        localStorage.setItem('token', action.payload.data.token);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      })
      // Check Auth
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      });
  }
});

export const { clearAuthError, localLogout } = authSlice.actions;
export default authSlice.reducer;

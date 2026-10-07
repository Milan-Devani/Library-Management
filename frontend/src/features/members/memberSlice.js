import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { getErrorMessage } from '../../utils/helpers';

const initialState = {
  members: [],
  selectedMember: null,
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

export const fetchMembers = createAsyncThunk(
  'members/fetchMembers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/members', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to fetch members'));
    }
  }
);

export const fetchMemberById = createAsyncThunk(
  'members/fetchMemberById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/members/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to fetch member details'));
    }
  }
);

export const createMember = createAsyncThunk(
  'members/createMember',
  async (memberData, { rejectWithValue }) => {
    try {
      const response = await api.post('/members', memberData);
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to create member'));
    }
  }
);

export const updateMember = createAsyncThunk(
  'members/updateMember',
  async ({ id, memberData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/members/${id}`, memberData);
      return { id, ...response.data };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to update member'));
    }
  }
);

export const deleteMember = createAsyncThunk(
  'members/deleteMember',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/members/${id}`);
      return { id, message: response.data.message };
    } catch (err) {
      return rejectWithValue(getErrorMessage(err, 'Failed to delete member'));
    }
  }
);

const memberSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    clearMemberError: (state) => {
      state.error = null;
      state.success = false;
    },
    clearSelectedMember: (state) => {
      state.selectedMember = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Members
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload.data.members;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Member By Id
      .addCase(fetchMemberById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemberById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMember = action.payload.data.member;
      })
      .addCase(fetchMemberById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Member
      .addCase(createMember.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createMember.fulfilled, (state) => {
        state.actionLoading = false;
        state.success = true;
      })
      .addCase(createMember.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Update Member
      .addCase(updateMember.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateMember.fulfilled, (state) => {
        state.actionLoading = false;
        state.success = true;
      })
      .addCase(updateMember.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Delete Member
      .addCase(deleteMember.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.members = state.members.filter((m) => m.id !== action.payload.id);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteMember.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearMemberError, clearSelectedMember } = memberSlice.actions;
export default memberSlice.reducer;

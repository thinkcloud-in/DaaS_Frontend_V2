import { createSlice } from '@reduxjs/toolkit';
import { fetchActiveSessionsThunk } from './ActiveSessionsThunks';

const initialState = {
  sessions: [],
  loading: false,
  error: null,
};

const activeSessionsSlice = createSlice({
  name: 'activeSessions',
  initialState,
  reducers: {
    clearActiveSessionsError: (state) => {
      state.error = null;
    },
    clearActiveSessions: (state) => {
      state.sessions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveSessionsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveSessionsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchActiveSessionsThunk.rejected, (state, action) => {
        state.loading = false;
        state.sessions = [];
        state.error = action.payload;
      });
  },
});

export const { clearActiveSessionsError, clearActiveSessions } = activeSessionsSlice.actions;
export default activeSessionsSlice.reducer;
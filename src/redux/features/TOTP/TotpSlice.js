import { createSlice } from '@reduxjs/toolkit';
import {
  fetchTotpStatusThunk,
  updateTotpBrowserStatusThunk,
  updateTotpGuacStatusThunk,
  fetchUsersForTotpResetThunk,
  resetGuacTotpThunk,
} from './TotpThunks';

const initialState = {
  adminEnabled: false,
  clientEnabled: false,
  loading: false,
  error: null,
  users: [],
  usersLoading: false,
  usersError: null,
  resetLoading: null, // stores userId being reset
};

const totpSlice = createSlice({
  name: 'totp',
  initialState,
  reducers: {
    clearTotpError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTotpStatusThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTotpStatusThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.adminEnabled = action.payload.admin;
        state.clientEnabled = action.payload.client;
      })
      .addCase(fetchTotpStatusThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateTotpBrowserStatusThunk.fulfilled, (state, action) => {
        state.adminEnabled = action.payload;
      })
      .addCase(updateTotpGuacStatusThunk.fulfilled, (state, action) => {
        state.clientEnabled = action.payload;
      })
      // Users for TOTP Reset
      .addCase(fetchUsersForTotpResetThunk.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchUsersForTotpResetThunk.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchUsersForTotpResetThunk.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload;
      })
      // Reset TOTP
      .addCase(resetGuacTotpThunk.pending, (state, action) => {
        state.resetLoading = action.meta.arg.userId;
      })
      .addCase(resetGuacTotpThunk.fulfilled, (state) => {
        state.resetLoading = null;
      })
      .addCase(resetGuacTotpThunk.rejected, (state) => {
        state.resetLoading = null;
      });
  },
});

export const { clearTotpError } = totpSlice.actions;
export default totpSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchTotpStatusThunk,
  updateTotpBrowserStatusThunk,
  updateTotpGuacStatusThunk,
} from './TotpThunks';

const initialState = {
  adminEnabled: false,
  clientEnabled: false,
  loading: false,
  error: null,
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
      });
  },
});

export const { clearTotpError } = totpSlice.actions;
export default totpSlice.reducer;
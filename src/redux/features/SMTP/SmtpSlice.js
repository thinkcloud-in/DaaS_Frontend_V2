import { createSlice } from '@reduxjs/toolkit';
import {
  fetchSmtpConfigThunk,
  saveSmtpConfigThunk,
  updateSmtpStatusThunk,
  sendSmtpTestMailThunk,
} from './SmtpThunks';

const initialState = {
  config: null,
  loading: false,
  error: null,
  saveLoading: false,
  testMailLoading: false,
  statusLoading: false,
  testMailResult: null,
};

const smtpSlice = createSlice({
  name: 'smtp',
  initialState,
  reducers: {
    clearSmtpError: (state) => {
      state.error = null;
    },
    clearTestMailResult: (state) => {
      state.testMailResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch config
      .addCase(fetchSmtpConfigThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSmtpConfigThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(fetchSmtpConfigThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save config
      .addCase(saveSmtpConfigThunk.pending, (state) => {
        state.saveLoading = true;
        state.error = null;
      })
      .addCase(saveSmtpConfigThunk.fulfilled, (state, action) => {
        state.saveLoading = false;
        state.config = action.payload;
      })
      .addCase(saveSmtpConfigThunk.rejected, (state, action) => {
        state.saveLoading = false;
        state.error = action.payload;
      })
      // Update status
      .addCase(updateSmtpStatusThunk.pending, (state) => {
        state.statusLoading = true;
        state.error = null;
      })
      .addCase(updateSmtpStatusThunk.fulfilled, (state, action) => {
        state.statusLoading = false;
        state.config = { ...state.config, smtpStatus: action.payload.smtpStatus };
      })
      .addCase(updateSmtpStatusThunk.rejected, (state, action) => {
        state.statusLoading = false;
        state.error = action.payload;
      })
      // Send test mail
      .addCase(sendSmtpTestMailThunk.pending, (state) => {
        state.testMailLoading = true;
        state.error = null;
        state.testMailResult = null;
      })
      .addCase(sendSmtpTestMailThunk.fulfilled, (state, action) => {
        state.testMailLoading = false;
        state.testMailResult = action.payload;
      })
      .addCase(sendSmtpTestMailThunk.rejected, (state, action) => {
        state.testMailLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSmtpError, clearTestMailResult } = smtpSlice.actions;
export default smtpSlice.reducer;
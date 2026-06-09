import { createSlice } from '@reduxjs/toolkit';
import {
  uploadSSLThunk,
  fetchSSLStatusThunk,
  renewSSLThunk,
} from './SSLThunks';

const initialState = {
  status: null, // Isme GET API ka poora response block { status, ssl_details } save hoga
  uploadLoading: false,
  fetchLoading: false,
  renewLoading: false,
  error: null,
  validationMessages: [],
  uploadStatus: null, // 'success', 'error', null
};

const sslSlice = createSlice({
  name: 'ssl',
  initialState,
  reducers: {
    clearSSLError: (state) => {
      state.error = null;
    },
    clearValidationMessages: (state) => {
      state.validationMessages = [];
    },
    clearUploadStatus: (state) => {
      state.uploadStatus = null;
    },
    setValidationMessages: (state, action) => {
      state.validationMessages = action.payload;
    },
    addValidationMessage: (state, action) => {
      state.validationMessages.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload SSL Certificate
      .addCase(uploadSSLThunk.pending, (state) => {
        state.uploadLoading = true;
        state.error = null;
        state.uploadStatus = null;
      })
      .addCase(uploadSSLThunk.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadStatus = 'success';
        
        // Backend se aane wala success message extract karna
        const successMessage = action.payload?.message || 'Certificate uploaded successfully!';
        
        state.validationMessages.push({
          type: 'success',
          text: `✓ ${successMessage}`,
        });
      })
      .addCase(uploadSSLThunk.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadStatus = 'error';
        state.error = action.payload;
        
        // Backend se aane wala exact validation failure message screen par dikhana
        state.validationMessages.push({
          type: 'error',
          text: `✗ ${action.payload}`,
        });
      })
      
      // Fetch SSL Status
      .addCase(fetchSSLStatusThunk.pending, (state) => {
        state.fetchLoading = true;
        state.error = null;
      })
      .addCase(fetchSSLStatusThunk.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.status = action.payload; // Stores: { status: "success", ssl_details: {...} }
      })
      .addCase(fetchSSLStatusThunk.rejected, (state, action) => {
        state.fetchLoading = false;
        state.error = action.payload;
      })
      
      // Renew SSL Certificate
      .addCase(renewSSLThunk.pending, (state) => {
        state.renewLoading = true;
        state.error = null;
      })
      .addCase(renewSSLThunk.fulfilled, (state, action) => {
        state.renewLoading = false;
        // Renew hone par status update ho sakta hai, par SSL.js component me humne 
        // handleRenewal ke baad fresh fetchStatusThunk chalaya hai jo use sync rakhega.
      })
      .addCase(renewSSLThunk.rejected, (state, action) => {
        state.renewLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearSSLError,
  clearValidationMessages,
  clearUploadStatus,
  setValidationMessages,
  addValidationMessage,
} = sslSlice.actions;
export default sslSlice.reducer;
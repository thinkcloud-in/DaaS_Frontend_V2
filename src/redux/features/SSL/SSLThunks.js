import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  uploadSSLCertificate,
  fetchSSLStatus,
  renewSSLCertificate,
} from 'Services/SSLService';

export const uploadSSLThunk = createAsyncThunk(
  'ssl/upload',
  async ({ token, certFile, keyFile }, { rejectWithValue }) => {
    try {
      const res = await uploadSSLCertificate(token, certFile, keyFile);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to upload SSL certificate');
    }
  }
);

export const fetchSSLStatusThunk = createAsyncThunk(
  'ssl/fetchStatus',
  async (token, { rejectWithValue }) => {
    try {
      const res = await fetchSSLStatus(token);
      return res.data || res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to fetch SSL status');
    }
  }
);

export const renewSSLThunk = createAsyncThunk(
  'ssl/renew',
  async (token, { rejectWithValue }) => {
    try {
      const res = await renewSSLCertificate(token);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to renew SSL certificate');
    }
  }
);

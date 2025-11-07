import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchSmtpConfig,
  saveSmtpConfig,
  updateSmtpStatus,
  sendSmtpTestMail,
} from 'Services/SmtpService';

export const fetchSmtpConfigThunk = createAsyncThunk(
  'smtp/fetchConfig',
  async (token, { rejectWithValue }) => {
    try {
      const res = await fetchSmtpConfig(token);
      return res.data?.[0] || null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to fetch SMTP config');
    }
  }
);

export const saveSmtpConfigThunk = createAsyncThunk(
  'smtp/saveConfig',
  async ({ token, data, existingConfig }, { rejectWithValue }) => {
    try {
      const res = await saveSmtpConfig(token, data, existingConfig);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to save SMTP config');
    }
  }
);

export const updateSmtpStatusThunk = createAsyncThunk(
  'smtp/updateStatus',
  async ({ token, data, status }, { rejectWithValue }) => {
    try {
      const res = await updateSmtpStatus(token, data, status);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to update SMTP status');
    }
  }
);

export const sendSmtpTestMailThunk = createAsyncThunk(
  'smtp/sendTestMail',
  async ({ token, data }, { rejectWithValue }) => {
    try {
      const res = await sendSmtpTestMail(token, data);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'Failed to send test email');
    }
  }
);
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getTotpBrowserStatus,
  getTotpGuacStatus,
  updateTotpBrowserStatus,
  updateTotpGuacStatus,
} from 'Services/TotpService';

export const fetchTotpStatusThunk = createAsyncThunk(
  'totp/fetchStatus',
  async (token, { rejectWithValue }) => {
    try {
      const admin = await getTotpBrowserStatus(token);
      const client = await getTotpGuacStatus(token);
      return { admin, client };
    } catch (err) {
      return rejectWithValue('Failed to fetch TOTP status');
    }
  }
);

export const updateTotpBrowserStatusThunk = createAsyncThunk(
  'totp/updateBrowserStatus',
  async ({ token, enabled }, { rejectWithValue }) => {
    try {
      await updateTotpBrowserStatus(token, enabled);
      return enabled;
    } catch (err) {
      return rejectWithValue('Failed to update Admin TOTP status');
    }
  }
);

export const updateTotpGuacStatusThunk = createAsyncThunk(
  'totp/updateGuacStatus',
  async ({ token, enabled }, { rejectWithValue }) => {
    try {
      await updateTotpGuacStatus(token, enabled);
      return enabled;
    } catch (err) {
      return rejectWithValue('Failed to update Client TOTP status');
    }
  }
);
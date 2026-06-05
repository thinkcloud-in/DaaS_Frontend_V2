import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getTotpBrowserStatus,
  getTotpGuacStatus,
  updateTotpBrowserStatus,
  updateTotpGuacStatus,
  fetchUsersForTotpReset,
  resetGuacTotp,
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

export const fetchUsersForTotpResetThunk = createAsyncThunk(
  'totp/fetchUsersForReset',
  async ({ token, search, first, limit }, { rejectWithValue }) => {
    try {
      const users = await fetchUsersForTotpReset(token, search, first, limit);
      return users;
    } catch (err) {
      return rejectWithValue('Failed to fetch users');
    }
  }
);

export const resetGuacTotpThunk = createAsyncThunk(
  'totp/resetGuacTotp',
  async ({ token, userId }, { rejectWithValue }) => {
    try {
      await resetGuacTotp(token, userId);
      return userId;
    } catch (err) {
      return rejectWithValue('Failed to reset TOTP');
    }
  }
);
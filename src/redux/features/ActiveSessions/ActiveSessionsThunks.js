import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchGuacamoleActiveSessions } from 'Services/ActiveSessionsService';

export const fetchActiveSessionsThunk = createAsyncThunk(
  'activeSessions/fetchActiveSessions',
  async (token, { rejectWithValue }) => {
    try {
      const data = await fetchGuacamoleActiveSessions(token);
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.msg || 'Failed to fetch active sessions');
    }
  }
);
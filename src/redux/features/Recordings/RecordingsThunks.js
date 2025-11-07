import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchGuacamoleHistory, fetchGuacRecordingFile } from 'Services/RecordingsService';

export const fetchRecordingsThunk = createAsyncThunk(
  'recordings/fetchRecordings',
  async (token, { rejectWithValue }) => {
    try {
      const data = await fetchGuacamoleHistory(token);
      return data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.msg || 'Failed to fetch recordings');
    }
  }
);

export const fetchRecordingFileThunk = createAsyncThunk(
  'recordings/fetchRecordingFile',
  async ({ identifier, logUuid }, { rejectWithValue }) => {
    try {
      const buffer = await fetchGuacRecordingFile(identifier, logUuid);
      return buffer;
    } catch (error) {
      return rejectWithValue('Failed to fetch recording file');
    }
  }
);
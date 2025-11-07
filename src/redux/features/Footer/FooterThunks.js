import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchFooterTasks } from 'Services/FooterService';

export const fetchFooterTasksThunk = createAsyncThunk(
  'footer/fetchFooterTasks',
  async (userName, { rejectWithValue }) => {
    try {
      const data = await fetchFooterTasks(userName);
      return data;
    } catch (err) {
      return rejectWithValue('Failed to fetch recent tasks');
    }
  }
);
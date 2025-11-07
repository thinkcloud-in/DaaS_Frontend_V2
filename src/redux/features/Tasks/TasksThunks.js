import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWorkflows } from 'Services/TaskService';

export const fetchTasksThunk = createAsyncThunk(
  'tasks/fetchTasks',
  async ({ userName, days }, { rejectWithValue }) => {
    try {
      const data = await fetchWorkflows(userName, days);
      return data;
    } catch (err) {
      return rejectWithValue('Failed to fetch tasks');
    }
  }
);
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchVmDetails,
  fetchBackgroundProcesses,
  fetchHostStats,
  killProcesses,
} from 'Services/TaskManagerService';

export const fetchVmDetailsThunk = createAsyncThunk(
  'agentTaskManager/fetchVmDetails',
  async (vmId, { rejectWithValue }) => {
    try {
      const data = await fetchVmDetails(vmId);
      return data;
    } catch (err) {
      return rejectWithValue('Failed to fetch VM details');
    }
  }
);

export const fetchBackgroundProcessesThunk = createAsyncThunk(
  'agentTaskManager/fetchBackgroundProcesses',
  async ({ agentBackendUrl, config, hostForApi, osType }, { rejectWithValue }) => {
    try {
      const data = await fetchBackgroundProcesses(agentBackendUrl, config, hostForApi, osType);
      return data;
    } catch (err) {
      return rejectWithValue('Failed to fetch background processes');
    }
  }
);

export const fetchHostStatsThunk = createAsyncThunk(
  'agentTaskManager/fetchHostStats',
  async ({ agentBackendUrl, config, hostForApi, osType }, { rejectWithValue }) => {
    try {
      const data = await fetchHostStats(agentBackendUrl, config, hostForApi, osType);
      return data;
    } catch (err) {
      return rejectWithValue('Failed to fetch host stats');
    }
  }
);

export const killProcessesThunk = createAsyncThunk(
  'agentTaskManager/killProcesses',
  async ({ agentBackendUrl, processHost, hostIp, pids, osType }, { rejectWithValue }) => {
    try {
      await killProcesses(agentBackendUrl, processHost, hostIp, pids, osType);
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || err.message || 'Failed to kill processes');
    }
  }
);
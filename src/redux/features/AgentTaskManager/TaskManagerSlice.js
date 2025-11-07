import { createSlice } from '@reduxjs/toolkit';
import {
  fetchVmDetailsThunk,
  fetchBackgroundProcessesThunk,
  fetchHostStatsThunk,
  killProcessesThunk,
} from './TaskManagerThunks';

const initialState = {
  vmDetails: null,
  processData: [],
  hostStats: { cpu: null, memory: null, diskio: null },
  loading: false,
  error: null,
  killLoading: false,
};

const agentTaskManagerSlice = createSlice({
  name: 'agentTaskManager',
  initialState,
  reducers: {
    clearAgentTaskManagerError(state) {
      state.error = null;
    },
    clearAgentTaskManagerState(state) {
      state.vmDetails = null;
      state.processData = [];
      state.hostStats = { cpu: null, memory: null, diskio: null };
      state.loading = false;
      state.error = null;
      state.killLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVmDetailsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVmDetailsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.vmDetails = action.payload;
      })
      .addCase(fetchVmDetailsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBackgroundProcessesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBackgroundProcessesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.processData = action.payload;
      })
      .addCase(fetchBackgroundProcessesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchHostStatsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHostStatsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.hostStats = action.payload;
      })
      .addCase(fetchHostStatsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(killProcessesThunk.pending, (state) => {
        state.killLoading = true;
        state.error = null;
      })
      .addCase(killProcessesThunk.fulfilled, (state) => {
        state.killLoading = false;
      })
      .addCase(killProcessesThunk.rejected, (state, action) => {
        state.killLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAgentTaskManagerError, clearAgentTaskManagerState } = agentTaskManagerSlice.actions;
export default agentTaskManagerSlice.reducer;
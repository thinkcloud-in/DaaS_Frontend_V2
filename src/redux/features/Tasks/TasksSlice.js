import { createSlice } from '@reduxjs/toolkit';
import { fetchTasksThunk } from './TasksThunks';

const initialState = {
  tasks: [],
  loading: false,
  error: null,
  days: 1,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setDays(state, action) {
      state.days = action.payload;
    },
    clearTasksError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasksThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setDays, clearTasksError } = tasksSlice.actions;
export default tasksSlice.reducer;
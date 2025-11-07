import { createSlice } from '@reduxjs/toolkit';
import { fetchFooterTasksThunk } from './FooterThunks';

const initialState = {
  tasks: [],
  loading: false,
  error: null,
};

const footerSlice = createSlice({
  name: 'footer',
  initialState,
  reducers: {
    clearFooterError(state) {
      state.error = null;
    },
    clearFooterTasks(state) {
      state.tasks = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFooterTasksThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFooterTasksThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchFooterTasksThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFooterError, clearFooterTasks } = footerSlice.actions;
export default footerSlice.reducer;
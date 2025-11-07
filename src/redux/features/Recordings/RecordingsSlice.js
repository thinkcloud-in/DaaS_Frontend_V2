import { createSlice } from '@reduxjs/toolkit';
import { fetchRecordingsThunk, fetchRecordingFileThunk } from './RecordingsThunks';

const initialState = {
  recordings: [],
  loading: false,
  error: null,
  recordingFile: null,
  recordingFileLoading: false,
  recordingFileError: null,
};

const recordingsSlice = createSlice({
  name: 'recordings',
  initialState,
  reducers: {
    clearRecordingsError: (state) => {
      state.error = null;
    },
    clearRecordings: (state) => {
      state.recordings = [];
    },
    clearRecordingFile: (state) => {
      state.recordingFile = null;
      state.recordingFileError = null;
      state.recordingFileLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecordingsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecordingsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.recordings = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchRecordingsThunk.rejected, (state, action) => {
        state.loading = false;
        state.recordings = [];
        state.error = action.payload;
      })
      .addCase(fetchRecordingFileThunk.pending, (state) => {
        state.recordingFileLoading = true;
        state.recordingFileError = null;
        state.recordingFile = null;
      })
      .addCase(fetchRecordingFileThunk.fulfilled, (state, action) => {
        state.recordingFileLoading = false;
        state.recordingFile = action.payload;
      })
      .addCase(fetchRecordingFileThunk.rejected, (state, action) => {
        state.recordingFileLoading = false;
        state.recordingFileError = action.payload;
        state.recordingFile = null;
      });
  },
});

export const { clearRecordingsError, clearRecordings } = recordingsSlice.actions;
export default recordingsSlice.reducer;
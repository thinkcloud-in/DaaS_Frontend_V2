import { createSelector } from '@reduxjs/toolkit';

export const selectRecordingsState = (state) => state.recordings;

export const selectRecordings = createSelector(
  [selectRecordingsState],
  (recordingsState) => recordingsState.recordings
);

export const selectRecordingsLoading = createSelector(
  [selectRecordingsState],
  (recordingsState) => recordingsState.loading
);

export const selectRecordingsError = createSelector(
  [selectRecordingsState],
  (recordingsState) => recordingsState.error
);

export const selectRecordingsCount = createSelector(
  [selectRecordings],
  (recordings) => recordings.length
);
export const selectRecordingFile = createSelector(
  [selectRecordingsState],
  (state) => state.recordingFile
);

export const selectRecordingFileLoading = createSelector(
  [selectRecordingsState],
  (state) => state.recordingFileLoading
);

export const selectRecordingFileError = createSelector(
  [selectRecordingsState],
  (state) => state.recordingFileError
);
import { createSelector } from '@reduxjs/toolkit';

export const selectActiveSessionsState = (state) => state.activeSessions;

export const selectActiveSessions = createSelector(
  [selectActiveSessionsState],
  (activeSessionsState) => activeSessionsState.sessions
);

export const selectActiveSessionsLoading = createSelector(
  [selectActiveSessionsState],
  (activeSessionsState) => activeSessionsState.loading
);

export const selectActiveSessionsError = createSelector(
  [selectActiveSessionsState],
  (activeSessionsState) => activeSessionsState.error
);

export const selectActiveSessionsCount = createSelector(
  [selectActiveSessions],
  (sessions) => sessions.length
);
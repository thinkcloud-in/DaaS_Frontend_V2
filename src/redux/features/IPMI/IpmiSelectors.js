import { createSelector } from '@reduxjs/toolkit';

// Base selectors
export const selectIpmiState = (state) => state.ipmi;
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthUserEmail = (state) => state.auth.tokenParsed?.preferred_username;
// Memoized selectors
export const selectIpmiList = createSelector(
  [selectIpmiState],
  (ipmiState) => ipmiState.ipmiList
);

export const selectIpmiLoading = createSelector(
  [selectIpmiState],
  (ipmiState) => ipmiState.loading
);

export const selectIpmiError = createSelector(
  [selectIpmiState],
  (ipmiState) => ipmiState.error
);

export const selectCreateLoading = createSelector(
  [selectIpmiState],
  (ipmiState) => ipmiState.createLoading
);

export const selectUpdateLoading = createSelector(
  [selectIpmiState],
  (ipmiState) => ipmiState.updateLoading
);

export const selectDeleteLoading = createSelector(
  [selectIpmiState],
  (ipmiState) => ipmiState.deleteLoading
);

export const selectSelectedIpmi = createSelector(
  [selectIpmiState],
  (ipmiState) => ipmiState.selectedIpmi
);

export const selectFetchByIdLoading = createSelector(
  [selectIpmiState],
  (ipmiState) => ipmiState.fetchByIdLoading
);

// Derived selectors
export const selectIpmiCount = createSelector(
  [selectIpmiList],
  (ipmiList) => ipmiList.length
);

export const selectIpmiById = createSelector(
  [selectIpmiList, (state, id) => id],
  (ipmiList, id) => ipmiList.find(ipmi => ipmi.id === id)
);

export const selectIsIpmiDeleteLoading = createSelector(
  [selectDeleteLoading, (state, ipmiId) => ipmiId],
  (deleteLoading, ipmiId) => Boolean(deleteLoading[ipmiId])
);
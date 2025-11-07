import { createSelector } from '@reduxjs/toolkit';

// Base selectors
export const selectIpPoolsState = (state) => state.ipPools;

// Memoized selectors
export const selectIpPools = createSelector(
  [selectIpPoolsState],
  (ipPoolsState) => ipPoolsState.pools
);

export const selectIpPoolsLoading = createSelector(
  [selectIpPoolsState],
  (ipPoolsState) => ipPoolsState.loading
);

export const selectIpPoolsError = createSelector(
  [selectIpPoolsState],
  (ipPoolsState) => ipPoolsState.error
);

export const selectCreateLoading = createSelector(
  [selectIpPoolsState],
  (ipPoolsState) => ipPoolsState.createLoading
);

export const selectDeleteLoading = createSelector(
  [selectIpPoolsState],
  (ipPoolsState) => ipPoolsState.deleteLoading
);

// Derived selectors
export const selectIpPoolsCount = createSelector(
  [selectIpPools],
  (pools) => pools.length
);

export const selectIpPoolByName = createSelector(
  [selectIpPools, (state, poolName) => poolName],
  (pools, poolName) => pools.find(pool => pool.Pool_name === poolName)
);

export const selectIsPoolDeleteLoading = createSelector(
  [selectDeleteLoading, (state, poolName) => poolName],
  (deleteLoading, poolName) => Boolean(deleteLoading[poolName])
);
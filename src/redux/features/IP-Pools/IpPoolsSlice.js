import { createSlice } from '@reduxjs/toolkit';
import { 
  fetchIpPoolsThunk, 
  createIpPoolThunk, 
  deleteIpPoolThunk 
} from './IpPoolsThunks';

const initialState = {
  pools: [],
  loading: false,
  error: null,
  createLoading: false,
  deleteLoading: {},
};

const ipPoolsSlice = createSlice({
  name: 'ipPools',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setDeleteLoading: (state, action) => {
      const { poolName, isLoading } = action.payload;
      if (isLoading) {
        state.deleteLoading[poolName] = true;
      } else {
        delete state.deleteLoading[poolName];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch IP Pools
      .addCase(fetchIpPoolsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIpPoolsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.pools = action.payload;
      })
      .addCase(fetchIpPoolsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create IP Pool
      .addCase(createIpPoolThunk.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createIpPoolThunk.fulfilled, (state, action) => {
        state.createLoading = false;
        // Add the new pool to the list if needed
        if (action.payload.pool) {
          state.pools.push(action.payload.pool);
        }
      })
      .addCase(createIpPoolThunk.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      // Delete IP Pool
      .addCase(deleteIpPoolThunk.pending, (state, action) => {
        const poolName = action.meta.arg.poolName;
        state.deleteLoading[poolName] = true;
        state.error = null;
      })
      .addCase(deleteIpPoolThunk.fulfilled, (state, action) => {
        const poolName = action.meta.arg.poolName;
        delete state.deleteLoading[poolName];
        // Remove the pool from the list
        state.pools = state.pools.filter(pool => pool.Pool_name !== poolName);
      })
      .addCase(deleteIpPoolThunk.rejected, (state, action) => {
        const poolName = action.meta.arg.poolName;
        delete state.deleteLoading[poolName];
        state.error = action.payload;
      });
  },
});

export const { clearError, setDeleteLoading } = ipPoolsSlice.actions;
export default ipPoolsSlice.reducer;
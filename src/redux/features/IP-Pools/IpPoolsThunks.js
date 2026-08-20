import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  fetchIpPools, 
  createIpPool, 
  deleteIpPoolByName 
} from '../../../Services/IP_PoolService';

// Fetch IP Pools
export const fetchIpPoolsThunk = createAsyncThunk(
  'ipPools/fetchIpPools',
  async (arg, { rejectWithValue }) => {
    // Back-compat: accept either a plain token string (old call sites) or
    // { token, page, pageSize } (new paginated call sites).
    const { token, page = 1, pageSize = 10 } =
      typeof arg === "string" ? { token: arg } : arg || {};
    try {
      const data = await fetchIpPools(token, page, pageSize);
      return {
        items: Array.isArray(data?.items) ? data.items : [],
        pagination: data?.pagination || null,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.msg || 'Failed to fetch IP pools';
      return rejectWithValue(errorMessage);
    }
  }
);

// Create IP Pool
export const createIpPoolThunk = createAsyncThunk(
  'ipPools/createIpPool',
  async ({ token, payload }, { rejectWithValue }) => {
    try {
      const response = await createIpPool(token, payload);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.msg || 'Failed to create IP pool';
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete IP Pool
export const deleteIpPoolThunk = createAsyncThunk(
  'ipPools/deleteIpPool',
  async ({ token, poolName }, { rejectWithValue }) => {
    try {
      const response = await deleteIpPoolByName(token, poolName);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.msg || `Failed to delete IP pool "${poolName}"`;
      return rejectWithValue(errorMessage);
    }
  }
);
import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  GetAllIpmiLists, 
  createIpmiServer, 
  deleteIpmiServer,
  updateIpmiServer,
  getIpmiServerById 
} from '../../../Services/IPMI_Service';

// Fetch IPMI List
export const fetchIpmiListThunk = createAsyncThunk(
  'ipmi/fetchIpmiList',
  async (token, { rejectWithValue }) => {
    try {
      const data = await GetAllIpmiLists(token);
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.msg || error.message || 'Failed to fetch IPMI list';
      return rejectWithValue(errorMessage);
    }
  }
);

// Create IPMI Server
export const createIpmiServerThunk = createAsyncThunk(
  'ipmi/createIpmiServer',
  async ({ token, payload }, { rejectWithValue }) => {
    try {
      const response = await createIpmiServer(token, payload);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.msg || error.message || 'Failed to create IPMI server';
      return rejectWithValue(errorMessage);
    }
  }
);

// Update IPMI Server
export const updateIpmiServerThunk = createAsyncThunk(
  'ipmi/updateIpmiServer',
  async ({ token, id, payload }, { rejectWithValue }) => {
    try {
      const response = await updateIpmiServer(token, id, payload);
      return { success: true, data: payload };
    } catch (error) {
      const errorMessage = error.response?.data?.msg || error.message || 'Failed to update IPMI server';
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete IPMI Server
export const deleteIpmiServerThunk = createAsyncThunk(
  'ipmi/deleteIpmiServer',
  async ({ token, ipmiId, userEmail }, { rejectWithValue }) => {
    try {
      const response = await deleteIpmiServer(token, ipmiId, userEmail);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.msg || error.message || 'Failed to delete IPMI server';
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch IPMI Server By ID
export const fetchIpmiServerByIdThunk = createAsyncThunk(
  'ipmi/fetchIpmiServerById',
  async ({ token, id }, { rejectWithValue }) => {
    try {
      const data = await getIpmiServerById(token, id);
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.msg || error.message || 'Failed to fetch IPMI server details';
      return rejectWithValue(errorMessage);
    }
  }
);
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchVamanitAllUsers as fetchVamanitAllUsersService,
  fetchVamanitSessionReports as fetchVamanitSessionReportsService,
  fetchVamanitDayReports as fetchVamanitDayReportsService,
  fetchVamanitConsolidateReports as fetchVamanitConsolidateReportsService,
  fetchCompanyDetails as fetchCompanyDetailsService,
} from '../../../Services/ReportsService';

export const fetchVamanitUsersForDateRange = createAsyncThunk(
  'vamanit/fetchUsersForDateRange',
  async ({ token, start, end }, { rejectWithValue }) => {
    try {
  const data = await fetchVamanitAllUsersService(token, start, end);
      return data;
    } catch (err) {
      return rejectWithValue('Failed to fetch users');
    }
  }
);

export const fetchVamanitSessionReports = createAsyncThunk(
  'vamanit/fetchSessionReports',
  async ({ token, start, end, user }, { rejectWithValue }) => {
    try {
  const data = await fetchVamanitSessionReportsService(token, start, end, user);
      return data;
    } catch (err) {
      return rejectWithValue('Failed to fetch session reports');
    }
  }
);

export const fetchVamanitDayReports = createAsyncThunk(
  'vamanit/fetchDayReports',
  async ({ token, start, end, user }, { rejectWithValue }) => {
    try {
  const data = await fetchVamanitDayReportsService(token, start, end, user);
      return data;
    } catch (err) {
      return rejectWithValue('Failed to fetch day reports');
    }
  }
);

export const fetchVamanitConsolidateReports = createAsyncThunk(
  'vamanit/fetchConsolidateReports',
  async ({ token, start, end, user }, { rejectWithValue }) => {
    try {
  const data = await fetchVamanitConsolidateReportsService(token, start, end, user);
      return data;
    } catch (err) {
      return rejectWithValue('Failed to fetch consolidate reports');
    }
  }
);

export const fetchVamanitCompanyDetails = createAsyncThunk(
  'vamanit/fetchCompanyDetails',
  async ({ token, reportType }, { rejectWithValue }) => {
    try {
  const data = await fetchCompanyDetailsService(token, reportType);
      return { reportType, data };
    } catch (err) {
      return rejectWithValue('Failed to fetch company details');
    }
  }
);

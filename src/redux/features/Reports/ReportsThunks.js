import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchVamanitAllUsers as fetchVamanitAllUsersService,
  fetchSessionReports as fetchSessionReportsService,
  fetchDayReports as fetchDayReportsService,
  fetchConsolidateReports as fetchConsolidateReportsService,
  fetchCompanyDetails as fetchCompanyDetailsService,
  fetchReportsList as fetchReportsListService,
  fetchScheduleStatus as fetchScheduleStatusService,
  deleteReportSchedule as deleteReportScheduleService,
  addOrUpdateSchedule as addOrUpdateScheduleService,
} from '../../../Services/ReportsService';

export const fetchUsersForDateRange = createAsyncThunk(
  'reports/fetchUsersForDateRange',
  async ({ token, start, end }, { rejectWithValue }) => {
    try {
      const data = await fetchVamanitAllUsersService(token, start, end);
      return data || [];
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const fetchSessionReports = createAsyncThunk(
  'reports/fetchSessionReports',
  async ({ token, start, end, user }, { rejectWithValue }) => {
    try {
      const data = await fetchSessionReportsService(token, start, end, user);
      return data || [];
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const fetchDayReports = createAsyncThunk(
  'reports/fetchDayReports',
  async ({ token, start, end, user }, { rejectWithValue }) => {
    try {
      const data = await fetchDayReportsService(token, start, end, user);
      return data || [];
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const fetchConsolidateReports = createAsyncThunk(
  'reports/fetchConsolidateReports',
  async ({ token, start, end, user }, { rejectWithValue }) => {
    try {
      const data = await fetchConsolidateReportsService(token, start, end, user);
      return data || [];
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const fetchCompanyDetails = createAsyncThunk(
  'reports/fetchCompanyDetails',
  async ({ token, reportType }, { rejectWithValue }) => {
    try {
      const data = await fetchCompanyDetailsService(token, reportType);
      return { reportType, data };
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const fetchReportsList = createAsyncThunk(
  'reports/fetchReportsList',
  async ({ token, alignment, page, itemsPerPage }, { rejectWithValue }) => {
    try {
      const data = await fetchReportsListService(token, alignment, page, itemsPerPage);
      return data || { items: [], total: 0 };
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const fetchScheduleStatus = createAsyncThunk(
  'reports/fetchScheduleStatus',
  async ({ token, schedule_id }, { rejectWithValue }) => {
    try {
      const status = await fetchScheduleStatusService(token, schedule_id);
      return { schedule_id, status };
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const deleteReportSchedule = createAsyncThunk(
  'reports/deleteReportSchedule',
  async ({ token, schedule_id }, { rejectWithValue }) => {
    try {
      const data = await deleteReportScheduleService(token, schedule_id);
      return { schedule_id, data };
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);

export const addOrUpdateSchedule = createAsyncThunk(
  'reports/addOrUpdateSchedule',
  async ({ token, formData, isUpdate }, { rejectWithValue }) => {
    try {
      const resp = await addOrUpdateScheduleService(token, formData, isUpdate);
      // return the created/updated schedule data when available
      return resp?.data || { success: true };
    } catch (err) {
      return rejectWithValue(err?.response?.data || err.message);
    }
  }
);


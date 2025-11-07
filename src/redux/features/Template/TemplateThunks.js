import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchReports as fetchReportsService, updateReport as updateReportService } from '../../../Services/TemplateService';

export const fetchReports = createAsyncThunk(
  'template/fetchReports',
  async ({ token, reportType }, { rejectWithValue }) => {
    try {
      const data = await fetchReportsService(token, reportType);
      // return the data and the reportType so reducer can set related fields
      return { reportType, data };
    } catch (err) {
      return rejectWithValue('Failed to fetch reports');
    }
  }
);

export const updateReport = createAsyncThunk(
  'template/updateReport',
  async ({ token, formData }, { rejectWithValue }) => {
    try {
      const response = await updateReportService(token, formData);
      return { status: response?.status, data: response?.data };
    } catch (err) {
      return rejectWithValue('Failed to update report');
    }
  }
);

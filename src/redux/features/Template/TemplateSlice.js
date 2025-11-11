import { createSlice } from '@reduxjs/toolkit';
import { fetchReports, updateReport } from './TemplateThunks';

const initialState = {
  reportType: '',
  reports: [],
  companyName: '',
  image: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
};

const templateSlice = createSlice({
  name: 'template',
  initialState,
  reducers: {
    setReportType(state, action) {
      state.reportType = action.payload;
    },
    setCompanyName(state, action) {
      state.companyName = action.payload;
    },
    setImage(state, action) {
      state.image = action.payload;
    },
    clearTemplateState(state) {
      state.reportType = '';
      state.reports = [];
      state.companyName = '';
      state.image = null;
      state.isLoading = false;
      state.isSubmitting = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.isLoading = false;
        const { reportType, data } = action.payload || {};
        state.reportType = reportType || state.reportType;
        state.reports = data || [];
        // populate companyName and image from first report if available
        if (Array.isArray(data) && data.length > 0) {
          state.companyName = data[0].company_name || '';
          state.image = data[0].company_logo || null;
        } else {
          state.companyName = '';
          state.image = null;
        }
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch reports';
      })

      .addCase(updateReport.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateReport.fulfilled, (state, action) => {
        state.isSubmitting = false;
      })
      .addCase(updateReport.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || 'Failed to update report';
      });
  },
});

export const { setReportType, setCompanyName, setImage, clearTemplateState } = templateSlice.actions;
export default templateSlice.reducer;

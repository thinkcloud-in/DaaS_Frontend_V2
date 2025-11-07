import { createSlice } from '@reduxjs/toolkit';
import {
  fetchVamanitUsersForDateRange,
  fetchVamanitSessionReports,
  fetchVamanitDayReports,
  fetchVamanitConsolidateReports,
  fetchVamanitCompanyDetails,
} from './VamanitReportsThunks';

const initialState = {
  userOptions: [],
  user: 'All Users',
  dateRange: { start: '', end: '' },
  sessionReports: [],
  dayReports: [],
  consolidateReports: [],
  showSessionReports: false,
  showDayReports: false,
  showConsolidateReports: false,
  loader: false,
  print: false,
  company: { company_name: '', company_logo: '' },
  activeTab: '',
  error: null,
};

const vamanitSlice = createSlice({
  name: 'vamanitReports',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    setDateRange(state, action) {
      state.dateRange = action.payload;
    },
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },
    clearVamanitState(state) {
      state.sessionReports = [];
      state.dayReports = [];
      state.consolidateReports = [];
      state.userOptions = [];
      state.showSessionReports = false;
      state.showDayReports = false;
      state.showConsolidateReports = false;
      state.loader = false;
      state.print = false;
      state.company = { company_name: '', company_logo: '' };
      state.activeTab = '';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVamanitUsersForDateRange.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchVamanitUsersForDateRange.fulfilled, (state, action) => {
        state.loader = false;
        state.userOptions = action.payload || [];
      })
      .addCase(fetchVamanitUsersForDateRange.rejected, (state) => {
        state.loader = false;
        state.userOptions = [];
      })

      .addCase(fetchVamanitCompanyDetails.fulfilled, (state, action) => {
        const { reportType, data } = action.payload || {};
        const companyData = Array.isArray(data?.data) ? data.data.find((c) => c.report_type === reportType) : data?.data;
        if (companyData) {
          state.company = { company_name: companyData.company_name || '', company_logo: companyData.company_logo || '' };
        }
      })

      .addCase(fetchVamanitSessionReports.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchVamanitSessionReports.fulfilled, (state, action) => {
        state.loader = false;
        state.sessionReports = action.payload?.data || [];
        state.print = true;
        state.showSessionReports = true;
        state.showDayReports = false;
        state.showConsolidateReports = false;
      })
      .addCase(fetchVamanitSessionReports.rejected, (state) => {
        state.loader = false;
        state.sessionReports = [];
        state.showSessionReports = false;
      })

      .addCase(fetchVamanitDayReports.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchVamanitDayReports.fulfilled, (state, action) => {
        state.loader = false;
        state.dayReports = action.payload?.data || [];
        state.print = true;
        state.showSessionReports = false;
        state.showDayReports = true;
        state.showConsolidateReports = false;
      })
      .addCase(fetchVamanitDayReports.rejected, (state) => {
        state.loader = false;
        state.dayReports = [];
        state.showDayReports = false;
      })

      .addCase(fetchVamanitConsolidateReports.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchVamanitConsolidateReports.fulfilled, (state, action) => {
        state.loader = false;
        state.consolidateReports = action.payload?.data || [];
        state.print = true;
        state.showSessionReports = false;
        state.showDayReports = false;
        state.showConsolidateReports = true;
      })
      .addCase(fetchVamanitConsolidateReports.rejected, (state) => {
        state.loader = false;
        state.consolidateReports = [];
        state.showConsolidateReports = false;
      });
  },
});

export const { setUser, setDateRange, setActiveTab, clearVamanitState } = vamanitSlice.actions;
export default vamanitSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';
import {
  fetchUsersForDateRange,
  fetchSessionReports,
  fetchDayReports,
  fetchConsolidateReports,
  fetchCompanyDetails,
  fetchReportsList,
  fetchScheduleStatus,
  deleteReportSchedule,
  addOrUpdateSchedule,
} from './ReportsThunks';

const initialState = {
  userOptions: [],
  user: 'All Users',
  dateRange: { start: '', end: '' },
  sessionReports: [],
  dayReports: [],
  consolidateReports: [],
  scheduleList: [],
  scheduleTotal: 0,
  scheduleSaveLoading: false,
  scheduleLoading: false,
  scheduleDeleteLoading: {},
  showSessionReports: false,
  showDayReports: false,
  showConsolidateReports: false,
  loader: false,
  print: false,
  company: { company_name: '', company_logo: '' },
  activeTab: '',
  error: null,
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    setDateRange(state, action) {
      state.dateRange = action.payload;
    },
    clearReportsState(state) {
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
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersForDateRange.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchUsersForDateRange.fulfilled, (state, action) => {
        state.loader = false;
        const data = action.payload || [];
        if (Array.isArray(data)) {
          const users = [...new Set(data.map((r) => r.username))].sort((a, b) => a.localeCompare(b));
          state.userOptions = users;
        } else {
          state.userOptions = [];
        }
      })
      .addCase(fetchUsersForDateRange.rejected, (state) => {
        state.loader = false;
        state.userOptions = [];
      })

      .addCase(fetchCompanyDetails.fulfilled, (state, action) => {
        const { reportType, data } = action.payload || {};
        const companyData = Array.isArray(data) ? data.find((c) => c.report_type === reportType) : data;
        if (companyData) {
          state.company = { company_name: companyData.company_name || '', company_logo: companyData.company_logo || '' };
        }
      })

      .addCase(fetchSessionReports.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchSessionReports.fulfilled, (state, action) => {
        state.loader = false;
        state.sessionReports = action.payload || [];
        state.print = true;
        state.showSessionReports = true;
        state.showDayReports = false;
        state.showConsolidateReports = false;
      })
      .addCase(fetchSessionReports.rejected, (state) => {
        state.loader = false;
        state.sessionReports = [];
        state.showSessionReports = false;
      })

      // report schedule list
      .addCase(fetchReportsList.pending, (state) => {
        state.scheduleLoading = true;
      })
      .addCase(fetchReportsList.fulfilled, (state, action) => {
        state.scheduleLoading = false;
        const payload = action.payload || { items: [], total: 0 };
        state.scheduleList = payload.items || [];
        state.scheduleTotal = payload.total || 0;
      })
      .addCase(fetchReportsList.rejected, (state) => {
        state.scheduleLoading = false;
        state.scheduleList = [];
        state.scheduleTotal = 0;
      })

      .addCase(fetchScheduleStatus.fulfilled, (state, action) => {
        const { schedule_id, status } = action.payload || {};
        if (!schedule_id) return;
        const idx = state.scheduleList.findIndex((s) => s.schedule_id === schedule_id || s.id === schedule_id);
        if (idx >= 0) state.scheduleList[idx].status = status;
      })

      // add/update schedule
      .addCase(addOrUpdateSchedule.pending, (state) => {
        state.scheduleSaveLoading = true;
      })
      .addCase(addOrUpdateSchedule.fulfilled, (state /* action */) => {
        state.scheduleSaveLoading = false;
      })
      .addCase(addOrUpdateSchedule.rejected, (state) => {
        state.scheduleSaveLoading = false;
      })

      .addCase(deleteReportSchedule.pending, (state, action) => {
        const schedule_id = action.meta.arg?.schedule_id;
        if (schedule_id) state.scheduleDeleteLoading[schedule_id] = true;
      })
      .addCase(deleteReportSchedule.fulfilled, (state, action) => {
        const schedule_id = action.payload?.schedule_id || action.meta.arg?.schedule_id;
        if (schedule_id) {
          state.scheduleList = state.scheduleList.filter((s) => (s.schedule_id || s.id) !== schedule_id);
          delete state.scheduleDeleteLoading[schedule_id];
          state.scheduleTotal = Math.max(0, (state.scheduleTotal || 0) - 1);
        }
      })
      .addCase(deleteReportSchedule.rejected, (state, action) => {
        const schedule_id = action.meta.arg?.schedule_id;
        if (schedule_id) delete state.scheduleDeleteLoading[schedule_id];
      })

      .addCase(fetchDayReports.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchDayReports.fulfilled, (state, action) => {
        state.loader = false;
        state.dayReports = action.payload || [];
        state.print = true;
        state.showSessionReports = false;
        state.showDayReports = true;
        state.showConsolidateReports = false;
      })
      .addCase(fetchDayReports.rejected, (state) => {
        state.loader = false;
        state.dayReports = [];
        state.showDayReports = false;
      })

      .addCase(fetchConsolidateReports.pending, (state) => {
        state.loader = true;
        state.error = null;
      })
      .addCase(fetchConsolidateReports.fulfilled, (state, action) => {
        state.loader = false;
        state.consolidateReports = action.payload || [];
        state.print = true;
        state.showSessionReports = false;
        state.showDayReports = false;
        state.showConsolidateReports = true;
      })
      .addCase(fetchConsolidateReports.rejected, (state) => {
        state.loader = false;
        state.consolidateReports = [];
        state.showConsolidateReports = false;
      });
  },
});

export const { setUser, setDateRange, clearReportsState, setActiveTab } = reportsSlice.actions;
export default reportsSlice.reducer;

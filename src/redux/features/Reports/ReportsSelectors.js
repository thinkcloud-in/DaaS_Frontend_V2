export const selectReportsState = (state) => state.reports || {};

export const selectUserOptions = (state) => selectReportsState(state).userOptions || [];
export const selectSelectedUser = (state) => selectReportsState(state).user || 'All Users';
export const selectDateRange = (state) => selectReportsState(state).dateRange || { start: '', end: '' };

export const selectSessionReports = (state) => selectReportsState(state).sessionReports || [];
export const selectDayReports = (state) => selectReportsState(state).dayReports || [];
export const selectConsolidateReports = (state) => selectReportsState(state).consolidateReports || [];

export const selectScheduleList = (state) => selectReportsState(state).scheduleList || [];
export const selectScheduleTotal = (state) => selectReportsState(state).scheduleTotal || 0;
export const selectScheduleLoading = (state) => !!selectReportsState(state).scheduleLoading;
export const selectScheduleDeleteLoading = (state) => selectReportsState(state).scheduleDeleteLoading || {};
export const selectScheduleSaveLoading = (state) => !!selectReportsState(state).scheduleSaveLoading;

export const selectShowSessionReports = (state) => !!selectReportsState(state).showSessionReports;
export const selectShowDayReports = (state) => !!selectReportsState(state).showDayReports;
export const selectShowConsolidateReports = (state) => !!selectReportsState(state).showConsolidateReports;

export const selectLoader = (state) => !!selectReportsState(state).loader;
export const selectPrint = (state) => !!selectReportsState(state).print;
export const selectCompany = (state) => selectReportsState(state).company || { company_name: '', company_logo: '' };
export const selectActiveTab = (state) => selectReportsState(state).activeTab || '';

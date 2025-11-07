export const selectVamanitState = (state) => state.vamanitReports || {};

export const selectVamanitUserOptions = (state) => selectVamanitState(state).userOptions || [];
export const selectVamanitUser = (state) => selectVamanitState(state).user || 'All Users';
export const selectVamanitDateRange = (state) => selectVamanitState(state).dateRange || { start: '', end: '' };

export const selectVamanitSessionReports = (state) => selectVamanitState(state).sessionReports || [];
export const selectVamanitDayReports = (state) => selectVamanitState(state).dayReports || [];
export const selectVamanitConsolidateReports = (state) => selectVamanitState(state).consolidateReports || [];

export const selectVamanitShowSession = (state) => !!selectVamanitState(state).showSessionReports;
export const selectVamanitShowDay = (state) => !!selectVamanitState(state).showDayReports;
export const selectVamanitShowConsolidate = (state) => !!selectVamanitState(state).showConsolidateReports;

export const selectVamanitLoader = (state) => !!selectVamanitState(state).loader;
export const selectVamanitPrint = (state) => !!selectVamanitState(state).print;
export const selectVamanitCompany = (state) => selectVamanitState(state).company || { company_name: '', company_logo: '' };
export const selectVamanitActiveTab = (state) => selectVamanitState(state).activeTab || '';

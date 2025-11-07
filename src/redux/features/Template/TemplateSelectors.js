export const selectTemplateState = (state) => state.template || {};

export const selectReportType = (state) => selectTemplateState(state).reportType || '';
export const selectReports = (state) => selectTemplateState(state).reports || [];
export const selectCompanyName = (state) => selectTemplateState(state).companyName || '';
export const selectImage = (state) => selectTemplateState(state).image || null;
export const selectIsLoading = (state) => selectTemplateState(state).isLoading || false;
export const selectIsSubmitting = (state) => selectTemplateState(state).isSubmitting || false;
export const selectTemplateError = (state) => selectTemplateState(state).error || null;

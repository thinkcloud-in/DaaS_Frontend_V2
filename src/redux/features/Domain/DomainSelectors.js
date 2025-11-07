export const selectDomains = (state) => state.domain?.domains || [];
export const selectDomainLoading = (state) => state.domain?.loader || false;
export const selectDomainError = (state) => state.domain?.error || null;
export const selectDomainDetails = (state) => state.domain?.domainDetails || null;
export const selectLastSyncResult = (state) => state.domain?.lastSyncResult || null;

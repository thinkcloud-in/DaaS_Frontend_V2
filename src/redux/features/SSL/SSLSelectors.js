export const selectSSLStatus = (state) => state.ssl.status;
export const selectSSLStatusDetails = (state) => state.ssl.status?.ssl_details || null;
export const selectSSLUploadLoading = (state) => state.ssl.uploadLoading;
export const selectSSLFetchLoading = (state) => state.ssl.fetchLoading;
export const selectSSLRenewLoading = (state) => state.ssl.renewLoading;
export const selectSSLError = (state) => state.ssl.error;
export const selectSSLValidationMessages = (state) => state.ssl.validationMessages;
export const selectSSLUploadStatus = (state) => state.ssl.uploadStatus;

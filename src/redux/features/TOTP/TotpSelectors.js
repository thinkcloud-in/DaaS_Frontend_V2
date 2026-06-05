export const selectTotpAdminEnabled = (state) => state.totp.adminEnabled;
export const selectTotpClientEnabled = (state) => state.totp.clientEnabled;
export const selectTotpLoading = (state) => state.totp.loading;
export const selectTotpError = (state) => state.totp.error;
export const selectTotpUsers = (state) => state.totp.users;
export const selectTotpUsersLoading = (state) => state.totp.usersLoading;
export const selectTotpUsersError = (state) => state.totp.usersError;
export const selectTotpResetLoading = (state) => state.totp.resetLoading;
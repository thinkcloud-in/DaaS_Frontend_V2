// Selectors for the userManagement Redux slice
// Keep selectors simple and memoizable if needed later (reselect can be added)

export const selectUserManagementState = (state) => state.userManagement || {};

export const selectUsers = (state) => selectUserManagementState(state).users || [];
export const selectRoles = (state) => selectUserManagementState(state).roles || [];
export const selectRoleComponents = (state) => selectUserManagementState(state).roleComponents || [];
export const selectUserRoles = (state) => selectUserManagementState(state).userRoles || [];

export const selectLoading = (state) => selectUserManagementState(state).loading || false;
export const selectComponentsLoading = (state) => selectUserManagementState(state).isComponentsLoading || false;
export const selectUserRolesLoading = (state) => selectUserManagementState(state).userRolesLoading || false;

export const selectActionsLoading = (state) => selectUserManagementState(state).actionsLoading || {};

// convenience selectors for specific action loading flags
export const selectIsAddingRole = (state) => selectActionsLoading(state).addRole || false;
export const selectDeletingRole = (state) => selectActionsLoading(state).deleteRole || null;
export const selectIsSubmitting = (state) => selectActionsLoading(state).submit || false;
export const selectIsAssigningRole = (state) => selectActionsLoading(state).assignRole || false;
export const selectRemovingRole = (state) => selectActionsLoading(state).removeRole || null;

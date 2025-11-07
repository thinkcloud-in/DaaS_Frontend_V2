import { createSlice } from '@reduxjs/toolkit';
import {
  fetchUsers,
  fetchRoles,
  fetchRoleComponents,
  addRole,
  deleteRole,
  submitRoleComponents,
  getUserPermission,
  assignUserRole,
  removeRoleFromUser,
} from './UserManagementThunks';

const initialState = {
  users: [],
  roles: [],
  roleComponents: [],
  userRoles: [],
  loading: false,
  isComponentsLoading: false,
  userRolesLoading: false,
  actionsLoading: {
    addRole: false,
    deleteRole: null,
    submit: false,
    assignRole: false,
    removeRole: null,
  },
  error: null,
};

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    clearUserRoles(state) {
      state.userRoles = [];
    },
    clearRoleComponents(state) {
      state.roleComponents = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchRoles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchRoleComponents
      .addCase(fetchRoleComponents.pending, (state) => {
        state.isComponentsLoading = true;
        state.error = null;
      })
      .addCase(fetchRoleComponents.fulfilled, (state, action) => {
        state.isComponentsLoading = false;
        state.roleComponents = action.payload.components || [];
      })
      .addCase(fetchRoleComponents.rejected, (state, action) => {
        state.isComponentsLoading = false;
        state.roleComponents = [];
        state.error = action.payload;
      })

      // addRole
      .addCase(addRole.pending, (state) => {
        state.actionsLoading.addRole = true;
      })
      .addCase(addRole.fulfilled, (state) => {
        state.actionsLoading.addRole = false;
      })
      .addCase(addRole.rejected, (state) => {
        state.actionsLoading.addRole = false;
      })

      // deleteRole
      .addCase(deleteRole.pending, (state, action) => {
        state.actionsLoading.deleteRole = action.meta.arg.role;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.actionsLoading.deleteRole = null;
        state.roles = state.roles.filter((r) => r !== action.payload.role);
      })
      .addCase(deleteRole.rejected, (state) => {
        state.actionsLoading.deleteRole = null;
      })

      // submitRoleComponents
      .addCase(submitRoleComponents.pending, (state) => {
        state.actionsLoading.submit = true;
      })
      .addCase(submitRoleComponents.fulfilled, (state) => {
        state.actionsLoading.submit = false;
      })
      .addCase(submitRoleComponents.rejected, (state) => {
        state.actionsLoading.submit = false;
      })

      // getUserPermission
      .addCase(getUserPermission.pending, (state) => {
        state.userRolesLoading = true;
      })
      .addCase(getUserPermission.fulfilled, (state, action) => {
        state.userRolesLoading = false;
        const payload = action.payload || {};
        if (payload?.data?.code === 200) {
          state.userRoles = payload.data?.data?.roles || [];
        } else {
          state.userRoles = [];
        }
      })
      .addCase(getUserPermission.rejected, (state) => {
        state.userRolesLoading = false;
        state.userRoles = [];
      })

      // assignUserRole
      .addCase(assignUserRole.pending, (state) => {
        state.actionsLoading.assignRole = true;
      })
      .addCase(assignUserRole.fulfilled, (state, action) => {
        state.actionsLoading.assignRole = false;
        const { role, updatedRoles } = action.payload || {};
        if (Array.isArray(updatedRoles)) {
          if (role && updatedRoles.includes(role)) {
            state.userRoles = updatedRoles;
          } else {
            if (role && !state.userRoles.includes(role)) {
              state.userRoles.push(role);
            }
          }
        } else if (role && !state.userRoles.includes(role)) {
          state.userRoles.push(role);
        }
      })
      .addCase(assignUserRole.rejected, (state) => {
        state.actionsLoading.assignRole = false;
      })

      // removeRoleFromUser
      .addCase(removeRoleFromUser.pending, (state, action) => {
        state.actionsLoading.removeRole = action.meta.arg.role;
      })
      .addCase(removeRoleFromUser.fulfilled, (state, action) => {
        state.actionsLoading.removeRole = null;
        const { role } = action.payload;
        state.userRoles = state.userRoles.filter((r) => r !== role);
      })
      .addCase(removeRoleFromUser.rejected, (state) => {
        state.actionsLoading.removeRole = null;
      });
  },
});

export const { clearUserRoles, clearRoleComponents } = userManagementSlice.actions;
export default userManagementSlice.reducer;

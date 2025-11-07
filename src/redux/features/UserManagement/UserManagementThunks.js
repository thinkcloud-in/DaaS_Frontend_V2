import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchUsers as fetchUsersService,
  fetchRoles as fetchRolesService,
  fetchRoleComponents as fetchRoleComponentsService,
  addRole as addRoleService,
  deleteRole as deleteRoleService,
  submitRoleComponents as submitRoleComponentsService,
  getUserPermission as getUserPermissionService,
  assignUserRole as assignUserRoleService,
  removeRoleFromUserService,
} from "../../../Services/UserManagementService"

export const fetchUsers = createAsyncThunk(
  'userManagement/fetchUsers',
  async ({ token }, { rejectWithValue }) => {
    try {
      const users = await fetchUsersService(token);
      return users;
    } catch (err) {
      return rejectWithValue('Failed to fetch users');
    }
  }
);

export const fetchRoles = createAsyncThunk(
  'userManagement/fetchRoles',
  async ({ token }, { rejectWithValue }) => {
    try {
      const roles = await fetchRolesService(token);
      return roles;
    } catch (err) {
      return rejectWithValue('Failed to fetch roles');
    }
  }
);

export const fetchRoleComponents = createAsyncThunk(
  'userManagement/fetchRoleComponents',
  async ({ token, role }, { rejectWithValue }) => {
    try {
      const components = await fetchRoleComponentsService(token, role);
      return { role, components };
    } catch (err) {
      return rejectWithValue('Failed to fetch role components');
    }
  }
);

export const addRole = createAsyncThunk(
  'userManagement/addRole',
  async ({ token, role }, { rejectWithValue }) => {
    try {
      const response = await addRoleService(token, role);
      // return only serializable parts
      return { status: response?.status, data: response?.data };
    } catch (err) {
      return rejectWithValue('Failed to add role');
    }
  }
);

export const deleteRole = createAsyncThunk(
  'userManagement/deleteRole',
  async ({ token, role }, { rejectWithValue }) => {
    try {
      const response = await deleteRoleService(token, role);
      return { role, status: response?.status, data: response?.data };
    } catch (err) {
      return rejectWithValue('Failed to delete role');
    }
  }
);

export const submitRoleComponents = createAsyncThunk(
  'userManagement/submitRoleComponents',
  async ({ token, role, components }, { rejectWithValue }) => {
    try {
      const response = await submitRoleComponentsService(token, role, components);
      return { status: response?.status, data: response?.data };
    } catch (err) {
      return rejectWithValue('Failed to submit role components');
    }
  }
);

export const getUserPermission = createAsyncThunk(
  'userManagement/getUserPermission',
  async ({ token, username }, { rejectWithValue }) => {
    try {
      const response = await getUserPermissionService(token, username);
      return { username, status: response?.status, data: response?.data };
    } catch (err) {
      return rejectWithValue('Failed to get user permission');
    }
  }
);

export const assignUserRole = createAsyncThunk(
  'userManagement/assignUserRole',
  async ({ token, username, role }, { rejectWithValue }) => {
    try {
      const response = await assignUserRoleService(token, username, role, []);
      let updatedRoles = null;
      try {
        const permResp = await getUserPermissionService(token, username);
        updatedRoles = permResp?.data?.data?.roles || null;
      } catch (e) {
        // ignore — we'll rely on optimistic update in the reducer
        updatedRoles = null;
      }

      return { username, role, status: response?.status, data: response?.data, updatedRoles };
    } catch (err) {
      return rejectWithValue('Failed to assign role');
    }
  }
);

export const removeRoleFromUser = createAsyncThunk(
  'userManagement/removeRoleFromUser',
  async ({ token, username, role }, { rejectWithValue }) => {
    try {
      const response = await removeRoleFromUserService(token, username, role, []);
      return { username, role, status: response?.status, data: response?.data };
    } catch (err) {
      return rejectWithValue('Failed to remove role from user');
    }
  }
);

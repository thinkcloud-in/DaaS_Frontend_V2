import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUserPermissions } from '../../../Services/ContextService';
import { baseNavigation, filterNavigation } from './RbacUtils';

export const fetchRbac = createAsyncThunk(
  'rbac/fetchRbac',
  async ({ token, username }, { rejectWithValue }) => {
    try {
      const response = await fetchUserPermissions(token, username);
      if (response.code === 200 && response.status === "OK") {
        const roles = response.data?.roles || [];
        const components = response.data?.components || [];
        const navigation = filterNavigation(baseNavigation, components);
        return { roles, components, navigation };
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      return rejectWithValue('Error fetching permissions');
    }
  }
);
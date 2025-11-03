import { createSlice } from '@reduxjs/toolkit';
import { fetchRbac } from './RbacThunks';

const initialState = {
  roles: [],
  components: [],
  navigation: [],
  loading: false,
  error: null,
};

const rbacSlice = createSlice({
  name: 'rbac',
  initialState,
  reducers: {
    clearRbac(state) {
      state.roles = [];
      state.components = [];
      state.navigation = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRbac.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRbac.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.roles;
        state.components = action.payload.components;
        state.navigation = action.payload.navigation;
      })
      .addCase(fetchRbac.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearRbac } = rbacSlice.actions;
export default rbacSlice.reducer;
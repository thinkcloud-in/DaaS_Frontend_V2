import { createSlice } from "@reduxjs/toolkit";
import { fetchNamespaces, updateNamespaceRetention } from "./NamespaceThunks";

const initialState = {
  namespaces: [],
  loading: false,
  saving: false,
  error: null,
};

const namespaceSlice = createSlice({
  name: "namespace",
  initialState,
  reducers: {
    setNamespaces(state, action) {
      state.namespaces = action.payload || [];
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNamespaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNamespaces.fulfilled, (state, action) => {
        state.loading = false;
        state.namespaces = action.payload || [];
      })
      .addCase(fetchNamespaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error?.message;
        state.namespaces = [];
      })
      .addCase(updateNamespaceRetention.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateNamespaceRetention.fulfilled, (state, action) => {
        state.saving = false;
        // backend may return updated namespace info; try to merge if present
        const payload = action.payload || {};
        if (payload.updated_namespace || payload.namespace) {
          const updated = payload.updated_namespace || payload.namespace;
          state.namespaces = state.namespaces.map((n) =>
            n.namespaceName === updated.namespaceName ? { ...n, ...updated } : n
          );
        }
      })
      .addCase(updateNamespaceRetention.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || action.error?.message;
      });
  },
});

export const { setNamespaces } = namespaceSlice.actions;
export default namespaceSlice.reducer;

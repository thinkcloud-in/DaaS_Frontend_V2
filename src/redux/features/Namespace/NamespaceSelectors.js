export const selectAllNamespaces = (state) => state.namespace?.namespaces || [];
export const selectNamespaceLoading = (state) => !!state.namespace?.loading;
export const selectNamespaceSaving = (state) => !!state.namespace?.saving;
export const selectNamespaceError = (state) => state.namespace?.error || null;

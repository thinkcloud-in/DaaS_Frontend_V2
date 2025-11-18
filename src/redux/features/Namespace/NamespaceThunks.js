import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchNamespacesService, updateNamespaceRetentionService } from "Services/NamespaceService";

export const fetchNamespaces = createAsyncThunk(
  "namespace/fetchNamespaces",
  async (token, { rejectWithValue }) => {
    try {
      const data = await fetchNamespacesService(token);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to fetch namespaces");
    }
  }
);

export const updateNamespaceRetention = createAsyncThunk(
  "namespace/updateRetention",
  async ({ token, namespace, retention_days, email }, { rejectWithValue }) => {
    try {
      const res = await updateNamespaceRetentionService(token, namespace, retention_days, email);
      // return whatever backend returned (message/newRetentionPeriod etc.)
      return res?.data || res;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to update retention");
    }
  }
);

export default {
  fetchNamespaces,
  updateNamespaceRetention,
};

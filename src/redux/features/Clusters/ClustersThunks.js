import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchClusters,
  createCluster,
  deleteCluster,
  updateCluster,
  fetchClusterById,
  fetchInfluxdbDetails,
  addInfluxdb,
  deleteInfluxdb,
  migrateMonitoringData,
  updateProxmoxNodes,
  fetchEditInfluxdbDetails,
} from "Services/ClusterService";

// Fetch all clusters
export const fetchClustersThunk = createAsyncThunk(
  "clusters/fetchAll",
  async (arg, { rejectWithValue }) => {
    // Back-compat: accept either a plain token string (old call sites) or
    // { token, page, pageSize } (new paginated call sites).
    const { token, page = 1, pageSize = 10 } =
      typeof arg === "string" ? { token: arg } : arg || {};
    try {
      const data = await fetchClusters(token, page, pageSize);
      return {
        items: Array.isArray(data?.items) ? data.items : [],
        pagination: data?.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// Create a new cluster
export const createClusterThunk = createAsyncThunk(
  "clusters/createCluster",
  async ({ token, payload }, { rejectWithValue }) => {
    try {
      const res = await createCluster(token, payload);
      // Assuming res.data.cluster contains created cluster info
      if (typeof res.data === "string") {
        return { cluster: null, message: res.data, warning: true };
      }

      // Backend returned a cluster object
      if (res.data?.cluster) {
        return {
          cluster: res.data.cluster,
          message: res.msg || null,
          warning: false,
        };
      }
    } catch (err) {
      const message =
        err.response?.data?.data ||
        err.response?.data?.msg ||
        err.message ||
        "Cluster creation failed";

      return rejectWithValue(message);
    }
  },
);

// Delete a cluster
export const deleteClusterThunk = createAsyncThunk(
  "clusters/deleteCluster",
  async ({ token, cluster_id, email }, { rejectWithValue }) => {
    try {
      await deleteCluster(token, cluster_id, email);
      return cluster_id;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.msg || err.message);
    }
  },
);

// Update a cluster
export const updateClusterThunk = createAsyncThunk(
  "clusters/updateCluster",
  async ({ token, clusterId, payload }, { rejectWithValue }) => {
    try {
      const res = await updateCluster(token, clusterId, payload);
      return res.data?.cluster || payload;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// Get cluster by id
export const fetchClusterByIdThunk = createAsyncThunk(
  "clusters/fetchById",
  async ({ token, clusterId }, { rejectWithValue }) => {
    try {
      return await fetchClusterById(token, clusterId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// Monitorings related
export const fetchInfluxdbDetailsThunk = createAsyncThunk(
  "clusters/fetchInfluxdbDetails",
  async ({ token, clusterId }, { rejectWithValue }) => {
    try {
      return await fetchInfluxdbDetails(token, clusterId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const fetchEditInfluxdbDetailsThunk = createAsyncThunk(
  "clusters/fetchEditInfluxdbDetails",
  async ({ token, clusterId }, { rejectWithValue }) => {
    try {
      return await fetchEditInfluxdbDetails(token, clusterId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const addInfluxdbThunk = createAsyncThunk(
  "clusters/addInfluxdb",
  async ({ token, clusterId, isCustomIntegration }, { rejectWithValue }) => {
    try {
      return await addInfluxdb(token, clusterId, isCustomIntegration);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const deleteInfluxdbThunk = createAsyncThunk(
  "clusters/deleteInfluxdb",
  async ({ token, clusterId }, { rejectWithValue }) => {
    try {
      return await deleteInfluxdb(token, clusterId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const migrateMonitoringDataThunk = createAsyncThunk(
  "clusters/migrateMonitoringData",
  async ({ token, payload }, { rejectWithValue }) => {
    try {
      return await migrateMonitoringData(token, payload);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

// Update Proxmox nodes action (refresh)
export const updateProxmoxNodesThunk = createAsyncThunk(
  "clusters/updateProxmoxNodes",
  async (arg, { rejectWithValue }) => {
    const { token, page = 1, pageSize = 10 } =
      typeof arg === "string" ? { token: arg } : arg || {};
    try {
      const updateRes = await updateProxmoxNodes(token);
      const clustersRes = await fetchClusters(token, page, pageSize);

      return {
        update: updateRes,
        items: Array.isArray(clustersRes?.items) ? clustersRes.items : [],
        pagination: clustersRes?.pagination || null,
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

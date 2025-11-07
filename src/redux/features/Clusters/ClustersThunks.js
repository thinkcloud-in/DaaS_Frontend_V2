import { createAsyncThunk } from '@reduxjs/toolkit';
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
} from 'Services/ClusterService';

// Fetch all clusters
export const fetchClustersThunk = createAsyncThunk(
  'clusters/fetchAll',
  async (token, { rejectWithValue }) => {
    try {
      return await fetchClusters(token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Create a new cluster
export const createClusterThunk = createAsyncThunk(
  'clusters/createCluster',
  async ({ token, payload }, { rejectWithValue }) => {
    try {
      const res = await createCluster(token, payload);
      // Assuming res.data.cluster contains created cluster info
      return res.data.cluster;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Delete a cluster
export const deleteClusterThunk = createAsyncThunk(
  'clusters/deleteCluster',
  async ({ token, cluster_id, email }, { rejectWithValue }) => {
    try {
      await deleteCluster(token, cluster_id, email);
      return cluster_id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Update a cluster
export const updateClusterThunk = createAsyncThunk(
  'clusters/updateCluster',
  async ({ token, clusterId, payload }, { rejectWithValue }) => {
    try {
      const res = await updateCluster(token, clusterId, payload);
      return res.data?.cluster || payload;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Get cluster by id
export const fetchClusterByIdThunk = createAsyncThunk(
  'clusters/fetchById',
  async ({ token, clusterId }, { rejectWithValue }) => {
    try {
      return await fetchClusterById(token, clusterId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Monitorings related
export const fetchInfluxdbDetailsThunk = createAsyncThunk(
  'clusters/fetchInfluxdbDetails',
  async ({ token, clusterId }, { rejectWithValue }) => {
    try {
      return await fetchInfluxdbDetails(token, clusterId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchEditInfluxdbDetailsThunk = createAsyncThunk(
  'clusters/fetchEditInfluxdbDetails',
  async ({ token, clusterId }, { rejectWithValue }) => {
    try {
      return await fetchEditInfluxdbDetails(token, clusterId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addInfluxdbThunk = createAsyncThunk(
  'clusters/addInfluxdb',
  async ({ token, clusterId, isCustomIntegration }, { rejectWithValue }) => {
    try {
      return await addInfluxdb(token, clusterId, isCustomIntegration);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteInfluxdbThunk = createAsyncThunk(
  'clusters/deleteInfluxdb',
  async ({ token, clusterId }, { rejectWithValue }) => {
    try {
      return await deleteInfluxdb(token, clusterId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const migrateMonitoringDataThunk = createAsyncThunk(
  'clusters/migrateMonitoringData',
  async ({ token, payload }, { rejectWithValue }) => {
    try {
      return await migrateMonitoringData(token, payload);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Update Proxmox nodes action (refresh)
export const updateProxmoxNodesThunk = createAsyncThunk(
  'clusters/updateProxmoxNodes',
  async (token, { rejectWithValue }) => {
    try {
      await updateProxmoxNodes(token);
      // Should probably refetch clusters after updating
      return await fetchClusters(token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
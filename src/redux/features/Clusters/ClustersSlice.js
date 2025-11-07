import { createSlice } from '@reduxjs/toolkit';
import {
  fetchClustersThunk,
  createClusterThunk,
  deleteClusterThunk,
  updateClusterThunk,
  fetchClusterByIdThunk,
  fetchInfluxdbDetailsThunk,
  addInfluxdbThunk,
  deleteInfluxdbThunk,
  migrateMonitoringDataThunk,
  updateProxmoxNodesThunk,
  fetchEditInfluxdbDetailsThunk
} from './ClustersThunks';

const initialState = {
  clusters: [],
  clusterDetails: null,
  isLoading: false,
  error: null,
  selectedClusterId: null,
  monitoring: {
    status: 'idle',
    monitoringData: null,
    monitoringLoading: false,
    showMonitoringConfirm: false,
    wasMonitoringIntegrated: false,
  },
};

const clustersSlice = createSlice({
  name: 'clusters',
  initialState,
  reducers: {
    setSelectedClusterId(state, action) {
      state.selectedClusterId = action.payload;
    },
    clearClusterDetails(state) {
      state.clusterDetails = null;
    },
    setShowMonitoringConfirm(state, action) {
      state.monitoring.showMonitoringConfirm = action.payload;
    },
    setMonitoringChecked(state, action) {
      state.monitoring.wasMonitoringIntegrated = action.payload;
    },
    resetError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch clusters
      .addCase(fetchClustersThunk.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClustersThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clusters = action.payload;
      })
      .addCase(fetchClustersThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Create cluster
      .addCase(createClusterThunk.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createClusterThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clusters.push(action.payload);
      })
      .addCase(createClusterThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Delete cluster
      .addCase(deleteClusterThunk.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteClusterThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clusters = state.clusters.filter(
          cluster => cluster.id !== action.meta.arg.cluster_id
        );
      })
      .addCase(deleteClusterThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Update cluster
      .addCase(updateClusterThunk.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateClusterThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.clusters.findIndex(
          cl => cl.id === action.meta.arg.clusterId
        );
        if (idx >= 0) state.clusters[idx] = action.payload;
      })
      .addCase(updateClusterThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Single cluster details
      .addCase(fetchClusterByIdThunk.pending, state => {
        state.isLoading = true;
      })
      .addCase(fetchClusterByIdThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clusterDetails = action.payload;
      })
      .addCase(fetchClusterByIdThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Monitoring/InfluxDB
      .addCase(fetchInfluxdbDetailsThunk.pending, state => {
        state.monitoring.monitoringLoading = true;
      })
      .addCase(fetchInfluxdbDetailsThunk.fulfilled, (state, action) => {
        state.monitoring.monitoringLoading = false;
        state.monitoring.monitoringData = action.payload;
        state.monitoring.wasMonitoringIntegrated =
          !!(action.payload && Object.keys(action.payload).length > 0 && !action.payload.error);
      })
      .addCase(fetchInfluxdbDetailsThunk.rejected, state => {
        state.monitoring.monitoringLoading = false;
        state.monitoring.monitoringData = null;
        state.monitoring.wasMonitoringIntegrated = false;
      })
      .addCase(fetchEditInfluxdbDetailsThunk.pending, state => {
        state.monitoring.monitoringLoading = true;
      })
      .addCase(fetchEditInfluxdbDetailsThunk.fulfilled, (state, action) => {
        state.monitoring.monitoringLoading = false;
        state.monitoring.monitoringData = action.payload;
        state.monitoring.wasMonitoringIntegrated = !!(action.payload && action.payload.monitoring);
      })
      .addCase(fetchEditInfluxdbDetailsThunk.rejected, state => {
        state.monitoring.monitoringLoading = false;
        state.monitoring.monitoringData = null;
        state.monitoring.wasMonitoringIntegrated = false;
      })
      .addCase(addInfluxdbThunk.pending, state => {
        state.monitoring.monitoringLoading = true;
      })
      .addCase(addInfluxdbThunk.fulfilled, state => {
        state.monitoring.monitoringLoading = false;
      })
      .addCase(addInfluxdbThunk.rejected, state => {
        state.monitoring.monitoringLoading = false;
      })
      .addCase(deleteInfluxdbThunk.pending, state => {
        state.monitoring.monitoringLoading = true;
      })
      .addCase(deleteInfluxdbThunk.fulfilled, state => {
        state.monitoring.monitoringLoading = false;
        state.monitoring.monitoringData = null;
      })
      .addCase(deleteInfluxdbThunk.rejected, state => {
        state.monitoring.monitoringLoading = false;
      })
      .addCase(migrateMonitoringDataThunk.pending, state => {
        state.monitoring.monitoringLoading = true;
      })
      .addCase(migrateMonitoringDataThunk.fulfilled, state => {
        state.monitoring.monitoringLoading = false;
      })
      .addCase(migrateMonitoringDataThunk.rejected, state => {
        state.monitoring.monitoringLoading = false;
      })

      // Update/refresh Proxmox nodes
      .addCase(updateProxmoxNodesThunk.pending, state => {
        state.isLoading = true;
      })
      .addCase(updateProxmoxNodesThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.clusters = action.payload;
      })
      .addCase(updateProxmoxNodesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const {
  setSelectedClusterId,
  clearClusterDetails,
  setShowMonitoringConfirm,
  setMonitoringChecked,
  resetError
} = clustersSlice.actions;

export default clustersSlice.reducer;
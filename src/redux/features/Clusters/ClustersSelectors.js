// Selectors for clusters state

// Root selector for clusters
export const selectClustersState = state => state.clusters;

// All clusters
export const selectAllClusters = state => state.clusters.clusters;

// Cluster loading state
export const selectClustersLoading = state => state.clusters.isLoading;

// Single cluster details
export const selectClusterDetails = state => state.clusters.clusterDetails;

// Monitoring data and flags
export const selectMonitoring = state => state.clusters.monitoring;

// Selected cluster (id)
export const selectSelectedClusterId = state => state.clusters.selectedClusterId;

// Error
export const selectClustersError = state => state.clusters.error;
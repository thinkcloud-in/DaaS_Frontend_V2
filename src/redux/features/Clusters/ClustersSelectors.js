
export const selectClustersState = state => state.clusters;
export const selectAllClusters = state => state.clusters.clusters;
export const selectClustersLoading = state => state.clusters.isLoading;
export const selectClusterDetails = state => state.clusters.clusterDetails;
export const selectMonitoring = state => state.clusters.monitoring;
export const selectSelectedClusterId = state => state.clusters.selectedClusterId;
export const selectClustersError = state => state.clusters.error;
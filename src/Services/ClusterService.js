import axiosInstance from "./AxiosInstane";
import { getEnv } from "utils/getEnv";

const backendUrl = getEnv("BACKEND_URL");
// Proxmox: Get Monitoring (Edit Page)
export const fetchEditInfluxdbDetails = async (token, clusterId) => {

  const res = await axiosInstance.get(
    `${backendUrl}/v1/proxmox/edit/get_influxdb_metric_server`,
    {
      params: { cluster_id: clusterId },
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return res.data?.data?.influxdb_metric_server;
};

// Create Cluster
export const createCluster = async (token, payload) => {
  const res = await axiosInstance.post(
    `${backendUrl}/v1/create_cluster`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Get All Clusters
export const fetchClusters = async (token) => {
  const res = await axiosInstance.get(
    `${backendUrl}/v1/clusters`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data?.data || [];
};

// Get Cluster By ID
export const fetchClusterById = async (token, clusterId) => {
  const res = await axiosInstance.get(
    `${backendUrl}/v1/cluster/${clusterId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data?.data;
};

// Update Cluster
export const updateCluster = async (token, clusterId, payload) => {
  const res = await axiosInstance.put(
    `${backendUrl}/v1/update_cluster/${clusterId}`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Delete Cluster
export const deleteCluster = async (token, clusterId, userEmail) => {
  const res = await axiosInstance.delete(
    `${backendUrl}/v1/delete_cluster/${clusterId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      data: { email: userEmail }
    }
  );
  return res.data;
};

// Proxmox: Get/Set Monitoring (InfluxDB)
export const fetchInfluxdbDetails = async (token, clusterId) => {
  const res = await axiosInstance.get(
    `${backendUrl}/v1/proxmox/get_influxdb_metric_server`,
    {
      params: { cluster_id: clusterId, monitoring: true },
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return res.data?.data?.influxdb_metric_server;
};

export const addInfluxdb = async (token, clusterId, isCustomIntegration) => {
  const res = await axiosInstance.post(
    `${backendUrl}/v1/proxmox/add_influxdb_metric_server`,
    { monitoring: true, is_custom_integration: isCustomIntegration },
    {
      params: { cluster_id: clusterId, influxdb_metric_server: "" },
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return res.data;
};

export const deleteInfluxdb = async (token, clusterId) => {
  const res = await axiosInstance.delete(
    `${backendUrl}/v1/proxmox/delete_influxdb_metric_server`,
    {
      params: { cluster_id: clusterId },
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return res.data;
};

// Proxmox: Migrate Monitoring Data
export const migrateMonitoringData = async (token, payload) => {
  const res = await axiosInstance.post(
    `${backendUrl}/v1/proxmox/migrate_bucket_all_data`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

// Proxmox: Update Nodes
export const updateProxmoxNodes = async (token) => {
  const res = await axiosInstance.put(
    `${backendUrl}/v1/proxmox/update-nodes`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};
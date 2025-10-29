import axiosInstance from "Services/AxiosInstane";
import { getEnv } from "utils/getEnv";

const backendUrl = getEnv("BACKEND_URL");
const agentBackendUrl = process.env.REACT_APP_AGENT_BACKEND_URL;

export const fetchVmDetails = async (vmId) => {
  const res = await axiosInstance.get(`${backendUrl}/v1/proxmox/proxmox_vm_info/${vmId}`);
  return res.data.data;
};

export const fetchBackgroundProcesses = async (config, hostForApi, osType) => {
  const res = await axiosInstance.get(`${agentBackendUrl}/api/influxdb/fetch-background-processes`, {
    params: {
      bucket: config.bucket,
      range_start: "-1m",
      host: hostForApi,
      os_type: osType
    }
  });
  return res.data.data || [];
};

export const fetchHostStats = async (config, hostForApi, osType) => {
  const res = await axiosInstance.get(`${agentBackendUrl}/api/influxdb/fetch-host-stats`, {
    params: {
      bucket: config.bucket,
      host: hostForApi,
      range_start: "-5m",
      os_type: osType
    }
  });
  return res.data || {};
};

export const killProcesses = async (processHost, hostIp, pids, osType) => {
  return axiosInstance.post(
    `${agentBackendUrl}/api/TaskManager/kill_process`,
    {
      host: processHost,
      IP: hostIp,
      pids: pids,
      os_type: osType
    }
  );
};

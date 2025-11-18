import axiosInstance from "./AxiosInstance";
import { getEnv } from "utils/getEnv";

const backendUrl = getEnv("BACKEND_URL");

export const fetchNamespacesService = async (token) => {
  const response = await axiosInstance.get(`${backendUrl}/v1/namespace/get_namespaces`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data?.data || response.data || [];
};

export const updateNamespaceRetentionService = async (token, namespace, retention_days, email) => {
  const response = await axiosInstance.put(
    `${backendUrl}/v1/namespace/update-retention`,
    { namespace, retention_days, email },
    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
  );
  return response.data || response;
};

export default {
  fetchNamespacesService,
  updateNamespaceRetentionService,
};

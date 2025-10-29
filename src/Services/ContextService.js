import axiosInstance from "./AxiosInstane";
import { getEnv } from "utils/getEnv";

const backendUrl = getEnv('BACKEND_URL');

export const fetchUserPermissions = async (token, username) => {
  const res = await axiosInstance.get(
    `${backendUrl}/v1/guacamole/get_user_permissions/${username}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return res.data;
};

export const fetchPools = async (token) => {
  const res = await axiosInstance.get(`${backendUrl}/v1/pools`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data?.data || [];
};

export const fetchClusters = async (token) => {
  const res = await axiosInstance.get(`${backendUrl}/v1/clusters`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data?.data || [];
};

export const fetchDomains = async (token) => {
  const res = await axiosInstance.get(`${backendUrl}/v1/ldaps`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data?.data || [];
};
import axiosInstance from "./AxiosInstane";
import { getEnv } from "utils/getEnv";

const backendUrl = getEnv('BACKEND_URL');

export const createIpPool = async (token, payload) => {
  const res = await axiosInstance.post(
    `${backendUrl}/v1/ips/add_ips`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const fetchIpPools = async (token) => {
  const res = await axiosInstance.get(
    `${backendUrl}/v1/ips/get_all_ips`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data?.data || [];
};

export const deleteIpPoolByName = async (token, poolName) => {
  const res = await axiosInstance.delete(
    `${backendUrl}/v1/ips/delete_pool_by_name/${encodeURIComponent(poolName)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};



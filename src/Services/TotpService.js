
import axiosInstance from "./AxiosInstance";
import { getEnv } from "utils/getEnv";
import { toast } from "react-toastify";
import { Slide } from "react-toastify";

const backendUrl = getEnv("BACKEND_URL");

export const getTotpBrowserStatus = async (token) => {
  try {
    const response = await axiosInstance.get(
      `${backendUrl}/v1/totp/get-enable-disable-totp-browser`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    toast.error("Failed to fetch TOTP browser status");
    throw error;
  }
};

export const getTotpGuacStatus = async (token) => {
  try {
    const response = await axiosInstance.get(
      `${backendUrl}/v1/totp/get-enable-disable-guac`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  } catch (error) {
    toast.error("Failed to fetch TOTP Guacamole status");
    throw error;
  }
};

export const updateTotpBrowserStatus = async (token, enabled) => {
  try {
    const response = await axiosInstance.put(
      `${backendUrl}/v1/totp/enable-disable-totp-browser/${enabled}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (response.status === 200) {
      toast.info(`TOTP Turned ${enabled ? 'ON' : 'OFF'} for Admin`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
    } else {
      toast.error("Failed to update TOTP for Admin", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
    }
    
    return response.data;
  } catch (error) {
    toast.error("Failed to update TOTP browser status");
    throw error;
  }
};

export const fetchUsersForTotpReset = async (token, search = "", first, limit) => {
  try {
    const queryParams = [];
    if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
    if (typeof first !== "undefined" && first !== null) queryParams.push(`first=${encodeURIComponent(first)}`);
    if (typeof limit !== "undefined" && limit !== null) queryParams.push(`limit=${encodeURIComponent(limit)}`);
    const queryString = queryParams.length ? `?${queryParams.join("&")}` : "";
    const response = await axiosInstance.get(
      `${backendUrl}/v1/guacamole/list_users${queryString}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (response.data?.data) {
      const data = response.data.data;
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.users)) {
        return data.users;
      }
    }
    return [];
  } catch (error) {
    throw new Error("Failed to fetch users");
  }
};

export const resetGuacTotp = async (token, userId) => {
  try {
    const response = await axiosInstance.post(
      `${backendUrl}/v1/totp/reset-guac-totp/${userId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (response.status === 200) {
      toast.success("TOTP reset successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
    }
    return response.data;
  } catch (error) {
    toast.error("Failed to reset TOTP");
    throw error;
  }
};

export const verifyTotpCode = async (token, totpCode) => {
  const response = await axiosInstance.post(
    `${backendUrl}/v1/totp/verify-totp`,
    { totp_code: totpCode },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const updateTotpGuacStatus = async (token, enabled) => {
  try {
    const response = await axiosInstance.put(
      `${backendUrl}/v1/totp/enable-disable-guac/${enabled}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (response.status === 200) {
      toast.info(`TOTP Turned ${enabled ? 'ON' : 'OFF'} for Client`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
    } else {
      toast.error("Failed to update TOTP for Client", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
    }
    
    return response.data;
  } catch (error) {
    toast.error("Failed to update TOTP Guacamole status");
    throw error;
  }
};
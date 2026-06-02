
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
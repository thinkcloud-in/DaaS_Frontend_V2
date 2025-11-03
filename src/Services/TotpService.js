import axiosInstance from "./AxiosInstane";
import { getEnv } from "utils/getEnv";
import { toast } from "react-toastify";
import { Slide } from "react-toastify";

const backendUrl = getEnv("BACKEND_URL");

// Get TOTP status for browser/admin
export const getTotpBrowserStatus = async (token) => {
  try {
    const response = await axiosInstance.get(
      `${backendUrl}/v1/get-enable-disable-totp-browser`,
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

// Get TOTP status for Guacamole/client
export const getTotpGuacStatus = async (token) => {
  try {
    const response = await axiosInstance.get(
      `${backendUrl}/v1/get-enable-disable-guac`,
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

// Enable/Disable TOTP for browser/admin
export const updateTotpBrowserStatus = async (token, enabled) => {
  try {
    const response = await axiosInstance.put(
      `${backendUrl}/v1/enable-disable-totp-browser/${enabled}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (response.statusText === "OK") {
      toast.success("Success", {
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
      toast.error("enable-disable-totp-browser Failed", {
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

// Enable/Disable TOTP for Guacamole/client
export const updateTotpGuacStatus = async (token, enabled) => {
  try {
    const response = await axiosInstance.put(
      `${backendUrl}/v1/enable-disable-guac/${enabled}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (response.statusText === "OK") {
      toast.success("Success", {
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
      toast.error("enable-disable-guac Failed", {
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
import axiosInstance from "./AxiosInstane";
import { getEnv } from "utils/getEnv";
import { toast } from "react-toastify";

const backendUrl = getEnv("BACKEND_URL");
export const GetAllIpmiLists = async (token) => {
  try {
    const response = await axiosInstance.get(`${backendUrl}/v1/ipmi/get_all_ipmi_servers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data?.data || [];
  } catch (error) {
    toast.error(error?.data?.msg || "Failed to fetch IPMI list", { position: "top-right", autoClose: 3000 });
    throw error;
  }
};
export const createIpmiServer = async (token, payload) => {
  try {
    const response = await axiosInstance.post(`${backendUrl}/v1/ipmi/add_ipmi_server`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.data && response.data.code === 400) {
      toast.info(response.data?.msg);
      return { success: false, message: response.data.msg };
    }

    toast.success("IPMI server created successfully!");
    return { success: true };
  } catch (error) {
    const errorMsg = error.response?.data?.msg || "Failed to create IPMI server";
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }
};

export const deleteIpmiServer = async (token, ipmi_id, userEmail) => {
  try {
    await axiosInstance.delete(`${backendUrl}/v1/ipmi/delete_ipmi_server/${ipmi_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: { email: userEmail },
    });
    toast.success("IPMI Server deleted successfully!");
    return true;
  } catch (error) {
    toast.error("Delete failed.");
    throw error;
  }
};
export const getIpmiServerById = async (token, id) => {
  try {
    const response = await axiosInstance.get(`${backendUrl}/v1/ipmi/get_ipmi_server/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data?.data;
  } catch (error) {
    const errorMsg = error?.data?.msg || "Failed to load IPMI device details";
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }
};
export const updateIpmiServer = async (token, id, payload) => {
  try {
    await axiosInstance.put(`${backendUrl}/v1/ipmi/update_ipmi_server/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("IPMI Server updated successfully!");
    return true;
  } catch (error) {
    const errorMsg = error?.data?.msg || "Failed to update IPMI server";
    toast.error(errorMsg);
    throw new Error(errorMsg);
  }
};
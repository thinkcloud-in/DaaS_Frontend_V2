import axiosInstance from "./AxiosInstane";
import { getEnv } from "utils/getEnv";

const backendUrl = getEnv("BACKEND_URL");

// Fetch a Guacamole recording file as ArrayBuffer
export const fetchGuacRecordingFile = async (identifier, logUuid) => {
  const url = `${backendUrl}/v1/guacamole/api/recording/${identifier}/${logUuid}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch recording file");
  return await response.arrayBuffer();
};

// Fetch Guacamole session history
export const fetchGuacamoleHistory = async (token) => {
  const res = await axiosInstance.get(
    `${backendUrl}/v1/guacamole/guacamole_history`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

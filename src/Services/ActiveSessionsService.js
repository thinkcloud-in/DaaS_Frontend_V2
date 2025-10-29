import axiosInstance from "./AxiosInstane";
import { getEnv } from "utils/getEnv";

const backendUrl = getEnv("BACKEND_URL");

// Fetch Guacamole active sessions
export const fetchGuacamoleActiveSessions = async (token) => {
  const res = await axiosInstance.get(
    `${backendUrl}/v1/guacamole/guacamole_ActiveSessions`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

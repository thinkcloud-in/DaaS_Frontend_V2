import axiosInstance from "./AxiosInstance";
import { getEnv } from "utils/getEnv";

const backendUrl = getEnv("BACKEND_URL");
const sslApiUrl = "http://10.1.3.48:8000/v1/ssl";

export const uploadSSLCertificate = async (token, certFile, keyFile) => {
  const formData = new FormData();
  formData.append("cert_file", certFile);
  formData.append("key_file", keyFile);

  const response = await axiosInstance.post(
    `${sslApiUrl}/ssl_upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const fetchSSLStatus = async (token) => {
  const response = await axiosInstance.get(
    `${sslApiUrl}/ssl_status`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const renewSSLCertificate = async (token) => {
  const response = await axiosInstance.post(
    `${sslApiUrl}/ssl_renew`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

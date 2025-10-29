import axiosInstance from "./AxiosInstane";
import { getEnv } from "utils/getEnv";

const backendUrl = getEnv("BACKEND_URL");

export const fetchSmtpConfig = async (token) => {
  const response = await axiosInstance.get(
    `${backendUrl}/v1/smtp/smtp-get`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const updateSmtpStatus = async (token, data, status) => {
  const updatedData = { ...data, smtpStatus: status };
  const response = await axiosInstance.patch(
    `${backendUrl}/v1/smtp/smtp-update-status`,
    updatedData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const saveSmtpConfig = async (token, data, existingConfig) => {
  if (existingConfig) {
    const response = await axiosInstance.put(
      `${backendUrl}/v1/smtp/smtp-update`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } else {
    const response = await axiosInstance.post(
      `${backendUrl}/v1/smtp/smtp-post`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  }
};

export const sendSmtpTestMail = async (token, data) => {
  const response = await axiosInstance.post(
    `${backendUrl}/v1/smtp/smtp-test-mail`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
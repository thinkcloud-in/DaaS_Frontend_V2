import axiosInstance from "./AxiosInstance";
import { getEnv } from "utils/getEnv";

const backendUrl = getEnv("BACKEND_URL");

export const uploadLibraryFile = async (token, formData, onProgress) => {
    const response = await axiosInstance.post(
        `${backendUrl}/v1/library/upload`,
        formData,
        {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
            onUploadProgress: (e) => {
                if (onProgress && e.total) {
                    onProgress(Math.round((e.loaded * 100) / e.total));
                }
            },
        }
    );
    return response.data;
};

export const fetchLibraryList = async (token, { type, page = 1, pageSize = 10 } = {}) => {
    const params = new URLSearchParams({ page, page_size: pageSize });
    if (type) params.append("type", type);
    const response = await axiosInstance.get(
        `${backendUrl}/v1/library/list?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

export const fetchLibraryItem = async (token, id) => {
    const response = await axiosInstance.get(
        `${backendUrl}/v1/library/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

export const deleteLibraryItem = async (token, id) => {
    const response = await axiosInstance.delete(
        `${backendUrl}/v1/library/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

export const downloadLibraryFile = async (token, id, fileName) => {
    const response = await axiosInstance.get(
        `${backendUrl}/v1/library/download/${id}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" }
    );
    const url = URL.createObjectURL(response.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || `library-file-${id}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

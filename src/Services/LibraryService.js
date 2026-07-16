import axiosInstance from "./AxiosInstance";
import { getEnv } from "utils/getEnv";

const backendUrl = getEnv("BACKEND_URL");

// Step 1: POST metadata only — returns item_id in <100ms
export const createLibraryItem = async (token, { name, fileName, type, machineId }) => {
    const body = { name, file_name: fileName };
    if (type)      body.type       = type;
    if (machineId) body.machine_id = machineId;
    const response = await axiosInstance.post(
        `${backendUrl}/v1/library/upload`,
        body,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
    return response.data;
};

// Step 2: PUT raw file bytes via XHR — gives real browser-side upload progress
// xhrRef (optional): pass a ref to get the XHR instance for abort on cancel
export const streamLibraryFile = (token, itemId, file, onProgress, xhrRef) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        if (xhrRef) xhrRef.current = xhr;

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                onProgress(Math.round((e.loaded / e.total) * 99)); // cap at 99 — 100 = Temporal done
            }
        };
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try { resolve(JSON.parse(xhr.responseText || "{}")); }
                catch { resolve({}); }
            } else {
                try {
                    const err = JSON.parse(xhr.responseText || "{}");
                    reject(err?.msg || err?.detail || `Upload failed (${xhr.status})`);
                } catch {
                    reject(`Upload failed (${xhr.status})`);
                }
            }
        };
        xhr.onerror = () => reject("Network error during file upload");
        xhr.onabort = () => reject("__CANCELLED__");

        xhr.open("PUT", `${backendUrl}/v1/library/${itemId}/file`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.send(file);
    });
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

export const deployLibraryItem = async (token, id, payload) => {
    const response = await axiosInstance.post(
        `${backendUrl}/v1/library/${id}/deploy`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

export const fetchDeployments = async (token, { page = 1, pageSize = 10 } = {}) => {
    const params = new URLSearchParams({ page, page_size: pageSize });
    const response = await axiosInstance.get(
        `${backendUrl}/v1/library/deployments?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

export const fetchDeployment = async (token, id) => {
    const response = await axiosInstance.get(
        `${backendUrl}/v1/library/deployments/${id}`,
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

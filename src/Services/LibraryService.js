import axiosInstance from "./AxiosInstance";
import { getEnv } from "utils/getEnv";

const backendUrl = getEnv("BACKEND_URL");

// Step 1: POST metadata only — returns item_id in <100ms
// The backend derives the item's name from the uploaded file itself, so no
// `name` field is sent here.
export const createLibraryItem = async (token, { fileName, fileSize, type, harborRegistryId, version, metadata }) => {
    const body = { file_name: fileName };
    if (fileSize != null)  body.file_size          = fileSize;
    if (type)               body.type              = type;
    if (harborRegistryId)  body.harbor_registry_id = harborRegistryId;
    if (version)            body.version           = version;
    // Extracted client-side from the uploaded .zip's version_metadata.json, if present.
    if (metadata)            body.metadata          = metadata;
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

// Polls a Kubernetes Harbor deployment's status/harbor_url after
// deployLibraryItem() is called with deployment_type: "kubernetes".
export const fetchKubernetesDeploymentStatus = async (token, clusterId, deployId) => {
    const response = await axiosInstance.get(
        `${backendUrl}/v1/kubernetes/clusters/${clusterId}/deployments/${deployId}`,
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

// type: "kubernetes" | "lxc" — the deployments list mixes both job kinds
// (kubernetes rows carry a deploy_id, lxc rows carry a job_id), and the
// detail endpoint needs to know which table to look the id up in.
export const fetchDeployment = async (token, id, type) => {
    const params = type ? `?type=${type}` : "";
    const response = await axiosInstance.get(
        `${backendUrl}/v1/library/deployments/${id}${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

// Deletes a deployment job — backend checks lxc_restore_jobs first, then
// kubernetes_deployments, and 404s if found in neither.
export const deleteDeployment = async (token, id) => {
    const response = await axiosInstance.delete(
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

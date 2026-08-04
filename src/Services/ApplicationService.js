import axiosInstance from "Services/AxiosInstance";
import { getEnv } from "utils/getEnv";

const backendUrl = getEnv("BACKEND_URL")?.replace(/\/$/, "");

// Maps whatever shape the backend returns onto the field names the
// Application UI components expect.
const normalizeApplication = (raw) => {
    if (!raw) return null;
    return {
        id:         String(raw.id ?? ""),
        name:       raw.name ?? "",
        type:       raw.deployment_type ?? raw.type ?? "",
        clusterId:  raw.k8s_cluster_id ?? raw.cluster_id ?? null,
        harborId:   raw.harbor_registry_id ?? raw.harbor_id ?? null,
        versionId:  raw.version_id ?? null,
        namespace:  raw.namespace ?? "",
        status:     raw.status ?? "Unknown",
        // Ready once serviceUrl/externalIp/nodePort come back populated.
        serviceUrl:   raw.service_url ?? null,
        externalIp:   raw.external_ip ?? null,
        nodePort:     raw.node_port ?? null,
        harborUrl:    raw.harbor_url ?? null,
        image:        raw.image ?? null,
        // Currently-linked Vector DB (Open WebUI deployments only) — field name
        // isn't documented on the detail response yet, so check a few likely ones.
        linkedVectorDbId: raw.vectordb_deploy_id ?? raw.connected_vectordb_id ?? raw.linked_vectordb_id ?? null,
        // { step, label, pct } while deploying; stepsLog is the raw event timeline.
        progress:     raw.progress ?? null,
        stepsLog:     raw.steps_log ?? [],
        errorMessage: raw.error_message ?? null,
        createdAt:    raw.created_at ?? raw.createdAt ?? "",
    };
};

// Lists deployed applications — supports pagination and optional filtering
// by deployment type ("openwebui" | "vectordb").
export const fetchApplications = async ({ page = 1, pageSize = 10, deploymentType } = {}) => {
    const params = new URLSearchParams({ page, page_size: pageSize });
    if (deploymentType) params.append("deployment_type", deploymentType);

    const res = await axiosInstance.get(`${backendUrl}/v1/app-deploy?${params}`);
    // Response is wrapped as { status, code, msg, data: { items, pagination } }
    // — unwrap the envelope, but tolerate an unwrapped { items, pagination } too.
    const envelope = res.data ?? {};
    const body = envelope.data ?? envelope;
    const items = Array.isArray(body.items) ? body.items : (Array.isArray(body) ? body : []);
    const pg = body.pagination || {};

    return {
        items: items.map(normalizeApplication),
        pagination: {
            page:       pg.page ?? page,
            pageSize:   pg.page_size ?? pageSize,
            total:      pg.total ?? items.length,
            totalPages: pg.total_pages ?? (Math.ceil((pg.total ?? items.length) / pageSize) || 1),
            hasNext:    pg.has_next ?? false,
            hasPrev:    pg.has_prev ?? false,
        },
    };
};

// Fetches a single deployed application's detail/status.
export const fetchApplicationDetail = async (id) => {
    const res = await axiosInstance.get(`${backendUrl}/v1/app-deploy/${id}`);
    return normalizeApplication(res.data?.data || res.data);
};

// Deploys a new Open WebUI or Vector DB instance.
export const deployApplication = async ({ name, deploymentType, clusterId, harborId, versionId, namespace }) => {
    const res = await axiosInstance.post(`${backendUrl}/v1/app-deploy`, {
        name,
        deployment_type:     deploymentType,
        k8s_cluster_id:      Number(clusterId),
        harbor_registry_id:  Number(harborId),
        version_id:          Number(versionId),
        namespace,
    });
    return normalizeApplication(res.data?.data || res.data);
};

// Deletes a deployed application.
export const deleteApplication = async (id) => {
    const res = await axiosInstance.delete(`${backendUrl}/v1/app-deploy/${id}`);
    return res.data;
};

// Lists already-deployed Private LLM instances (separate from /v1/app-deploy)
// for display on the Open WebUI detail page. Only pagination is sent — the
// endpoint itself returns just the deployed/running instances.
export const fetchDeployedPrivateLLMs = async ({ page = 1, pageSize = 10 } = {}) => {
    const params = new URLSearchParams({ page, page_size: pageSize });

    const res = await axiosInstance.get(`${backendUrl}/v1/llm-inference-v2/deployed?${params}`);
    const envelope = res.data ?? {};
    const body = envelope.data ?? envelope;
    const items = Array.isArray(body.items) ? body.items : (Array.isArray(body) ? body : []);
    const pg = body.pagination || {};

    return {
        items,
        pagination: {
            page:       pg.page ?? page,
            pageSize:   pg.page_size ?? pageSize,
            total:      pg.total ?? items.length,
            totalPages: pg.total_pages ?? (Math.ceil((pg.total ?? items.length) / pageSize) || 1),
            hasNext:    pg.has_next ?? false,
            hasPrev:    pg.has_prev ?? false,
        },
    };
};

// Configures Keycloak SSO login for a deployed Open WebUI instance.
// TODO: no endpoint published for this yet — wire up once available.
export const setOpenWebUiKeycloakConfig = async (applicationId, payload) => {
    throw new Error("Open WebUI Keycloak SSO configuration API is not available yet.");
};

// Connects a deployed Vector DB instance to a deployed Open WebUI instance.
export const linkVectorDb = async (openWebUiId, vectorDbDeployId) => {
    const res = await axiosInstance.post(`${backendUrl}/v1/app-deploy/${openWebUiId}/connect-vectordb`, {
        vectordb_deploy_id: Number(vectorDbDeployId),
    });
    return normalizeApplication(res.data?.data || res.data);
};

// Disconnects the Vector DB instance currently linked to an Open WebUI instance.
export const unlinkVectorDb = async (openWebUiId) => {
    const res = await axiosInstance.delete(`${backendUrl}/v1/app-deploy/${openWebUiId}/connect-vectordb`);
    return res.data;
};

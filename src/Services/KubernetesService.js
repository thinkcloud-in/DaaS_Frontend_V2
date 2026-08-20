import axiosInstance from "Services/AxiosInstance";
import { getEnv } from "utils/getEnv";

const backendUrl = getEnv("BACKEND_URL")?.replace(/\/$/, "");

// Username/password are SSH credentials for the control plane node and are
// always sent. Kubeconfig YAML (any auth type inside it, incl. client-cert)
// is sent as-is — the backend parses the server address / auth from it, same
// as PUT. In credentials mode, auth_token is an optional extra for the
// Kubernetes API itself, alongside the SSH password.
const buildConnectionPayload = ({ controlIp, port, username, password, authToken, kubeconfig }) => {
  const base = {
    control_ip: controlIp,
    username,
    password,
  };

  if (kubeconfig?.trim()) {
    return {
      ...base,
      kubeconfig: kubeconfig.trim(),
    };
  }

  const payload = {
    ...base,
    port: Number(port),
  };

  if (authToken?.trim()) {
    payload.auth_token = authToken.trim();
  }

  return payload;
};

// Tests connectivity to a Kubernetes control plane using an auth token,
// username/password credentials, or a full kubeconfig YAML.
export const testKubernetesConnection = async (credentials) => {
  const res = await axiosInstance.post(
    `${backendUrl}/v1/kubernetes/clusters/test`,
    buildConnectionPayload(credentials)
  );
  return res.data;
};

// Registers/connects a Kubernetes cluster using an auth token, username/password
// credentials, or a full kubeconfig YAML.
export const addKubernetesCluster = async ({ name, ...credentials }) => {
  const payload = {
    name,
    ...buildConnectionPayload(credentials),
  };

  const res = await axiosInstance.post(`${backendUrl}/v1/kubernetes/clusters`, payload);
  return normalizeCluster(res.data?.data || res.data);
};

// Maps whatever shape the backend returns (control_ip/node_count/created_at, etc.)
// onto the field names the Kubernetes UI components expect.
export const normalizeCluster = (raw) => {
  if (!raw) return null;
  return {
    id: String(raw.id ?? raw.cluster_id ?? raw._id ?? ""),
    name: raw.name ?? "",
    headIp: raw.control_ip ?? raw.headIp ?? "",
    port: String(raw.port ?? raw.headPort ?? "6443"),
    username: raw.username ?? "-",
    nodeCount: raw.nodes?.total_nodes ?? raw.node_count ?? raw.nodeCount ?? 0,
    status: raw.status ?? "Unknown",
    createdAt: raw.created_at ?? raw.createdAt ?? "",
    // Raw per-node detail (master_nodes/worker_nodes), only present on the
    // single-cluster detail endpoint — used to render real node topology.
    nodesInfo: raw.nodes ?? null,
    // Cluster-wide CPU/memory/pods/nodes summary and control-plane component
    // health — only present on the single-cluster detail endpoint.
    clusterSummary: raw.cluster_summary ?? null,
    systemComponents: raw.system_components ?? null,
    allPods: raw.all_pods ?? null,
  };
};

// Lists all connected Kubernetes clusters — used by simple dropdowns/lookups
// elsewhere in the app that just want every cluster, so this requests a
// large page size to keep pagination invisible to those callers. The
// response now wraps the array as data.clusters alongside pagination info.
export const fetchKubernetesClusters = async () => {
  const res = await axiosInstance.get(`${backendUrl}/v1/kubernetes/clusters`, { params: { page: 1, page_size: 100 } });
  const body = res.data?.data ?? res.data ?? {};
  const list = Array.isArray(body.clusters) ? body.clusters : (Array.isArray(body) ? body : []);
  return list.map(normalizeCluster);
};

// Paginated fetch for the Kubernetes list page's own table + Prev/Next UI.
export const fetchKubernetesClustersPage = async ({ page = 1, pageSize = 10 } = {}) => {
  const res = await axiosInstance.get(`${backendUrl}/v1/kubernetes/clusters`, { params: { page, page_size: pageSize } });
  const body = res.data?.data ?? res.data ?? {};
  const items = Array.isArray(body.clusters) ? body.clusters.map(normalizeCluster) : [];
  return {
    items,
    pagination: {
      page:       body.page ?? page,
      pageSize:   body.page_size ?? pageSize,
      total:      body.total ?? items.length,
      totalPages: body.total_pages ?? 1,
      hasNext:    body.has_next ?? false,
      hasPrev:    body.has_prev ?? false,
    },
  };
};

// Fetches a single cluster's details.
export const fetchKubernetesClusterDetail = async (id) => {
  const res = await axiosInstance.get(`${backendUrl}/v1/kubernetes/clusters/${id}`);
  return normalizeCluster(res.data?.data || res.data);
};

// Disconnects/deletes a Kubernetes cluster.
export const deleteKubernetesCluster = async (id) => {
  const res = await axiosInstance.delete(`${backendUrl}/v1/kubernetes/clusters/${id}`);
  return res.data;
};

// Updates a cluster's Control Plane IP, kubeconfig, and SSH username/password.
export const updateKubernetesCluster = async (id, { controlIp, kubeconfig, username, password }) => {
  const res = await axiosInstance.put(`${backendUrl}/v1/kubernetes/clusters/${id}`, {
    control_ip: controlIp,
    kubeconfig,
    username,
    password,
  });
  return normalizeCluster(res.data?.data || res.data);
};

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    CheckCircle, Loader2, AlertCircle,
    RefreshCw, Rocket, LayoutGrid, Clock, Server, Layers, Trash2,
    ChevronLeft, ChevronRight,
} from "lucide-react";
import { APP_TYPES } from "./appTypes";
import { fetchApplications, deleteApplication } from "../../Services/ApplicationService";
import { fetchKubernetesClusters } from "../../Services/KubernetesService";

const PAGE_SIZE = 10;
const ACTIVE_STATUSES = ["deploying", "provisioning", "pending"];
const isActive = (s) => ACTIVE_STATUSES.includes(s?.toLowerCase());

const StatusBadge = ({ status }) => {
    if (!status) return null;
    const s = status.toLowerCase();
    if (s === "running" || s === "deployed") return (
        <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            {s === "deployed" ? "Deployed" : "Running"}
        </span>
    );
    if (isActive(s)) return (
        <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
            <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
    if (s === "failed" || s === "error") return (
        <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20">
            <AlertCircle className="h-3 w-3 text-red-500" />
            Failed
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 ring-1 ring-inset ring-gray-300">
            {status}
        </span>
    );
};

const ApplicationList = () => {
    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [page,         setPage]         = useState(1);
    const [meta,         setMeta]         = useState({ total: 0, totalPages: 1 });
    const [loading,       setLoading]     = useState(false);
    const [clusterNames,  setClusterNames] = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting,      setDeleting]      = useState(false);

    const loadApplications = useCallback(async () => {
        setLoading(true);
        try {
            const { items, pagination } = await fetchApplications({ page, pageSize: PAGE_SIZE });
            setApplications(items);
            setMeta({ total: pagination.total, totalPages: pagination.totalPages });
        } catch {
            setApplications([]);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => { loadApplications(); }, [loadApplications]);

    // Build an id → name lookup for Kubernetes clusters so the table can show
    // a readable cluster name instead of the raw k8s_cluster_id.
    useEffect(() => {
        fetchKubernetesClusters()
            .then((list) => {
                const map = {};
                (Array.isArray(list) ? list : []).forEach((c) => { map[c.id] = c.name; });
                setClusterNames(map);
            })
            .catch(() => setClusterNames({}));
    }, []);

    // Auto-poll every 5s while any deployment is still in progress.
    useEffect(() => {
        if (!applications.some((a) => isActive(a.status))) return;
        const t = setTimeout(loadApplications, 5000);
        return () => clearTimeout(t);
    }, [applications, loadApplications]);

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;
        const { id, name } = deleteConfirm;
        setDeleting(true);
        try {
            await deleteApplication(id);
            toast.success(`"${name}" deleted.`);
            setDeleteConfirm(null);
            if (applications.length === 1 && page > 1) setPage((p) => p - 1);
            else loadApplications();
        } catch (err) {
            const msg = err?.response?.data?.msg || err?.response?.data?.detail || err?.message || "Delete failed.";
            toast.error(msg);
        } finally {
            setDeleting(false);
        }
    };

    const formatDateTime = (str) => {
        if (!str) return "—";
        try {
            const d = new Date(str);
            return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                + " " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
        } catch { return str; }
    };

    const typeMeta = (id) => APP_TYPES.find((t) => t.apiType === id || t.id === id);

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-left flex flex-col w-full select-none">

            {/* Header */}
            <div className="pb-4 border-b border-gray-200 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-[#1a365d]/10 flex items-center justify-center flex-shrink-0">
                        <LayoutGrid className="h-4 w-4 text-[#1a365d]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[#1a365d]">Applications</h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Deploy and manage applications on your connected Kubernetes clusters.
                            {meta.total > 0 && <span className="ml-1 font-medium text-gray-600">{meta.total} total</span>}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <button
                        onClick={loadApplications}
                        disabled={loading}
                        className="p-2 text-gray-500 hover:text-[#1a365d] bg-white hover:bg-gray-100 rounded border border-gray-200 shadow-xs transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                    </button>
                    <button
                        onClick={() => navigate("/application/deploy")}
                        className="inline-flex items-center gap-2 rounded-md bg-[#1a365d] hover:bg-[#122744] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all uppercase tracking-wider"
                    >
                        <Rocket className="h-3.5 w-3.5" />
                        Deploy
                    </button>
                </div>
            </div>

            {/* Applications table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left border-collapse">
                        <thead>
                            <tr className="bg-[#1a365d] text-white text-sm font-semibold select-none">
                                <th className="py-3.5 px-6">Name</th>
                                <th className="py-3.5 px-6">Type</th>
                                <th className="py-3.5 px-6">Namespace</th>
                                <th className="py-3.5 px-6">
                                    <span className="inline-flex items-center gap-1"><Server className="h-3 w-3" /> Cluster</span>
                                </th>
                                <th className="py-3.5 px-6 text-center">Status</th>
                                <th className="py-3.5 px-6">
                                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Created</span>
                                </th>
                                <th className="py-3.5 px-6 text-center w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                            {loading && applications.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-gray-400">
                                        <Loader2 className="h-5 w-5 text-[#1a365d] animate-spin mx-auto mb-2" />
                                        Loading applications...
                                    </td>
                                </tr>
                            ) : applications.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-gray-400">
                                        <Layers className="h-7 w-7 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-500">No applications deployed yet</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Click <span className="font-semibold">Deploy</span> above to get started.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app) => {
                                    const meta = typeMeta(app.type);
                                    const Icon = meta?.Icon || Rocket;
                                    return (
                                        <tr
                                            key={app.id}
                                            onClick={() => navigate(`/application/detail/${app.id}`, { state: { applicationData: app } })}
                                            className="hover:bg-blue-50/20 cursor-pointer transition-colors"
                                        >
                                            <td className="py-4 px-6 text-gray-900 font-bold whitespace-nowrap">{app.name || "—"}</td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center gap-1.5 text-gray-600">
                                                    <Icon className="h-3.5 w-3.5 text-[#1a365d]" />
                                                    {meta?.label || app.type}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 font-mono text-xs text-gray-600">{app.namespace || "—"}</td>
                                            <td className="py-4 px-6 text-gray-600">{clusterNames[app.clusterId] || app.clusterId || "—"}</td>
                                            <td className="py-4 px-6 text-center"><StatusBadge status={app.status} /></td>
                                            <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(app.createdAt)}</td>
                                            <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => setDeleteConfirm({ id: app.id, name: app.name })}
                                                        title="Delete"
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {meta.totalPages > 1 && (
                    <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between bg-gray-50/60">
                        <p className="text-xs text-gray-500">
                            Page {page} of {meta.totalPages} — {meta.total} total
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                                className="p-1 text-gray-500 hover:text-[#1a365d] bg-white rounded border border-gray-200 disabled:opacity-40 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                                disabled={page === meta.totalPages || loading}
                                className="p-1 text-gray-500 hover:text-[#1a365d] bg-white rounded border border-gray-200 disabled:opacity-40 transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-sm mx-4 overflow-hidden">
                        <div className="p-5 flex items-start gap-3">
                            <div className="flex-shrink-0 h-9 w-9 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Delete Application</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    Are you sure you want to delete <span className="font-semibold text-gray-700">"{deleteConfirm.name}"</span>? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 border-t border-gray-200 px-5 py-3 flex justify-end gap-2">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                disabled={deleting}
                                className="px-4 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors uppercase tracking-wider disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded transition-colors uppercase tracking-wider disabled:opacity-50"
                            >
                                {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicationList;

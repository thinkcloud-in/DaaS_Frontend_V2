import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    CheckCircle, Loader2, AlertCircle,
    RefreshCw, ChevronLeft, ChevronRight, Rocket,
    Activity, Clock, Cpu, Wifi, Server,
} from "lucide-react";
import { selectAuthToken } from "../../redux/features/Auth/AuthSelectors";
import { fetchDeployments } from "../../Services/LibraryService";

const PAGE_SIZE = 10;

const ACTIVE_STATUSES = ["running", "provisioning", "deploying", "pending"];
const isActive = (s) => ACTIVE_STATUSES.includes(s?.toLowerCase());

const DeployStatusBadge = ({ status }) => {
    if (!status) return null;
    const s = status.toLowerCase();
    if (s === "running") return (
        <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Running
        </span>
    );
    if (s === "provisioning" || s === "deploying" || s === "pending") return (
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
    if (s === "completed" || s === "done" || s === "success") return (
        <span className="inline-flex items-center gap-1 rounded bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-600 ring-1 ring-inset ring-gray-300">
            <CheckCircle className="h-3 w-3 text-gray-400" />
            Completed
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 ring-1 ring-inset ring-gray-300">
            {status}
        </span>
    );
};

const HarborList = () => {
    const navigate = useNavigate();
    const token    = useSelector(selectAuthToken);

    const [deployments,       setDeployments]       = useState([]);
    const [page,              setPage]              = useState(1);
    const [meta,              setMeta]              = useState({ total: 0, totalPages: 1 });
    const [loading,           setLoading]           = useState(false);

    const loadDeployments = useCallback(async () => {
        setLoading(true);
        try {
            const res  = await fetchDeployments(token, { page, pageSize: PAGE_SIZE });
            const raw  = res?.data ?? res;
            const list = Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
            const pg   = res?.data?.pagination ?? res?.pagination ?? {};
            setDeployments(list);
            setMeta({
                total:      pg.total ?? list.length,
                totalPages: pg.total_pages ?? (Math.ceil(((pg.total ?? list.length) / PAGE_SIZE)) || 1),
            });
        } catch {
            setDeployments([]);
        } finally {
            setLoading(false);
        }
    }, [token, page]);

    useEffect(() => { loadDeployments(); }, [loadDeployments]);

    // Auto-poll every 5s while any job is active
    useEffect(() => {
        if (!deployments.some((d) => isActive(d.status))) return;
        const t = setTimeout(loadDeployments, 5000);
        return () => clearTimeout(t);
    }, [deployments, loadDeployments]);

    const formatDateTime = (str) => {
        if (!str) return "—";
        try {
            const d = new Date(str);
            return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                + " " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
        } catch { return str; }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-left flex flex-col w-full select-none">

            {/* Header */}
            <div className="pb-4 border-b border-gray-200 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-[#1a365d]/10 flex items-center justify-center flex-shrink-0">
                        <Activity className="h-4 w-4 text-[#1a365d]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[#1a365d]">Harbor Deployments</h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            All Harbor deployment jobs and their live status.
                            {meta.total > 0 && <span className="ml-1 font-medium text-gray-600">{meta.total} total</span>}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                        onClick={loadDeployments}
                        disabled={loading}
                        className="p-2 text-gray-500 hover:text-[#1a365d] bg-white hover:bg-gray-100 rounded border border-gray-200 shadow-xs transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                    </button>
                    <button
                        onClick={() => navigate("/harbor/deploy")}
                        className="inline-flex items-center gap-2 rounded-md bg-[#1a365d] hover:bg-[#122744] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all uppercase tracking-wider"
                    >
                        <Rocket className="h-3.5 w-3.5" />
                        Deploy
                    </button>
                </div>
            </div>

            {/* Deployments table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wide w-[6%]">#</th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wide w-[22%]">Name</th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wide w-[14%]">Status</th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wide w-[18%]">
                                    <span className="inline-flex items-center gap-1"><Wifi className="h-3 w-3" /> IP Address</span>
                                </th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wide w-[22%]">
                                    <span className="inline-flex items-center gap-1"><Cpu className="h-3 w-3" /> Node / VMID</span>
                                </th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wide w-[18%]">
                                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> Created</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && deployments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center">
                                        <Loader2 className="h-5 w-5 text-[#1a365d] animate-spin mx-auto mb-2" />
                                        <p className="text-xs text-gray-400">Loading deployments...</p>
                                    </td>
                                </tr>
                            ) : deployments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center">
                                        <Activity className="h-7 w-7 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-500">No deployments yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Click <span className="font-semibold">Deploy</span> to start a new deployment.</p>
                                    </td>
                                </tr>
                            ) : (
                                deployments.map((job) => (
                                    <tr key={job.job_id} className={`transition-colors ${isActive(job.status) ? "bg-blue-50/20" : "hover:bg-gray-50/40"}`}>
                                        <td className="p-4 text-xs text-gray-400 font-mono">
                                            #{job.job_id}
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-semibold text-gray-900">{job.name || "—"}</p>
                                            {job.template_name && (
                                                <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                                    <Server className="h-2.5 w-2.5" />
                                                    {job.template_name}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <DeployStatusBadge status={job.status} />
                                        </td>
                                        <td className="p-4 text-xs font-mono text-gray-700">
                                            {job.ip_address || <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs font-medium text-gray-700">{job.node || "—"}</span>
                                            {job.vmid && (
                                                <span className="ml-1.5 text-xs text-gray-400 font-mono">· VM {job.vmid}</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-xs text-gray-500 whitespace-nowrap">
                                            {formatDateTime(job.created_at)}
                                        </td>
                                    </tr>
                                ))
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
        </div>
    );
};

export default HarborList;

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    ArrowLeft, RefreshCw, Loader2, AlertCircle, Activity,
} from "lucide-react";
import { selectAuthToken } from "../../redux/features/Auth/AuthSelectors";
import { fetchDeployment } from "../../Services/LibraryService";
import {
    DeployStatusBadge, KNOWN_FIELD_LABELS, HIDDEN_FIELDS,
    prettifyKey, formatValue,
} from "./HarborList";

const ACTIVE_STATUSES = ["running", "provisioning", "deploying", "pending"];
const isActive = (s) => ACTIVE_STATUSES.includes(s?.toLowerCase());

const HarborDetail = () => {
    const navigate  = useNavigate();
    const { id }    = useParams();
    const location  = useLocation();
    const [searchParams] = useSearchParams();
    const token     = useSelector(selectAuthToken);

    const type = searchParams.get("type") || "lxc";
    const nameFromList = location.state?.name;

    const [detail,  setDetail]  = useState(null);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState("");

    const loadDetail = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetchDeployment(token, id, type);
            setDetail(res?.data ?? res);
        } catch (err) {
            setError(err?.response?.data?.msg || err?.response?.data?.detail || err?.message || "Failed to load details.");
        } finally {
            setLoading(false);
        }
    }, [token, id, type]);

    useEffect(() => { loadDetail(); }, [loadDetail]);

    // Auto-poll every 5s while the deployment is still in progress
    useEffect(() => {
        if (!isActive(detail?.status)) return;
        const t = setTimeout(loadDetail, 5000);
        return () => clearTimeout(t);
    }, [detail, loadDetail]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-left flex flex-col w-full select-none">

            {/* Header */}
            <div className="pb-4 border-b border-gray-200 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/harbor")}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className="h-9 w-9 rounded-lg bg-[#1a365d]/10 flex items-center justify-center flex-shrink-0">
                        <Activity className="h-4 w-4 text-[#1a365d]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[#1a365d]">
                            {detail?.name || nameFromList || `Deployment #${id}`}
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {type === "kubernetes" ? "Kubernetes" : "LXC"} deployment · #{id}
                        </p>
                    </div>
                </div>
                <button
                    onClick={loadDetail}
                    disabled={loading}
                    className="p-2 text-gray-500 hover:text-[#1a365d] bg-white hover:bg-gray-100 rounded border border-gray-200 shadow-xs transition-colors self-start sm:self-auto"
                    title="Refresh"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-3xl p-6 space-y-4">
                {loading && !detail ? (
                    <div className="py-16 text-center">
                        <Loader2 className="h-6 w-6 text-[#1a365d] animate-spin mx-auto mb-2" />
                        <p className="text-xs text-gray-400">Loading details...</p>
                    </div>
                ) : error ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-2.5">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm font-semibold text-red-700">{error}</span>
                    </div>
                ) : detail && typeof detail === "object" ? (
                    <>
                        {/* Status + progress */}
                        <div className="flex items-center justify-between">
                            <DeployStatusBadge status={detail.status} />
                            {detail.progress?.pct != null && (
                                <span className="text-xs font-semibold text-gray-500">
                                    {detail.progress.label} — {detail.progress.pct}%
                                </span>
                            )}
                        </div>
                        {detail.progress?.pct != null && (
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div
                                    className="h-1.5 rounded-full bg-[#1a365d] transition-all duration-500"
                                    style={{ width: `${detail.progress.pct}%` }}
                                />
                            </div>
                        )}

                        {/* Error */}
                        {detail.error_message && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <span className="text-xs font-semibold text-red-700">{detail.error_message}</span>
                            </div>
                        )}

                        {/* Harbor URL */}
                        {detail.harbor_url && (
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Harbor URL</span>
                                <a
                                    href={detail.harbor_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline break-all"
                                >
                                    {detail.harbor_url}
                                </a>
                            </div>
                        )}

                        {/* Remaining known/unknown fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-2 border-t border-gray-100">
                            {Object.entries(detail)
                                .filter(([key, val]) => !HIDDEN_FIELDS.includes(key) && val !== null && val !== undefined && val !== "")
                                .map(([key, val]) => (
                                    <div key={key} className="flex flex-col gap-0.5">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                            {KNOWN_FIELD_LABELS[key] || prettifyKey(key)}
                                        </span>
                                        <span className="text-xs font-medium text-gray-800 font-mono whitespace-pre-wrap break-all">
                                            {formatValue(val)}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </>
                ) : (
                    <p className="text-xs text-gray-400 text-center py-10">No details available.</p>
                )}
            </div>
        </div>
    );
};

export default HarborDetail;

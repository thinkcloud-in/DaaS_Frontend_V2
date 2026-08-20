import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Loader2, ChevronDown, Rocket } from "lucide-react";
import { toast } from "react-toastify";
import { selectAuthToken } from "../../redux/features/Auth/AuthSelectors";
import { fetchClustersThunk } from "../../redux/features/Clusters/ClustersThunks";
import { selectAllClusters } from "../../redux/features/Clusters/ClustersSelectors";
import {
    fetchIpPoolNames,
    fetchClusterNodes,
    fetchProxmoxStorages,
} from "../../redux/features/Pools/PoolsThunks";
import {
    selectCreationIpPoolNames,
    selectProxmoxStorages,
    selectCreationNodes,
    selectCreationNodesLoading,
    selectProxmoxStoragesLoading,
} from "../../redux/features/Pools/PoolsSelectors";
import { deployLibraryItem } from "../../Services/LibraryService";

// Simple multi-select dropdown
const MultiSelect = ({ options = [], selected = [], onChange, placeholder, disabled, loading }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const toggle = (val) =>
        onChange(selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val]);

    return (
        <div className="relative w-full" ref={ref}>
            <div
                onClick={() => !disabled && !loading && setOpen((o) => !o)}
                className={`w-full min-h-[36px] border rounded-lg px-3 py-1.5 flex items-center justify-between bg-white dark:bg-gray-800 text-sm cursor-pointer transition-all
                    ${disabled || loading ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed border-gray-200 dark:border-gray-700 text-gray-400" : "border-gray-300 dark:border-gray-600 hover:border-gray-400"}
                    ${open ? "border-[#1a365d] ring-1 ring-[#1a365d]/20" : ""}`}
            >
                <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                    {loading ? (
                        <span className="flex items-center gap-1.5 text-gray-400 text-sm"><Loader2 className="h-3 w-3 animate-spin" /> Loading...</span>
                    ) : selected.length === 0 ? (
                        <span className="text-gray-400 text-sm">{placeholder || "Select..."}</span>
                    ) : (
                        selected.map((v) => (
                            <span key={v} className="inline-flex items-center gap-1 bg-[#1a365d]/10 text-[#1a365d] dark:text-blue-300 text-xs font-medium px-2 py-0.5 rounded">
                                {v}
                                <X className="h-2.5 w-2.5 cursor-pointer opacity-60 hover:opacity-100"
                                   onClick={(e) => { e.stopPropagation(); toggle(v); }} />
                            </span>
                        ))
                    )}
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 ml-1 transition-transform ${open ? "rotate-180" : ""}`} />
            </div>
            {open && !disabled && !loading && (
                <div className="absolute z-50 top-[calc(100%+2px)] left-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-44 overflow-y-auto">
                    {options.length === 0 ? (
                        <p className="px-3 py-3 text-xs text-gray-400 text-center">No options available</p>
                    ) : options.map((opt) => {
                        const val = typeof opt === "object" ? opt.value || opt.name || opt : opt;
                        const lbl = typeof opt === "object" ? opt.label || opt.name || opt.value || opt : opt;
                        return (
                            <label key={val} className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 dark:bg-gray-900/60 cursor-pointer text-gray-800 dark:text-gray-100">
                                <input type="checkbox" checked={selected.includes(val)}
                                    onChange={() => toggle(val)}
                                    className="rounded border-gray-300 dark:border-gray-600 text-[#1a365d] dark:text-blue-300 h-3.5 w-3.5" />
                                {lbl}
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const LibraryDeployModal = ({ item, onClose, onDeployed }) => {
    const dispatch = useDispatch();
    const token    = useSelector(selectAuthToken);

    const allClusters    = useSelector(selectAllClusters)        || [];
    const ipPoolNames    = useSelector(selectCreationIpPoolNames) || [];
    const creationNodes  = useSelector(selectCreationNodes)       || [];
    const storages       = useSelector(selectProxmoxStorages)     || [];
    const nodesLoading   = useSelector(selectCreationNodesLoading);
    const storagesLoading = useSelector(selectProxmoxStoragesLoading);

    const [deployName,     setDeployName]     = useState("");
    const [clusterName,    setClusterName]    = useState("");
    const [selectedPools,  setSelectedPools]  = useState([]);
    const [selectedStorage, setSelectedStorage] = useState("");
    const [submitting,     setSubmitting]     = useState(false);

    // Fetch clusters + IP pools on mount
    useEffect(() => {
        dispatch(fetchClustersThunk({ token, page: 1, pageSize: 100 }));
        dispatch(fetchIpPoolNames(token));
    }, [dispatch, token]);

    const getClusterId = (name) => {
        const c = allClusters.find((x) => (typeof x === "object" ? x.name || x.cluster_name : x) === name);
        const raw = c ? c.id || c.cluster_id || c._id : null;
        return raw != null ? String(raw) : null;
    };

    // On cluster change → fetch nodes → fetch storages
    const handleClusterChange = (e) => {
        const name = e.target.value;
        setClusterName(name);
        setSelectedStorage("");
        const id = name ? getClusterId(name) : null;
        if (!id) return;
        dispatch(fetchClusterNodes({ token, clusterId: id })).then((action) => {
            const nodes = action.payload;
            if (Array.isArray(nodes) && nodes.length > 0) {
                const nodeNames = nodes
                    .map((n) => String(typeof n === "object" ? n.name || n.node_name || n.Node_name || "" : n))
                    .filter(Boolean);
                dispatch(fetchProxmoxStorages({ token, clusterId: id, nodes: nodeNames }));
            }
        });
    };

    const clusterOptions = allClusters.map((x) =>
        typeof x === "object" ? x.name || x.cluster_name : x
    ).filter(Boolean);

    const ipPoolOptions = ipPoolNames.map((ip) =>
        String(typeof ip === "object" ? ip.name || ip.pool_name || "" : ip)
    ).filter(Boolean);

    const storageOptions = storages.map((s) =>
        String(typeof s === "object" ? s.storage || s.name || "" : s)
    ).filter(Boolean);

    const isValid = deployName.trim() && clusterName && selectedPools.length > 0 && selectedStorage;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid) return;

        const clusterId = getClusterId(clusterName);
        if (!clusterId) { toast.error("Invalid cluster selection"); return; }

        setSubmitting(true);
        try {
            await deployLibraryItem(token, item.id, {
                name:      deployName.trim(),
                cluster_id: Number(clusterId),
                ip_pools:  selectedPools,
                storage:   selectedStorage,
            });
            toast.success(`"${item.name}" deployment started successfully!`);
            onDeployed?.(item.id);
            onClose();
        } catch (err) {
            const msg = err?.response?.data?.msg || err?.response?.data?.detail || err?.message || "Deploy failed";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-[#1a365d]/10 flex items-center justify-center flex-shrink-0">
                            <Rocket className="h-4 w-4 text-[#1a365d] dark:text-blue-300" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Deploy Library Item</h2>
                            <p className="text-[11px] text-gray-400 mt-0.5 max-w-[280px] truncate" title={item.name}>
                                {item.name}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={submitting}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:bg-gray-700 rounded transition-colors disabled:opacity-40">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">

                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Deployment Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={deployName}
                            disabled={submitting}
                            onChange={(e) => setDeployName(e.target.value)}
                            placeholder="e.g. harbor-prod-01"
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 text-sm text-gray-900 dark:text-gray-100 focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none transition-all disabled:opacity-50"
                        />
                    </div>

                    {/* Cluster */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Cluster <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={clusterName}
                            onChange={handleClusterChange}
                            disabled={submitting || allClusters.length === 0}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 text-sm text-gray-900 dark:text-gray-100 focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none transition-all disabled:bg-gray-100 dark:bg-gray-700 disabled:text-gray-400"
                        >
                            <option value="">Select Cluster</option>
                            {clusterOptions.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* IP Pools */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            IP Pools <span className="text-red-500">*</span>
                        </label>
                        <MultiSelect
                            options={ipPoolOptions}
                            selected={selectedPools}
                            onChange={setSelectedPools}
                            placeholder="Select IP Pools"
                            disabled={submitting}
                        />
                    </div>

                    {/* Storage */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Storage <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedStorage}
                            onChange={(e) => setSelectedStorage(e.target.value)}
                            disabled={submitting || !clusterName || storagesLoading}
                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 text-sm text-gray-900 dark:text-gray-100 focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none transition-all disabled:bg-gray-100 dark:bg-gray-700 disabled:text-gray-400"
                        >
                            <option value="">
                                {!clusterName ? "Select a cluster first" :
                                 storagesLoading ? "Loading storages..." :
                                 "Select Storage"}
                            </option>
                            {storageOptions.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                </form>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-700 px-5 py-3.5 flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:bg-gray-900/60 transition-colors uppercase tracking-wider disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !isValid}
                        className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white rounded-lg transition-colors uppercase tracking-wider
                            ${submitting || !isValid ? "bg-[#1a365d] opacity-50 cursor-not-allowed" : "bg-[#1a365d] hover:bg-[#122744]"}`}
                    >
                        {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {submitting ? "Deploying..." : "Deploy"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LibraryDeployModal;

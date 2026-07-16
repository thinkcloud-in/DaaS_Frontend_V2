import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, ChevronDown, Rocket, X, ChevronLeft, Server, Box } from "lucide-react";
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
    selectCreationNodesLoading,
    selectProxmoxStoragesLoading,
} from "../../redux/features/Pools/PoolsSelectors";
import { fetchLibraryList, deployLibraryItem } from "../../Services/LibraryService";

// ── MultiSelect component ─────────────────────────────────────────────────────
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
                className={`w-full min-h-[42px] border rounded-lg px-3 py-2 flex items-center justify-between bg-white text-sm cursor-pointer transition-all
                    ${disabled || loading ? "bg-gray-100 cursor-not-allowed border-gray-200 text-gray-400" : "border-gray-300 hover:border-gray-400"}
                    ${open ? "border-[#1a365d] ring-1 ring-[#1a365d]/20" : ""}`}
            >
                <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                    {loading ? (
                        <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                            <Loader2 className="h-3 w-3 animate-spin" /> Loading...
                        </span>
                    ) : selected.length === 0 ? (
                        <span className="text-gray-400 text-sm">{placeholder || "Select..."}</span>
                    ) : (
                        selected.map((v) => (
                            <span key={v} className="inline-flex items-center gap-1 bg-[#1a365d]/10 text-[#1a365d] text-xs font-medium px-2 py-0.5 rounded">
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
                <div className="absolute z-50 top-[calc(100%+2px)] left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {options.length === 0 ? (
                        <p className="px-3 py-3 text-xs text-gray-400 text-center">No options available</p>
                    ) : options.map((opt) => {
                        const val = typeof opt === "object" ? opt.value || opt.name || opt : opt;
                        const lbl = typeof opt === "object" ? opt.label || opt.name || opt.value || opt : opt;
                        return (
                            <label key={val} className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer text-gray-800">
                                <input type="checkbox" checked={selected.includes(val)}
                                    onChange={() => toggle(val)}
                                    className="rounded border-gray-300 text-[#1a365d] h-3.5 w-3.5" />
                                {lbl}
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ── Field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, required, children, hint }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
);

const inputCls = (disabled) =>
    `w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm text-gray-900
    focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none transition-all
    ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`;

// ── Deployment Target Toggle ──────────────────────────────────────────────────
const TargetToggle = ({ value, onChange }) => {
    const options = [
        { id: "lxc",        label: "LXC",        Icon: Box,    desc: "Deploy to Proxmox LXC cluster" },
        { id: "kubernetes", label: "Kubernetes",  Icon: Server, desc: "Deploy to connected K8s cluster" },
    ];
    return (
        <div className="grid grid-cols-2 gap-3">
            {options.map(({ id, label, Icon, desc }) => {
                const active = value === id;
                return (
                    <button
                        key={id}
                        type="button"
                        onClick={() => onChange(id)}
                        className={`flex flex-col items-start gap-1 p-3.5 rounded-xl border-2 text-left transition-all
                            ${active
                                ? "border-[#1a365d] bg-[#1a365d]/5 shadow-sm"
                                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        <div className="flex items-center gap-2 w-full">
                            <div className={`p-1.5 rounded-lg flex-shrink-0 ${active ? "bg-[#1a365d]/10" : "bg-gray-100"}`}>
                                <Icon className={`h-3.5 w-3.5 ${active ? "text-[#1a365d]" : "text-gray-500"}`} />
                            </div>
                            <span className={`text-sm font-bold ${active ? "text-[#1a365d]" : "text-gray-700"}`}>{label}</span>
                            {active && (
                                <span className="ml-auto text-[10px] font-bold text-[#1a365d] bg-[#1a365d]/10 px-1.5 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
                                    Selected
                                </span>
                            )}
                        </div>
                        <p className={`text-xs pl-0.5 ${active ? "text-[#1a365d]/70" : "text-gray-400"}`}>{desc}</p>
                    </button>
                );
            })}
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const HarborDeploy = () => {
    const navigate   = useNavigate();
    const dispatch   = useDispatch();
    const token      = useSelector(selectAuthToken);

    const allClusters     = useSelector(selectAllClusters)          || [];
    const ipPoolNames     = useSelector(selectCreationIpPoolNames)   || [];
    const storages        = useSelector(selectProxmoxStorages)       || [];
    const storagesLoading = useSelector(selectProxmoxStoragesLoading);
    const nodesLoading    = useSelector(selectCreationNodesLoading);

    const [templates,        setTemplates]        = useState([]);
    const [templatesLoading, setTemplatesLoading] = useState(true);

    // Common form state
    const [templateId,   setTemplateId]  = useState("");
    const [deployTarget, setDeployTarget] = useState(""); // "lxc" | "kubernetes"
    const [deployName,   setDeployName]  = useState("");

    // LXC-specific
    const [clusterName,     setClusterName]     = useState("");
    const [selectedPools,   setSelectedPools]   = useState([]);
    const [selectedStorage, setSelectedStorage] = useState("");

    // Kubernetes-specific
    const [k8sClusters, setK8sClusters] = useState([]);
    const [selectedK8s, setSelectedK8s] = useState("");

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchClustersThunk(token));
        dispatch(fetchIpPoolNames(token));

        fetchLibraryList(token, { type: "harbor_template", page: 1, pageSize: 100 })
            .then((res) => {
                const dirs = res.data?.directories || {};
                const allItems = Object.values(dirs).flat();
                setTemplates(allItems.filter((i) => i.type === "harbor_template"));
            })
            .catch(() => setTemplates([]))
            .finally(() => setTemplatesLoading(false));

        // Load connected Kubernetes clusters from localStorage
        try {
            const stored = localStorage.getItem("thinkcloud_k8s_clusters");
            const parsed = stored ? JSON.parse(stored) : [];
            setK8sClusters(Array.isArray(parsed) ? parsed : []);
        } catch {
            setK8sClusters([]);
        }
    }, [dispatch, token]);

    // Reset all dependent fields when template changes
    const handleTemplateChange = (e) => {
        setTemplateId(e.target.value);
        setDeployTarget("");
        setDeployName("");
        setClusterName("");
        setSelectedPools([]);
        setSelectedStorage("");
        setSelectedK8s("");
    };

    // Reset target-specific fields when switching deployment target
    const handleTargetChange = (t) => {
        setDeployTarget(t);
        setClusterName("");
        setSelectedPools([]);
        setSelectedStorage("");
        setSelectedK8s("");
    };

    const getClusterId = (name) => {
        const c = allClusters.find((x) => (typeof x === "object" ? x.name || x.cluster_name : x) === name);
        const raw = c ? c.id || c.cluster_id || c._id : null;
        return raw != null ? String(raw) : null;
    };

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

    const clusterOptions = allClusters.map((x) => typeof x === "object" ? x.name || x.cluster_name : x).filter(Boolean);
    const ipPoolOptions  = ipPoolNames.map((ip) => String(typeof ip === "object" ? ip.name || ip.pool_name || "" : ip)).filter(Boolean);
    const storageOptions = storages.map((s) => String(typeof s === "object" ? s.storage || s.name || "" : s)).filter(Boolean);

    const isLxcValid = deployTarget === "lxc" && templateId && deployName.trim() && clusterName && selectedPools.length > 0 && selectedStorage;
    const isK8sValid = deployTarget === "kubernetes" && templateId && deployName.trim() && selectedK8s;
    const isValid    = isLxcValid || isK8sValid;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid || submitting) return;

        setSubmitting(true);
        try {
            if (deployTarget === "lxc") {
                const clusterId = getClusterId(clusterName);
                if (!clusterId) { toast.error("Invalid cluster selection"); setSubmitting(false); return; }
                await deployLibraryItem(token, templateId, {
                    name:       deployName.trim(),
                    cluster_id: Number(clusterId),
                    ip_pools:   selectedPools,
                    storage:    selectedStorage,
                });
            } else {
                await deployLibraryItem(token, templateId, {
                    name:              deployName.trim(),
                    deployment_target: "kubernetes",
                    k8s_cluster:       selectedK8s,
                });
            }
            const tpl = templates.find((t) => String(t.id) === String(templateId));
            toast.success(`"${tpl?.name || "Template"}" deployment started successfully!`);
            navigate("/harbor");
        } catch (err) {
            const msg = err?.response?.data?.msg || err?.response?.data?.detail || err?.message || "Deploy failed";
            toast.error(msg);
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen w-full text-left">

            {/* Header */}
            <div className="mb-6 pb-4 border-b border-gray-200 flex items-center gap-3">
                <button
                    onClick={() => navigate("/harbor")}
                    disabled={submitting}
                    className="p-1.5 text-gray-500 hover:text-[#1a365d] hover:bg-gray-100 rounded transition-colors disabled:opacity-40"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="h-9 w-9 rounded-lg bg-[#1a365d]/10 flex items-center justify-center flex-shrink-0">
                    <Rocket className="h-4 w-4 text-[#1a365d]" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-[#1a365d]">Deploy Harbor Template</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Configure and deploy a Harbor container registry to a cluster.</p>
                </div>
            </div>

            {/* Form card */}
            <div className="max-w-xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5">

                        {/* ── Step 1: Harbor Template ── */}
                        <Field label="Harbor Template" required>
                            <select
                                value={templateId}
                                onChange={handleTemplateChange}
                                disabled={submitting || templatesLoading}
                                className={inputCls(submitting || templatesLoading)}
                            >
                                <option value="">
                                    {templatesLoading ? "Loading templates..." : "Select a template"}
                                </option>
                                {templates.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            {!templatesLoading && templates.length === 0 && (
                                <p className="text-xs text-amber-600 mt-1">
                                    No Harbor templates found. Upload one from the Library page first.
                                </p>
                            )}
                        </Field>

                        {/* ── Step 2: Deployment Target (shown only after template selected) ── */}
                        {templateId && (
                            <>
                                <div>
                                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2.5">
                                        Deployment Target <span className="text-red-500">*</span>
                                    </p>
                                    <TargetToggle value={deployTarget} onChange={handleTargetChange} />
                                </div>

                                {/* Deployment Name — common to both targets */}
                                {deployTarget && (
                                    <Field label="Deployment Name" required>
                                        <input
                                            type="text"
                                            value={deployName}
                                            onChange={(e) => setDeployName(e.target.value)}
                                            disabled={submitting}
                                            placeholder="e.g. harbor-prod-01"
                                            className={inputCls(submitting)}
                                        />
                                    </Field>
                                )}

                                {/* ════ LXC Fields ════ */}
                                {deployTarget === "lxc" && (
                                    <>
                                        <Field label="Cluster" required>
                                            <select
                                                value={clusterName}
                                                onChange={handleClusterChange}
                                                disabled={submitting || allClusters.length === 0}
                                                className={inputCls(submitting || allClusters.length === 0)}
                                            >
                                                <option value="">
                                                    {allClusters.length === 0 ? "No clusters available" : "Select a cluster"}
                                                </option>
                                                {clusterOptions.map((c) => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </Field>

                                        <Field label="IP Pools" required>
                                            <MultiSelect
                                                options={ipPoolOptions}
                                                selected={selectedPools}
                                                onChange={setSelectedPools}
                                                placeholder="Select IP Pools"
                                                disabled={submitting}
                                            />
                                        </Field>

                                        <Field label="Storage" required>
                                            <select
                                                value={selectedStorage}
                                                onChange={(e) => setSelectedStorage(e.target.value)}
                                                disabled={submitting || !clusterName || storagesLoading || nodesLoading}
                                                className={inputCls(submitting || !clusterName || storagesLoading || nodesLoading)}
                                            >
                                                <option value="">
                                                    {!clusterName    ? "Select a cluster first" :
                                                     nodesLoading    ? "Loading nodes..." :
                                                     storagesLoading ? "Loading storages..." :
                                                     storageOptions.length === 0 ? "No storages found" :
                                                     "Select Storage"}
                                                </option>
                                                {storageOptions.map((s) => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </Field>
                                    </>
                                )}

                                {/* ════ Kubernetes Fields ════ */}
                                {deployTarget === "kubernetes" && (
                                    <Field label="Kubernetes Machine" required>
                                        <select
                                            value={selectedK8s}
                                            onChange={(e) => setSelectedK8s(e.target.value)}
                                            disabled={submitting || k8sClusters.length === 0}
                                            className={inputCls(submitting || k8sClusters.length === 0)}
                                        >
                                            <option value="">
                                                {k8sClusters.length === 0
                                                    ? "No Kubernetes clusters available"
                                                    : "Select a Kubernetes cluster"}
                                            </option>
                                            {k8sClusters.map((k) => (
                                                <option key={k.id} value={k.id}>
                                                    {k.name} — {k.ip}:{k.port}
                                                </option>
                                            ))}
                                        </select>
                                        {k8sClusters.length === 0 && (
                                            <p className="text-xs text-amber-600 mt-1">
                                                Go to <strong>Pools → Kubernetes</strong> and connect a cluster first.
                                            </p>
                                        )}
                                    </Field>
                                )}
                            </>
                        )}

                    </div>

                    {/* Footer buttons */}
                    <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/harbor")}
                            disabled={submitting}
                            className="px-5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors uppercase tracking-wider disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !isValid}
                            className={`inline-flex items-center gap-2 px-6 py-2 text-xs font-bold text-white rounded-lg transition-colors uppercase tracking-wider
                                ${submitting || !isValid
                                    ? "bg-[#1a365d]/50 cursor-not-allowed"
                                    : "bg-[#1a365d] hover:bg-[#122744]"
                                }`}
                        >
                            {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            {submitting ? "Deploying..." : "Deploy"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default HarborDeploy;

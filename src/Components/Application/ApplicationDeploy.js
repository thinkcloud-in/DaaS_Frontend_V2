import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader2, ChevronLeft, LayoutGrid } from "lucide-react";
import { toast } from "react-toastify";
import { selectAuthToken } from "../../redux/features/Auth/AuthSelectors";
import { fetchLibraryList, fetchDeployments } from "../../Services/LibraryService";
import { fetchKubernetesClusters } from "../../Services/KubernetesService";
import { deployApplication } from "../../Services/ApplicationService";
import { APP_TYPES, getAppType } from "./appTypes";

// Kubernetes namespace names must be lowercase DNS-1123 labels.
const slugifyNamespace = (value) =>
    (value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 63);

const Field = ({ label, required, children, hint }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
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

// ── Main Component ────────────────────────────────────────────────────────────
// A single "Deploy" button on the list page lands here — the application type
// is chosen inside the form itself (Select Application field) rather than by
// which button was clicked.
const ApplicationDeploy = () => {
    const navigate = useNavigate();
    const token    = useSelector(selectAuthToken);

    const [selectedAppType, setSelectedAppType] = useState("");
    const activeApp = getAppType(selectedAppType);

    const [name, setName] = useState("");
    const [namespace, setNamespace] = useState("");
    const [namespaceTouched, setNamespaceTouched] = useState(false);

    const [clusters,        setClusters]        = useState([]);
    const [clustersLoading, setClustersLoading] = useState(true);
    const [clusterId,       setClusterId]       = useState("");

    const [harbors,        setHarbors]        = useState([]);
    const [harborsLoading, setHarborsLoading] = useState(true);
    const [harborId,       setHarborId]       = useState("");

    const [versions,        setVersions]        = useState([]);
    const [versionsLoading, setVersionsLoading] = useState(false);
    const [versionId,       setVersionId]       = useState("");

    const [submitting, setSubmitting] = useState(false);

    // Kubernetes clusters + deployed Harbor registries — independent of app type.
    useEffect(() => {
        fetchKubernetesClusters()
            .then((list) => setClusters(Array.isArray(list) ? list : []))
            .catch(() => setClusters([]))
            .finally(() => setClustersLoading(false));

        fetchDeployments(token, { page: 1, pageSize: 100 })
            .then((res) => {
                const raw  = res?.data ?? res;
                const list = Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
                // Only Kubernetes-hosted Harbor deployments (identified by a harbor_url) that are live.
                setHarbors(
                    list.filter(
                        (d) =>
                            d.harbor_url &&
                            ["deployed", "running", "completed", "success"].includes((d.status || "").toLowerCase())
                    )
                );
            })
            .catch(() => setHarbors([]))
            .finally(() => setHarborsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // Library versions depend on the selected application type. This page
    // (only this page) filters by the app id itself ("openwebui" / "vectordb")
    // rather than the shared Library upload type ("container"), so the two
    // app types get their own version lists instead of sharing one pool.
    useEffect(() => {
        if (!activeApp) { setVersions([]); setVersionId(""); return; }
        setVersionsLoading(true);
        setVersionId("");
        fetchLibraryList(token, { type: activeApp.id, page: 1, pageSize: 100 })
            .then((res) => {
                const dirs = res.data?.directories || {};
                const allItems = Object.values(dirs).flat();
                setVersions(allItems.filter((i) => i.type === activeApp.id || i.type === activeApp.apiType));
            })
            .catch(() => setVersions([]))
            .finally(() => setVersionsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeApp, token]);

    // Namespace defaults to the application name until the user edits it directly.
    // TODO: once a "list deployed applications" API exists, prefer reusing the
    // namespace already used for this app type + cluster instead of the name.
    useEffect(() => {
        if (!namespaceTouched) setNamespace(slugifyNamespace(name));
    }, [name, namespaceTouched]);

    const handleAppTypeChange = (id) => {
        setSelectedAppType(id);
        setName("");
        setNamespace("");
        setNamespaceTouched(false);
    };

    const isValid = !!(activeApp && name.trim() && clusterId && harborId && versionId && namespace.trim());

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid || submitting) return;

        setSubmitting(true);
        try {
            const app = await deployApplication({
                name:          name.trim(),
                deploymentType: activeApp.id,
                clusterId,
                harborId,
                versionId,
                namespace:     namespace.trim(),
            });
            toast.success(`"${name}" deployment started!`);
            navigate(app?.id ? `/application/detail/${app.id}` : "/application");
        } catch (err) {
            const msg = err?.response?.data?.msg || err?.response?.data?.detail || err?.message || "Unable to deploy this application right now.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const HeaderIcon = activeApp?.Icon || LayoutGrid;

    return (
        <div className="p-6 bg-gray-50 min-h-screen w-full text-left">

            {/* Header */}
            <div className="mb-6 pb-4 border-b border-gray-200 flex items-center gap-3">
                <button
                    onClick={() => navigate("/application")}
                    disabled={submitting}
                    className="p-1.5 text-gray-500 hover:text-[#1a365d] hover:bg-gray-100 rounded transition-colors disabled:opacity-40"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="h-9 w-9 rounded-lg bg-[#1a365d]/10 flex items-center justify-center flex-shrink-0">
                    <HeaderIcon className="h-4 w-4 text-[#1a365d]" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-[#1a365d]">
                        {activeApp ? `Deploy ${activeApp.label}` : "Deploy Application"}
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {activeApp?.desc || "Choose an application to deploy to a connected Kubernetes cluster."}
                    </p>
                </div>
            </div>

            {/* Form card */}
            <div className="max-w-xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5">

                        {/* Select Application */}
                        <Field label="Select Application" required>
                            <select
                                value={selectedAppType}
                                onChange={(e) => handleAppTypeChange(e.target.value)}
                                disabled={submitting}
                                className={inputCls(submitting)}
                            >
                                <option value="">Select an application...</option>
                                {APP_TYPES.map((t) => (
                                    <option key={t.id} value={t.id}>{t.label}</option>
                                ))}
                            </select>
                        </Field>

                        {activeApp && (
                            <>
                                {/* Name */}
                                <Field label="Name" required>
                                    <input
                                        type="text"
                                        value={name}
                                        disabled={submitting}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={`e.g. ${activeApp.label.toLowerCase().replace(/\s+/g, "-")}-prod`}
                                        className={inputCls(submitting)}
                                    />
                                </Field>

                                {/* Kubernetes Cluster */}
                                <Field label="Kubernetes Machine" required>
                                    <select
                                        value={clusterId}
                                        onChange={(e) => setClusterId(e.target.value)}
                                        disabled={submitting || clustersLoading || clusters.length === 0}
                                        className={inputCls(submitting || clustersLoading || clusters.length === 0)}
                                    >
                                        <option value="">
                                            {clustersLoading
                                                ? "Loading Kubernetes clusters..."
                                                : clusters.length === 0
                                                ? "No Kubernetes clusters available"
                                                : "Select a Kubernetes cluster"}
                                        </option>
                                        {clusters.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} — {c.headIp}:{c.port}
                                            </option>
                                        ))}
                                    </select>
                                    {!clustersLoading && clusters.length === 0 && (
                                        <p className="text-xs text-amber-600 mt-1">
                                            Go to <strong>Pools → Kubernetes</strong> and connect a cluster first.
                                        </p>
                                    )}
                                </Field>

                                {/* Harbor Registry */}
                                <Field label="Harbor Registry" required>
                                    <select
                                        value={harborId}
                                        onChange={(e) => setHarborId(e.target.value)}
                                        disabled={submitting || harborsLoading || harbors.length === 0}
                                        className={inputCls(submitting || harborsLoading || harbors.length === 0)}
                                    >
                                        <option value="">
                                            {harborsLoading
                                                ? "Loading deployed Harbor registries..."
                                                : harbors.length === 0
                                                ? "No Harbor registries available"
                                                : "Select a Harbor registry"}
                                        </option>
                                        {harbors.map((h) => (
                                            <option key={h.deploy_id ?? h.job_id ?? h.id} value={h.deploy_id ?? h.job_id ?? h.id}>
                                                {h.name} — {h.harbor_url}
                                            </option>
                                        ))}
                                    </select>
                                    {!harborsLoading && harbors.length === 0 && (
                                        <p className="text-xs text-amber-600 mt-1">
                                            Deploy a Harbor template to Kubernetes first — see <strong>Settings → Harbor</strong>.
                                        </p>
                                    )}
                                </Field>

                                {/* Version */}
                                <Field label={`${activeApp.label} Version`} required>
                                    <select
                                        value={versionId}
                                        onChange={(e) => setVersionId(e.target.value)}
                                        disabled={submitting || versionsLoading || versions.length === 0}
                                        className={inputCls(submitting || versionsLoading || versions.length === 0)}
                                    >
                                        <option value="">
                                            {versionsLoading
                                                ? "Loading versions..."
                                                : versions.length === 0
                                                ? "No versions uploaded"
                                                : "Select a version"}
                                        </option>
                                        {versions.map((v) => (
                                            <option key={v.id} value={v.id}>
                                                {v.name}{v.version ? ` — v${v.version}` : ""}
                                            </option>
                                        ))}
                                    </select>
                                    {!versionsLoading && versions.length === 0 && (
                                        <p className="text-xs text-amber-600 mt-1">
                                            Upload a {activeApp.label} package from the Library page first.
                                        </p>
                                    )}
                                </Field>

                                {/* Namespace */}
                                <Field
                                    label="Namespace"
                                    required
                                    hint="Defaults to the application name — edit if you want to reuse an existing namespace."
                                >
                                    <input
                                        type="text"
                                        value={namespace}
                                        disabled={submitting}
                                        onChange={(e) => {
                                            setNamespace(e.target.value);
                                            setNamespaceTouched(true);
                                        }}
                                        placeholder="e.g. openwebui"
                                        className={inputCls(submitting)}
                                    />
                                </Field>
                            </>
                        )}
                    </div>

                    {/* Footer buttons */}
                    <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/application")}
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

export default ApplicationDeploy;

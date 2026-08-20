import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
    ChevronLeft, ChevronRight, ChevronDown, Loader2, Cpu, Box, Link2, Link2Off, Layers, ExternalLink,
    ShieldCheck, Plus, AlertCircle, Eye, EyeOff, Copy, Check, X, Users, Search,
} from "lucide-react";
import { getAppType } from "./appTypes";
import { selectAuthToken } from "../../redux/features/Auth/AuthSelectors";
import { connectPrivateLLM as connectPrivateLLMThunk, disconnectPrivateLLM as disconnectPrivateLLMThunk } from "../../redux/features/Application/ApplicationThunks";
import {
    fetchApplicationDetail,
    fetchApplications,
    fetchDeployedPrivateLLMs,
    connectOpenWebUiKeycloak,
    disconnectOpenWebUiKeycloak,
    fetchKeycloakUsers,
    fetchOpenWebUiAdminUsers,
    fetchOpenWebUiMemberUsers,
    assignOpenWebUiRoles,
    linkVectorDb,
    unlinkVectorDb,
} from "../../Services/ApplicationService";
import { fetchKubernetesClusters } from "../../Services/KubernetesService";
import { fetchDeployments, fetchLibraryList } from "../../Services/LibraryService";

const ACTIVE_STATUSES = ["deploying", "provisioning", "pending"];
const isActive = (s) => ACTIVE_STATUSES.includes(s?.toLowerCase());

const InfoRow = ({ label, value, mono }) => (
    <div>
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block">{label}</span>
        <span className={`text-sm text-gray-800 dark:text-gray-100 font-medium block mt-0.5 ${mono ? "font-mono text-xs" : ""}`}>{value || "—"}</span>
    </div>
);

const Panel = ({ title, icon: Icon, children, action, badge }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Icon className="h-4 w-4 text-[#1a365d] dark:text-blue-300" />
                {title}
                {badge && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-red-50 text-red-600 ring-1 ring-inset ring-red-200">
                        {badge}
                    </span>
                )}
            </h3>
            {action}
        </div>
        {children}
    </div>
);

// A masked-but-real <input> (not rendered dots) so selecting the text and
// hitting Ctrl+C copies the actual value, plus a dedicated copy button for
// one-click copy — either path works regardless of whether it's revealed.
// navigator.clipboard needs a secure context (HTTPS or localhost) — this app
// is often served over plain HTTP on a LAN IP, where that API is unavailable.
// Falls back to the legacy execCommand("copy") trick via a hidden textarea,
// which still works over HTTP.
const copyToClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    let ok = false;
    try {
        ok = document.execCommand("copy");
    } finally {
        document.body.removeChild(textarea);
    }
    if (!ok) throw new Error("execCommand copy failed");
};

const CopyableField = ({ label, value, maskable }) => {
    const [visible, setVisible] = useState(!maskable);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await copyToClipboard(value);
            setCopied(true);
            toast.success(`${label} copied.`);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            toast.error("Unable to copy — please select and copy manually.");
        }
    };

    return (
        <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-0.5">{label}</span>
            <div className="flex items-center gap-1.5">
                <input
                    type={maskable && !visible ? "password" : "text"}
                    value={value}
                    readOnly
                    onFocus={(e) => e.target.select()}
                    className="flex-1 min-w-0 text-xs font-mono text-gray-800 dark:text-gray-100 bg-transparent border-0 p-0 focus:ring-0 focus:outline-none"
                />
                {maskable && (
                    <button
                        type="button"
                        onClick={() => setVisible((s) => !s)}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-400 flex-shrink-0"
                    >
                        {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                )}
                <button
                    type="button"
                    onClick={handleCopy}
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-400 flex-shrink-0"
                >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
            </div>
        </div>
    );
};

// ── Connection Details panel: shared between Open WebUI and Vector DB ────────
const ServicePanel = ({ application }) => {
    const ready = !!application.serviceUrl;

    return (
        <Panel title="Connection Details" icon={ExternalLink}>
            {!ready ? (
                <div className="flex items-center gap-2 py-6 justify-center text-xs text-gray-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Waiting for the service to come online...
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">Service URL</span>
                        {application.serviceUrl.startsWith("http") ? (
                            <a
                                href={application.serviceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-mono text-[#1a365d] dark:text-blue-300 hover:underline break-all"
                            >
                                {application.serviceUrl}
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                        ) : (
                            <span className="text-sm font-mono text-gray-800 dark:text-gray-100 break-all block">{application.serviceUrl}</span>
                        )}
                    </div>
                    {application.adminEmail && (
                        <CopyableField label="Admin Email" value={application.adminEmail} maskable />
                    )}
                    {application.adminPassword && (
                        <CopyableField label="Admin Password" value={application.adminPassword} maskable />
                    )}
                </div>
            )}
        </Panel>
    );
};

// ── Open WebUI: Private LLM panel ─────────────────────────────────────────────
// Lists already-deployed, running Private LLM instances (from the separate
// /v1/llm-inference/deployed endpoint — not the app-deploy list). Loads
// one page at a time and fetches the next page as the panel is scrolled.
const PRIVATE_LLM_PAGE_SIZE = 10;

const PrivateLLMPanel = ({ application, onChanged }) => {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadError, setLoadError] = useState("");

    const [showConnectForm, setShowConnectForm] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedToConnect, setSelectedToConnect] = useState([]); // array of item objects, multi-select
    const [connecting, setConnecting] = useState(false);

    const [selectedToDisconnect, setSelectedToDisconnect] = useState([]); // array of llm ids, multi-select (bulk)
    const [disconnecting, setDisconnecting] = useState(false);
    const [disconnectingId, setDisconnectingId] = useState(null); // single-row quick disconnect
    const listRef = useRef(null);

    const loadPage = useCallback((pageNum, append) => {
        (append ? setLoadingMore : setLoading)(true);
        if (!append) setLoadError("");
        fetchDeployedPrivateLLMs({ page: pageNum, pageSize: PRIVATE_LLM_PAGE_SIZE })
            .then(({ items: newItems, pagination }) => {
                setItems((prev) => (append ? [...prev, ...newItems] : newItems));
                setHasNext(!!pagination.hasNext);
                setPage(pageNum);
            })
            .catch((err) => {
                if (append) return;
                setItems([]);
                setLoadError(err?.response?.data?.msg || err?.response?.data?.detail || err?.message || "Failed to load Private LLM instances.");
            })
            .finally(() => (append ? setLoadingMore : setLoading)(false));
    }, []);

    useEffect(() => { loadPage(1, false); }, [loadPage]);

    const handleListScroll = () => {
        const el = listRef.current;
        if (!el || loading || loadingMore || !hasNext) return;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 32) {
            loadPage(page + 1, true);
        }
    };

    const dispatch = useDispatch();

    const toggleToConnect = (item) => {
        setSelectedToConnect((prev) =>
            prev.some((i) => i.id === item.id) ? prev.filter((i) => i.id !== item.id) : [...prev, item]
        );
    };

    const toggleToDisconnect = (id) => {
        setSelectedToDisconnect((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const handleToggleConnectForm = () => {
        setShowConnectForm((s) => !s);
        setDropdownOpen(false);
        setSelectedToConnect([]);
    };

    const handleConnect = async () => {
        if (selectedToConnect.length === 0 || connecting) return;
        setConnecting(true);
        try {
            await dispatch(connectPrivateLLMThunk({
                openWebUiId: application.id,
                privateLlmIds: selectedToConnect.map((i) => i.id),
            })).unwrap();
            toast.success(
                selectedToConnect.length === 1
                    ? `Connected to "${selectedToConnect[0].name}".`
                    : `Connected ${selectedToConnect.length} Private LLMs.`
            );
            setSelectedToConnect([]);
            setDropdownOpen(false);
            onChanged?.();
        } catch (err) {
            const msg = err || err?.message || "Unable to connect right now.";
            toast.error(msg);
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnectSelected = async () => {
        if (selectedToDisconnect.length === 0 || disconnecting) return;
        setDisconnecting(true);
        try {
            await Promise.all(
                selectedToDisconnect.map((llmId) =>
                    dispatch(disconnectPrivateLLMThunk({ openWebUiId: application.id, privateLlmId: llmId })).unwrap()
                )
            );
            toast.success(
                selectedToDisconnect.length === 1 ? "Disconnected Private LLM." : `Disconnected ${selectedToDisconnect.length} Private LLMs.`
            );
            setSelectedToDisconnect([]);
            onChanged?.();
        } catch (err) {
            const msg = err || err?.message || "Unable to disconnect right now.";
            toast.error(msg);
        } finally {
            setDisconnecting(false);
        }
    };

    const handleDisconnectOne = async (llmId, name) => {
        if (disconnectingId || disconnecting) return;
        setDisconnectingId(llmId);
        try {
            await dispatch(disconnectPrivateLLMThunk({ openWebUiId: application.id, privateLlmId: llmId })).unwrap();
            toast.success(`Disconnected "${name}".`);
            setSelectedToDisconnect((prev) => prev.filter((id) => id !== llmId));
            onChanged?.();
        } catch (err) {
            const msg = err || err?.message || "Unable to disconnect right now.";
            toast.error(msg);
        } finally {
            setDisconnectingId(null);
        }
    };

    // The app-deploy detail response already returns the full connected LLM
    // object(s) directly (as an array — more than one can be connected at
    // once), so there's no need to cross-reference the paginated dropdown list.
    const connectedLLMs = application.linkedLLMs || [];

    return (
        <Panel
            title="Private LLM"
            icon={Cpu}
            action={
                <button
                    type="button"
                    onClick={handleToggleConnectForm}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-2.5 py-1 rounded transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Connect
                </button>
            }
        >
            <div className="space-y-4">
                {/* Connect form — shown above the connected list, toggled via the header button */}
                {showConnectForm && (
                    <div className="pb-4 border-b border-gray-100">
                        {loadError ? (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-center gap-2.5">
                                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                <span className="text-xs font-semibold text-red-700">{loadError}</span>
                            </div>
                        ) : loading ? (
                            <div className="flex items-center gap-2 py-4 justify-center text-xs text-gray-400">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading Private LLM instances...
                            </div>
                        ) : items.length === 0 ? (
                            <div className="py-4 text-center">
                                <Cpu className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No deployed Private LLM instances</p>
                                <p className="text-xs text-gray-400 mt-1">Deploy one from Pools → Private LLM.</p>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <button
                                        type="button"
                                        onClick={() => setDropdownOpen((o) => !o)}
                                        disabled={connecting}
                                        className="w-full flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 text-sm text-gray-900 dark:text-gray-100 hover:border-[#1a365d] focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none transition-all disabled:opacity-50"
                                    >
                                        {selectedToConnect.length > 0 ? (
                                            <span className="truncate">
                                                {selectedToConnect.length === 1
                                                    ? selectedToConnect[0].name
                                                    : `${selectedToConnect.length} Private LLMs selected`}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">Select Private LLM(s)...</span>
                                        )}
                                        <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                                    </button>

                                    {dropdownOpen && (
                                        <div
                                            ref={listRef}
                                            onScroll={handleListScroll}
                                            className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
                                        >
                                            {items.map((item) => {
                                                const checked = selectedToConnect.some((i) => i.id === item.id);
                                                return (
                                                    <label
                                                        key={item.id}
                                                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-blue-50 transition-colors cursor-pointer
                                                            ${checked ? "bg-blue-50/60" : ""}`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => toggleToConnect(item)}
                                                            className="h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-600 text-[#1a365d] dark:text-blue-300 focus:ring-[#1a365d] flex-shrink-0"
                                                        />
                                                        <span className="text-sm text-gray-800 dark:text-gray-100 truncate">{item.name}</span>
                                                    </label>
                                                );
                                            })}
                                            {loadingMore && (
                                                <div className="flex items-center justify-center gap-2 py-2 text-xs text-gray-400">
                                                    <Loader2 className="h-3 w-3 animate-spin" /> Loading more...
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleConnect}
                                    disabled={selectedToConnect.length === 0 || connecting}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#1a365d] hover:bg-[#122744] rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                                >
                                    {connecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    Connect{selectedToConnect.length > 1 ? ` (${selectedToConnect.length})` : ""}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Connected list — each row has its own Disconnect button; checkboxes
                    are only for the optional bulk "Disconnect Selected" action. */}
                {connectedLLMs.length > 0 ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                Connected ({connectedLLMs.length})
                            </span>
                            {selectedToDisconnect.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleDisconnectSelected}
                                    disabled={disconnecting}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {disconnecting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Link2Off className="h-3 w-3" />}
                                    Disconnect Selected ({selectedToDisconnect.length})
                                </button>
                            )}
                        </div>
                        {connectedLLMs.map((llm) => (
                            <div
                                key={llm.id}
                                className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50/50 px-3 py-2"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedToDisconnect.includes(llm.id)}
                                    onChange={() => toggleToDisconnect(llm.id)}
                                    disabled={disconnecting || disconnectingId === llm.id}
                                    className="h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-600 text-[#1a365d] dark:text-blue-300 focus:ring-[#1a365d] flex-shrink-0"
                                />
                                <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{llm.name}</p>
                                    {llm.endpointUrl && (
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">{llm.endpointUrl}</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDisconnectOne(llm.id, llm.name)}
                                    disabled={disconnecting || disconnectingId === llm.id}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded transition-colors disabled:opacity-50 flex-shrink-0"
                                >
                                    {disconnectingId === llm.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Link2Off className="h-3 w-3" />}
                                    Disconnect
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    !showConnectForm && (
                        <div className="py-6 text-center">
                            <Cpu className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No Private LLM connected</p>
                            <p className="text-xs text-gray-400 mt-1">Click Connect to link one.</p>
                        </div>
                    )
                )}
            </div>
        </Panel>
    );
};

// ── Open WebUI: Keycloak SSO toggle + user management ─────────────────────────
const KeycloakConfigPanel = ({ application, onChanged }) => {
    const connected = !!application.keycloakConnected;
    const [toggling, setToggling] = useState(false);
    const [showUsersModal, setShowUsersModal] = useState(false);

    const handleToggle = async () => {
        if (toggling) return;
        setToggling(true);
        try {
            if (connected) {
                await disconnectOpenWebUiKeycloak(application.id);
                toast.success("Keycloak SSO disconnected.");
            } else {
                await connectOpenWebUiKeycloak(application.id);
                toast.success("Keycloak SSO connected.");
            }
            onChanged?.();
        } catch (err) {
            const msg = err?.response?.data?.msg || err?.response?.data?.detail || err?.message || "Unable to update Keycloak SSO right now.";
            toast.error(msg);
        } finally {
            setToggling(false);
        }
    };

    return (
        <Panel
            title="Keycloak Configuration"
            icon={ShieldCheck}
            action={
                connected && (
                    <button
                        type="button"
                        onClick={() => setShowUsersModal(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-2.5 py-1 rounded transition-colors"
                    >
                        <Users className="h-3.5 w-3.5" />
                        Manage Users
                    </button>
                )
            }
        >
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {connected ? "Keycloak SSO connected" : "Keycloak SSO not connected"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Let users sign in to this Open WebUI instance with Keycloak.</p>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={connected}
                    onClick={handleToggle}
                    disabled={toggling}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50
                        ${connected ? "bg-[#1a365d]" : "bg-gray-300"}`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-800 shadow transition-transform flex items-center justify-center
                            ${connected ? "translate-x-6" : "translate-x-1"}`}
                    >
                        {toggling && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
                    </span>
                </button>
            </div>

            {showUsersModal && (
                <KeycloakUsersModal application={application} onClose={() => setShowUsersModal(false)} />
            )}
        </Panel>
    );
};

// ── Open WebUI: Keycloak user role management (popup) ─────────────────────────
// Two lists: everyone registered in the Keycloak realm (read-only reference),
// and Open WebUI users who've actually logged in — those get an editable
// User/Admin role selector. Opened from the Keycloak Configuration card.
const ROLE_OPTIONS = ["user", "admin"];

const kcUserLabel = (u) => u.username ?? u.name ?? u.email ?? u.preferred_username ?? `User #${u.id ?? u.user_id ?? "?"}`;
const kcUserId    = (u) => u.id ?? u.user_id;

// One role-filtered, paginated, searchable list ("Users" or "Admins" tab) —
// each row can flip the user's role, which moves them out of this list on
// the next load since the lists are already split by role.
const RoleUsersList = ({ application, role, fetchFn }) => {
    const [items, setItems]           = useState([]);
    const [page, setPage]             = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch]         = useState("");
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState("");
    const searchMountedRef = useRef(false);

    const load = useCallback((pageNum, searchTerm) => {
        setLoading(true);
        setError("");
        fetchFn(application.id, { page: pageNum, pageSize: 10, search: searchTerm || undefined })
            .then(({ items: list, pagination }) => {
                setItems(list);
                setPage(pagination.page);
                setTotalPages(pagination.totalPages);
            })
            .catch((err) => {
                setItems([]);
                setError(err?.response?.data?.msg || err?.response?.data?.detail || err?.message || "Failed to load users.");
            })
            .finally(() => setLoading(false));
    }, [application.id, fetchFn]);

    useEffect(() => { load(1, ""); }, [load]);

    // Debounced — refetch page 1 as the user types, skipping the initial mount.
    useEffect(() => {
        if (!searchMountedRef.current) { searchMountedRef.current = true; return; }
        const t = setTimeout(() => load(1, search), 400);
        return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    return (
        <>
            <div className="relative mb-4">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-8 pr-3 text-xs text-gray-900 dark:text-gray-100 focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none transition-all"
                />
            </div>

            {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-center gap-2.5">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-red-700">{error}</span>
                </div>
            ) : loading ? (
                <div className="flex items-center gap-2 py-6 justify-center text-xs text-gray-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading users...
                </div>
            ) : items.length === 0 ? (
                <div className="py-6 text-center">
                    <ShieldCheck className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {search ? "No users match your search" : `No ${role === "admin" ? "admins" : "users"} yet`}
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {items.map((u) => {
                            const id = kcUserId(u);
                            return (
                                <div key={id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{kcUserLabel(u)}</p>
                                        {u.email && u.email !== kcUserLabel(u) && (
                                            <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        {updatingId === id && <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />}
                                        <select
                                            value={role}
                                            onChange={(e) => handleRoleChange(u, e.target.value)}
                                            disabled={updatingId === id}
                                            className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-1 px-2 text-xs font-semibold text-gray-800 dark:text-gray-100 capitalize focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none disabled:opacity-50"
                                        >
                                            {ROLE_OPTIONS.map((r) => (
                                                <option key={r} value={r} className="capitalize">{r}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-100">
                            <p className="text-[11px] text-gray-400">Page {page} of {totalPages}</p>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => load(page - 1, search)}
                                    disabled={page <= 1 || loading}
                                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-[#1a365d] dark:text-blue-300 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => load(page + 1, search)}
                                    disabled={page >= totalPages || loading}
                                    className="p-1 text-gray-500 dark:text-gray-400 hover:text-[#1a365d] dark:text-blue-300 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 transition-colors"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
};

const KeycloakUsersModal = ({ application, onClose }) => {
    const [activeTab, setActiveTab] = useState("users"); // "users" | "admins" | "keycloak"

    const [kcUsers, setKcUsers]     = useState([]);
    const [kcLoading, setKcLoading] = useState(false);
    const [kcError, setKcError]     = useState("");
    const [kcLoaded, setKcLoaded]   = useState(false);
    const [kcPage, setKcPage]           = useState(1);
    const [kcTotalPages, setKcTotalPages] = useState(1);
    const [kcSearch, setKcSearch]       = useState("");
    const kcSearchMountedRef = useRef(false);

    const loadKcUsers = (pageNum, search) => {
        setKcLoading(true);
        setKcError("");
        fetchKeycloakUsers(application.id, { page: pageNum, pageSize: 10, search: search || undefined })
            .then(({ items, pagination }) => {
                setKcUsers(items);
                setKcPage(pagination.page);
                setKcTotalPages(pagination.totalPages);
                setKcLoaded(true);
            })
            .catch((err) => {
                setKcUsers([]);
                setKcError(err?.response?.data?.msg || err?.response?.data?.detail || err?.message || "Failed to load Keycloak users.");
            })
            .finally(() => setKcLoading(false));
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === "keycloak" && !kcLoaded) {
            loadKcUsers(1, kcSearch);
        }
    };

    // Debounced — refetch page 1 as the user types, skipping the initial mount.
    useEffect(() => {
        if (!kcSearchMountedRef.current) { kcSearchMountedRef.current = true; return; }
        const t = setTimeout(() => loadKcUsers(1, kcSearch), 400);
        return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kcSearch]);

    // Staged role picks for the "All Keycloak Users" tab — userId -> role.
    // Kept independent of the current page's list so picks survive pagination,
    // and submitted together (single user or many, possibly different roles).
    const [pendingRoles, setPendingRoles] = useState({});
    const [assigning, setAssigning]       = useState(false);

    const handlePendingRoleChange = (userId, role) => {
        setPendingRoles((prev) => ({ ...prev, [userId]: role }));
    };

    const pendingCount = Object.keys(pendingRoles).length;

    const handleAssignRoles = async () => {
        const assignments = Object.entries(pendingRoles).map(([userId, role]) => ({ userId, role }));
        if (assignments.length === 0 || assigning) return;
        setAssigning(true);
        try {
            await assignOpenWebUiRoles(application.id, assignments);
            toast.success(assignments.length === 1 ? "Role assigned." : `${assignments.length} roles assigned.`);
            setPendingRoles({});
        } catch (err) {
            const msg = err?.response?.data?.msg || err?.response?.data?.detail || err?.message || "Unable to assign roles right now.";
            toast.error(msg);
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-3">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-[#1a365d] dark:text-blue-300" />
                            Keycloak Users
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{application.name}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:bg-gray-700 transition-colors flex-shrink-0"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto flex-1 min-h-0">
                    <div className="flex items-center gap-1 mb-4">
                        {[{ key: "users", label: "Users" }, { key: "admins", label: "Admins" }, { key: "keycloak", label: "Assign Role" }].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => handleTabChange(tab.key)}
                                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors
                                    ${activeTab === tab.key
                                        ? "bg-[#1a365d] text-white shadow-sm"
                                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-900/60 hover:text-[#1a365d] dark:text-blue-300"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === "keycloak" && (
                        <div className="relative mb-4">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                value={kcSearch}
                                onChange={(e) => setKcSearch(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-8 pr-3 text-xs text-gray-900 dark:text-gray-100 focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none transition-all"
                            />
                        </div>
                    )}

                    {activeTab === "keycloak" && pendingCount > 0 && (
                        <div className="flex items-center justify-between gap-3 mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                            <span className="text-xs font-semibold text-blue-800">
                                {pendingCount} role{pendingCount !== 1 ? "s" : ""} pending
                            </span>
                            <button
                                type="button"
                                onClick={handleAssignRoles}
                                disabled={assigning}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#1a365d] hover:bg-[#122744] rounded-lg transition-colors disabled:opacity-50"
                            >
                                {assigning && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                Assign Roles
                            </button>
                        </div>
                    )}

                    {activeTab === "users" ? (
                        <RoleUsersList application={application} role="user" fetchFn={fetchOpenWebUiMemberUsers} />
                    ) : activeTab === "admins" ? (
                        <RoleUsersList application={application} role="admin" fetchFn={fetchOpenWebUiAdminUsers} />
                    ) : (
                kcError ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-center gap-2.5">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span className="text-xs font-semibold text-red-700">{kcError}</span>
                    </div>
                ) : kcLoading ? (
                    <div className="flex items-center gap-2 py-6 justify-center text-xs text-gray-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading Keycloak users...
                    </div>
                ) : kcUsers.length === 0 ? (
                    <div className="py-6 text-center">
                        <ShieldCheck className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {kcSearch ? "No users match your search" : "No Keycloak users found"}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {kcUsers.map((u) => {
                                const id = kcUserId(u);
                                return (
                                    <div key={id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{kcUserLabel(u)}</p>
                                            {u.email && u.email !== kcUserLabel(u) && (
                                                <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
                                            )}
                                        </div>
                                        <select
                                            value={pendingRoles[id] ?? ""}
                                            onChange={(e) => handlePendingRoleChange(id, e.target.value)}
                                            disabled={assigning}
                                            className={`rounded border py-1 px-2 text-xs font-semibold capitalize focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none disabled:opacity-50 flex-shrink-0
                                                ${pendingRoles[id] ? "border-blue-300 bg-blue-50 text-blue-800" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"}`}
                                        >
                                            <option value="" disabled>Set role...</option>
                                            {ROLE_OPTIONS.map((r) => (
                                                <option key={r} value={r} className="capitalize">{r}</option>
                                            ))}
                                        </select>
                                    </div>
                                );
                            })}
                        </div>
                        {kcTotalPages > 1 && (
                            <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-100">
                                <p className="text-[11px] text-gray-400">Page {kcPage} of {kcTotalPages}</p>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => loadKcUsers(kcPage - 1)}
                                        disabled={kcPage <= 1 || kcLoading}
                                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-[#1a365d] dark:text-blue-300 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 transition-colors"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => loadKcUsers(kcPage + 1)}
                                        disabled={kcPage >= kcTotalPages || kcLoading}
                                        className="p-1 text-gray-500 dark:text-gray-400 hover:text-[#1a365d] dark:text-blue-300 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 transition-colors"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                    )
                )}
                </div>
            </div>
        </div>
    );
};

// ── Open WebUI: Vector DB integration panel ───────────────────────────────────
const VectorDbLinkPanel = ({ application, onChanged }) => {
    const [vectorDbs, setVectorDbs] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [selected, setSelected]   = useState("");
    const [connecting, setConnecting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);

    useEffect(() => {
        fetchApplications({ deploymentType: "vectordb", pageSize: 100 })
            .then(({ items }) => setVectorDbs(items))
            .catch(() => setVectorDbs([]))
            .finally(() => setLoading(false));
    }, []);

    const linkedId = application.linkedVectorDbId;
    const linkedVectorDb = vectorDbs.find((v) => String(v.id) === String(linkedId));

    const handleConnect = async () => {
        if (!selected || connecting) return;
        setConnecting(true);
        try {
            await linkVectorDb(application.id, selected);
            toast.success("Vector DB connected successfully.");
            setSelected("");
            onChanged?.();
        } catch (err) {
            const msg = err?.response?.data?.msg || err?.response?.data?.detail || err?.message || "Unable to connect Vector DB right now.";
            toast.error(msg);
        } finally {
            setConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        if (disconnecting) return;
        setDisconnecting(true);
        try {
            await unlinkVectorDb(application.id);
            toast.success("Vector DB disconnected.");
            onChanged?.();
        } catch (err) {
            const msg = err?.response?.data?.msg || err?.response?.data?.detail || err?.message || "Unable to disconnect Vector DB right now.";
            toast.error(msg);
        } finally {
            setDisconnecting(false);
        }
    };

    return (
        <Panel title="Vector DB Integration" icon={Link2} badge="Mandatory">
            {loading ? (
                <div className="flex items-center gap-2 py-4 text-xs text-gray-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading Vector DB applications...
                </div>
            ) : linkedId ? (
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            Connected to {linkedVectorDb?.name || `Vector DB #${linkedId}`}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={handleDisconnect}
                        disabled={disconnecting}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {disconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Link2Off className="h-3.5 w-3.5" />}
                        Disconnect
                    </button>
                </div>
            ) : vectorDbs.length === 0 ? (
                <div className="py-6 text-center">
                    <Box className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No Vector DB applications deployed yet</p>
                    <p className="text-xs text-gray-400 mt-1">Deploy a Vector DB instance to connect it here.</p>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <select
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                        disabled={connecting}
                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 text-sm text-gray-900 dark:text-gray-100 focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none transition-all disabled:opacity-50"
                    >
                        <option value="">Select a Vector DB...</option>
                        {vectorDbs.map((v) => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={handleConnect}
                        disabled={!selected || connecting}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#1a365d] hover:bg-[#122744] rounded-lg transition-colors disabled:opacity-50"
                    >
                        {connecting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Connect
                    </button>
                </div>
            )}
        </Panel>
    );
};

// ── Vector DB: linked applications panel ──────────────────────────────────────
const LinkedAppsPanel = () => (
    <Panel title="Linked Applications" icon={Link2}>
        <div className="py-6 text-center">
            <Link2 className="h-6 w-6 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Not linked to any application yet</p>
            <p className="text-xs text-gray-400 mt-1">Open WebUI instances connected to this Vector DB will appear here.</p>
        </div>
    </Panel>
);

// ── Main Component ────────────────────────────────────────────────────────────
const ApplicationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const token    = useSelector(selectAuthToken);

    const [application, setApplication] = useState(location.state?.applicationData || null);
    const [loading, setLoading] = useState(!location.state?.applicationData);
    const [clusterName, setClusterName] = useState("");
    const [harborName, setHarborName]   = useState("");
    const [versionName, setVersionName] = useState("");

    // Initial load.
    useEffect(() => {
        let cancelled = false;
        fetchApplicationDetail(id)
            .then((data) => { if (!cancelled && data) setApplication(data); })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id]);

    // Re-fetches the application — used after connecting/disconnecting a Vector DB.
    const refreshApplication = () => {
        fetchApplicationDetail(id)
            .then((data) => { if (data) setApplication(data); })
            .catch(() => {});
    };

    // Poll every 5s while the deployment is still in progress (waiting for
    // status/serviceUrl to settle), same pattern as the application list page.
    useEffect(() => {
        if (!application || !isActive(application.status)) return;
        const t = setTimeout(() => {
            fetchApplicationDetail(id)
                .then((data) => { if (data) setApplication(data); })
                .catch(() => {});
        }, 5000);
        return () => clearTimeout(t);
    }, [application, id]);

    // Resolve cluster/harbor/version ids to readable names.
    useEffect(() => {
        if (!application) return;

        if (application.clusterId) {
            fetchKubernetesClusters()
                .then((list) => {
                    const match = (list || []).find((c) => String(c.id) === String(application.clusterId));
                    setClusterName(match?.name || "");
                })
                .catch(() => {});
        }

        if (application.harborId) {
            fetchDeployments(token, { page: 1, pageSize: 100 })
                .then((res) => {
                    const raw  = res?.data ?? res;
                    const list = Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
                    const match = list.find((h) => String(h.deploy_id ?? h.job_id ?? h.id) === String(application.harborId));
                    setHarborName(match?.name || "");
                })
                .catch(() => {});
        }

        if (application.versionId) {
            const activeApp = getAppType(application.type);
            if (activeApp) {
                fetchLibraryList(token, { type: activeApp.apiType, page: 1, pageSize: 100 })
                    .then((res) => {
                        const dirs = res.data?.directories || {};
                        const allItems = Object.values(dirs).flat();
                        const match = allItems.find((v) => String(v.id) === String(application.versionId));
                        setVersionName(match ? `${match.name}${match.version ? ` — v${match.version}` : ""}` : "");
                    })
                    .catch(() => {});
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [application?.id, application?.clusterId, application?.harborId, application?.versionId]);

    if (loading) {
        return (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#1a365d] dark:text-blue-300 mb-2" />
                Loading application...
            </div>
        );
    }

    if (!application) {
        return (
            <div className="p-6 flex flex-col items-center justify-center text-center min-h-[60vh]">
                <Layers className="h-8 w-8 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Application not found</p>
                <p className="text-xs text-gray-400 mt-1 mb-4">It may have been removed, or is not reachable right now.</p>
                <button
                    onClick={() => navigate("/application")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded transition-colors"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Back to Applications
                </button>
            </div>
        );
    }

    const activeApp = getAppType(application.type);
    const Icon = activeApp?.Icon || Layers;
    const isReady = !isActive(application.status);

    return (
        <div className="p-6 pb-32 bg-gray-50 dark:bg-gray-900 min-h-screen text-left items-start flex flex-col w-full">
            {/* Back button */}
            <div className="mb-4">
                <button
                    onClick={() => navigate("/application")}
                    className="flex items-center gap-1.5 text-[#1a365d] dark:text-blue-300 hover:text-[#153056] font-semibold text-sm transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Applications
                </button>
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 pb-5 border-b border-gray-200 dark:border-gray-700 mb-6 w-full">
                <div className="h-9 w-9 rounded-lg bg-[#1a365d]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-[#1a365d] dark:text-blue-300" />
                </div>
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{application.name}</h1>
                        <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                isReady
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                        >
                            {isReady ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            ) : (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            )}
                            {application.status || "Unknown"}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activeApp?.label}</p>
                </div>
            </div>

            {/* Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 w-full mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <InfoRow label="Namespace" value={application.namespace} />
                    <InfoRow label="Cluster" value={clusterName || application.clusterId} />
                    <InfoRow label="Harbor Registry" value={harborName || application.harborUrl || application.harborId} />
                    <InfoRow label="Version" value={versionName || application.versionId} />
                </div>
            </div>

            {/* Type-specific panels — extend this switch as more app types register. */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                <ServicePanel application={application} />
                {activeApp?.id === "openwebui" && <VectorDbLinkPanel application={application} onChanged={refreshApplication} />}
                {activeApp?.id === "vectordb" && <LinkedAppsPanel />}
                {activeApp?.id === "openwebui" && <PrivateLLMPanel application={application} onChanged={refreshApplication} />}
                {activeApp?.id === "openwebui" && <KeycloakConfigPanel application={application} onChanged={refreshApplication} />}
            </div>
        </div>
    );
};

export default ApplicationDetail;

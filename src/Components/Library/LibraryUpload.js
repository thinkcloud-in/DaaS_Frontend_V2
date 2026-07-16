import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    UploadCloud, CheckCircle,
    Loader2, ChevronDown, ArrowLeft, AlertCircle,
    Server, Globe, HardDrive, Box, Database,
} from "lucide-react";
import { toast } from "react-toastify";
import { selectAuthToken } from "../../redux/features/Auth/AuthSelectors";
import { uploadLibraryThunk } from "../../redux/features/Library/LibraryThunks";
import { selectLibraryUploadLoading } from "../../redux/features/Library/LibrarySelectors";
import { clearUploadResult } from "../../redux/features/Library/LibrarySlice";
import { streamLibraryFile, fetchDeployments } from "../../Services/LibraryService";

const UPLOAD_TYPES = [
    {
        value:       "harbor_template",
        apiType:     "harbor_template",
        label:       "Harbor",
        icon:        Server,
        description: "Harbor container registry templates",
        accept:      ".zst,.tar,.gz,.tar.gz",
        placeholder: "e.g. Harbor v1",
        fileHint:    ".tar.zst / .tar.gz",
    },
    {
        value:       "openwebui",
        apiType:     "openwebui",
        label:       "Open WebUI",
        icon:        Globe,
        description: "Open WebUI application packages",
        accept:      ".zst,.tar,.gz,.tar.gz",
        placeholder: "e.g. OpenWebUI v1",
        fileHint:    ".tar.zst / .tar.gz",
    },
    {
        value:       "os",
        apiType:     "os",
        label:       "OS",
        icon:        HardDrive,
        description: "Operating system images",
        accept:      ".iso,.img,.qcow2,.tar,.zst",
        placeholder: "e.g. Ubuntu-22.04-LTS",
        fileHint:    ".iso / .img / .qcow2",
    },
    {
        value:       "podman",
        apiType:     "podman",
        label:       "Podman",
        icon:        Box,
        description: "Podman container image packages",
        accept:      ".zst,.tar,.gz,.tar.gz",
        placeholder: "e.g. Podman Image v1",
        fileHint:    ".tar.zst / .tar.gz",
    },
    {
        value:       "vectordb",
        apiType:     "vectordb",
        label:       "Vector DB",
        icon:        Database,
        description: "Vector database packages",
        accept:      ".zst,.tar,.gz,.tar.gz",
        placeholder: "e.g. Milvus v2.4",
        fileHint:    ".tar.zst / .tar.gz",
    },
];

// phase: idle | creating | streaming | done
const LibraryUpload = () => {
    const nav      = useNavigate();
    const dispatch = useDispatch();
    const token    = useSelector(selectAuthToken);
    const createLoading = useSelector(selectLibraryUploadLoading);

    const [selectedType, setSelectedType] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [name, setName] = useState("");
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    const [phase,        setPhase]        = useState("idle");
    const [httpProgress, setHttpProgress] = useState(0);
    const [error,        setError]        = useState("");

    // Machine selection — only for openwebui & vectordb
    const [machineId,       setMachineId]       = useState("");
    const [machines,        setMachines]        = useState([]);
    const [machinesLoading, setMachinesLoading] = useState(false);

    const NEEDS_MACHINE = ["openwebui", "vectordb"];

    // XHR ref for cancel support
    const xhrRef     = useRef(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            // Do NOT abort XHR on unmount — let the transfer continue in background.
            // The library list will show real-time progress from the API.
            dispatch(clearUploadResult());
        };
    }, [dispatch]);

    // Fetch deployed machines when type needs one
    useEffect(() => {
        if (!NEEDS_MACHINE.includes(selectedType)) { setMachines([]); setMachineId(""); return; }
        setMachinesLoading(true);
        setMachineId("");
        fetchDeployments(token, { page: 1, pageSize: 100 })
            .then((res) => {
                const raw  = res?.data ?? res;
                const list = Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
                setMachines(list.filter((m) => ["deployed_successfully", "running", "completed"].includes(m.status)));
            })
            .catch(() => setMachines([]))
            .finally(() => setMachinesLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedType, token]);

    const resetFields = () => {
        setName(""); setFile(null); setMachineId("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleTypeChange = (value) => {
        setSelectedType(value);
        setDropdownOpen(false);
        setError("");
        resetFields();
    };

    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        setError("");
        if (!name) setName(f.name.replace(/\.[^.]+$/, ""));
    };

    const activeType      = UPLOAD_TYPES.find((t) => t.value === selectedType);
    const needsMachine    = NEEDS_MACHINE.includes(selectedType);
    const isFormValid     = !!(selectedType && name.trim() && file && (!needsMachine || machineId));
    const isBusy          = phase === "creating" || phase === "streaming";

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) { toast.error("Please fill all required fields."); return; }

        setError("");

        // ── Phase 1: POST metadata (<100ms) ──────────────────────────────
        setPhase("creating");
        let itemId;
        try {
            const result = await dispatch(uploadLibraryThunk({
                token,
                name:      name.trim(),
                fileName:  file.name,
                type:      activeType?.apiType || null,
                machineId: machineId || undefined,
            })).unwrap();
            itemId = result?.id ?? result?.item_id ?? result?.data?.id;
            if (!itemId) throw new Error("Server did not return item ID");
        } catch (err) {
            setPhase("idle");
            const msg = typeof err === "string" ? err : err?.msg || err?.detail || "Failed to create upload record";
            setError(msg);
            toast.error(msg);
            return;
        }

        // ── Phase 2: PUT raw bytes via XHR (browser upload progress) ─────
        if (mountedRef.current) { setPhase("streaming"); setHttpProgress(0); }
        try {
            await streamLibraryFile(
                token,
                itemId,
                file,
                (pct) => { if (mountedRef.current) setHttpProgress(pct); },
                xhrRef,
            );
            // XHR done — navigate to list regardless of mount state
            toast.success(`"${name}" uploaded! Temporal is processing it in background.`);
            dispatch(clearUploadResult());
            // If already navigated away, this nav is a no-op since component unmounted
            if (mountedRef.current) nav("/library");
        } catch (err) {
            if (err === "__CANCELLED__") return; // user cancelled — no toast
            if (!mountedRef.current) return;     // navigated away — silent
            setPhase("idle");
            const msg = typeof err === "string" ? err : "File upload failed";
            setError(msg);
            toast.error(msg);
        }
    };

    const handleCancel = () => {
        xhrRef.current?.abort(); // abort in-flight XHR
        dispatch(clearUploadResult());
        setSelectedType("");
        setPhase("idle");
        setHttpProgress(0);
        setError("");
        resetFields();
    };

    const formatSize = (bytes) => {
        if (!bytes) return "";
        if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
        if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
        return `${(bytes / 1024).toFixed(0)} KB`;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-left flex flex-col w-full relative select-none">

            {/* Header */}
            <div className="pb-4 border-b border-gray-200 mb-6 w-full flex items-center gap-3">
                <button
                    onClick={() => nav("/library")}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-[#1a365d]">Library Upload</h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Upload files to the centralized library — Base OS, Harbor Templates, LXC Backups, or General files.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-2xl overflow-hidden flex flex-col">
                <form onSubmit={handleSubmit} className="w-full flex flex-col">
                    <div className="p-6 space-y-5">

                        {/* Phase banners */}
                        {phase === "creating" && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3.5 flex items-center gap-2.5">
                                <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />
                                <span className="text-sm font-semibold text-blue-800">Creating upload record...</span>
                            </div>
                        )}

                        {phase === "streaming" && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 text-blue-600 animate-spin flex-shrink-0" />
                                        <span className="text-sm font-semibold text-blue-800">
                                            {httpProgress < 99
                                                ? "Uploading file..."
                                                : "Transfer complete — awaiting server acknowledgement..."}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-blue-700 tabular-nums">{httpProgress}%</span>
                                </div>

                                {/* Real HTTP upload progress bar */}
                                <div className="w-full bg-blue-100 rounded-full h-2.5">
                                    <div
                                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-200 ease-out"
                                        style={{ width: `${httpProgress}%` }}
                                    />
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-blue-500">
                                    <span className="truncate max-w-[70%]">{file?.name}</span>
                                    <span className="flex-shrink-0">{formatSize(file?.size)}</span>
                                </div>

                                <p className="text-[11px] text-blue-400">
                                    After transfer, Temporal moves the file to storage — track progress in the Library list.
                                </p>
                            </div>
                        )}

                        {/* Error */}
                        {error && !isBusy && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3">
                                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                <span className="text-sm font-semibold text-red-700">{error}</span>
                            </div>
                        )}

                        {/* Type Dropdown */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                                Upload Type <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => setDropdownOpen((o) => !o)}
                                    className="w-full flex items-center justify-between rounded border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 hover:border-[#1a365d] focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {activeType ? (
                                        <span className="flex items-center gap-2">
                                            <activeType.icon className="h-4 w-4 text-[#1a365d]" />
                                            {activeType.label}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">Select upload type...</span>
                                    )}
                                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                        {UPLOAD_TYPES.map((t) => {
                                            const Icon = t.icon;
                                            return (
                                                <button
                                                    key={t.value}
                                                    type="button"
                                                    onClick={() => handleTypeChange(t.value)}
                                                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors
                                                        ${selectedType === t.value ? "bg-blue-50/60" : ""}`}
                                                >
                                                    <Icon className="h-4 w-4 text-[#1a365d] mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">{t.label}</p>
                                                        <p className="text-xs text-gray-400">{t.description}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Fields */}
                        {activeType && (
                            <div className="bg-gray-50/50 border border-gray-200/80 rounded-xl p-5 space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                    <activeType.icon className="h-4 w-4 text-[#1a365d]" />
                                    <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                        {activeType.label} Details
                                    </h2>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        disabled={isBusy}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={activeType.placeholder}
                                        className="w-full rounded border border-gray-300 bg-white py-2 px-3 focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none text-sm text-gray-900 transition-all disabled:opacity-50"
                                    />
                                </div>

                                {/* Machine selector — only for openwebui & vectordb */}
                                {needsMachine && (
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                                            Target Machine <span className="text-red-500">*</span>
                                        </label>
                                        {machinesLoading ? (
                                            <div className="flex items-center gap-2 py-2 px-3 rounded border border-gray-200 bg-gray-50 text-xs text-gray-400">
                                                <Loader2 className="h-3 w-3 animate-spin" /> Loading deployed machines...
                                            </div>
                                        ) : machines.length === 0 ? (
                                            <div className="py-2 px-3 rounded border border-amber-200 bg-amber-50 text-xs text-amber-700">
                                                No running machines found. Deploy a Harbor template first.
                                            </div>
                                        ) : (
                                            <select
                                                value={machineId}
                                                onChange={(e) => setMachineId(e.target.value)}
                                                disabled={isBusy}
                                                className="w-full rounded border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none transition-all disabled:opacity-50"
                                            >
                                                <option value="">Select a machine...</option>
                                                {machines.map((m) => (
                                                    <option key={m.job_id} value={m.job_id}>
                                                        {m.name}
                                                        {m.ip_address ? ` — ${m.ip_address}` : ""}
                                                        {m.node ? ` (${m.node}` : ""}
                                                        {m.vmid ? ` · VM ${m.vmid})` : (m.node ? ")" : "")}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                                        File <span className="text-red-500">*</span>
                                        <span className="ml-1 normal-case font-normal text-gray-400">({activeType.fileHint})</span>
                                    </label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept={activeType.accept}
                                    />
                                    <div
                                        onClick={() => !isBusy && fileInputRef.current.click()}
                                        className={`border-2 border-dashed rounded bg-white p-4 flex items-center gap-2.5 transition-all group
                                            ${isBusy
                                                ? "opacity-50 cursor-not-allowed border-gray-200"
                                                : "border-gray-300 cursor-pointer hover:bg-blue-50/20 hover:border-[#1a365d]"
                                            }`}
                                    >
                                        {file ? (
                                            <>
                                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                <span className="text-xs font-semibold text-gray-800 truncate flex-1">{file.name}</span>
                                                <span className="text-[11px] text-gray-400 flex-shrink-0">{formatSize(file.size)}</span>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="h-4 w-4 text-gray-400 group-hover:text-[#1a365d] transition-colors" />
                                                <span className="text-xs text-gray-500 font-medium group-hover:text-gray-700">
                                                    Click to browse or drop a file
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!selectedType && (
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center text-center">
                                <UploadCloud className="h-8 w-8 text-gray-300 mb-3" />
                                <p className="text-sm font-semibold text-gray-400">Select an upload type above</p>
                                <p className="text-xs text-gray-300 mt-1">Fields will appear based on your selection</p>
                            </div>
                        )}

                    </div>

                    {/* Actions */}
                    <div className="w-full bg-gray-50 border-t border-gray-200 p-4 px-6 flex items-center justify-end gap-3 rounded-b-lg">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={phase === "creating"}
                            className="inline-flex justify-center rounded-md bg-white hover:bg-gray-100 px-5 py-2 text-xs font-bold text-gray-700 shadow-xs ring-1 ring-gray-300 transition-colors uppercase tracking-wider disabled:opacity-50"
                        >
                            {phase === "streaming" ? "Cancel Upload" : "Cancel"}
                        </button>
                        <button
                            type="submit"
                            disabled={isBusy || !isFormValid}
                            className={`inline-flex items-center gap-2 rounded-md px-5 py-2 text-xs font-bold text-white shadow-xs transition-all uppercase tracking-wider
                                ${isBusy || !isFormValid
                                    ? "bg-[#1a365d] opacity-50 cursor-not-allowed"
                                    : "bg-[#1a365d] hover:bg-[#122744]"
                                }`}
                        >
                            {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            <span>
                                {phase === "creating"  ? "Creating record..." :
                                 phase === "streaming" ? `Uploading... ${httpProgress}%` :
                                 "Upload to Library"}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LibraryUpload;

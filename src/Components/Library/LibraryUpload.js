import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    UploadCloud, CheckCircle,
    Loader2, ChevronDown, ArrowLeft, AlertCircle,
    Server, Brain, HardDrive, Box,
} from "lucide-react";
import { toast } from "react-toastify";
import { selectAuthToken } from "../../redux/features/Auth/AuthSelectors";
import { uploadLibraryThunk } from "../../redux/features/Library/LibraryThunks";
import { selectLibraryUploadLoading } from "../../redux/features/Library/LibrarySelectors";
import { clearUploadResult } from "../../redux/features/Library/LibrarySlice";
import { streamLibraryFile, fetchDeployments } from "../../Services/LibraryService";

// Open WebUI and Vector DB packages are both uploaded through this single
// "Container" upload type — no further sub-selection, the file just goes
// straight into the library tagged as a container package.
const UPLOAD_TYPES = [
    {
        value:       "harbor_template",
        apiType:     "harbor_template",
        label:       "Harbor",
        icon:        Server,
        description: "Harbor container registry templates",
        accept:      ".zst,.tar,.gz,.tar.gz,.zip,.rar",
        fileHint:    ".tar.zst / .tar.gz / .zip / .rar",
    },
    {
        value:       "container",
        apiType:     "container",
        label:       "Container",
        icon:        Box,
        description: "Open WebUI or Vector DB application packages",
        accept:      ".zst,.tar,.gz,.tar.gz,.zip,.rar",
        fileHint:    ".tar.zst / .tar.gz / .zip / .rar",
        needsHarbor: true,
    },
    {
        value:       "llm_model",
        apiType:     "llm_model",
        label:       "LLM Model",
        icon:        Brain,
        description: "Large language model packages",
        accept:      ".zst,.tar,.gz,.tar.gz,.gguf,.bin,.safetensors,.zip,.rar",
        fileHint:    ".gguf / .safetensors / .tar.zst / .zip / .rar",
        needsHarbor: true,
    },
    {
        value:       "llm_template",
        apiType:     "llm_template",
        label:       "LLM-Model Proxmox Template",
        icon:        HardDrive,
        description: "Proxmox VM templates pre-loaded with an LLM model",
        accept:      ".iso,.img,.qcow2,.tar,.zst,.tar.gz,.zip,.rar",
        fileHint:    ".qcow2 / .img / .tar.zst / .zip / .rar",
        needsHarbor: true,
    },
];

// Browser `accept` attributes are advisory only (drag-drop and "All Files"
// bypass them), so extensions are re-checked here before a file is accepted.
const isAllowedExtension = (fileName, accept) => {
    const exts  = accept.split(",").map((e) => e.trim().toLowerCase());
    const lower = fileName.toLowerCase();
    return exts.some((ext) => lower.endsWith(ext));
};

// .zip uploads only — other archive formats (.tar.gz, .tar.zst, .rar) aren't
// practical to parse in the browser. This reads ONLY the ZIP's central
// directory (a small index near the end of the file) plus the one entry we
// want — it never loads the whole archive into memory, which matters here
// since these are often multi-hundred-MB to multi-GB LLM model packages.
// Note: does not support Zip64 (>4GB archives / >65535 entries) — falls
// back to "error" status for those rather than misreading offsets.
const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_DIR_SIGNATURE = 0x02014b50;
const ZIP64_SENTINEL = 0xffffffff;

const readBlobBytes = async (file, start, end) =>
    new Uint8Array(await file.slice(start, end).arrayBuffer());

// Standard PKZIP/zlib CRC-32 — used to verify decompressed bytes against the
// checksum the zip itself stores, so a bad inflate is caught precisely
// instead of surfacing as a confusing downstream JSON.parse error.
let crc32Table = null;
const crc32 = (bytes) => {
    if (!crc32Table) {
        crc32Table = new Uint32Array(256);
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
            crc32Table[n] = c >>> 0;
        }
    }
    let crc = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) crc = crc32Table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
};

const findEndOfCentralDirectory = async (file) => {
    const maxCommentSize = 65535;
    const searchSize = Math.min(file.size, 22 + maxCommentSize);
    const tail = await readBlobBytes(file, file.size - searchSize, file.size);
    const view = new DataView(tail.buffer);
    for (let i = tail.length - 22; i >= 0; i--) {
        if (view.getUint32(i, true) === EOCD_SIGNATURE) {
            return {
                centralDirSize:   view.getUint32(i + 12, true),
                centralDirOffset: view.getUint32(i + 16, true),
            };
        }
    }
    return null;
};

const inflateIfNeeded = async (bytes, method) => {
    if (method === 0) return bytes; // stored, no compression
    if (method !== 8) throw new Error(`Unsupported zip compression method: ${method}`);
    if (typeof DecompressionStream === "undefined") throw new Error("Browser lacks DecompressionStream");
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
};

const readZipTextEntry = async (file, entryName) => {
    const eocd = await findEndOfCentralDirectory(file);
    if (!eocd) throw new Error("Not a valid zip (no end-of-central-directory record found)");
    if (eocd.centralDirOffset === ZIP64_SENTINEL || eocd.centralDirSize === ZIP64_SENTINEL) {
        throw new Error("Zip64 archives are not supported for browser-side metadata extraction");
    }

    const centralDir = await readBlobBytes(file, eocd.centralDirOffset, eocd.centralDirOffset + eocd.centralDirSize);
    const view = new DataView(centralDir.buffer);
    const decoder = new TextDecoder("utf-8");

    let offset = 0;
    while (offset + 46 <= centralDir.length && view.getUint32(offset, true) === CENTRAL_DIR_SIGNATURE) {
        const method           = view.getUint16(offset + 10, true);
        const expectedCrc      = view.getUint32(offset + 16, true);
        const compressedSize   = view.getUint32(offset + 20, true);
        const nameLen          = view.getUint16(offset + 28, true);
        const extraLen         = view.getUint16(offset + 30, true);
        const commentLen       = view.getUint16(offset + 32, true);
        const localHeaderOffset = view.getUint32(offset + 42, true);
        const name = decoder.decode(centralDir.slice(offset + 46, offset + 46 + nameLen));

        if (name.toLowerCase() === entryName.toLowerCase() || name.toLowerCase().endsWith(`/${entryName.toLowerCase()}`)) {
            const localHeader  = await readBlobBytes(file, localHeaderOffset, localHeaderOffset + 30);
            const localView    = new DataView(localHeader.buffer);
            const localNameLen  = localView.getUint16(26, true);
            const localExtraLen = localView.getUint16(28, true);
            const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
            const compressed = await readBlobBytes(file, dataStart, dataStart + compressedSize);
            const raw = await inflateIfNeeded(compressed, method);
            const actualCrc = crc32(raw);
            if (actualCrc !== expectedCrc) {
                throw new Error(
                    `CRC mismatch reading "${name}" — expected ${expectedCrc.toString(16)}, got ${actualCrc.toString(16)} ` +
                    `(compressedSize=${compressedSize}, method=${method}, dataStart=${dataStart}, localHeaderOffset=${localHeaderOffset})`
                );
            }
            return decoder.decode(raw);
        }

        offset += 46 + nameLen + extraLen + commentLen;
    }
    return null;
};

const extractVersionMetadata = async (file) => {
    if (!file.name.toLowerCase().endsWith(".zip")) return { metadata: null, status: "skipped" };
    try {
        const text = await readZipTextEntry(file, "version_metadata.json");
        if (!text) return { metadata: null, status: "not_found" };
        try {
            return { metadata: JSON.parse(text), status: "found" };
        } catch (parseErr) {
            // CRC passed (bytes are provably correct) but the content itself
            // isn't valid JSON — log the raw text so this is diagnosable.
            console.error("version_metadata.json extracted correctly (CRC OK) but failed to parse as JSON:", parseErr);
            console.error("Raw extracted text:", JSON.stringify(text));
            return { metadata: null, status: "error" };
        }
    } catch (err) {
        console.error("Failed to read version_metadata.json from zip:", err);
        return { metadata: null, status: "error" };
    }
};

// phase: idle | creating | streaming | done
const LibraryUpload = () => {
    const nav      = useNavigate();
    const dispatch = useDispatch();
    const token    = useSelector(selectAuthToken);
    const createLoading = useSelector(selectLibraryUploadLoading);

    const [selectedType, setSelectedType] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    // Extracted from version_metadata.json inside the uploaded .zip, if present.
    const [metadata, setMetadata] = useState(null);
    const [metadataStatus, setMetadataStatus] = useState(null); // found | not_found | error | null
    const [metadataLoading, setMetadataLoading] = useState(false);

    const [phase,        setPhase]        = useState("idle");
    const [httpProgress, setHttpProgress] = useState(0);
    const [error,        setError]        = useState("");

    // Target Harbor registry selection — only for effective types with needsHarbor
    const [harborRegistryId, setHarborRegistryId] = useState("");
    const [harbors,          setHarbors]          = useState([]);
    const [harborsLoading,   setHarborsLoading]   = useState(false);

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

    const activeType   = UPLOAD_TYPES.find((t) => t.value === selectedType);
    const needsHarbor  = !!activeType?.needsHarbor;

    // Fetch deployed Harbor registries when the type needs one
    useEffect(() => {
        if (!needsHarbor) { setHarbors([]); setHarborRegistryId(""); return; }
        setHarborsLoading(true);
        setHarborRegistryId("");
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
    }, [needsHarbor, token]);

    const resetFields = () => {
        setFile(null); setHarborRegistryId(""); setMetadata(null); setMetadataStatus(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleTypeChange = (value) => {
        setSelectedType(value);
        setDropdownOpen(false);
        setError("");
        resetFields();
    };

    const handleFileChange = async (e) => {
        const f = e.target.files[0];
        if (!f) return;
        if (activeType && !isAllowedExtension(f.name, activeType.accept)) {
            toast.error(`Invalid file type. Allowed: ${activeType.fileHint}`);
            e.target.value = "";
            return;
        }
        setFile(f);
        setError("");
        setMetadata(null);
        setMetadataStatus(null);

        if (f.name.toLowerCase().endsWith(".zip")) {
            setMetadataLoading(true);
            const { metadata: found, status } = await extractVersionMetadata(f);
            setMetadataLoading(false);
            setMetadata(found);
            setMetadataStatus(status);
        }
    };

    const isFormValid = !!(activeType && file && (!needsHarbor || harborRegistryId) && !metadataLoading);
    const isBusy       = phase === "creating" || phase === "streaming";

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (metadataLoading) { toast.error("Still reading version_metadata.json from the zip — please wait."); return; }
        if (!isFormValid) { toast.error("Please fill all required fields."); return; }

        setError("");

        // ── Phase 1: POST metadata (<100ms) ──────────────────────────────
        setPhase("creating");
        let itemId;
        try {
            const result = await dispatch(uploadLibraryThunk({
                token,
                fileName:         file.name,
                fileSize:         file.size,
                type:             activeType?.apiType || null,
                harborRegistryId: harborRegistryId || undefined,
                metadata:         metadata || undefined,
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
            toast.success(`"${file.name}" uploaded! Temporal is processing it in background.`);
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

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-2xl flex flex-col">
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
                                            {httpProgress < 100
                                                ? "Uploading file..."
                                                : "Upload complete — finishing up..."}
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

                                {/* Harbor registry selector — only for types with needsHarbor */}
                                {needsHarbor && (
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
                                            Harbor Registry <span className="text-red-500">*</span>
                                        </label>
                                        {harborsLoading ? (
                                            <div className="flex items-center gap-2 py-2 px-3 rounded border border-gray-200 bg-gray-50 text-xs text-gray-400">
                                                <Loader2 className="h-3 w-3 animate-spin" /> Loading Harbor registries...
                                            </div>
                                        ) : harbors.length === 0 ? (
                                            <div className="py-2 px-3 rounded border border-amber-200 bg-amber-50 text-xs text-amber-700">
                                                No Harbor registries deployed. Go to <strong>Settings → Harbor</strong> and deploy one first.
                                            </div>
                                        ) : (
                                            <select
                                                value={harborRegistryId}
                                                onChange={(e) => setHarborRegistryId(e.target.value)}
                                                disabled={isBusy}
                                                className="w-full rounded border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none transition-all disabled:opacity-50"
                                            >
                                                <option value="">Select a Harbor registry...</option>
                                                {harbors.map((h) => (
                                                    <option key={h.deploy_id ?? h.job_id ?? h.id} value={h.deploy_id ?? h.job_id ?? h.id}>
                                                        {h.name} — {h.harbor_url}
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

                                    {metadataLoading && (
                                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Reading version_metadata.json from zip...
                                        </div>
                                    )}
                                    {!metadataLoading && metadataStatus === "found" && (
                                        <div className="flex items-start gap-2 rounded border border-green-200 bg-green-50 px-3 py-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-[11px] text-green-800">
                                                <p className="font-semibold">version_metadata.json found</p>
                                                <p className="text-green-700">
                                                    {metadata.display_name || metadata.name}
                                                    {metadata.version ? ` — ${metadata.version}` : ""}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {!metadataLoading && metadataStatus === "not_found" && (
                                        <div className="flex items-center gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2">
                                            <AlertCircle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                                            <p className="text-[11px] text-amber-700">
                                                No version_metadata.json found inside this zip — uploading without metadata.
                                            </p>
                                        </div>
                                    )}
                                    {!metadataLoading && metadataStatus === "error" && (
                                        <div className="flex items-center gap-2 rounded border border-amber-200 bg-amber-50 px-3 py-2">
                                            <AlertCircle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                                            <p className="text-[11px] text-amber-700">
                                                Could not read this zip in the browser to extract metadata — uploading without it. (See console for details.)
                                            </p>
                                        </div>
                                    )}
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

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    UploadCloud, CheckCircle, Layers, Cpu, Loader2,
    Archive, ChevronDown, Monitor, ArrowLeft, AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { selectAuthToken } from "../../redux/features/Auth/AuthSelectors";
import { uploadLibraryThunk, fetchLibraryItemThunk } from "../../redux/features/Library/LibraryThunks";
import {
    selectLibraryUploadLoading,
    selectLibraryPollingItem,
} from "../../redux/features/Library/LibrarySelectors";
import { clearUploadResult } from "../../redux/features/Library/LibrarySlice";

const TYPE_API_MAP = {
    "base-os":       "base_os",
    "devraq-agent":  "devraq_agent",
    "open-web-ui":   "open_web_ui",
};

const UPLOAD_TYPES = [
    { value: "base-os",      label: "Base OS",       icon: Layers,  description: "Upload Base OS image (.iso / .img / .qcow2)" },
    { value: "devraq-agent", label: "Devraq Agent",  icon: Cpu,     description: "Upload Devraq Agent binary (.tar.gz / .bin)" },
    { value: "open-web-ui",  label: "Open Web UI",   icon: Monitor, description: "Upload Open Web UI package" },
];

const LibraryManagement = () => {
    const navigate  = useNavigate();
    const dispatch  = useDispatch();
    const token     = useSelector(selectAuthToken);
    const uploading = useSelector(selectLibraryUploadLoading);
    const pollingItem = useSelector(selectLibraryPollingItem);

    const [selectedType, setSelectedType] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Base OS
    const [baseOsName, setBaseOsName] = useState("");
    const [baseOsFile, setBaseOsFile] = useState(null);
    const baseOsInputRef = useRef(null);

    // Devraq Agent
    const [agentVersion, setAgentVersion] = useState("");
    const [agentFile, setAgentFile]       = useState(null);
    const agentInputRef = useRef(null);

    // Open Web UI
    const [owuiName, setOwuiName] = useState("");
    const [owuiFile, setOwuiFile] = useState(null);
    const owuiInputRef = useRef(null);

    // Upload phases
    const [httpProgress, setHttpProgress]   = useState(0);   // 0-100 while sending
    const [phase, setPhase]                 = useState("idle"); // idle | sending | polling | done | failed
    const pollTimerRef = useRef(null);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            clearTimeout(pollTimerRef.current);
            dispatch(clearUploadResult());
        };
    }, [dispatch]);

    // Watch pollingItem for status changes
    const currentItemId = pollingItem?.id;
    const pollStatus = useCallback((id) => {
        pollTimerRef.current = setTimeout(async () => {
            try {
                const item = await dispatch(fetchLibraryItemThunk({ token, id })).unwrap();
                if (item?.status === "uploading") {
                    pollStatus(id);
                } else if (item?.status === "ready") {
                    setPhase("done");
                    toast.success(`"${item.name}" uploaded and ready!`);
                    dispatch(clearUploadResult());
                    navigate("/library");
                } else {
                    setPhase("failed");
                    toast.error(`Upload failed for item #${id}.`);
                }
            } catch {
                setPhase("failed");
            }
        }, 3000);
    }, [token, dispatch, navigate]);

    useEffect(() => {
        if (phase === "polling" && currentItemId) {
            pollStatus(currentItemId);
        }
    }, [phase, currentItemId, pollStatus]);

    const resetAllFields = () => {
        setBaseOsName(""); setBaseOsFile(null);
        setAgentVersion(""); setAgentFile(null);
        setOwuiName(""); setOwuiFile(null);
        [baseOsInputRef, agentInputRef, owuiInputRef].forEach((r) => {
            if (r.current) r.current.value = "";
        });
    };

    const handleTypeChange = (value) => {
        setSelectedType(value);
        setDropdownOpen(false);
        resetAllFields();
    };

    const handleFileChange = (setter, nameSetterFn) => (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setter(file);
        nameSetterFn(file.name.split(".").slice(0, -1).join("."));
    };

    const isFormValid = () => {
        if (!selectedType) return false;
        if (selectedType === "base-os")      return !!(baseOsName && baseOsFile);
        if (selectedType === "devraq-agent") return !!(agentVersion && agentFile);
        if (selectedType === "open-web-ui")  return !!(owuiName && owuiFile);
        return false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid()) { toast.error("Please fill all required fields."); return; }

        const formData = new FormData();
        formData.append("type", TYPE_API_MAP[selectedType]);

        if (selectedType === "base-os") {
            formData.append("name", baseOsName);
            formData.append("file", baseOsFile);
        } else if (selectedType === "devraq-agent") {
            formData.append("name", "Devraq Agent");
            formData.append("version", agentVersion);
            formData.append("file", agentFile);
        } else if (selectedType === "open-web-ui") {
            formData.append("name", owuiName);
            formData.append("file", owuiFile);
        }

        setPhase("sending");
        setHttpProgress(0);

        try {
            await dispatch(uploadLibraryThunk({
                token,
                formData,
                onProgress: (pct) => setHttpProgress(pct),
            })).unwrap();
            setPhase("polling");
        } catch (err) {
            setPhase("idle");
            toast.error(typeof err === "string" ? err : err?.msg || err?.detail || "Upload failed");
        }
    };

    const handleCancel = () => {
        clearTimeout(pollTimerRef.current);
        dispatch(clearUploadResult());
        setSelectedType("");
        setPhase("idle");
        setHttpProgress(0);
        resetAllFields();
        toast.info("Upload cancelled.");
    };

    const selectedTypeConfig = UPLOAD_TYPES.find((t) => t.value === selectedType);
    const isBusy = phase === "sending" || phase === "polling";

    const FileDropZone = ({ inputRef, file, onChange, accept, icon: Icon }) => (
        <>
            <input type="file" ref={inputRef} onChange={onChange} className="hidden" accept={accept} />
            <div
                onClick={() => !isBusy && inputRef.current.click()}
                className={`border-2 border-dashed rounded bg-white p-3.5 flex items-center justify-center gap-2.5 transition-all group
                    ${isBusy ? "opacity-50 cursor-not-allowed border-gray-200" : "border-gray-300 cursor-pointer hover:bg-blue-50/20 hover:border-[#1a365d]"}`}
            >
                {file ? (
                    <>
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="text-xs font-semibold text-gray-800 truncate">{file.name}</span>
                    </>
                ) : (
                    <>
                        <Icon className="h-4 w-4 text-gray-400 group-hover:text-[#1a365d] transition-colors" />
                        <span className="text-xs text-gray-500 font-medium group-hover:text-gray-700">Click to browse or upload file</span>
                    </>
                )}
            </div>
        </>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-left flex flex-col w-full relative select-none">

            {/* Header */}
            <div className="pb-4 border-b border-gray-200 mb-6 w-full flex items-center gap-3">
                <button
                    onClick={() => navigate("/library")}
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-[#1a365d]">Library Management</h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Upload Base OS, Devraq Agent, or Open Web UI packages to the centralized repository.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-2xl overflow-hidden flex flex-col">
                <form onSubmit={handleSubmit} className="w-full flex flex-col">
                    <div className="p-6 space-y-6">

                        {/* Upload Progress Banner */}
                        {isBusy && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin flex-shrink-0" />
                                    <span className="text-sm font-semibold text-blue-800">
                                        {phase === "sending"
                                            ? `Sending file... ${httpProgress}%`
                                            : "Processing — file is being written to storage..."}
                                    </span>
                                </div>
                                {phase === "sending" && (
                                    <div className="w-full bg-blue-100 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${httpProgress}%` }}
                                        />
                                    </div>
                                )}
                                {phase === "polling" && (
                                    <p className="text-xs text-blue-600">
                                        Checking status every 3 seconds — this may take a moment for large files.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Failed Banner */}
                        {phase === "failed" && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3">
                                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                <span className="text-sm font-semibold text-red-700">Upload failed. Please try again.</span>
                            </div>
                        )}

                        {/* Type Selector */}
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
                                    {selectedTypeConfig ? (
                                        <span className="flex items-center gap-2">
                                            <selectedTypeConfig.icon className="h-4 w-4 text-[#1a365d]" />
                                            {selectedTypeConfig.label}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">Select upload type...</span>
                                    )}
                                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                        {UPLOAD_TYPES.map((type) => {
                                            const Icon = type.icon;
                                            return (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => handleTypeChange(type.value)}
                                                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors
                                                        ${selectedType === type.value ? "bg-blue-50/60" : ""}`}
                                                >
                                                    <Icon className="h-4 w-4 text-[#1a365d] mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">{type.label}</p>
                                                        <p className="text-xs text-gray-400">{type.description}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* BASE OS */}
                        {selectedType === "base-os" && (
                            <div className="bg-gray-50/50 border border-gray-200/80 rounded-xl p-5 space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                    <Layers className="h-4 w-4 text-[#1a365d]" />
                                    <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Base OS Configuration</h2>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Base OS Name *</label>
                                    <input
                                        type="text" value={baseOsName} disabled={isBusy}
                                        onChange={(e) => setBaseOsName(e.target.value)}
                                        placeholder="e.g. Ubuntu-22.04-LTS"
                                        className="w-full rounded border border-gray-300 bg-white py-2 px-3 focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none text-sm text-gray-900 transition-all disabled:opacity-50"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Upload OS Image (.iso / .img) *</label>
                                    <FileDropZone inputRef={baseOsInputRef} file={baseOsFile}
                                        onChange={handleFileChange(setBaseOsFile, (n) => !baseOsName && setBaseOsName(n))}
                                        accept=".iso,.img,.qcow2,.tar" icon={UploadCloud} />
                                </div>
                            </div>
                        )}

                        {/* DEVRAQ AGENT */}
                        {selectedType === "devraq-agent" && (
                            <div className="bg-gray-50/50 border border-gray-200/80 rounded-xl p-5 space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                    <Cpu className="h-4 w-4 text-[#1a365d]" />
                                    <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Devraq Agent Configuration</h2>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Agent Version *</label>
                                    <input
                                        type="text" value={agentVersion} disabled={isBusy}
                                        onChange={(e) => setAgentVersion(e.target.value)}
                                        placeholder="e.g. v2.4.1-stable"
                                        className="w-full rounded border border-gray-300 bg-white py-2 px-3 focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none text-sm text-gray-900 transition-all disabled:opacity-50"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Upload Agent Binary (.tar.gz / .bin) *</label>
                                    <FileDropZone inputRef={agentInputRef} file={agentFile}
                                        onChange={handleFileChange(setAgentFile, () => {})}
                                        accept=".gz,.bin,.zip,.sh" icon={Archive} />
                                </div>
                            </div>
                        )}

                        {/* OPEN WEB UI */}
                        {selectedType === "open-web-ui" && (
                            <div className="bg-gray-50/50 border border-gray-200/80 rounded-xl p-5 space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                    <Monitor className="h-4 w-4 text-[#1a365d]" />
                                    <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Open Web UI Configuration</h2>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Name *</label>
                                    <input
                                        type="text" value={owuiName} disabled={isBusy}
                                        onChange={(e) => setOwuiName(e.target.value)}
                                        placeholder="e.g. open-webui-v0.5"
                                        className="w-full rounded border border-gray-300 bg-white py-2 px-3 focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none text-sm text-gray-900 transition-all disabled:opacity-50"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Upload File *</label>
                                    <FileDropZone inputRef={owuiInputRef} file={owuiFile}
                                        onChange={handleFileChange(setOwuiFile, (n) => !owuiName && setOwuiName(n))}
                                        accept=".tar,.gz,.zip,.bin" icon={UploadCloud} />
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
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
                            disabled={uploading}
                            className="inline-flex justify-center rounded-md bg-white hover:bg-gray-100 px-5 py-2 text-xs font-bold text-gray-700 shadow-xs ring-1 ring-gray-300 transition-colors uppercase tracking-wider disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isBusy || !isFormValid()}
                            className={`inline-flex items-center gap-2 rounded-md px-5 py-2 text-xs font-bold text-white shadow-xs transition-all uppercase tracking-wider
                                ${isBusy || !isFormValid() ? "bg-[#1a365d] opacity-50 cursor-not-allowed" : "bg-[#1a365d] hover:bg-[#122744]"}`}
                        >
                            {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            <span>
                                {phase === "sending"  ? `Sending... ${httpProgress}%` :
                                 phase === "polling"  ? "Processing..." :
                                 "Sync to Library"}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LibraryManagement;

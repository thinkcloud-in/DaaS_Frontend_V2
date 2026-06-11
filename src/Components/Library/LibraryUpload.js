import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    UploadCloud,
    CheckCircle,
    Layers,
    Cpu,
    Loader2,
    Archive
} from "lucide-react";
import { toast } from "react-toastify";

const LibraryManagement = () => {
    const navigate = useNavigate();
    const [isUploading, setIsUploading] = useState(false);

    // Metadata States
    const [baseOsName, setBaseOsName] = useState("");
    const [agentVersion, setAgentVersion] = useState("");

    // File States
    const [baseOsFile, setBaseOsFile] = useState(null);
    const [devraqAgentFile, setDevraqAgentFile] = useState(null);

    // File Input Refs
    const baseOsInputRef = useRef(null);
    const agentInputRef = useRef(null);

    // File Change Handlers
    const handleBaseOsFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBaseOsFile(file);
            if (!baseOsName) {
                setBaseOsName(file.name.split('.').slice(0, -1).join('.'));
            }
        }
    };

    const handleAgentFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setDevraqAgentFile(file);
        }
    };

    // FIXED: Cancel Handler jo bina page refresh kiye saare fields ko khali (reset) karega
    const handleCancelReset = () => {
        setBaseOsName("");
        setAgentVersion("");
        setBaseOsFile(null);
        setDevraqAgentFile(null);
        
        // Input elements ki value ko bhi reset karein taaki same file dubara select ho sake
        if (baseOsInputRef.current) baseOsInputRef.current.value = "";
        if (agentInputRef.current) agentInputRef.current.value = "";
        
        toast.info("All fields have been cleared.");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!baseOsName || !agentVersion || !baseOsFile || !devraqAgentFile) {
            toast.error("Please fill all required fields and upload files.");
            return;
        }

        setIsUploading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            toast.success("Package synchronized to library successfully!");
            navigate(-1);
        } catch (error) {
            toast.error("Something went wrong during upload.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 h-auto text-left items-start flex flex-col w-full relative select-none">
            
            {/* Header Section */}
            <div className="pb-4 border-b border-gray-200 mb-6 w-full">
                <h1 className="text-xl font-bold text-[#1a365d]">Library Management</h1>
                <p className="text-xs text-gray-500 mt-0.5">Upload and synchronize Base OS packages and Devraq Agents to the centralized repository.</p>
            </div>

            {/* Main Form Container */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full max-w-2xl overflow-hidden flex flex-col">
                
                <form onSubmit={handleSubmit} className="w-full flex flex-col relative">
                    
                    {/* Form Content Area */}
                    <div className="p-6 space-y-6">
                        
                        {/* SECTION 1: Base OS Package */}
                        <div className="bg-gray-50/50 border border-gray-200/80 rounded-xl p-5 space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                <Layers className="h-4 w-4 text-[#1a365d]" />
                                <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Base OS Configuration</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex flex-col gap-1.5 text-left">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Base OS Name *</label>
                                    <input
                                        type="text"
                                        value={baseOsName}
                                        onChange={(e) => setBaseOsName(e.target.value)}
                                        placeholder="e.g. Ubuntu-22.04-LTS"
                                        className="w-full rounded border border-gray-300 bg-white py-2 px-3 focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none text-sm text-gray-900 transition-all shadow-2xs"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5 text-left">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Upload OS Image (.iso/.img) *</label>
                                    <input
                                        type="file"
                                        ref={baseOsInputRef}
                                        onChange={handleBaseOsFileChange}
                                        className="hidden"
                                        accept=".iso,.img,.qcow2,.tar"
                                    />
                                    <div 
                                        onClick={() => baseOsInputRef.current.click()}
                                        className="border-2 border-dashed border-gray-300 rounded bg-white p-3.5 flex items-center justify-center gap-2.5 cursor-pointer hover:bg-blue-50/20 hover:border-[#1a365d] transition-all group"
                                    >
                                        {baseOsFile ? (
                                            <>
                                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                <span className="text-xs font-semibold text-gray-800 truncate">{baseOsFile.name}</span>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="h-4 w-4 text-gray-400 group-hover:text-[#1a365d] transition-colors" />
                                                <span className="text-xs text-gray-500 font-medium group-hover:text-gray-700">Click to browse or upload file</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: Devraq Agent Package */}
                        <div className="bg-gray-50/50 border border-gray-200/80 rounded-xl p-5 space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                <Cpu className="h-4 w-4 text-[#1a365d]" />
                                <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Devraq Agent Configuration</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex flex-col gap-1.5 text-left">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Agent Version *</label>
                                    <input
                                        type="text"
                                        value={agentVersion}
                                        onChange={(e) => setAgentVersion(e.target.value)}
                                        placeholder="e.g. v2.4.1-stable"
                                        className="w-full rounded border border-gray-300 bg-white py-2 px-3 focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none text-sm text-gray-900 transition-all shadow-2xs"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5 text-left">
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Upload Agent Binary (.tar.gz/.bin) *</label>
                                    <input
                                        type="file"
                                        ref={agentInputRef}
                                        onChange={handleAgentFileChange}
                                        className="hidden"
                                        accept=".gz,.bin,.zip,.sh"
                                    />
                                    <div 
                                        onClick={() => agentInputRef.current.click()}
                                        className="border-2 border-dashed border-gray-300 rounded bg-white p-3.5 flex items-center justify-center gap-2.5 cursor-pointer hover:bg-blue-50/20 hover:border-[#1a365d] transition-all group"
                                    >
                                        {devraqAgentFile ? (
                                            <>
                                                <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                <span className="text-xs font-semibold text-gray-800 truncate">{devraqAgentFile.name}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Archive className="h-4 w-4 text-gray-400 group-hover:text-[#1a365d] transition-colors" />
                                                <span className="text-xs text-gray-500 font-medium group-hover:text-gray-700">Click to browse or upload file</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* BOTTOM ACTIONS STRIP */}
                    <div className="w-full bg-gray-50 border-t border-gray-200 p-4 px-6 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-lg">
                        <button
                            type="button"
                            onClick={handleCancelReset} // FIXED: Ab yeh page refresh nahi karega, sirf form clear karega
                            className="inline-flex justify-center rounded-md bg-white hover:bg-gray-100 px-5 py-2 text-xs font-bold text-gray-700 shadow-xs ring-1 ring-gray-300 transition-colors uppercase tracking-wider"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isUploading}
                            className={`inline-flex items-center gap-2 rounded-md px-5 py-2 text-xs font-bold text-white shadow-xs transition-all uppercase tracking-wider ${
                                isUploading ? "bg-[#1a365d] cursor-not-allowed opacity-80" : "bg-[#1a365d] hover:bg-[#122744]"
                            }`}
                        >
                            {isUploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            <span>{isUploading ? "Uploading..." : "Sync to Library"}</span>
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
};

export default LibraryManagement;
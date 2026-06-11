import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectAuthToken } from "../../redux/features/Auth/AuthSelectors";
import {
    ArrowPathIcon,
    PlusIcon,
    TrashIcon,
    CpuChipIcon,
    GlobeAltIcon,
    EllipsisVerticalIcon,
    XMarkIcon,
    UserPlusIcon,
    PlayIcon,
    PowerIcon,
    ArrowPathRoundedSquareIcon,
    StopIcon,
    PencilSquareIcon,
    InformationCircleIcon,
    ServerIcon,
    ComputerDesktopIcon
} from "@heroicons/react/24/outline";

const LLMInference = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token = useSelector(selectAuthToken);

    // Mock Data with nested machines/VMs list for each cluster pool
    const [inferencePools, setInferencePools] = useState([
        {
            id: "1",
            name: "Inference-Pool-Alpha",
            ip_pools: "10.100.4.0/22",
            base_os: "Ubuntu 22.04 LTS (CUDA 12.1)",
            cluster: "K8s-GPU-Cluster-01",
            model_name: "Meta-Llama-3-8B-Instruct",
            status: "Running",
            custom_model_path: "huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct",
            replicas: 2,
            endpoint_prefix: "meta-llama-3-8b-instruct",
            max_tokens: 4096,
            temperature: 0.7,
            machines: [
                { id: "m-101", name: "gpu-node-01a", hostname: "10.100.4.12", port: 22, protocol: "SSH", status: "Active" },
                { id: "m-102", name: "gpu-node-01b", hostname: "10.100.4.13", port: 22, protocol: "SSH", status: "Active" }
            ]
        },
        {
            id: "2",
            name: "Mistral-Prod-Endpoint",
            ip_pools: "10.100.8.0/22",
            base_os: "Ubuntu 20.04 LTS (CUDA 11.8)",
            cluster: "K8s-GPU-Cluster-01",
            model_name: "Mistral-7B-Instruct-v0.2",
            status: "Stopped",
            custom_model_path: "huggingface.co/mistralai/Mistral-7B-Instruct-v0.2",
            replicas: 1,
            endpoint_prefix: "mistral-7b-instruct-v0-2",
            max_tokens: 8192,
            temperature: 0.5,
            machines: [
                { id: "m-201", name: "mistral-core-01", hostname: "10.100.8.45", port: 3389, protocol: "RDP", status: "Inactive" }
            ]
        },
        {
            id: "3",
            name: "Custom-FineTuned-LLM",
            ip_pools: "172.16.20.0/24",
            base_os: "Rocky Linux 9 (CUDA 12.2)",
            cluster: "DGX-OnPrem-Cluster",
            model_name: "DeepSeek-Coder-7B",
            status: "Deploying",
            custom_model_path: "s3://my-llm-bucket/custom-llama-v3",
            replicas: 1,
            endpoint_prefix: "custom-endpoint-slug",
            max_tokens: 16384,
            temperature: 0.2,
            machines: [
                { id: "m-301", name: "dgx-node-alpha", hostname: "172.16.20.5", port: 5900, protocol: "VNC", status: "Active" }
            ]
        }
    ]);

    // UI States
    const [selectedPools, setSelectedPools] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeDropdownId, setActiveDropdownId] = useState(null);

    // Side Panel Drawer State
    const [selectedPoolForDrawer, setSelectedPoolForDrawer] = useState(null);

    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDropdownId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
        } catch (error) {
            console.error(error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedPools(inferencePools.map((item) => item.id));
        } else {
            setSelectedPools([]);
        }
    };

    const handleCheckboxClick = (e, id) => {
        e.stopPropagation();
        if (selectedPools.includes(id)) {
            setSelectedPools((prev) => prev.filter((pId) => pId !== id));
        } else {
            setSelectedPools((prev) => [...prev, id]);
        }
    };

    // Row click par naye machines page par redirect karega
    const handleRowClick = (item) => {
        navigate(`/inference/machines/${item.id}`, { state: { poolData: item } });
    };

    const toggleDropdown = (e, id) => {
        e.stopPropagation();
        setActiveDropdownId(activeDropdownId === id ? null : id);
    };

    // Details par click karne se dropdown close hoga aur purana side drawer modal khulega
    const handleDetailsClick = (e, item) => {
        e.stopPropagation();
        setActiveDropdownId(null);
        setSelectedPoolForDrawer(item);
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-left items-start flex flex-col w-full relative">
            {/* Top Action Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200 mb-6 w-full">
                <div>
                    <h1 className="text-2xl font-bold text-[#1a365d]">Private LLM Pools</h1>
                    <p className="text-xs text-gray-500 mt-1">Click on any pool row to navigate to its deployed Virtual Machines list page.</p>
                </div>

                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium shadow-sm transition-all"
                    >
                        <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                        {isRefreshing ? "Refreshing..." : "Refresh"}
                    </button>

                    <button
                        onClick={() => navigate("/inference-create")}
                        className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1a365d] text-white hover:bg-[#153056] text-sm font-medium shadow-sm transition-all"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Create Pool
                    </button>

                    {selectedPools.length > 0 && (
                        <button
                            onClick={() => console.log("Deleting:", selectedPools)}
                            className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm font-medium shadow-sm transition-all"
                        >
                            <TrashIcon className="h-4 w-4" />
                            Delete ({selectedPools.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
                <div className="overflow-x-auto max-w-full">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                            <tr className="bg-[#1a365d] text-white text-sm font-semibold select-none">
                                <th className="py-3 px-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-[#1a365d] focus:ring-[#1a365d] cursor-pointer h-4 w-4"
                                        onChange={handleSelectAll}
                                        checked={inferencePools.length > 0 && selectedPools.length === inferencePools.length}
                                    />
                                </th>
                                <th className="py-3 px-4">Name</th>
                                <th className="py-3 px-4">IP Pools</th>
                                <th className="py-3 px-4">Base OS</th>
                                <th className="py-3 px-4">Cluster</th>
                                <th className="py-3 px-4">Model Name</th>
                                <th className="py-3 px-4 text-center">Machines</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-center w-24">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                            {inferencePools.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={() => handleRowClick(item)}
                                    className={`hover:bg-blue-50/20 cursor-pointer transition-colors ${selectedPools.includes(item.id) ? "bg-blue-50/40" : ""
                                        } ${selectedPoolForDrawer?.id === item.id ? "bg-blue-50/60 font-medium" : ""}`}
                                >
                                    {/* Checkbox Column */}
                                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-[#1a365d] focus:ring-[#1a365d] cursor-pointer h-4 w-4"
                                            checked={selectedPools.includes(item.id)}
                                            onChange={(e) => handleCheckboxClick(e, item.id)}
                                        />
                                    </td>

                                    <td className="py-3.5 px-4 text-gray-900 font-semibold max-w-[180px] truncate">
                                        {item.name}
                                    </td>
                                    <td className="py-3.5 px-4 font-mono text-xs text-gray-600">
                                        {item.ip_pools}
                                    </td>
                                    <td className="py-3.5 px-4 text-gray-600 max-w-[200px] truncate">
                                        {item.base_os}
                                    </td>
                                    <td className="py-3.5 px-4 text-gray-600 max-w-[180px] truncate">
                                        {item.cluster}
                                    </td>
                                    <td className="py-3.5 px-4 text-gray-900 font-medium max-w-[220px] truncate">
                                        {item.model_name}
                                    </td>

                                    {/* Machines Count Live Badge Column */}
                                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                        <span className="inline-flex items-center justify-center bg-blue-50 border border-blue-200 text-[#1a365d] text-xs font-bold px-2.5 py-0.5 rounded-md min-w-[28px] shadow-xs">
                                            {item.machines?.length || 0}
                                        </span>
                                    </td>

                                    {/* Status Badge */}
                                    <td className="py-3.5 px-4 text-center">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.status === "Running"
                                                    ? "bg-green-100 text-green-800"
                                                    : item.status === "Deploying"
                                                        ? "bg-yellow-100 text-yellow-800 animate-pulse"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                        >
                                            <span className={`h-1.5 w-1.5 rounded-full ${item.status === "Running" ? "bg-green-500" : item.status === "Deploying" ? "bg-yellow-500" : "bg-gray-400"}`} />
                                            {item.status}
                                        </span>
                                    </td>

                                    {/* Action Column - Details click opens the side panel model */}
                                    <td className="py-3.5 px-4 text-center relative" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={(e) => toggleDropdown(e, item.id)}
                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors inline-flex text-gray-500"
                                        >
                                            <EllipsisVerticalIcon className="h-5 w-5" />
                                        </button>

                                        {activeDropdownId === item.id && (
                                            <div
                                                ref={dropdownRef}
                                                className="absolute right-4 mt-1 w-36 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 border border-gray-100 text-left divide-y divide-gray-100"
                                            >
                                                <div className="py-1">
                                                    <button
                                                        onClick={(e) => handleDetailsClick(e, item)}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 gap-2 font-medium"
                                                    >
                                                        <InformationCircleIcon className="h-4 w-4 text-blue-500" />
                                                        Details
                                                    </button>
                                                </div>
                                                <div className="py-1">
                                                    <button onClick={() => navigate("/inference-edit")} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 gap-2 font-medium">
                                                        <PencilSquareIcon className="h-4 w-4 text-gray-400" />
                                                        Edit
                                                    </button>
                                                </div>
                                                <div className="py-1">
                                                    <button onClick={() => setActiveDropdownId(null)} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 gap-2 font-medium">
                                                        <TrashIcon className="h-4 w-4 text-red-400" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Side Drawer Modal Restored (Details click handler renders this UI panel block seamlessly) */}
            {selectedPoolForDrawer && (
                <>
                    {/* Backdrop Overlay - z-[90] */}
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-[90]" onClick={() => setSelectedPoolForDrawer(null)} />

                    {/* Main Side Drawer Container - z-[100] */}
                    <div className="fixed top-0 bottom-0 right-0 max-w-xl w-full bg-white shadow-2xl z-[100] flex flex-col justify-between border-l border-gray-200 h-full">

                        {/* Drawer Header & Scrolled Content Area */}
                        <div className="overflow-y-auto flex-1 p-6 custom-scrollbar text-left">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-5">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#1a365d] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded">
                                        Pool Details View
                                    </span>
                                    <h2 className="text-xl font-bold text-gray-900 mt-2">
                                        {selectedPoolForDrawer.name}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setSelectedPoolForDrawer(null)}
                                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Section 1: Read-Only Configurations Meta-Grid */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-2 gap-x-4 gap-y-3 text-xs shadow-xs">
                                <div>
                                    <span className="text-gray-400 font-semibold block uppercase tracking-wide">Model Architecture</span>
                                    <span className="text-gray-900 font-medium text-sm block mt-0.5">{selectedPoolForDrawer.model_name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-semibold block uppercase tracking-wide">Target Cluster Node</span>
                                    <span className="text-gray-900 font-medium text-sm block mt-0.5">{selectedPoolForDrawer.cluster}</span>
                                </div>
                                <div className="border-t border-gray-200/60 pt-2 col-span-2"></div>
                                <div>
                                    <span className="text-gray-400 font-semibold block uppercase tracking-wide">IP Routing Pool</span>
                                    <span className="text-gray-700 font-mono block mt-0.5 font-semibold">{selectedPoolForDrawer.ip_pools}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-semibold block uppercase tracking-wide">Scale Replicas</span>
                                    <span className="text-gray-900 block font-bold mt-0.5">{selectedPoolForDrawer.replicas} Target Instance(s)</span>
                                </div>
                                <div className="border-t border-gray-200/60 pt-2 col-span-2"></div>
                                <div className="col-span-2">
                                    <span className="text-gray-400 font-semibold block uppercase tracking-wide">Model Registry/S3 Storage Path</span>
                                    <span className="text-gray-800 font-mono block text-[11px] mt-0.5 bg-white p-1.5 rounded border border-gray-200 break-all">
                                        {selectedPoolForDrawer.custom_model_path || "Default Hub Path"}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200/60 pt-2 col-span-2"></div>
                                <div>
                                    <span className="text-gray-400 font-semibold block uppercase tracking-wide">Max Tokens</span>
                                    <span className="text-gray-800 font-mono font-medium block mt-0.5">{selectedPoolForDrawer.max_tokens}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-semibold block uppercase tracking-wide">Temperature</span>
                                    <span className="text-gray-800 font-mono font-medium block mt-0.5">{selectedPoolForDrawer.temperature}</span>
                                </div>
                            </div>

                            {/* Section 2: Virtual Machines Sub-table Inside Drawer */}
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <ServerIcon className="h-5 w-5 text-[#1a365d]" />
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                            Virtual Machines ({selectedPoolForDrawer.machines?.length || 0})
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => console.log("Trigger Add Machine Popover for pool:", selectedPoolForDrawer.id)}
                                        className="text-xs bg-[#1a365d] hover:bg-[#153056] text-white py-1 px-2.5 rounded font-semibold shadow-xs flex items-center gap-1 transition-all"
                                    >
                                        <PlusIcon className="h-3.5 w-3.5" />
                                        Add Machine
                                    </button>
                                </div>

                                <div className="border border-gray-200 rounded-md overflow-hidden bg-white shadow-xs">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
                                                <th className="p-2.5">VM Name</th>
                                                <th className="p-2.5">Hostname</th>
                                                <th className="p-2.5 text-center">Port/Protocol</th>
                                                <th className="p-2.5 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 text-gray-700">
                                            {selectedPoolForDrawer.machines && selectedPoolForDrawer.machines.length > 0 ? (
                                                selectedPoolForDrawer.machines.map((machine) => (
                                                    <tr key={machine.id} className="hover:bg-gray-50/60">
                                                        <td className="p-2.5 font-semibold text-gray-900 flex items-center gap-1.5">
                                                            <ComputerDesktopIcon className="h-3.5 w-3.5 text-gray-400" />
                                                            {machine.name}
                                                        </td>
                                                        <td className="p-2.5 font-mono text-gray-600">{machine.hostname}</td>
                                                        <td className="p-2.5 text-center">
                                                            <span className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded font-mono text-[10px]">
                                                                {machine.port} / {machine.protocol}
                                                            </span>
                                                        </td>
                                                        <td className="p-2.5 text-center">
                                                            <span className={`inline-block h-2 w-2 rounded-full mr-1.5 ${machine.status === "Active" ? "bg-green-500" : "bg-gray-400"}`} />
                                                            <span className="font-medium">{machine.status}</span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="p-4 text-center text-gray-400 italic">
                                                        No virtual machines attached to this cluster configuration.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>

                        {/* Bottom Power Actions Strip */}
                        <div className="p-4 bg-gray-50 border-t border-gray-200 grid grid-cols-4 gap-2">
                            <button
                                onClick={() => console.log("Starting:", selectedPoolForDrawer.id)}
                                className="flex flex-col items-center justify-center p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-green-700 hover:bg-green-50 hover:border-green-300 shadow-xs gap-1.5 transition-all"
                            >
                                <PlayIcon className="h-4 w-4 text-green-600" />
                                Start
                            </button>

                            <button
                                onClick={() => console.log("Shutting down:", selectedPoolForDrawer.id)}
                                className="flex flex-col items-center justify-center p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-red-700 hover:bg-red-50 hover:border-red-300 shadow-xs gap-1.5 transition-all"
                            >
                                <PowerIcon className="h-4 w-4 text-red-600" />
                                Shutdown
                            </button>

                            <button
                                onClick={() => console.log("Restarting:", selectedPoolForDrawer.id)}
                                className="flex flex-col items-center justify-center p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-amber-700 hover:bg-amber-50 hover:border-amber-300 shadow-xs gap-1.5 transition-all"
                            >
                                <ArrowPathRoundedSquareIcon className="h-4 w-4 text-amber-600" />
                                Restart
                            </button>

                            <button
                                onClick={() => console.log("Stopping:", selectedPoolForDrawer.id)}
                                className="flex flex-col items-center justify-center p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:border-gray-400 shadow-xs gap-1.5 transition-all"
                            >
                                <StopIcon className="h-4 w-4 text-gray-600" />
                                Stop
                            </button>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
};

export default LLMInference;
import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeftIcon,
    PlusIcon,
    ArrowPathIcon,
    EllipsisVerticalIcon,
    XMarkIcon,
    ComputerDesktopIcon,
    CpuChipIcon,
    ListBulletIcon,
    ArrowsRightLeftIcon,
    CommandLineIcon
} from "@heroicons/react/24/outline";

const LLMInferenceMachines = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Redirection se aane wala data extract karein ya phir fallback data use karein
    const pool = location.state?.poolData || {
        name: "lucky_test_pool",
        machines: [
            { id: "m-101", name: "test", protocol: "RDP", port: 3389, ip_address: "172.16.0.34", entitle: "—", custom_settings: "Disabled", status: "Active" },
            { id: "m-102", name: "gpu-node-core", protocol: "SSH", port: 22, ip_address: "172.16.0.85", entitle: "—", custom_settings: "Enabled", status: "Active" }
        ]
    };

    // UI States
    const [machinesList, setMachinesList] = useState(pool.machines || []);
    const [activeDropdownId, setActiveDropdownId] = useState(null);

    // Side Modal Drawer State
    const [selectedMachineForDrawer, setSelectedMachineForDrawer] = useState(null);

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

    const toggleDropdown = (e, id) => {
        e.stopPropagation();
        setActiveDropdownId(activeDropdownId === id ? null : id);
    };

    const handleRowClick = (machine) => {
        setSelectedMachineForDrawer(machine); // Row par click karte hi side drawer modal open hoga
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-left items-start flex flex-col w-full relative select-none">

            {/* TOP ACTIONS BAR */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 w-full flex flex-col sm:flex-row items-center justify-between shadow-sm mb-6 gap-4">
                {/* Left Side: Back Arrow and Pool Title */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-[#4a5568]/10 hover:bg-[#4a5568]/20 rounded-md transition-colors text-[#2d3748]"
                    >
                        <ArrowLeftIcon className="h-5 w-5 stroke-[2.5]" />
                    </button>
                    <div className="flex items-center gap-2 text-sm sm:text-base">
                        <span className="text-gray-500 font-medium">Pool Name:</span>
                        <span className="text-gray-800 font-bold">{pool.name}</span>
                    </div>
                </div>

                {/* Right Side Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
                    {/* <button className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#2b4c7e] text-white hover:bg-[#1f3a63] text-xs font-semibold shadow-sm transition-all">
                        <PlusIcon className="h-4 w-4 stroke-[2.5]" />
                        Add Machine
                    </button>
                    <button className="px-4 py-2 rounded bg-[#2b4c7e] text-white hover:bg-[#1f3a63] text-xs font-semibold shadow-sm transition-all">
                        Entitle
                    </button>
                    <button className="px-4 py-2 rounded bg-[#2b4c7e] text-white hover:bg-[#1f3a63] text-xs font-semibold shadow-sm transition-all">
                        Edit Pool
                    </button> */}
                    <button className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-xs font-semibold shadow-sm transition-all">
                        Delete Pool
                    </button>
                    <button className="p-2 border border-gray-300 rounded bg-white text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
                        <ArrowPathIcon className="h-4 w-4 stroke-[2.5]" />
                    </button>
                </div>
            </div>

            {/* MAIN DATA TABLE GRID (Faltu scroll hatane ke liye flex-1 ko h-auto kiya hai) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full h-auto mb-6">
                <div className="overflow-x-auto max-w-full">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            {/* Header size text-[11px] se bada karke text-xs kar diya hai */}
                            <tr className="bg-blue-50/50 border-b border-gray-200 text-gray-500 text-xs font-bold tracking-wider uppercase select-none">
                                <th className="py-3.5 px-6 w-1/5">Name</th>
                                <th className="py-3.5 px-4 w-1/6">Protocol</th>
                                <th className="py-3.5 px-4 w-1/6">Port</th>
                                <th className="py-3.5 px-4 w-1/5">IP Address</th>
                                <th className="py-3.5 px-4 w-1/6">Entitle</th>
                                <th className="py-3.5 px-4 w-1/6">Custom Settings</th>
                                <th className="py-3.5 px-6 w-20 text-center">Actions</th>
                            </tr>
                        </thead>

                        {/* Body text size text-xs se bada karke text-sm kar diya hai */}
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700 font-medium创作">
                            {machinesList.map((machine) => (
                                <tr
                                    key={machine.id}
                                    onClick={() => handleRowClick(machine)}
                                    className={`hover:bg-blue-50/10 cursor-pointer transition-colors ${selectedMachineForDrawer?.id === machine.id ? "bg-blue-50/40" : ""
                                        }`}
                                >
                                    <td className="py-4 px-6 text-gray-900 font-semibold">
                                        {machine.name}
                                    </td>
                                    <td className="py-4 px-4 text-gray-600">
                                        {machine.protocol}
                                    </td>
                                    <td className="py-4 px-4 text-gray-600 font-mono">
                                        {machine.port}
                                    </td>
                                    <td className="py-4 px-4 text-gray-600 font-mono">
                                        {machine.ip_address || machine.hostname}
                                    </td>
                                    <td className="py-4 px-4 text-gray-400 font-bold">
                                        {machine.entitle || "—"}
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`font-bold ${machine.custom_settings === "Disabled" ? "text-red-500" : "text-green-600"}`}>
                                            {machine.custom_settings}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center relative" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={(e) => toggleDropdown(e, machine.id)}
                                            className="p-1 hover:bg-gray-100 rounded-full text-gray-700 transition-colors inline-flex"
                                        >
                                            <EllipsisVerticalIcon className="h-5 w-5 stroke-[2.5]" />
                                        </button>

                                        {activeDropdownId === machine.id && (
                                            <div
                                                ref={dropdownRef}
                                                className="absolute right-6 mt-1 w-36 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 border border-gray-100 text-left py-1 text-sm font-semibold text-gray-700"
                                            >
                                                <button
                                                    onClick={() => { setSelectedMachineForDrawer(machine); setActiveDropdownId(null); }}
                                                    className="w-full px-4 py-2 hover:bg-gray-50 block"
                                                >
                                                    View Metrics
                                                </button>
                                                <button onClick={() => setActiveDropdownId(null)} className="w-full px-4 py-2 hover:bg-gray-50 block text-red-600">
                                                    Disconnect
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SIDE MODAL DRAWER */}
            {selectedMachineForDrawer && (
                <>
                    {/* Backdrop Overlay */}
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-xs z-[90]" onClick={() => setSelectedMachineForDrawer(null)} />

                    {/* Main Side Drawer Container */}
                    <div className="fixed top-0 bottom-0 right-0 max-w-md w-full bg-white shadow-2xl z-[100] flex flex-col justify-between border-l border-gray-200 h-full animate-in slide-in-from-right duration-200">

                        <div className="overflow-y-auto flex-1 p-6 text-left">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-5">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                                        Instance Inspector
                                    </span>
                                    <h2 className="text-lg font-bold text-gray-900 mt-1.5 flex items-center gap-1.5">
                                        <ComputerDesktopIcon className="h-5 w-5 text-[#2b4c7e]" />
                                        {selectedMachineForDrawer.name}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setSelectedMachineForDrawer(null)}
                                    className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <XMarkIcon className="h-5 w-5 stroke-[2.5]" />
                                </button>
                            </div>

                            {/* Section 1: Core Networking Info Block */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5 grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                                <div>
                                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wide">Protocol Stack</span>
                                    <span className="text-gray-900 font-bold block mt-0.5">{selectedMachineForDrawer.protocol} Tunnel</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wide">Target Port</span>
                                    <span className="text-gray-800 font-mono font-bold block mt-0.5 bg-white border border-gray-200 px-1.5 py-0.5 rounded w-max">
                                        {selectedMachineForDrawer.port}
                                    </span>
                                </div>
                                <div className="col-span-2 border-t border-gray-200/60 pt-2">
                                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wide">Endpoint Private IP Address</span>
                                    <span className="text-gray-900 font-mono font-bold block mt-0.5 tracking-tight">{selectedMachineForDrawer.ip_address}</span>
                                </div>
                            </div>

                            {/* Section 2: Resource Vitals Mock Metrics */}
                            <div className="mt-6 border-t border-gray-100 pt-5">
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <CpuChipIcon className="h-4 w-4 text-gray-500" />
                                    Live Node Utilization
                                </h3>

                                <div className="space-y-3 text-sm">
                                    <div>
                                        <div className="flex justify-between font-semibold text-gray-600 mb-1">
                                            <span>Virtual CPU Cores</span>
                                            <span className="text-gray-900">42%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-blue-600 h-full rounded-full" style={{ width: "42%" }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between font-semibold text-gray-600 mb-1">
                                            <span>vRAM Allocation</span>
                                            <span className="text-gray-900">78%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div className="bg-amber-500 h-full rounded-full" style={{ width: "78%" }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Connection logs placeholder */}
                            <div className="mt-6 border-t border-gray-100 pt-5">
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <CommandLineIcon className="h-4 w-4 text-gray-500" />
                                    Active Stream Activity
                                </h3>
                                <div className="bg-[#1e293b] rounded p-3 font-mono text-[11px] text-green-400 space-y-1 h-32 overflow-y-auto">
                                    <p>[info] Initializing handshake via {selectedMachineForDrawer.protocol}...</p>
                                    <p>[info] Connected securely to tunnel endpoint {selectedMachineForDrawer.ip_address}.</p>
                                    <p className="text-gray-400">[debug] Custom configuration state: {selectedMachineForDrawer.custom_settings}</p>
                                    <p>[success] Telemetry sync stream is active and operational.</p>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Actions Footer */}
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                            <button
                                onClick={() => setSelectedMachineForDrawer(null)}
                                className="w-full py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors shadow-sm"
                            >
                                Terminate Remote Session
                            </button>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
};

export default LLMInferenceMachines;
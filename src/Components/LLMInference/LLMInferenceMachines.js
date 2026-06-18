import React, { useState, useEffect, useRef, useContext } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { selectAuthToken, selectAuthTokenParsed } from "../../redux/features/Auth/AuthSelectors";
import { fetchPrivateLLMByIdThunk, deletePrivateLLMThunk, privateLLMPoolActionThunk } from "../../redux/features/Pools/PoolsThunks";
import { clearPrivateLLMDetail } from "../../redux/features/Pools/PoolsSlice";
import { fetchFooterTasksThunk } from "../../redux/features/Footer/FooterThunks";
import { fetchTotpStatusThunk } from "../../redux/features/TOTP/TotpThunks";
import { selectTotpAdminEnabled } from "../../redux/features/TOTP/TotpSelectors";
import { GrafanaToolbarContext } from "../../Context/GrafanaToolbarContext";
import TotpVerifyModal from "./TotpVerifyModal";
import TimeRangeSelector from "../Dashboard/TimeRangeSelector";
import AutoRefresh from "../Dashboard/AutoRefresh";
import {
    selectPrivateLLMDetail,
    selectPrivateLLMDetailLoading,
} from "../../redux/features/Pools/PoolsSelectors";
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    XMarkIcon,
    ComputerDesktopIcon,
    CpuChipIcon,
    CommandLineIcon,
    TrashIcon,
    ServerIcon,
    ExclamationTriangleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChartBarIcon,
    PlayIcon,
    PowerIcon,
    ArrowPathRoundedSquareIcon,
    StopIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline";

const MACHINE_STATUS_CONFIG = {
    running:  { label: "Running",  dot: "bg-green-500",  badge: "bg-green-100 text-green-800"  },
    stopped:  { label: "Stopped",  dot: "bg-red-500",    badge: "bg-red-100 text-red-800"      },
    paused:   { label: "Paused",   dot: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-800" },
};
const getMachineStatus = (status) =>
    MACHINE_STATUS_CONFIG[status?.toLowerCase()] || { label: status || "Unknown", dot: "bg-gray-400", badge: "bg-gray-100 text-gray-600" };

const ROLE_BADGE = {
    head:   "bg-blue-100 text-blue-800 border-blue-200",
    worker: "bg-purple-100 text-purple-800 border-purple-200",
};

const LLMInferenceMachines = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id: paramId } = useParams();
    const dispatch = useDispatch();
    const token       = useSelector(selectAuthToken);
    const tokenParsed = useSelector(selectAuthTokenParsed);
    const userName    = tokenParsed?.preferred_username;

    const poolDetail      = useSelector(selectPrivateLLMDetail);
    const detailLoading   = useSelector(selectPrivateLLMDetailLoading);
    const totpAdminEnabled = useSelector(selectTotpAdminEnabled);
    const gc            = useContext(GrafanaToolbarContext);
    const grafanaBase   = "https://devraq.dev.team/grafana" //`${window.location.origin}/grafana`;

    const passedPool = location.state?.poolData;
    const poolId = paramId || passedPool?.id;

    const [selectedMachineForDrawer, setSelectedMachineForDrawer] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showTotpVerify, setShowTotpVerify] = useState(false);
    const [machinePage, setMachinePage] = useState(1);
    const [showActionDropdown, setShowActionDropdown] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    const MACHINE_PAGE_SIZE = 5;
    const actionDropdownRef = useRef(null);

    // Derive machines synchronously from Redux state — no setState timing gap
    const machines = React.useMemo(() => {
        if (!poolDetail) return [];
        const raw = poolDetail.machines ?? poolDetail.vms ?? [];
        return Array.isArray(raw) ? raw.filter(Boolean) : [];
    }, [poolDetail]);

    // Fetch on mount — clear stale data, reset page, load TOTP status
    useEffect(() => {
        dispatch(clearPrivateLLMDetail());
        setMachinePage(1);
        if (token && poolId) dispatch(fetchPrivateLLMByIdThunk({ token, id: poolId }));
        if (token) dispatch(fetchTotpStatusThunk(token));
    }, [token, poolId, dispatch]);

    // Reset to page 1 whenever machines list changes
    useEffect(() => {
        setMachinePage(1);
    }, [machines.length]);

    useEffect(() => {
        const handleOutside = (e) => {
            if (actionDropdownRef.current && !actionDropdownRef.current.contains(e.target))
                setShowActionDropdown(false);
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    const handleRefresh = () => {
        if (token && poolId) dispatch(fetchPrivateLLMByIdThunk({ token, id: poolId }));
    };

    const handlePoolAction = async (action) => {
        setShowActionDropdown(false);
        setActionLoading(action);
        dispatch(fetchFooterTasksThunk(userName));
        try {
            await dispatch(privateLLMPoolActionThunk({ token, id: poolId, action })).unwrap();
            toast.success(`Pool ${action} initiated successfully`);
            handleRefresh();
        } catch (err) {
            toast.error(typeof err === "string" ? err : err?.detail || err?.message || `Failed to ${action} pool`);
        } finally {
            setActionLoading(null);
            setTimeout(() => dispatch(fetchFooterTasksThunk(userName)), 2000);
        }
    };

    // Core delete execution — totpCode passed only when TOTP is enabled
    const executePoolDelete = (totpCode = null) => {
        const poolName = pool.name;
        dispatch(deletePrivateLLMThunk({ token, id: poolId, totpCode }))
            .unwrap()
            .then(() => {
                toast.success(`Pool "${poolName}" deleted successfully`);
                setTimeout(() => dispatch(fetchFooterTasksThunk(userName)), 1500);
                navigate(-1);
            })
            .catch((err) => {
                toast.error(typeof err === "string" ? err : err?.detail || err?.message || "Failed to delete pool");
            });
    };

    // User confirms delete — check TOTP status first
    const handleDeleteConfirmed = () => {
        setShowDeleteConfirm(false);
        if (totpAdminEnabled === true) {
            setShowTotpVerify(true);
        } else {
            executePoolDelete();
        }
    };

    // Called after user enters OTP — code is passed directly to delete API
    const handleTotpVerified = (totpCode) => {
        setShowTotpVerify(false);
        executePoolDelete(totpCode);
    };

    const grafanaIframeSrc =
        `${grafanaBase}/d/dcfca114-136e-4213-b86f-75152b7865b6/gpu-per-gpu-matrix` +
        `?orgId=1` +
        `&from=${gc.timeStamp.startDate}` +
        `&to=${gc.timeStamp.endDate}` +
        `&theme=light` +
        `&kiosk`;

    const pool = poolDetail || passedPool || {};
    const totalMachinePages = Math.max(1, Math.ceil(machines.length / MACHINE_PAGE_SIZE));
    const paginatedMachines = machines.slice((machinePage - 1) * MACHINE_PAGE_SIZE, machinePage * MACHINE_PAGE_SIZE);

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-left items-start flex flex-col w-full relative select-none">

            {/* TOP ACTIONS BAR */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 w-full flex flex-col sm:flex-row items-center justify-between shadow-sm mb-6 gap-4 shrink-0">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-700"
                    >
                        <ArrowLeftIcon className="h-5 w-5 stroke-[2.5]" />
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500 font-medium">Pool:</span>
                            <span className="text-gray-900 font-bold">{pool.name || "—"}</span>
                            {pool.status && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    pool.status === "vms_ready" ? "bg-green-100 text-green-700 border-green-200" :
                                    pool.status === "provisioning" ? "bg-yellow-100 text-yellow-700 border-yellow-200 animate-pulse" :
                                    "bg-gray-100 text-gray-600 border-gray-200"
                                }`}>
                                    {pool.status === "vms_ready" ? "VMs Ready" : pool.status}
                                </span>
                            )}
                        </div>
                        {pool.head_ip && (
                            <span className="text-xs text-gray-400 font-mono mt-0.5">Head IP: {pool.head_ip}</span>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
                    {/* Action Dropdown */}
                    <div className="relative" ref={actionDropdownRef}>
                        <button
                            onClick={() => setShowActionDropdown((v) => !v)}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#1a365d] text-white hover:bg-[#153056] text-xs font-semibold shadow-sm transition-all disabled:opacity-60"
                        >
                            {actionLoading
                                ? <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                : <ChevronDownIcon className="h-4 w-4" />
                            }
                            {actionLoading ? `${actionLoading.charAt(0).toUpperCase() + actionLoading.slice(1)}ing...` : "Action"}
                        </button>

                        {showActionDropdown && (
                            <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                                <div className="py-1">
                                    {[
                                        { action: "start",    label: "Start",    Icon: PlayIcon,                   cls: "text-green-700 hover:bg-green-50" },
                                        { action: "stop",     label: "Stop",     Icon: StopIcon,                   cls: "text-gray-700 hover:bg-gray-50"  },
                                        { action: "shutdown", label: "Shutdown", Icon: PowerIcon,                  cls: "text-red-600 hover:bg-red-50"    },
                                        { action: "restart",  label: "Restart",  Icon: ArrowPathRoundedSquareIcon, cls: "text-amber-700 hover:bg-amber-50" },
                                    ].map(({ action, label, Icon, cls }) => (
                                        <button
                                            key={action}
                                            onClick={() => handlePoolAction(action)}
                                            className={`flex items-center w-full px-4 py-2.5 text-sm font-medium gap-3 transition-colors ${cls}`}
                                        >
                                            <Icon className="h-4 w-4 flex-shrink-0" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-xs font-semibold shadow-sm transition-all"
                    >
                        <TrashIcon className="h-4 w-4" />
                        Delete Pool
                    </button>
                    <button
                        onClick={handleRefresh}
                        disabled={detailLoading}
                        className="p-2 border border-gray-300 rounded bg-white text-gray-600 hover:bg-gray-50 shadow-sm transition-all disabled:opacity-60"
                        title="Refresh"
                    >
                        <ArrowPathIcon className={`h-4 w-4 stroke-[2.5] ${detailLoading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* MACHINES TABLE */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full mb-6 shrink-0">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <ServerIcon className="h-4 w-4 text-[#1a365d]" />
                        Virtual Machines
                        <span className="ml-1 bg-blue-50 border border-blue-200 text-[#1a365d] text-xs font-bold px-2 py-0.5 rounded">
                            {machines.length}
                        </span>
                    </h2>
                </div>

                <div className="overflow-x-auto max-w-full">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-[#1a365d] text-white text-xs font-semibold uppercase tracking-wider select-none">
                                <th className="py-3 px-5">VM ID</th>
                                <th className="py-3 px-4">IP Address</th>
                                <th className="py-3 px-4">Protocol</th>
                                <th className="py-3 px-4 text-center">Port</th>
                                <th className="py-3 px-4">Node</th>
                                <th className="py-3 px-4">GPU(s)</th>
                                <th className="py-3 px-4 text-center">Role</th>
                                <th className="py-3 px-4 text-center">Status</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {detailLoading ? (
                                <tr>
                                    <td colSpan="8" className="py-12 text-center text-gray-400">
                                        <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Loading machines...
                                    </td>
                                </tr>
                            ) : machines.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-12 text-center text-gray-400">
                                        No machines found in this pool.
                                    </td>
                                </tr>
                            ) : (
                                paginatedMachines.map((machine, idx) => {
                                    if (!machine || typeof machine !== "object") return null;
                                    const gpuList = Array.isArray(machine.gpu)
                                        ? machine.gpu
                                        : machine.gpu
                                            ? [String(machine.gpu)]
                                            : [];
                                    const sc = getMachineStatus(machine.status);
                                    const roleCls = ROLE_BADGE[machine.role?.toLowerCase()] || "bg-gray-100 text-gray-600 border-gray-200";
                                    return (
                                        <tr
                                            key={machine.vm_id ?? machine.id ?? idx}
                                            onClick={() => setSelectedMachineForDrawer(machine)}
                                            className={`hover:bg-blue-50/20 cursor-pointer transition-colors ${
                                                selectedMachineForDrawer?.vm_id === machine.vm_id ? "bg-blue-50/40" : ""
                                            }`}
                                        >
                                            <td className="py-3.5 px-5 text-gray-900 font-mono font-semibold">
                                                #{machine.vm_id ?? machine.id ?? idx + 1}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-xs text-gray-700">
                                                {machine.ip_address || machine.hostname || machine.ip || "-"}
                                            </td>
                                            <td className="py-3.5 px-4 uppercase text-gray-600 font-semibold text-xs">
                                                {machine.protocol || "-"}
                                            </td>
                                            <td className="py-3.5 px-4 text-center font-mono text-gray-600">
                                                {machine.port ?? "-"}
                                            </td>
                                            <td className="py-3.5 px-4 text-gray-600">
                                                {machine.node || "-"}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {gpuList.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {gpuList.map((g, i) => (
                                                            <span key={i} className="text-[10px] font-mono bg-violet-50 border border-violet-200 text-violet-700 px-1.5 py-0.5 rounded">
                                                                {g}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {machine.role ? (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${roleCls}`}>
                                                        {machine.role}
                                                    </span>
                                                ) : "-"}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                {machine.status ? (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${sc.badge}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                                                        {sc.label}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Machine Pagination */}
                {machines.length > MACHINE_PAGE_SIZE && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                        <span className="text-xs text-gray-500">
                            Showing{" "}
                            <span className="font-semibold text-gray-700">
                                {(machinePage - 1) * MACHINE_PAGE_SIZE + 1}–{Math.min(machinePage * MACHINE_PAGE_SIZE, machines.length)}
                            </span>{" "}
                            of <span className="font-semibold text-gray-700">{machines.length}</span> machines
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setMachinePage((p) => Math.max(1, p - 1))}
                                disabled={machinePage === 1}
                                className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeftIcon className="h-4 w-4" />
                            </button>
                            {Array.from({ length: totalMachinePages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setMachinePage(p)}
                                    className={`min-w-[32px] h-8 px-2 rounded-md text-xs font-medium border transition-colors
                                        ${machinePage === p
                                            ? "bg-[#1a365d] text-white border-[#1a365d] shadow-sm"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                onClick={() => setMachinePage((p) => Math.min(totalMachinePages, p + 1))}
                                disabled={machinePage === totalMachinePages}
                                className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRightIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* GRAFANA DASHBOARD */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full mb-6 shrink-0">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                    <ChartBarIcon className="h-4 w-4 text-[#1a365d]" />
                    <h2 className="text-sm font-bold text-gray-800">GPU Per-GPU Matrix</h2>
                </div>
                <div style={{ width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "center", height: "50px", margin: "0 20px", gap: "10px" }}>
                    <TimeRangeSelector />
                    <AutoRefresh />
                </div>
                <iframe
                    title="gpu-per-gpu-matrix"
                    src={grafanaIframeSrc}
                    width="100%"
                    height="450"
                    style={{ border: "none", backgroundColor: "white" }}
                />
            </div>

            {/* DELETE CONFIRMATION MODAL */}
            {showDeleteConfirm && (
                <>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]" onClick={() => setShowDeleteConfirm(false)} />
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900">Delete Pool</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Are you sure you want to delete pool{" "}
                                            <span className="font-semibold text-gray-800">"{pool.name}"</span>?
                                            This action cannot be undone and all associated VMs will be removed.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 pb-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirmed}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* TOTP Verification Modal */}
            {showTotpVerify && (
                <TotpVerifyModal
                    token={token}
                    actionLabel={`delete pool "${pool.name || poolId}"`}
                    onSuccess={handleTotpVerified}
                    onCancel={() => setShowTotpVerify(false)}
                />
            )}

            {/* SIDE DRAWER */}
            {selectedMachineForDrawer && (
                <>
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-xs z-[90]" onClick={() => setSelectedMachineForDrawer(null)} />

                    <div className="fixed top-0 bottom-0 right-0 max-w-md w-full bg-white shadow-2xl z-[100] flex flex-col justify-between border-l border-gray-200 h-full">

                        <div className="overflow-y-auto flex-1 p-6 text-left">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-5">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1a365d] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                                        Machine Details
                                    </span>
                                    <h2 className="text-lg font-bold text-gray-900 mt-1.5 flex items-center gap-1.5">
                                        <ComputerDesktopIcon className="h-5 w-5 text-[#1a365d]" />
                                        VM #{selectedMachineForDrawer.vm_id}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setSelectedMachineForDrawer(null)}
                                    className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <XMarkIcon className="h-5 w-5 stroke-[2.5]" />
                                </button>
                            </div>

                            {/* Core Info */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5 grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                                <div>
                                    <span className="text-gray-400 font-semibold uppercase tracking-wide block">VM ID</span>
                                    <span className="text-gray-900 font-mono font-bold text-sm block mt-0.5">#{selectedMachineForDrawer.vm_id}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-semibold uppercase tracking-wide block">Role</span>
                                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize mt-0.5 ${ROLE_BADGE[selectedMachineForDrawer.role?.toLowerCase()] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                                        {selectedMachineForDrawer.role || "-"}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200/60 pt-2 col-span-2" />
                                <div>
                                    <span className="text-gray-400 font-semibold uppercase tracking-wide block">Protocol</span>
                                    <span className="text-gray-900 font-semibold uppercase block mt-0.5">{selectedMachineForDrawer.protocol || "-"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-semibold uppercase tracking-wide block">Port</span>
                                    <span className="text-gray-900 font-mono font-bold block mt-0.5 bg-white border border-gray-200 px-1.5 py-0.5 rounded w-max">
                                        {selectedMachineForDrawer.port ?? "-"}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200/60 pt-2 col-span-2" />
                                <div className="col-span-2">
                                    <span className="text-gray-400 font-semibold uppercase tracking-wide block">IP Address</span>
                                    <span className="text-gray-900 font-mono font-bold block mt-0.5 tracking-tight">
                                        {selectedMachineForDrawer.ip_address || selectedMachineForDrawer.hostname || "-"}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200/60 pt-2 col-span-2" />
                                <div>
                                    <span className="text-gray-400 font-semibold uppercase tracking-wide block">Node</span>
                                    <span className="text-gray-900 font-medium block mt-0.5">{selectedMachineForDrawer.node || "-"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-semibold uppercase tracking-wide block">Status</span>
                                    <span className="text-gray-500 block mt-0.5">{selectedMachineForDrawer.status || "—"}</span>
                                </div>
                                {selectedMachineForDrawer.username && (
                                    <>
                                        <div className="border-t border-gray-200/60 pt-2 col-span-2" />
                                        <div>
                                            <span className="text-gray-400 font-semibold uppercase tracking-wide block">Username</span>
                                            <span className="text-gray-900 font-mono block mt-0.5">{selectedMachineForDrawer.username}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* GPUs */}
                            {(() => {
                                const drawerGpuList = Array.isArray(selectedMachineForDrawer.gpu)
                                    ? selectedMachineForDrawer.gpu
                                    : selectedMachineForDrawer.gpu
                                        ? [String(selectedMachineForDrawer.gpu)]
                                        : [];
                                return drawerGpuList.length > 0 ? (
                                    <div className="mb-5">
                                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            <CpuChipIcon className="h-4 w-4 text-[#1a365d]" />
                                            GPUs ({drawerGpuList.length})
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {drawerGpuList.map((g, i) => (
                                                <span key={i} className="font-mono text-xs bg-violet-50 border border-violet-200 text-violet-800 px-2.5 py-1 rounded-md font-semibold">
                                                    {g}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : null;
                            })()}

                            {/* Connection Info */}
                            <div className="mt-4 border-t border-gray-100 pt-4">
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <CommandLineIcon className="h-4 w-4 text-gray-500" />
                                    Connection Info
                                </h3>
                                <div className="bg-[#1e293b] rounded p-3 font-mono text-[11px] text-green-400 space-y-1">
                                    <p className="text-gray-400"># Connect via {selectedMachineForDrawer.protocol?.toUpperCase()}</p>
                                    <p>
                                        {selectedMachineForDrawer.protocol?.toLowerCase() === "ssh"
                                            ? `ssh ${selectedMachineForDrawer.username || "user"}@${selectedMachineForDrawer.ip_address || selectedMachineForDrawer.hostname} -p ${selectedMachineForDrawer.port || 22}`
                                            : `${selectedMachineForDrawer.protocol?.toUpperCase()} → ${selectedMachineForDrawer.ip_address}:${selectedMachineForDrawer.port}`
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                            <button
                                onClick={() => setSelectedMachineForDrawer(null)}
                                className="w-full py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LLMInferenceMachines;

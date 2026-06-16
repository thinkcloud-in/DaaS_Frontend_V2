import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { selectAuthToken, selectAuthTokenParsed } from "../../redux/features/Auth/AuthSelectors";
import { fetchPrivateLLMListThunk, deletePrivateLLMThunk, privateLLMPoolActionThunk } from "../../redux/features/Pools/PoolsThunks";
import { fetchFooterTasksThunk } from "../../redux/features/Footer/FooterThunks";
import {
    selectPrivateLLMList,
    selectPrivateLLMPagination,
    selectPrivateLLMListLoading,
    selectPrivateLLMDeleteLoading,
} from "../../redux/features/Pools/PoolsSelectors";
import {
    ArrowPathIcon,
    PlusIcon,
    TrashIcon,
    EllipsisVerticalIcon,
    XMarkIcon,
    PlayIcon,
    PowerIcon,
    ArrowPathRoundedSquareIcon,
    StopIcon,
    InformationCircleIcon,
    CpuChipIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const STATUS_CONFIG = {
    vms_ready:    { label: "VMs Ready",    dot: "bg-green-500",  badge: "bg-green-100 text-green-800",   pulse: false },
    provisioning: { label: "Provisioning", dot: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-800", pulse: true  },
    failed:       { label: "Failed",       dot: "bg-red-500",    badge: "bg-red-100 text-red-800",       pulse: false },
};

const getStatusConfig = (status) =>
    STATUS_CONFIG[status] || { label: status || "Unknown", dot: "bg-gray-400", badge: "bg-gray-100 text-gray-700", pulse: false };

const LLMInference = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token       = useSelector(selectAuthToken);
    const tokenParsed = useSelector(selectAuthTokenParsed);
    const userName    = tokenParsed?.preferred_username;

    const inferencePools  = useSelector(selectPrivateLLMList);
    const pagination      = useSelector(selectPrivateLLMPagination);
    const listLoading     = useSelector(selectPrivateLLMListLoading);
    const deleteLoading   = useSelector(selectPrivateLLMDeleteLoading);

    const [selectedPools, setSelectedPools] = useState([]);
    const [activeDropdownId, setActiveDropdownId] = useState(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
    const [selectedPoolForDrawer, setSelectedPoolForDrawer] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    // confirmDelete: { type: 'single'|'bulk', id?: number, name?: string } | null
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [drawerActionLoading, setDrawerActionLoading] = useState(null);

    const dropdownRef = useRef(null);

    const fetchList = useCallback((page, size) => {
        if (token) dispatch(fetchPrivateLLMListThunk({ token, page, pageSize: size }));
    }, [token, dispatch]);

    useEffect(() => {
        fetchList(currentPage, pageSize);
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    // Close fixed dropdown on outside click or scroll
    useEffect(() => {
        const close = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setActiveDropdownId(null);
        };
        document.addEventListener("mousedown", close);
        document.addEventListener("scroll", () => setActiveDropdownId(null), true);
        return () => {
            document.removeEventListener("mousedown", close);
            document.removeEventListener("scroll", () => setActiveDropdownId(null), true);
        };
    }, []);

    const handleRefresh = () => fetchList(currentPage, pageSize);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setSelectedPools([]);
        fetchList(page, pageSize);
    };

    const handlePageSizeChange = (e) => {
        const newSize = Number(e.target.value);
        setPageSize(newSize);
        setCurrentPage(1);
        setSelectedPools([]);
        fetchList(1, newSize);
    };

    const handleSelectAll = (e) => {
        setSelectedPools(e.target.checked ? inferencePools.map((item) => item.id) : []);
    };

    const handleCheckboxClick = (e, id) => {
        e.stopPropagation();
        setSelectedPools((prev) =>
            prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
        );
    };

    const handleRowClick = (item) => {
        navigate(`/inference/machines/${item.id}`, { state: { poolData: item } });
    };

    const toggleDropdown = (e, id) => {
        e.stopPropagation();
        if (activeDropdownId === id) { setActiveDropdownId(null); return; }
        const rect = e.currentTarget.getBoundingClientRect();
        setDropdownPos({
            top: rect.bottom + 4,
            right: window.innerWidth - rect.right,
        });
        setActiveDropdownId(id);
    };

    const handleDetailsClick = (e, item) => {
        e.stopPropagation();
        setActiveDropdownId(null);
        setSelectedPoolForDrawer(item);
    };

    // Open confirmation modal for single delete
    const handleDeleteSingleClick = (e, item) => {
        e.stopPropagation();
        setActiveDropdownId(null);
        setConfirmDelete({ type: "single", id: item.id, name: item.name });
    };

    // Open confirmation modal for bulk delete
    const handleDeleteBulkClick = () => {
        setConfirmDelete({ type: "bulk", count: selectedPools.length });
    };

    // Actual delete — close modal immediately, run in background
    const handleConfirmedDelete = () => {
        const snapshot = { ...confirmDelete };
        // Close modal right away so user can continue working
        setConfirmDelete(null);
        setIsDeleting(false);

        const triggerFooterRefresh = () => {
            dispatch(fetchFooterTasksThunk(userName));
            // Re-poll after a brief delay for the workflow to register
            setTimeout(() => dispatch(fetchFooterTasksThunk(userName)), 3000);
        };

        if (snapshot.type === "single") {
            if (selectedPoolForDrawer?.id === snapshot.id) setSelectedPoolForDrawer(null);
            setSelectedPools((prev) => prev.filter((pId) => pId !== snapshot.id));
            dispatch(fetchFooterTasksThunk(userName)); // immediate trigger
            dispatch(deletePrivateLLMThunk({ token, id: snapshot.id }))
                .unwrap()
                .then(() => {
                    toast.success(`Pool "${snapshot.name || snapshot.id}" deleted successfully`);
                    fetchList(currentPage, pageSize);
                    triggerFooterRefresh();
                })
                .catch((err) => {
                    toast.error(typeof err === "string" ? err : err?.detail || err?.message || "Failed to delete");
                    triggerFooterRefresh();
                });
        } else {
            const ids = [...selectedPools];
            const count = ids.length;
            setSelectedPools([]);
            dispatch(fetchFooterTasksThunk(userName));
            Promise.all(ids.map((id) => dispatch(deletePrivateLLMThunk({ token, id })).unwrap()))
                .then(() => {
                    toast.success(`${count} pool(s) deleted successfully`);
                    fetchList(currentPage, pageSize);
                    triggerFooterRefresh();
                })
                .catch((err) => {
                    toast.error(typeof err === "string" ? err : err?.detail || err?.message || "Failed to delete");
                    triggerFooterRefresh();
                });
        }
    };

    const handlePoolAction = async (action) => {
        if (!selectedPoolForDrawer) return;
        setDrawerActionLoading(action);
        dispatch(fetchFooterTasksThunk(userName));
        try {
            await dispatch(privateLLMPoolActionThunk({ token, id: selectedPoolForDrawer.id, action })).unwrap();
            toast.success(`Pool ${action} initiated successfully`);
            fetchList(currentPage, pageSize);
        } catch (err) {
            toast.error(typeof err === "string" ? err : err?.detail || err?.message || `Failed to ${action} pool`);
        } finally {
            setDrawerActionLoading(null);
            setTimeout(() => dispatch(fetchFooterTasksThunk(userName)), 2000);
        }
    };

    const { total = 0, total_pages = 1, has_next = false, has_prev = false } = pagination;
    const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem   = Math.min(currentPage * pageSize, total);

    const getPageNumbers = () => {
        if (total_pages <= 7) return Array.from({ length: total_pages }, (_, i) => i + 1);
        const pages = [];
        const delta = 2;
        const left  = Math.max(2, currentPage - delta);
        const right = Math.min(total_pages - 1, currentPage + delta);
        pages.push(1);
        if (left > 2) pages.push("...");
        for (let i = left; i <= right; i++) pages.push(i);
        if (right < total_pages - 1) pages.push("...");
        pages.push(total_pages);
        return pages;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-left items-start flex flex-col w-full relative">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200 mb-6 w-full">
                <div>
                    <h1 className="text-2xl font-bold text-[#1a365d]">Private LLM Pools</h1>
                    <p className="text-xs text-gray-500 mt-1">Click on any pool row to navigate to its deployed Virtual Machines list page.</p>
                </div>

                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <button
                        onClick={handleRefresh}
                        disabled={listLoading}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium shadow-sm transition-all disabled:opacity-60"
                    >
                        <ArrowPathIcon className={`h-4 w-4 ${listLoading ? "animate-spin" : ""}`} />
                        {listLoading ? "Loading..." : "Refresh"}
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
                            onClick={handleDeleteBulkClick}
                            disabled={deleteLoading}
                            className="flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium shadow-sm transition-all"
                        >
                            <TrashIcon className="h-4 w-4" />
                            Delete ({selectedPools.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
                <div className="overflow-x-auto max-w-full">
                    <table className="w-full text-left border-collapse min-w-[1100px]">
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
                                <th className="py-3 px-4">OS Type</th>
                                <th className="py-3 px-4">Storage</th>
                                <th className="py-3 px-4">Head IP</th>
                                <th className="py-3 px-4">Template</th>
                                <th className="py-3 px-4 text-center">VMs</th>
                                <th className="py-3 px-4">Created At</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-center w-20">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                            {listLoading && inferencePools.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="py-12 text-center text-gray-400">
                                        <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Loading pools...
                                    </td>
                                </tr>
                            ) : inferencePools.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="py-12 text-center text-gray-400">
                                        No Private LLM pools found.
                                    </td>
                                </tr>
                            ) : (
                                inferencePools.map((item) => {
                                    const sc = getStatusConfig(item.status);
                                    return (
                                        <tr
                                            key={item.id}
                                            onClick={() => handleRowClick(item)}
                                            className={`hover:bg-blue-50/20 cursor-pointer transition-colors
                                                ${selectedPools.includes(item.id) ? "bg-blue-50/40" : ""}
                                                ${selectedPoolForDrawer?.id === item.id ? "bg-blue-50/60 font-medium" : ""}`}
                                        >
                                            <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-[#1a365d] focus:ring-[#1a365d] cursor-pointer h-4 w-4"
                                                    checked={selectedPools.includes(item.id)}
                                                    onChange={(e) => handleCheckboxClick(e, item.id)}
                                                />
                                            </td>
                                            <td className="py-3.5 px-4 text-gray-900 font-semibold max-w-[160px] truncate">
                                                {item.name}
                                            </td>
                                            <td className="py-3.5 px-4 text-gray-600 capitalize">
                                                {item.pool_os_type || "-"}
                                            </td>
                                            <td className="py-3.5 px-4 text-gray-600">
                                                {item.storage || "-"}
                                            </td>
                                            <td className="py-3.5 px-4 font-mono text-xs text-gray-600">
                                                {item.head_ip || "-"}
                                            </td>
                                            <td className="py-3.5 px-4 text-gray-600">
                                                {item.template || "-"}
                                            </td>
                                            <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <span className="inline-flex items-center justify-center bg-blue-50 border border-blue-200 text-[#1a365d] text-xs font-bold px-2.5 py-0.5 rounded-md min-w-[28px]">
                                                    {item.vmids?.length || 0}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                                                {item.created_at ? item.created_at.split(".")[0] : "-"}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${sc.badge} ${sc.pulse ? "animate-pulse" : ""}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                                                    {sc.label}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={(e) => toggleDropdown(e, item.id)}
                                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors inline-flex text-gray-500"
                                                >
                                                    <EllipsisVerticalIcon className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {total > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-500">
                                Showing <span className="font-semibold text-gray-700">{startItem}–{endItem}</span> of <span className="font-semibold text-gray-700">{total}</span> pools
                            </span>
                            <div className="flex items-center gap-1.5">
                                <label className="text-xs text-gray-500 whitespace-nowrap">Rows per page:</label>
                                <select
                                    value={pageSize}
                                    onChange={handlePageSizeChange}
                                    className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d] cursor-pointer"
                                >
                                    {PAGE_SIZE_OPTIONS.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={!has_prev || listLoading}
                                className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeftIcon className="h-4 w-4" />
                            </button>

                            {getPageNumbers().map((p, idx) =>
                                p === "..." ? (
                                    <span key={`ellipsis-${idx}`} className="px-1.5 text-gray-400 text-xs select-none">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => handlePageChange(p)}
                                        disabled={listLoading}
                                        className={`min-w-[32px] h-8 px-2 rounded-md text-xs font-medium border transition-colors disabled:cursor-not-allowed
                                            ${currentPage === p
                                                ? "bg-[#1a365d] text-white border-[#1a365d] shadow-sm"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={!has_next || listLoading}
                                className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRightIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Fixed-position dropdown — rendered outside table so overflow won't clip it */}
            {activeDropdownId !== null && (
                <div
                    ref={dropdownRef}
                    style={{ position: "fixed", top: dropdownPos.top, right: dropdownPos.right, zIndex: 200 }}
                    className="w-36 bg-white rounded-md shadow-xl ring-1 ring-black ring-opacity-5 border border-gray-100 text-left divide-y divide-gray-100"
                >
                    {(() => {
                        const item = inferencePools.find((p) => p.id === activeDropdownId);
                        if (!item) return null;
                        return (
                            <>
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
                                    <button
                                        onClick={(e) => handleDeleteSingleClick(e, item)}
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 gap-2 font-medium"
                                    >
                                        <TrashIcon className="h-4 w-4 text-red-400" />
                                        Delete
                                    </button>
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[210]"
                        onClick={() => !isDeleting && setConfirmDelete(null)}
                    />
                    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900">
                                            {confirmDelete.type === "bulk" ? "Delete Multiple Pools" : "Delete Pool"}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {confirmDelete.type === "bulk"
                                                ? <>Are you sure you want to delete <span className="font-semibold text-gray-800">{confirmDelete.count} pool(s)</span>? This action cannot be undone.</>
                                                : <>Are you sure you want to delete pool <span className="font-semibold text-gray-800">"{confirmDelete.name}"</span>? This action cannot be undone.</>
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 pb-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmedDelete}
                                    disabled={isDeleting}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isDeleting ? (
                                        <>
                                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <TrashIcon className="h-4 w-4" />
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Side Drawer */}
            {selectedPoolForDrawer && (
                <>
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-[90]" onClick={() => setSelectedPoolForDrawer(null)} />

                    <div className="fixed top-0 bottom-0 right-0 max-w-xl w-full bg-white shadow-2xl z-[100] flex flex-col justify-between border-l border-gray-200 h-full">

                        <div className="overflow-y-auto flex-1 p-6 text-left">
                            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-5">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#1a365d] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded">
                                        Pool Details
                                    </span>
                                    <h2 className="text-xl font-bold text-gray-900 mt-2">{selectedPoolForDrawer.name}</h2>
                                </div>
                                <button
                                    onClick={() => setSelectedPoolForDrawer(null)}
                                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                                <div>
                                    <span className="text-gray-400 font-semibold block uppercase tracking-wide">Pool ID</span>
                                    <span className="text-gray-900 font-mono font-medium text-sm block mt-0.5">#{selectedPoolForDrawer.id}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-semibold block uppercase tracking-wide">Status</span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mt-0.5 ${getStatusConfig(selectedPoolForDrawer.status).badge}`}>
                                        {getStatusConfig(selectedPoolForDrawer.status).label}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200/60 pt-2 col-span-2" />
                                <div>
                                    <span className="text-gray-400 font-semibold block uppercase tracking-wide">OS Type</span>
                                    <span className="text-gray-900 font-medium block mt-0.5 capitalize">{selectedPoolForDrawer.pool_os_type || "-"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-semibold block uppercase tracking-wide">Storage</span>
                                    <span className="text-gray-900 font-mono block mt-0.5">{selectedPoolForDrawer.storage || "-"}</span>
                                </div>
                                <div className="border-t border-gray-200/60 pt-2 col-span-2" />
                                <div>
                                    <span className="text-gray-400 font-semibold block uppercase tracking-wide">Template</span>
                                    <span className="text-gray-900 font-mono block mt-0.5">{selectedPoolForDrawer.template || "-"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-semibold block uppercase tracking-wide">Machine Name</span>
                                    <span className="text-gray-900 block mt-0.5">{selectedPoolForDrawer.machine_name || "-"}</span>
                                </div>
                                <div className="border-t border-gray-200/60 pt-2 col-span-2" />
                                <div>
                                    <span className="text-gray-400 font-semibold block uppercase tracking-wide">Head IP</span>
                                    <span className="text-gray-700 font-mono font-semibold block mt-0.5">{selectedPoolForDrawer.head_ip || "-"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-semibold block uppercase tracking-wide">IP Addresses</span>
                                    <span className="text-gray-700 font-mono block mt-0.5">{selectedPoolForDrawer.ip_addresses?.join(", ") || "-"}</span>
                                </div>
                                <div className="border-t border-gray-200/60 pt-2 col-span-2" />
                                <div className="col-span-2">
                                    <span className="text-gray-400 font-semibold block uppercase tracking-wide">Workflow ID</span>
                                    <span className="text-gray-800 font-mono block text-[11px] mt-0.5 bg-white p-1.5 rounded border border-gray-200 break-all">
                                        {selectedPoolForDrawer.workflow_id || "-"}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200/60 pt-2 col-span-2" />
                                <div>
                                    <span className="text-gray-400 font-semibold block uppercase tracking-wide">Created At</span>
                                    <span className="text-gray-700 block mt-0.5">{selectedPoolForDrawer.created_at?.split(".")[0] || "-"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-semibold block uppercase tracking-wide">VM IDs</span>
                                    <span className="text-gray-700 font-mono block mt-0.5">{selectedPoolForDrawer.vmids?.join(", ") || "-"}</span>
                                </div>
                            </div>

                            {selectedPoolForDrawer.nodes?.length > 0 && (
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CpuChipIcon className="h-5 w-5 text-[#1a365d]" />
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                            Nodes & GPUs ({selectedPoolForDrawer.nodes.length})
                                        </h3>
                                    </div>
                                    <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
                                                    <th className="p-2.5">Node</th>
                                                    <th className="p-2.5">GPUs</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                                {selectedPoolForDrawer.nodes.map((n, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/60">
                                                        <td className="p-2.5 font-semibold text-gray-900">{n.node}</td>
                                                        <td className="p-2.5 font-mono">{n.gpu?.join(", ") || "-"}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-200 grid grid-cols-4 gap-2">
                            {[
                                { action: "start",    label: "Start",    Icon: PlayIcon,                   color: "text-green-700 hover:bg-green-50 hover:border-green-300", iconColor: "text-green-600" },
                                { action: "shutdown", label: "Shutdown", Icon: PowerIcon,                  color: "text-red-700 hover:bg-red-50 hover:border-red-300",       iconColor: "text-red-600"   },
                                { action: "restart",  label: "Restart",  Icon: ArrowPathRoundedSquareIcon, color: "text-amber-700 hover:bg-amber-50 hover:border-amber-300", iconColor: "text-amber-600" },
                                { action: "stop",     label: "Stop",     Icon: StopIcon,                   color: "text-gray-700 hover:bg-gray-100 hover:border-gray-400",   iconColor: "text-gray-600"  },
                            ].map(({ action, label, Icon, color, iconColor }) => (
                                <button
                                    key={action}
                                    onClick={() => handlePoolAction(action)}
                                    disabled={!!drawerActionLoading}
                                    className={`flex flex-col items-center justify-center p-2.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${color}`}
                                >
                                    {drawerActionLoading === action
                                        ? <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                        : <Icon className={`h-4 w-4 ${iconColor}`} />
                                    }
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LLMInference;

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    Plus, Search, Trash2, Download,
    FileText, Loader2,
    RefreshCw, Server, HardDrive, Box, Brain, ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { selectAuthToken } from "../../redux/features/Auth/AuthSelectors";
import { fetchLibraryListThunk, deleteLibraryItemThunk } from "../../redux/features/Library/LibraryThunks";
import {
    selectLibraryItems,
    selectLibraryFilters,
    selectLibraryPagination,
    selectLibraryListLoading,
    selectLibraryDeleteLoading,
} from "../../redux/features/Library/LibrarySelectors";
import { downloadLibraryFile } from "../../Services/LibraryService";

// Filter tabs and their labels/counts come from the API's `filters` array
// (data.filters: [{type, label, count}]) so new upload types show up here
// automatically. The API doesn't send an icon per type, so we keep a small
// local type→icon lookup with a generic fallback for any type it doesn't cover.
const TYPE_ICONS = {
    harbor_template: Server,
    container:       Box,
    os:              HardDrive,
    podman:          Box,
    llm_model:       Brain,
    llm_template:    HardDrive,
};

const PAGE_SIZE = 10;

const DONE_STATUSES      = ["ready", "completed", "done", "success"];
const FAIL_STATUSES      = ["failed", "error"];
const UPLOADING_STATUSES = ["uploading", "processing", "pending"];

const isReady     = (s) => DONE_STATUSES.includes(s?.toLowerCase());
const isFailed    = (s) => FAIL_STATUSES.includes(s?.toLowerCase());
const isUploading = (s) => UPLOADING_STATUSES.includes(s?.toLowerCase());

const formatBytes = (bytes) => {
    if (bytes == null || bytes === 0) return "";
    if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
    if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
};


const LibraryList = () => {
    const navigate   = useNavigate();
    const dispatch   = useDispatch();
    const token      = useSelector(selectAuthToken);
    const items      = useSelector(selectLibraryItems);
    const filters    = useSelector(selectLibraryFilters);
    const pagination = useSelector(selectLibraryPagination);
    const listLoading  = useSelector(selectLibraryListLoading);
    const deleteLoading = useSelector(selectLibraryDeleteLoading);

    const [activeTab,   setActiveTab]   = useState("");
    const [searchTerm,  setSearchTerm]  = useState("");
    const [page,        setPage]        = useState(1);
    const [downloading,   setDownloading]   = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const loadList = useCallback(() => {
        dispatch(fetchLibraryListThunk({ token, type: activeTab || undefined, page, pageSize: PAGE_SIZE }));
    }, [dispatch, token, activeTab, page]);

    useEffect(() => {
        loadList();
    }, [loadList]);

    // Auto-poll every 4s while any item is in uploading/processing state
    useEffect(() => {
        const hasPending = items.some((i) => isUploading(i.status));
        if (!hasPending) return;
        const timer = setTimeout(loadList, 4000);
        return () => clearTimeout(timer);
    }, [items, loadList]);

    const handleTabChange = (key) => {
        setActiveTab(key);
        setPage(1);
        setSearchTerm("");
    };

    const handleDownload = async (item) => {
        if (!isReady(item.status)) return;
        setDownloading(item.id);
        try {
            await downloadLibraryFile(token, item.id, item.file_name || item.name);
            toast.success(`Downloaded "${item.name}"`);
        } catch {
            toast.error("Download failed. Please try again.");
        } finally {
            setDownloading(null);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;
        const { id, name } = deleteConfirm;
        setDeleteConfirm(null);
        try {
            await dispatch(deleteLibraryItemThunk({ token, id })).unwrap();
            toast.success(`"${name}" deleted.`);
            if (items.length === 1 && page > 1) setPage((p) => p - 1);
            else loadList();
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Delete failed.");
        }
    };

    const filteredItems = searchTerm
        ? items.filter((i) =>
              i.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              i.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              i.version?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : items;

    const totalPages = pagination.totalPages || Math.ceil((pagination.total || 0) / PAGE_SIZE);

    const typeTabs = [
        { key: "", label: "All" },
        ...filters.map((f) => ({ key: f.type, label: f.label || f.type, count: f.count })),
    ];
    const labelByType = filters.reduce((acc, f) => {
        acc[f.type] = f.label || f.type;
        return acc;
    }, {});

    const formatDate = (str) => {
        if (!str) return "—";
        try { return new Date(str).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
        catch { return str; }
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-left flex flex-col w-full relative select-none">

            {/* Header */}
            <div className="pb-4 border-b border-gray-200 dark:border-gray-700 mb-5 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#1a365d] dark:text-blue-300">Library Repository</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Manage Base OS, Devraq Agent, and Open Web UI packages in the centralized repository.
                    </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                        onClick={loadList}
                        disabled={listLoading}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-[#1a365d] dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-700 shadow-xs transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${listLoading ? "animate-spin" : ""}`} />
                    </button>
                    <button
                        onClick={() => navigate("/upload-library")}
                        className="inline-flex items-center gap-2 rounded-md bg-[#1a365d] hover:bg-[#122744] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all uppercase tracking-wider"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Upload New</span>
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-4 flex-wrap">
                {typeTabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors
                            ${activeTab === tab.key
                                ? "bg-[#1a365d] text-white shadow-sm"
                                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-900/60 hover:text-[#1a365d] dark:text-blue-300"
                            }`}
                    >
                        {tab.label}
                        {tab.count != null && (
                            <span className={`ml-1.5 ${activeTab === tab.key ? "text-white/70" : "text-gray-400"}`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
                {pagination.total > 0 && (
                    <span className="ml-auto text-xs text-gray-400 font-medium">
                        {pagination.total} item{pagination.total !== 1 ? "s" : ""}
                    </span>
                )}
            </div>

            {/* Search */}
            <div className="mb-4 w-full max-w-sm relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                <input
                    type="text" value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, file, version..."
                    className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-8 pr-3 focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none text-xs text-gray-900 dark:text-gray-100 shadow-xs transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left border-collapse">
                        <thead>
                            <tr className="bg-[#1a365d] text-white text-[11px] font-bold uppercase tracking-wide select-none">
                                <th className="p-4 w-[30%]">Name</th>
                                <th className="p-4 w-[15%]">Type</th>
                                <th className="p-4 w-[30%]">File</th>
                                <th className="p-4 w-[15%]">Uploaded</th>
                                <th className="p-4 w-[10%] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {listLoading && filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-10 text-center">
                                        <Loader2 className="h-5 w-5 text-[#1a365d] dark:text-blue-300 animate-spin mx-auto mb-2" />
                                        <p className="text-xs text-gray-400">Loading library...</p>
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-10 text-center">
                                        <FileText className="h-7 w-7 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No library items found</p>
                                        <p className="text-xs text-gray-400 mt-0.5">Upload a new package to get started.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => {
                                    const meta          = {
                                        label: labelByType[item.type] || item.type || "General",
                                        Icon:  TYPE_ICONS[item.type] || FileText,
                                    };
                                    const itemReady     = isReady(item.status);
                                    const itemUploading = isUploading(item.status);
                                    const isDeleting    = deleteLoading === item.id;
                                    const isDownloading = downloading === item.id;
                                    const pct           = item.progress_pct ?? null;
                                    const stage         = item.stage || "";
                                    const bytesDone     = item.bytes_done;
                                    const bytesTotal    = item.bytes_total || item.file_size;
                                    return (
                                        <tr key={item.id} className={`transition-colors ${itemUploading ? "bg-yellow-50/20" : "hover:bg-gray-50 dark:bg-gray-900/60/40"}`}>
                                            <td className="p-4">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px]" title={item.name}>
                                                    {item.name || "—"}
                                                </p>
                                                {itemUploading && (
                                                    <div className="mt-2 max-w-[200px] space-y-1">
                                                        {/* Real progress bar from API */}
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="flex-1 bg-yellow-100 rounded-full h-1.5">
                                                                <div
                                                                    className="h-1.5 rounded-full bg-yellow-400 transition-all duration-700 ease-out"
                                                                    style={{ width: `${pct ?? 0}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-[10px] font-bold text-yellow-700 flex-shrink-0 w-7 text-right">
                                                                {pct ?? 0}%
                                                            </span>
                                                        </div>
                                                        {/* Stage + bytes */}
                                                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                                            {stage && (
                                                                <span className="capitalize font-medium text-yellow-600">{stage}</span>
                                                            )}
                                                            {bytesDone != null && bytesTotal != null && (
                                                                <span className={stage ? "before:content-['·'] before:mx-1" : ""}>
                                                                    {formatBytes(bytesDone)} / {formatBytes(bytesTotal)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {item.version && (
                                                    <p className="text-[11px] text-gray-400 mt-0.5">v{item.version}</p>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                    <meta.Icon className="h-3.5 w-3.5 text-[#1a365d] dark:text-blue-300" />
                                                    {meta.label}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 max-w-[220px] truncate" title={item.file_name}>
                                                    <FileText className="h-3 w-3 text-gray-300 flex-shrink-0" />
                                                    <span className="truncate">{item.file_name || "—"}</span>
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">
                                                {formatDate(item.created_at)}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleDownload(item)}
                                                        disabled={!itemReady || isDownloading}
                                                        title={itemReady ? "Download file" : "Available when ready"}
                                                        className={`p-1.5 rounded border border-gray-200 dark:border-gray-700 transition-colors shadow-2xs
                                                            ${itemReady && !isDownloading
                                                                ? "text-gray-500 dark:text-gray-400 hover:text-[#1a365d] dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:bg-gray-700"
                                                                : "text-gray-300 bg-gray-50 dark:bg-gray-900/60 cursor-not-allowed"
                                                            }`}
                                                    >
                                                        {isDownloading
                                                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            : <Download className="h-3.5 w-3.5" />
                                                        }
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm({ id: item.id, name: item.name })}
                                                        disabled={isDeleting}
                                                        title="Delete"
                                                        className="p-1.5 text-gray-400 hover:text-red-600 bg-white dark:bg-gray-800 hover:bg-red-50 rounded border border-gray-200 dark:border-gray-700 transition-colors shadow-2xs disabled:opacity-40"
                                                    >
                                                        {isDeleting
                                                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            : <Trash2 className="h-3.5 w-3.5" />
                                                        }
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-900/60/60">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Page {page} of {totalPages} — {pagination.total} total
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1 || listLoading}
                                className="p-1 text-gray-500 dark:text-gray-400 hover:text-[#1a365d] dark:text-blue-300 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 transition-colors"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                .reduce((acc, p, idx, arr) => {
                                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, idx) =>
                                    p === "..." ? (
                                        <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-gray-400">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            disabled={listLoading}
                                            className={`min-w-[28px] px-2 py-1 text-xs font-semibold rounded border transition-colors
                                                ${p === page
                                                    ? "bg-[#1a365d] text-white border-[#1a365d]"
                                                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:bg-gray-900/60 hover:text-[#1a365d] dark:text-blue-300"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )
                            }
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || listLoading}
                                className="p-1 text-gray-500 dark:text-gray-400 hover:text-[#1a365d] dark:text-blue-300 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40 transition-colors"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-4 overflow-hidden">
                        <div className="p-5 flex items-start gap-3">
                            <div className="flex-shrink-0 h-9 w-9 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Delete Library Item</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Are you sure you want to delete <span className="font-semibold text-gray-700 dark:text-gray-300">"{deleteConfirm.name}"</span>? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-700 px-5 py-3 flex justify-end gap-2">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:bg-gray-900/60 transition-colors uppercase tracking-wider"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded transition-colors uppercase tracking-wider"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LibraryList;

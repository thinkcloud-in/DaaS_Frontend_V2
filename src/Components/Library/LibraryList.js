import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    Plus, Search, Layers, Cpu, Trash2, Download,
    FileText, CheckCircle, Loader2, AlertCircle,
    RefreshCw, Monitor, ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { selectAuthToken } from "../../redux/features/Auth/AuthSelectors";
import { fetchLibraryListThunk, deleteLibraryItemThunk } from "../../redux/features/Library/LibraryThunks";
import {
    selectLibraryItems,
    selectLibraryPagination,
    selectLibraryListLoading,
    selectLibraryDeleteLoading,
} from "../../redux/features/Library/LibrarySelectors";
import { downloadLibraryFile } from "../../Services/LibraryService";

const TYPE_TABS = [
    { key: "",              label: "All"           },
    { key: "base_os",      label: "Base OS"       },
    { key: "devraq_agent", label: "Devraq Agent"  },
    { key: "open_web_ui",  label: "Open Web UI"   },
];

const TYPE_META = {
    base_os:      { label: "Base OS",      Icon: Layers  },
    devraq_agent: { label: "Devraq Agent", Icon: Cpu     },
    open_web_ui:  { label: "Open Web UI",  Icon: Monitor },
};

const PAGE_SIZE = 10;

const StatusBadge = ({ status }) => {
    if (!status) return null;
    const s = status.toLowerCase();
    if (s === "ready") return (
        <span className="inline-flex items-center gap-1 rounded bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
            <CheckCircle className="h-3 w-3 text-green-500" />
            Ready
        </span>
    );
    if (s === "uploading") return (
        <span className="inline-flex items-center gap-1 rounded bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-700 ring-1 ring-inset ring-yellow-600/20 animate-pulse">
            <Loader2 className="h-3 w-3 text-yellow-500 animate-spin" />
            Uploading
        </span>
    );
    if (s === "failed") return (
        <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20">
            <AlertCircle className="h-3 w-3 text-red-500" />
            Failed
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 ring-1 ring-inset ring-gray-300">
            {status}
        </span>
    );
};

const LibraryList = () => {
    const navigate   = useNavigate();
    const dispatch   = useDispatch();
    const token      = useSelector(selectAuthToken);
    const items      = useSelector(selectLibraryItems);
    const pagination = useSelector(selectLibraryPagination);
    const listLoading  = useSelector(selectLibraryListLoading);
    const deleteLoading = useSelector(selectLibraryDeleteLoading);

    const [activeTab,   setActiveTab]   = useState("");
    const [searchTerm,  setSearchTerm]  = useState("");
    const [page,        setPage]        = useState(1);
    const [downloading, setDownloading] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, name }

    const loadList = useCallback(() => {
        dispatch(fetchLibraryListThunk({ token, type: activeTab || undefined, page, pageSize: PAGE_SIZE }));
    }, [dispatch, token, activeTab, page]);

    useEffect(() => {
        loadList();
    }, [loadList]);

    // Auto-poll if any item is uploading
    useEffect(() => {
        const hasUploading = items.some((i) => i.status?.toLowerCase() === "uploading");
        if (!hasUploading) return;
        const timer = setTimeout(loadList, 5000);
        return () => clearTimeout(timer);
    }, [items, loadList]);

    const handleTabChange = (key) => {
        setActiveTab(key);
        setPage(1);
        setSearchTerm("");
    };

    const handleDownload = async (item) => {
        if (item.status?.toLowerCase() !== "ready") return;
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

    const totalPages = Math.ceil((pagination.total || 0) / PAGE_SIZE);

    const formatDate = (str) => {
        if (!str) return "—";
        try { return new Date(str).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
        catch { return str; }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-left flex flex-col w-full relative select-none">

            {/* Header */}
            <div className="pb-4 border-b border-gray-200 mb-5 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-[#1a365d]">Library Repository</h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Manage Base OS, Devraq Agent, and Open Web UI packages in the centralized repository.
                    </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                        onClick={loadList}
                        disabled={listLoading}
                        className="p-2 text-gray-500 hover:text-[#1a365d] bg-white hover:bg-gray-100 rounded border border-gray-200 shadow-xs transition-colors"
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
                {TYPE_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors
                            ${activeTab === tab.key
                                ? "bg-[#1a365d] text-white shadow-sm"
                                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-[#1a365d]"
                            }`}
                    >
                        {tab.label}
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
                    className="w-full rounded border border-gray-300 bg-white py-2 pl-8 pr-3 focus:border-[#1a365d] focus:ring-1 focus:ring-[#1a365d] focus:outline-none text-xs text-gray-900 shadow-xs transition-all"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wide w-[25%]">Name</th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wide w-[15%]">Type</th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wide w-[25%]">File</th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wide w-[15%]">Uploaded</th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wide w-[10%]">Status</th>
                                <th className="p-4 text-[11px] font-bold text-gray-500 uppercase tracking-wide w-[10%] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {listLoading && filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center">
                                        <Loader2 className="h-5 w-5 text-[#1a365d] animate-spin mx-auto mb-2" />
                                        <p className="text-xs text-gray-400">Loading library...</p>
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center">
                                        <FileText className="h-7 w-7 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-500">No library items found</p>
                                        <p className="text-xs text-gray-400 mt-0.5">Upload a new package to get started.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item) => {
                                    const meta = TYPE_META[item.type] || { label: item.type, Icon: FileText };
                                    const isReady = item.status?.toLowerCase() === "ready";
                                    const isDeleting = deleteLoading === item.id;
                                    const isDownloading = downloading === item.id;
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50/40 transition-colors">
                                            <td className="p-4">
                                                <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]" title={item.name}>
                                                    {item.name || "—"}
                                                </p>
                                                {item.version && (
                                                    <p className="text-[11px] text-gray-400 mt-0.5">v{item.version}</p>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                                                    <meta.Icon className="h-3.5 w-3.5 text-[#1a365d]" />
                                                    {meta.label}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 max-w-[220px] truncate" title={item.file_name}>
                                                    <FileText className="h-3 w-3 text-gray-300 flex-shrink-0" />
                                                    <span className="truncate">{item.file_name || "—"}</span>
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-gray-600 font-medium whitespace-nowrap">
                                                {formatDate(item.created_at)}
                                            </td>
                                            <td className="p-4">
                                                <StatusBadge status={item.status} />
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleDownload(item)}
                                                        disabled={!isReady || isDownloading}
                                                        title={isReady ? "Download file" : "Available when ready"}
                                                        className={`p-1.5 rounded border border-gray-200 transition-colors shadow-2xs
                                                            ${isReady && !isDownloading
                                                                ? "text-gray-500 hover:text-[#1a365d] bg-white hover:bg-gray-100"
                                                                : "text-gray-300 bg-gray-50 cursor-not-allowed"
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
                                                        className="p-1.5 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 rounded border border-gray-200 transition-colors shadow-2xs disabled:opacity-40"
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
                    <div className="border-t border-gray-100 px-4 py-3 flex items-center justify-between bg-gray-50/60">
                        <p className="text-xs text-gray-500">
                            Page {page} of {totalPages} — {pagination.total} total
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1 || listLoading}
                                className="p-1 text-gray-500 hover:text-[#1a365d] bg-white rounded border border-gray-200 disabled:opacity-40 transition-colors"
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
                                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-[#1a365d]"
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
                                className="p-1 text-gray-500 hover:text-[#1a365d] bg-white rounded border border-gray-200 disabled:opacity-40 transition-colors"
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
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-sm mx-4 overflow-hidden">
                        <div className="p-5 flex items-start gap-3">
                            <div className="flex-shrink-0 h-9 w-9 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">Delete Library Item</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    Are you sure you want to delete <span className="font-semibold text-gray-700">"{deleteConfirm.name}"</span>? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="bg-gray-50 border-t border-gray-200 px-5 py-3 flex justify-end gap-2">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors uppercase tracking-wider"
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

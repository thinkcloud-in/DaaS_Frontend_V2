import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    createLibraryItem,
    fetchLibraryList,
    fetchLibraryItem,
    deleteLibraryItem,
} from "Services/LibraryService";

// Step 1: POST metadata only → returns { id, ... } in <100ms
export const uploadLibraryThunk = createAsyncThunk(
    "library/upload",
    async ({ token, fileName, fileSize, type, harborRegistryId, version, metadata }, { rejectWithValue }) => {
        try {
            const res = await createLibraryItem(token, { fileName, fileSize, type, harborRegistryId, version, metadata });
            return res;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.msg ||
                err?.response?.data?.detail ||
                err?.message ||
                "Failed to create upload"
            );
        }
    }
);

export const fetchLibraryListThunk = createAsyncThunk(
    "library/fetchList",
    async ({ token, type, page = 1, pageSize = 10 }, { rejectWithValue }) => {
        try {
            const res = await fetchLibraryList(token, { type, page, pageSize });
            // API: { status, code, msg, data: { filters: [...], directories: { harbor:[], os:[], ... }, total, pagination } }
            const responseData = res.data || {};
            const dirs = responseData.directories || {};
            const allItems = Object.values(dirs).flat();
            const items = type ? allItems.filter((i) => i.type === type) : allItems;
            const pg = responseData.pagination || {};
            return {
                items,
                filters: responseData.filters || [],
                pagination: {
                    total:      pg.total      ?? responseData.total ?? items.length,
                    page:       pg.page       || page,
                    pageSize:   pg.page_size  || pageSize,
                    totalPages: pg.total_pages || 1,
                    hasNext:    pg.has_next   ?? false,
                    hasPrev:    pg.has_prev   ?? false,
                },
            };
        } catch (err) {
            return rejectWithValue(err?.message || "Failed to fetch library");
        }
    }
);

export const fetchLibraryItemThunk = createAsyncThunk(
    "library/fetchItem",
    async ({ token, id }, { rejectWithValue }) => {
        try {
            const res = await fetchLibraryItem(token, id);
            return res;
        } catch (err) {
            return rejectWithValue(err?.message || "Failed to fetch item");
        }
    }
);

export const deleteLibraryItemThunk = createAsyncThunk(
    "library/delete",
    async ({ token, id }, { rejectWithValue }) => {
        try {
            await deleteLibraryItem(token, id);
            return id;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.msg ||
                err?.response?.data?.detail ||
                err?.message ||
                "Delete failed"
            );
        }
    }
);

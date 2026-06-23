import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    uploadLibraryFile,
    fetchLibraryList,
    fetchLibraryItem,
    deleteLibraryItem,
} from "Services/LibraryService";

export const uploadLibraryThunk = createAsyncThunk(
    "library/upload",
    async ({ token, formData, onProgress }, { rejectWithValue }) => {
        try {
            const res = await uploadLibraryFile(token, formData, onProgress);
            return res;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.msg ||
                err?.response?.data?.detail ||
                err?.message ||
                "Upload failed"
            );
        }
    }
);

export const fetchLibraryListThunk = createAsyncThunk(
    "library/fetchList",
    async ({ token, type, page = 1, pageSize = 10 }, { rejectWithValue }) => {
        try {
            const res = await fetchLibraryList(token, { type, page, pageSize });
            return {
                items: res.data || [],
                pagination: { total: res.total || 0, limit: res.limit || pageSize, offset: res.offset || 0 },
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

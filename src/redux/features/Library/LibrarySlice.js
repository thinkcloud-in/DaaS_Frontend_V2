import { createSlice } from "@reduxjs/toolkit";
import {
    uploadLibraryThunk,
    fetchLibraryListThunk,
    fetchLibraryItemThunk,
    deleteLibraryItemThunk,
} from "./LibraryThunks";

const initialState = {
    items: [],
    pagination: { total: 0, page: 1, pageSize: 10, totalPages: 1, hasNext: false, hasPrev: false },
    listLoading: false,
    uploadLoading: false,
    uploadResult: null,
    pollingItem: null,
    deleteLoading: null,
    error: null,
};

const librarySlice = createSlice({
    name: "library",
    initialState,
    reducers: {
        clearUploadResult(state) {
            state.uploadResult = null;
            state.pollingItem = null;
        },
        clearLibraryError(state) {
            state.error = null;
        },
        setPollingItem(state, action) {
            state.pollingItem = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Upload
            .addCase(uploadLibraryThunk.pending, (state) => {
                state.uploadLoading = true;
                state.error = null;
                state.uploadResult = null;
            })
            .addCase(uploadLibraryThunk.fulfilled, (state, action) => {
                state.uploadLoading = false;
                state.uploadResult = action.payload;
                state.pollingItem = action.payload;
            })
            .addCase(uploadLibraryThunk.rejected, (state, action) => {
                state.uploadLoading = false;
                state.error = action.payload;
            })
            // List
            .addCase(fetchLibraryListThunk.pending, (state) => {
                state.listLoading = true;
                state.error = null;
            })
            .addCase(fetchLibraryListThunk.fulfilled, (state, action) => {
                state.listLoading = false;
                state.items = action.payload.items;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchLibraryListThunk.rejected, (state, action) => {
                state.listLoading = false;
                state.error = action.payload;
            })
            // Poll single item — update in list if present
            .addCase(fetchLibraryItemThunk.fulfilled, (state, action) => {
                state.pollingItem = action.payload;
                const idx = state.items.findIndex((i) => i.id === action.payload?.id);
                if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
            })
            // Delete
            .addCase(deleteLibraryItemThunk.pending, (state, action) => {
                state.deleteLoading = action.meta.arg.id;
            })
            .addCase(deleteLibraryItemThunk.fulfilled, (state, action) => {
                state.deleteLoading = null;
                state.items = state.items.filter((i) => i.id !== action.payload);
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            })
            .addCase(deleteLibraryItemThunk.rejected, (state) => {
                state.deleteLoading = null;
            });
    },
});

export const { clearUploadResult, clearLibraryError, setPollingItem } = librarySlice.actions;
export default librarySlice.reducer;

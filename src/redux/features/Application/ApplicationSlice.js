import { createSlice } from "@reduxjs/toolkit";
import { connectPrivateLLM, disconnectPrivateLLM } from "./ApplicationThunks";

const initialState = {
    connectLoading: false,
    disconnectLoading: false,
    error: null,
};

const applicationSlice = createSlice({
    name: "application",
    initialState,
    reducers: {
        clearApplicationError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(connectPrivateLLM.pending, (state) => {
                state.connectLoading = true;
                state.error = null;
            })
            .addCase(connectPrivateLLM.fulfilled, (state) => {
                state.connectLoading = false;
            })
            .addCase(connectPrivateLLM.rejected, (state, action) => {
                state.connectLoading = false;
                state.error = action.payload || action.error?.message;
            })
            .addCase(disconnectPrivateLLM.pending, (state) => {
                state.disconnectLoading = true;
                state.error = null;
            })
            .addCase(disconnectPrivateLLM.fulfilled, (state) => {
                state.disconnectLoading = false;
            })
            .addCase(disconnectPrivateLLM.rejected, (state, action) => {
                state.disconnectLoading = false;
                state.error = action.payload || action.error?.message;
            });
    },
});

export const { clearApplicationError } = applicationSlice.actions;
export default applicationSlice.reducer;

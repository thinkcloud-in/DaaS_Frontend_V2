import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    connectPrivateLLM as connectPrivateLLMService,
    disconnectPrivateLLM as disconnectPrivateLLMService,
} from "../../../Services/ApplicationService";

export const connectPrivateLLM = createAsyncThunk(
    "application/connectPrivateLLM",
    async ({ openWebUiId, privateLlmIds }, { rejectWithValue }) => {
        try {
            const response = await connectPrivateLLMService(openWebUiId, privateLlmIds);
            return response;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.msg ||
                err?.response?.data?.detail ||
                err?.message ||
                "Failed to connect Private LLM",
            );
        }
    },
);

// privateLlmId omitted disconnects all connected Private LLMs.
export const disconnectPrivateLLM = createAsyncThunk(
    "application/disconnectPrivateLLM",
    async ({ openWebUiId, privateLlmId }, { rejectWithValue }) => {
        try {
            const response = await disconnectPrivateLLMService(openWebUiId, privateLlmId);
            return response;
        } catch (err) {
            return rejectWithValue(
                err?.response?.data?.msg ||
                err?.response?.data?.detail ||
                err?.message ||
                "Failed to disconnect Private LLM",
            );
        }
    },
);

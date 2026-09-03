import JSZip from "jszip";
import axiosInstance from "./AxiosInstance";
import { getEnv } from "utils/getEnv";

const backendUrl = getEnv("BACKEND_URL");

const pickFirst = (obj, keys) => keys.map((k) => obj?.[k]).find((v) => v !== undefined && v !== null && v !== "");

// Different services (backend-code / keycloak / guacamole) ship differently
// shaped log entries. Try the fields backend-code uses first; if a service's
// entries don't carry a recognizable message field, fall back to dumping the
// raw entry (minus the bulky "kubernetes" metadata block) instead of
// silently producing a line with just the timestamp.
const formatLogLine = (log) => {
    const timestamp = log.timestamp || log["@timestamp"];
    const level     = log.level;
    const source    = log.logger || log.stream;
    const message   = pickFirst(log, ["event", "message", "msg", "log", "text"]);

    const parts = [timestamp, level, source, message].filter(Boolean);
    if (message) return parts.join(" | ");

    const { kubernetes, ...rest } = log;
    return [timestamp, JSON.stringify(rest)].filter(Boolean).join(" | ");
};

const authHeaders = (token) => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" });

// The scroll endpoints return the payload (scroll_id/logs/has_more) directly
// at the top level — unlike the plain /logs endpoint, there's no
// {status, code, msg, data: {...}} envelope. Support both shapes just in
// case the backend wraps it later.
const unwrap = (body) => body?.data ?? body;

const startScroll = async (token, params) => {
    const response = await axiosInstance.post(
        `${backendUrl}/v1/help-support/logs/scroll/start`,
        null,
        { headers: authHeaders(token), params }
    );
    return unwrap(response.data);
};

const nextScroll = async (token, scrollId) => {
    const response = await axiosInstance.post(
        `${backendUrl}/v1/help-support/logs/scroll/next`,
        { scroll_id: scrollId },
        { headers: authHeaders(token) }
    );
    return unwrap(response.data);
};

const stopScroll = async (token, scrollId) => {
    await axiosInstance.delete(
        `${backendUrl}/v1/help-support/logs/scroll`,
        { headers: authHeaders(token), data: { scroll_id: scrollId } }
    );
};

// Pages through the full result set via the scroll API (start -> repeated
// next while has_more -> cleanup), then builds a .zip client-side with one
// .log file per selected service.
export const downloadHelpSupportLogs = async (
    token,
    { startDate, endDate, startTime, endTime, services, batchSize = 1000, onProgress }
) => {
    let scrollId = null;
    const logs = [];

    try {
        let data = await startScroll(token, {
            start_date: startDate,
            end_date:   endDate,
            start_time: startTime,
            end_time:   endTime,
            batch_size: batchSize,
            services,
        });
        scrollId = data?.scroll_id || null;
        logs.push(...(data?.logs ?? []));
        onProgress?.(logs.length);

        while (data?.has_more && scrollId) {
            data = await nextScroll(token, scrollId);
            logs.push(...(data?.logs ?? []));
            onProgress?.(logs.length);
        }
    } finally {
        if (scrollId) {
            // Best-effort cleanup — a failure here shouldn't block the download
            // the user is actually waiting on.
            try { await stopScroll(token, scrollId); } catch { /* ignore */ }
        }
    }

    if (logs.length === 0) {
        throw new Error("No logs found for the selected range.");
    }

    const byService = {};
    logs.forEach((log) => {
        const service = log.service || log.kubernetes?.container_name || "unknown";
        if (!byService[service]) byService[service] = [];
        byService[service].push(formatLogLine(log));
    });

    const zip = new JSZip();
    Object.entries(byService).forEach(([service, lines]) => {
        zip.file(`${service}.log`, lines.join("\n"));
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-bundle_${startDate}_${endDate}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

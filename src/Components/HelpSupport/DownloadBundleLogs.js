import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Download, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { selectAuthToken } from "../../redux/features/Auth/AuthSelectors";
import { downloadHelpSupportLogs } from "../../Services/HelpSupportService";

const PRESETS = [
    { label: "Last 10 Days", days: 10 },
    { label: "Last 15 Days", days: 15 },
    { label: "Last 30 Days", days: 30 },
];

const LOG_SOURCES = [
    { key: "backend-code", label: "Backend Code" },
    { key: "keycloak",     label: "Keycloak" },
    { key: "guacamole",    label: "Guacamole" },
];

const fmtLocalDate = (d) => {
    const y   = d.getFullYear();
    const m   = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
};

// <input type="time"> without step="1" reports "HH:MM" — pad to "HH:MM:SS"
// so it always matches the backend's expected format.
const withSeconds = (t) => (t && t.length === 5 ? `${t}:00` : t);

const DownloadBundleLogs = () => {
    const token = useSelector(selectAuthToken);

    const [startDate, setStartDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endDate,   setEndDate]   = useState("");
    const [endTime,   setEndTime]   = useState("");
    const [sources,   setSources]   = useState(() => LOG_SOURCES.map((s) => s.key)); // default: all
    const [submitting, setSubmitting] = useState(false);
    const [fetchedCount, setFetchedCount] = useState(0);

    const applyPreset = (days) => {
        const end   = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);

        setStartDate(fmtLocalDate(start));
        setStartTime("00:00:00");
        setEndDate(fmtLocalDate(end));
        setEndTime("23:59:59");
    };

    const toggleSource = (key) => {
        setSources((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const isAllSelected = sources.length === LOG_SOURCES.length;
    const toggleAllSources = () => {
        setSources(isAllSelected ? [] : LOG_SOURCES.map((s) => s.key));
    };

    const isValid = !!(
        sources.length > 0 && startDate && startTime && endDate && endTime &&
        new Date(`${startDate}T${withSeconds(startTime)}`) <= new Date(`${endDate}T${withSeconds(endTime)}`)
    );

    const handleDownload = async (e) => {
        e.preventDefault();
        if (sources.length === 0) {
            toast.error("Please select at least one log source.");
            return;
        }
        if (!startDate || !startTime || !endDate || !endTime) {
            toast.error("Please select both a from and to date/time.");
            return;
        }
        if (new Date(`${startDate}T${withSeconds(startTime)}`) > new Date(`${endDate}T${withSeconds(endTime)}`)) {
            toast.error("\"To\" date/time must be after \"From\" date/time.");
            return;
        }

        setSubmitting(true);
        setFetchedCount(0);
        try {
            await downloadHelpSupportLogs(token, {
                startDate,
                endDate,
                startTime: withSeconds(startTime),
                endTime:   withSeconds(endTime),
                services: sources.join(","),
                onProgress: setFetchedCount,
            });
        } catch (err) {
            toast.error(err?.response?.data?.msg || err?.message || "Failed to download logs bundle.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-left w-full select-none">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 mb-6">
                <div className="h-9 w-9 rounded-lg bg-[#1a365d]/10 flex items-center justify-center flex-shrink-0">
                    <Download className="h-4 w-4 text-[#1a365d] dark:text-blue-300" />
                </div>
                <h1 className="text-xl font-bold text-[#1a365d] dark:text-blue-300">Download Logs Bundle</h1>
            </div>

            <form
                onSubmit={handleDownload}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-xl p-6 space-y-5"
            >
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Select a log source and a date/time range to download the logs bundle for that period.
                </p>

                {/* Log source */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Logs</label>
                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={toggleAllSources}
                                className="h-4 w-4 rounded border-gray-300 text-[#1a365d] focus:ring-[#1a365d]"
                            />
                            All Services
                        </label>
                        {LOG_SOURCES.map((s) => (
                            <label key={s.key} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={sources.includes(s.key)}
                                    onChange={() => toggleSource(s.key)}
                                    className="h-4 w-4 rounded border-gray-300 text-[#1a365d] focus:ring-[#1a365d]"
                                />
                                {s.label}
                            </label>
                        ))}
                    </div>
                    <p className="text-[11px] text-gray-400">Select individual services, or use "All Services" to select/unselect all at once.</p>
                </div>

                {/* Quick range presets */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">Quick Range</label>
                    <div className="flex flex-wrap gap-2">
                        {PRESETS.map((p) => (
                            <button
                                key={p.days}
                                type="button"
                                onClick={() => applyPreset(p.days)}
                                className="text-xs font-medium px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom date/time range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">From Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full text-sm px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">From Time</label>
                        <input
                            type="time"
                            step="1"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full text-sm px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">To Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full text-sm px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">To Time</label>
                        <input
                            type="time"
                            step="1"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full text-sm px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#1a365d] focus:border-[#1a365d]"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!isValid || submitting}
                    className="w-full flex items-center justify-center gap-2 bg-[#1a365d] hover:bg-[#153056] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-md transition-colors"
                >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {submitting ? `Fetching logs… ${fetchedCount.toLocaleString()} so far` : "Download"}
                </button>
            </form>
        </div>
    );
};

export default DownloadBundleLogs;

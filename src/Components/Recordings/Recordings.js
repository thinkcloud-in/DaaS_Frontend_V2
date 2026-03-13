import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecordingsThunk } from "../../redux/features/Recordings/RecordingsThunks";
import {
  selectRecordings,
  selectRecordingsLoading,
  selectRecordingsError,
} from "../../redux/features/Recordings/RecordingsSelectors";
import { selectAuthToken } from "../../redux/features/Auth/AuthSelectors";
import dayjs from "dayjs";
import { BiPlayCircle } from "react-icons/bi";
import { getEnv } from "utils/getEnv";

const PAGE_SIZE = 15;
const GUACAMOLE_BASE_URL = getEnv("GUACAMOLE_BASE_URL");

function formatDate(epoch) {
  if (!epoch) return "--";
  const date = dayjs(Number(epoch));
  return date.isValid() ? date.format("YYYY-MM-DD HH:mm:ss") : "--";
}

function formatDuration(start, end) {
  if (!start || !end) return "--";
  const durationSec = Math.round((end - start) / 1000);
  if (durationSec < 60) return `${durationSec} seconds`;
  if (durationSec < 3600) return `${(durationSec / 60).toFixed(1)} minutes`;
  return `${(durationSec / 3600).toFixed(1)} hours`;
}

const SkeletonLoader = () => (
  <tr>
    {[...Array(6)].map((_, i) => (
      <td key={i} className="py-3 px-4">
        <div className="h-6 w-full bg-gray-100 rounded animate-pulse"></div>
      </td>
    ))}
  </tr>
);

const GuacamoleHistory = () => {
  const dispatch = useDispatch();
  const token = useSelector(selectAuthToken);

  const recordings = useSelector(selectRecordings);
  const loading = useSelector(selectRecordingsLoading);
  const error = useSelector(selectRecordingsError);

  const [page, setPage] = useState(1);
  const [iframeUrl, setIframeUrl] = useState(null);

  useEffect(() => {
    if (token) {
      dispatch(fetchRecordingsThunk(token));
    }
  }, [dispatch, token]);

  const totalPages = Math.ceil((recordings?.length || 0) / PAGE_SIZE);
  const paginatedHistory = (recordings || []).slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const getRecordingUrl = (item) => {
    if (!item.logs || !item.identifier) return null;
    const entry = Object.entries(item.logs).find(
      ([_, log]) => log.type === "GUACAMOLE_SESSION_RECORDING"
    );
    if (!entry) return null;
    const [logUuid] = entry;
    return `${GUACAMOLE_BASE_URL}/guacamole/#/settings/postgresql/recording/${item.identifier}/${logUuid}`;
  };

  const renderPagination = () =>
    totalPages > 1 ? (
      <nav className="flex justify-center items-center mt-4 mb-2 gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className={`px-3 py-1.5 rounded bg-white text-gray-600 font-medium border border-gray-200 shadow-sm hover:bg-gray-50 transition ${
            page === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          Prev
        </button>
        <span className="text-sm text-gray-600 font-medium">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className={`px-3 py-1.5 rounded bg-white text-gray-600 font-medium border border-gray-200 shadow-sm hover:bg-gray-50 transition ${
            page === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          Next
        </button>
      </nav>
    ) : null;

  return (
    <div className="p-2 md:p-4 h-full flex flex-col overflow-hidden">
      <div className="w-full md:w-[98%] h-[85vh] md:h-[90vh] flex-1 mx-auto bg-white rounded-lg p-2 md:p-4 shadow-md flex flex-col overflow-hidden">
        <div className="mb-4 flex items-center justify-between px-2">
          <h2 className="text-xl font-bold text-[#1a365d]">Session History</h2>
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Total: {recordings?.length || 0}
          </div>
        </div>
        <div className="flex-1 overflow-auto rounded-md bg-white border border-gray-100 table-container custom-scrollbar">
          <table className="min-w-full bg-white text-[0.875rem] border-collapse">
            <thead className="bg-[#1a365d]/90 text-white font-bold uppercase text-[0.75rem] leading-normal sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 text-left">Username</th>
                <th className="py-3 px-4 text-left">Start Time</th>
                <th className="py-3 px-4 text-left">Duration</th>
                <th className="py-3 px-4 text-left">Connection Name</th>
                <th className="py-3 px-4 text-left">Remote Host</th>
                <th className="py-3 px-4 text-center">View</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {loading ? (
                [...Array(10)].map((_, idx) => <SkeletonLoader key={idx} />)
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-red-500 font-medium">
                    {error}
                  </td>
                </tr>
              ) : paginatedHistory.length > 0 ? (
                paginatedHistory.map((item) => {
                  const recordingUrl = getRecordingUrl(item);
                  return (
                    <tr key={item.uuid} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium">{item.username}</td>
                      <td className="py-3 px-4">{formatDate(item.startDate)}</td>
                      <td className="py-3 px-4">{formatDuration(item.startDate, item.endDate)}</td>
                      <td className="py-3 px-4">{item.connectionName}</td>
                      <td className="py-3 px-4">{item.remoteHost}</td>
                      <td className="py-3 px-4 text-center">
                        {recordingUrl ? (
                          <button
                            onClick={() => setIframeUrl(recordingUrl)}
                            className="inline-flex items-center gap-1.5 text-[#1a365d] font-bold hover:underline"
                          >
                            <BiPlayCircle className="text-xl" />
                            <span>Play</span>
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-200 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      No session history found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {renderPagination()}
      </div>

      {/* Iframe Modal for Recording */}
      {iframeUrl && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 md:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden relative">
            <button
              onClick={() => setIframeUrl(null)}
              className="absolute top-4 right-4 z-[10000] p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              title="Guacamole Recording"
              src={iframeUrl}
              className="flex-1 w-full border-none"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GuacamoleHistory;
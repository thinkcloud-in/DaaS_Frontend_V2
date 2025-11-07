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
      <td key={i} className="py-3 px-2">
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
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
      <nav className="flex justify-center items-center my-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className={`px-4 py-2 rounded bg-gray-100 text-gray-600 font-medium shadow-sm hover:bg-indigo-50 hover:text-indigo-800 transition ${
            page === 1 ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          Prev
        </button>
        <span className="px-4 py-2 text-gray-700 font-semibold bg-white rounded border border-gray-200 mx-2 shadow">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className={`px-4 py-2 rounded bg-gray-100 text-gray-600 font-medium shadow-sm hover:bg-indigo-50 hover:text-indigo-800 transition ${
            page === totalPages ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          Next
        </button>
      </nav>
    ) : null;

  return (
    <div className="w-[98%] flex-1 mx-auto bg-white rounded-lg p-4 shadow-md flex flex-col overflow-hidden">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-center text-gray-700">
          Session History
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto rounded-md bg-white custom-scrollbar">
        <table className="min-w-full bg-white text-[0.75rem] border-collapse">
          <thead className="bg-indigo-600 text-white font-bold uppercase text-[0.8rem] leading-normal sticky top-0 z-10">
            <tr>
              <th className="py-2 px-3">Username</th>
              <th className="py-2 px-3">Start Time</th>
              <th className="py-2 px-3">Duration</th>
              <th className="py-2 px-3">Connection Name</th>
              <th className="py-2 px-3">Remote Host</th>
              <th className="py-2 px-3">View</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(10)].map((_, idx) => <SkeletonLoader key={idx} />)
            ) : error ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-red-500">
                  {error}
                </td>
              </tr>
            ) : paginatedHistory.length > 0 ? (
              paginatedHistory.map((item) => {
                const recordingUrl = getRecordingUrl(item);
                return (
                  <tr
                    key={item.uuid}
                    className="text-center border-b border-gray-200"
                  >
                    <td className="py-2 px-3">{item.username}</td>
                    <td className="py-2 px-3">{formatDate(item.startDate)}</td>
                    <td className="py-2 px-3">
                      {formatDuration(item.startDate, item.endDate)}
                    </td>
                    <td className="py-2 px-3">{item.connectionName}</td>
                    <td className="py-2 px-3">{item.remoteHost}</td>
                    <td className="py-2 px-3 flex items-center justify-center">
                      {recordingUrl ? (
                        <button
                          onClick={() => setIframeUrl(recordingUrl)}
                          className="flex items-center justify-center gap-1 text-indigo-600 font-semibold hover:underline"
                        >
                          <BiPlayCircle className="text-indigo-500 text-lg" />
                          View
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
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No session history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {renderPagination()}

      {/* Iframe Modal for Recording */}
      {iframeUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-4 relative w-full max-w-5xl h-[90vh] flex flex-col">
            <button
              onClick={() => setIframeUrl(null)}
              className="absolute top-2 right-2 text-white hover:text-red-500 text-3xl"
              aria-label="Close"
            >
              ×
            </button>
            <iframe
              title="Guacamole Recording"
              src={iframeUrl}
              className="flex-1 w-full border rounded"
              allowFullScreen
              style={{ minHeight: "80vh" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GuacamoleHistory;
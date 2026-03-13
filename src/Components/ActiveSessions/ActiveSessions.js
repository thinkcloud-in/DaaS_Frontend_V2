import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchActiveSessionsThunk } from "../../redux/features/ActiveSessions/ActiveSessionsThunks";
import {
  selectActiveSessions,
  selectActiveSessionsLoading,
  selectActiveSessionsError,
} from "../../redux/features/ActiveSessions/ActiveSessionsSelectors";
import { selectAuthToken } from "../../redux/features/Auth/AuthSelectors";
import dayjs from "dayjs";

const PAGE_SIZE = 15;

function formatDate(epoch) {
  if (!epoch) return "--";
  const date = dayjs(Number(epoch));
  return date.isValid() ? date.format("YYYY-MM-DD HH:mm:ss") : "--";
}

const SkeletonLoader = () => (
  <tr>
    {[...Array(5)].map((_, i) => (
      <td key={i} className="py-3 px-2">
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
      </td>
    ))}
  </tr>
);

const GuacamoleActiveSessions = () => {
  const dispatch = useDispatch();
  const token = useSelector(selectAuthToken);

  const sessions = useSelector(selectActiveSessions);
  const loading = useSelector(selectActiveSessionsLoading);
  const error = useSelector(selectActiveSessionsError);

  const [page, setPage] = useState(1);
  const [iframeUrl, setIframeUrl] = useState(null);

  useEffect(() => {
    if (token) {
      dispatch(fetchActiveSessionsThunk(token));
    }
  }, [dispatch, token]);

  const totalPages = Math.ceil((sessions?.length || 0) / PAGE_SIZE);
  const paginatedSessions = (sessions || []).slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Modal to show the Guacamole session in an iframe
  const renderGuacIframe = () =>
    iframeUrl && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[9999] p-2 md:p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-bold text-gray-800">Session View</h3>
            <button
              onClick={() => setIframeUrl(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <iframe
            src={iframeUrl}
            title="Guacamole Session"
            className="flex-1 w-full"
            style={{ border: "none" }}
            allowFullScreen
          />
        </div>
      </div>
    );

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
          <h2 className="text-xl font-bold text-[#1a365d]">Active Sessions</h2>
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Total: {sessions?.length || 0}
          </div>
        </div>
        <div className="flex-1 overflow-auto rounded-md bg-white border border-gray-100 table-container custom-scrollbar">
          <table className="min-w-full bg-white text-[0.875rem] border-collapse">
            <thead className="bg-[#1a365d]/90 text-white font-bold uppercase text-[0.75rem] leading-normal sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 text-left">Username</th>
                <th className="py-3 px-4 text-left">Start Time</th>
                <th className="py-3 px-4 text-left">Connection Name</th>
                <th className="py-3 px-4 text-left">Connection UUID</th>
                <th className="py-3 px-4 text-left">Remote Host</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {loading ? (
                [...Array(10)].map((_, idx) => <SkeletonLoader key={idx} />)
              ) : error ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-red-500 font-medium">
                    {error}
                  </td>
                </tr>
              ) : paginatedSessions.length > 0 ? (
                paginatedSessions.map((item) => (
                  <tr key={item.connectionUUID} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium">{item.username}</td>
                    <td className="py-3 px-4">{formatDate(item.startDate)}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setIframeUrl(item.guacClientUrl)}
                        className="text-[#1a365d] hover:underline font-semibold"
                      > 
                        {item.connectionName}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{item.connectionUUID}</td>
                    <td className="py-3 px-4">{item.remoteHost}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-200 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      No active sessions found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {renderPagination()}
        {renderGuacIframe()}
      </div>
    </div>
  );
};

export default GuacamoleActiveSessions;
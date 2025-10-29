import React, { useEffect, useState, useContext } from "react";
import { fetchGuacamoleActiveSessions } from "Services/ActiveSessionsService";
import { PoolContext } from "../../Context/PoolContext";
import { getEnv } from "utils/getEnv";
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
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [iframeUrl, setIframeUrl] = useState(null);

  const pc = useContext(PoolContext);
  const token = pc.token;
  // backendUrl no longer needed for API calls

  useEffect(() => {
    async function fetchActiveSessions() {
      setLoading(true);
      try {
        const data = await fetchGuacamoleActiveSessions(token);
        setSessions(Array.isArray(data) ? data : []);
      } catch (error) {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchActiveSessions();
  }, [token]);

  const totalPages = Math.ceil(sessions.length / PAGE_SIZE);
  const paginatedSessions = sessions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Modal to show the Guacamole session in an iframe
  const renderGuacIframe = () =>
    iframeUrl && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
        <div className="bg-white rounded p-4 max-w-4xl w-full h-[80vh] flex flex-col">
          <button
            onClick={() => setIframeUrl(null)}
            className="self-end mb-2 px-4 py-2 bg-red-500 text-white rounded"
          >
            Close
          </button>
          <iframe
            src={iframeUrl}
            title="Guacamole Session"
            className="flex-1 w-full rounded"
            style={{ minHeight: "500px", border: "none" }}
            allowFullScreen
          />
        </div>
      </div>
    );

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
        <h2 className="text-lg font-semibold text-center text-gray-700">Active Sessions</h2>
      </div>
      <div className="flex-1 overflow-y-auto rounded-md bg-white custom-scrollbar">
        <table className="min-w-full bg-white text-[0.75rem] border-collapse">
          <thead className="bg-indigo-600 text-white font-bold uppercase text-[0.8rem] leading-normal sticky top-0 z-10">
            <tr>
              <th className="py-2 px-3">Username</th>
              <th className="py-2 px-3">Start Time</th>
              <th className="py-2 px-3">Connection Name</th>
              <th className="py-2 px-3">Connection UUID</th>
              <th className="py-2 px-3">Remote Host</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(10)].map((_, idx) => <SkeletonLoader key={idx} />)
            ) : paginatedSessions.length > 0 ? (
              paginatedSessions.map((item) => (
                <tr key={item.connectionUUID} className="text-center border-b border-gray-200">
                  <td className="py-2 px-3">{item.username}</td>
                  <td className="py-2 px-3">{formatDate(item.startDate)}</td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => setIframeUrl(item.guacClientUrl)}
                      className="text-blue-600 hover:underline"
                    > 
                      {item.connectionName}
                    </button>
                  </td>
                  <td className="py-2 px-3">{item.connectionUUID}</td>
                  <td className="py-2 px-3">{item.remoteHost}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No active sessions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {renderPagination()}
      {renderGuacIframe()}
    </div>
  );
};

export default GuacamoleActiveSessions;


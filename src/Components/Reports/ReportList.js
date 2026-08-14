import React, { useState, useEffect } from "react";
import "./ReportList.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { selectAuthToken } from "../../redux/features/Auth/AuthSelectors";
import {
  fetchReportsList,
  fetchScheduleStatus,
  deleteReportSchedule,
} from "../../redux/features/Reports/ReportsThunks";
import {
  selectScheduleList,
  selectScheduleLoading,
  selectScheduleTotal,
  selectScheduleDeleteLoading,
} from "../../redux/features/Reports/ReportsSelectors";

const ReportList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector(selectAuthToken);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDetails, setReportDetails] = useState({});

  const itemsPerPage = 10;

  const reports = useSelector(selectScheduleList);
  const isLoading = useSelector(selectScheduleLoading);
  const totalCount = useSelector(selectScheduleTotal);
  const deleteLoading = useSelector(selectScheduleDeleteLoading);

  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / itemsPerPage));

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const loadList = async () => {
    if (!token) return;
    try {
      const result = await dispatch(
        fetchReportsList({ token, page: currentPage, itemsPerPage }),
      ).unwrap();
      const list = result?.items || [];
      // request status for each schedule (non-blocking)
      list.forEach((r) => {
        const scheduleId = r.schedule_id || r.id;
        if (scheduleId)
          dispatch(fetchScheduleStatus({ token, schedule_id: scheduleId }));
      });
    } catch (err) {
      toast.error("Data Not Found. Please try again.");
    }
  };

  useEffect(() => {
    loadList();
  }, [currentPage, token]);

  const handleRefresh = () => loadList();

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete")) return;
    try {
      await dispatch(deleteReportSchedule({ token, schedule_id: id })).unwrap();
      toast.success("Report deleted successfully");
      // reload current page
      loadList();
    } catch (err) {
      toast.error("Failed to delete report. Please check your credentials.");
    }
  };

  const handleEdit = (report) => navigate("/Schedule", { state: { report } });
  const handleAdd = () => navigate("/Schedule");

  const handleRowClick = (report) => {
    if (selectedReport && selectedReport.id === report.id) {
      setSelectedReport(null);
      return;
    }
    setSelectedReport(report);
    if (!reportDetails[report.id]) {
      setReportDetails((prev) => ({
        ...prev,
        [report.id]: { status: report.status },
      }));
    }
  };

  const STATUS_CONFIG = {
    COMPLETED: { label: "Completed", icon: "fa-check-circle", badge: "bg-green-100 text-green-800", dot: "bg-green-500" },
    RUNNING: { label: "Running", icon: "fa-clock", badge: "bg-blue-100 text-blue-800", dot: "bg-blue-500", pulse: true },
    FAILED: { label: "Failed", icon: "fa-times-circle", badge: "bg-red-100 text-red-800", dot: "bg-red-500" },
  };
  const renderStatusBadge = (status) => {
    const s = String(status).toUpperCase();
    const sc = STATUS_CONFIG[s] || {
      label: s || "Pending",
      icon: "fa-circle-question",
      badge: "bg-gray-100 text-gray-600",
      dot: "bg-gray-400",
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${sc.badge} ${sc.pulse ? "animate-pulse" : ""}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
        {sc.label}
      </span>
    );
  };

  const skeletonRows = Array.from({ length: itemsPerPage }, (_, i) => (
    <tr key={i}>
      {[...Array(7)].map((_, j) => (
        <td key={j} className="py-3.5 px-4">
          <div className="h-5 w-24 bg-gray-100 rounded animate-pulse"></div>
        </td>
      ))}
    </tr>
  ));

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-left items-start flex flex-col w-full relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200 mb-6 w-full">
        <div>
          <h1 className="text-2xl font-bold text-[#1a365d]">
            Scheduled Reports
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Recurring reports emailed automatically on a schedule.
          </p>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium shadow-sm transition-all disabled:opacity-60"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isLoading ? "Loading..." : "Refresh"}
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1a365d] text-white hover:bg-[#153056] text-sm font-medium shadow-sm transition-all"
          >
            <i className="fa-solid fa-plus text-xs" />
            New
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#1a365d] text-white text-xs font-semibold uppercase tracking-wider select-none">
                <th className="py-3 px-4">S.No</th>
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Report Name</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Schedule Type</th>
                <th className="py-3 px-4">Receiver</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {isLoading ? (
                skeletonRows
              ) : !reports || reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    No Reports Found
                  </td>
                </tr>
              ) : (
                reports.map((report, index) => (
                  <React.Fragment key={report.id}>
                    <tr
                      onClick={() => handleRowClick(report)}
                      className={`hover:bg-blue-50/20 cursor-pointer transition-colors ${
                        selectedReport?.id === report.id
                          ? "bg-blue-50/40"
                          : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 text-gray-500">
                        {index + 1 + (currentPage - 1) * itemsPerPage}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-[#1a365d]/10 text-[#1a365d] text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {report.userEmail?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-gray-600 truncate max-w-[160px]">
                            {report.userEmail || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-900">
                        {report.reportName}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-600 font-mono">
                        {report.time}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 capitalize">
                        {report.schedule_type}
                      </td>
                      <td className="py-3.5 px-4">
                        <div
                          className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center"
                          title={report.receiverEmail}
                        >
                          {report.receiverEmail?.charAt(0).toUpperCase()}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {renderStatusBadge(report.status)}
                      </td>
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="p-1.5 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                          onClick={() => handleDelete(report.id)}
                          disabled={!!deleteLoading[report.id]}
                          title="Delete"
                        >
                          {deleteLoading[report.id] ? (
                            <CircularProgress
                              size={16}
                              sx={{ color: "#ef4444" }}
                            />
                          ) : (
                            <i className="fa-solid fa-trash" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {selectedReport && selectedReport.id === report.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={8} className="px-4 py-3 text-xs text-gray-600">
                          <span className="font-semibold text-gray-800">
                            Created On:
                          </span>{" "}
                          {report.schedule_date}
                          <span className="mx-2 text-gray-300">|</span>
                          <span className="font-semibold text-gray-800">
                            Delivered On:
                          </span>{" "}
                          {report.time_duration}
                          <span className="mx-2 text-gray-300">|</span>
                          <span className="font-semibold text-gray-800">
                            Receiver Email:
                          </span>{" "}
                          {report.receiverEmail}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isLoading && reports && reports.length > 0 && (
          <div className="flex items-center justify-end gap-1 px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="min-w-[32px] h-8 px-2 rounded-md text-xs font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`min-w-[32px] h-8 px-2 rounded-md text-xs font-medium border transition-colors ${
                  currentPage === index + 1
                    ? "bg-[#1a365d] text-white border-[#1a365d] shadow-sm"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="min-w-[32px] h-8 px-2 rounded-md text-xs font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportList;

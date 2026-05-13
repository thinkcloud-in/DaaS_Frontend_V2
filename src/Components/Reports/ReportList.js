import React, { useState, useEffect } from "react";
import "./ReportList.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
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

  const renderStatusBadge = (status) => {
    const s = String(status).toUpperCase();
    switch (s) {
      case "COMPLETED":
        return (
          <span className="status-badge completed">
            <i className="fa-solid fa-check-circle"></i> Completed
          </span>
        );
      case "RUNNING":
        return (
          <span className="status-badge running">
            <i className="fa-solid fa-clock"></i> Running
          </span>
        );
      case "FAILED":
        return (
          <span className="status-badge failed">
            <i className="fa-solid fa-times-circle"></i> Failed
          </span>
        );
      default:
        return (
          <span className="status-badge pending">
            <i className="fa-solid fa-circle-question"></i> {s || "Pending"}
          </span>
        );
    }
  };

  const skeletonRows = Array.from({ length: itemsPerPage }, (_, i) => (
    <tr key={i}>
      {[...Array(8)].map((_, j) => (
        <td key={j} className="py-4 px-3">
          <div className="h-6 w-24 bg-gray-100 rounded animate-pulse"></div>
        </td>
      ))}
    </tr>
  ));

  return (
    <div className="table-container p-2 md:p-4 h-full">
      <div className="report-list flex flex-col h-full overflow-hidden">
        <div className="header-item">
          <div className="left-spacer"></div>

          <h1 className="header-title">Scheduled Reports</h1>

          <div className="right-controls">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-[#1a365d]/80 hover:bg-[#1a365d] text-[#f5f5f5] rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 flex items-center justify-center"
              title="Refresh Reports"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 ${isLoading ? "animate-spin-custom" : ""}`}
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
            </button>
          </div>
        </div>

        {isLoading ? (
          <Box sx={{ width: "100%", mt: 2 }}>
            <table className="tableRow skeleton-loading">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>User Name</th>
                  <th>Report Name</th>
                  <th>Time</th>
                  <th>Schedule Type</th>
                  <th>Receiver</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{skeletonRows}</tbody>
            </table>
          </Box>
        ) : (
          <>
            <table className="tableRow">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>User Name</th>
                  <th>Report Name</th>
                  <th>Time</th>
                  <th>Schedule Type</th>
                  <th>Receiver</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!reports || reports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="h-64 text-xl text-center ">
                      No Reports Found
                    </td>
                  </tr>
                ) : (
                  reports.map((report, index) => (
                    <React.Fragment key={report.id}>
                      <tr onClick={() => handleRowClick(report)}>
                        <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                        <td>
                          <span className="user_tooltip">
                            <div className="user_circle">
                              {report.userEmail?.charAt(0).toUpperCase()}
                            </div>
                            <span className="user_tooltiptext">
                              {report.userEmail || "N/A"}
                            </span>
                          </span>
                        </td>
                        <td>{report.reportName}</td>
                        <td>{report.time}</td>
                        <td>{report.schedule_type}</td>
                        <td>
                          <span className="tooltip">
                            <div className="circle">
                              {report.receiverEmail?.charAt(0).toUpperCase()}
                            </div>
                          </span>
                        </td>
                        <td>{renderStatusBadge(report.status)}</td>
                        <td>
                          <button
                            className="edit-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(report);
                            }}
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button
                            className="delete-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(report.id);
                            }}
                            disabled={!!deleteLoading[report.id]}
                          >
                            {deleteLoading[report.id] ? (
                              <CircularProgress
                                size={16}
                                color="inherit"
                                sx={{ color: "red" }}
                              />
                            ) : (
                              <i className="fa-solid fa-trash"></i>
                            )}
                          </button>
                        </td>
                      </tr>
                      {selectedReport && selectedReport.id === report.id && (
                        <tr className="accordion-row">
                          <td colSpan="8" className="accordion-details">
                            <div>
                              <strong>Created On: </strong>
                              <span>{report.schedule_date}</span> |
                              <strong>Delivered On: </strong>
                              <span>{report.time_duration}</span> |
                              <strong>Receiver-Email: </strong>
                              <span>{report.receiverEmail}</span> |
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
            <div className="footer-container">
              <div className="pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={currentPage === index + 1 ? "active" : ""}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
              <div className="add-report-container">
                <button onClick={handleAdd} className="add-report-button">
                  <i className="fa-solid fa-plus"></i>
                  <span> New </span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportList;

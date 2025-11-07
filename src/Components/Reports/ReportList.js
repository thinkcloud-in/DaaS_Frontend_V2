import React, { useState, useEffect } from "react";
import "./ReportList.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ToggleButton, ToggleButtonGroup, Typography, CircularProgress, Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {selectAuthToken} from "../../redux/features/Auth/AuthSelectors";
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

  const [alignment, setAlignment] = useState("Vamanit");
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

  const handleChange = (event, newAlignment) => {
    if (newAlignment && newAlignment !== alignment) {
      setAlignment(newAlignment);
      setCurrentPage(1);
    }
  };

  const loadList = async () => {
    if (!token) return;
    try {
      const result = await dispatch(fetchReportsList({ token, alignment, page: currentPage, itemsPerPage })).unwrap();
      const list = result?.items || [];
      // request status for each schedule (non-blocking)
      list.forEach((r) => {
        const scheduleId = r.schedule_id || r.id;
        if (scheduleId) dispatch(fetchScheduleStatus({ token, schedule_id: scheduleId }));
      });
    } catch (err) {
      toast.error("Data Not Found. Please try again.");
    }
  };

  useEffect(() => {
    loadList();
  }, [alignment, currentPage, token]);

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
      setReportDetails((prev) => ({ ...prev, [report.id]: { status: report.status } }));
    }
  };

  const renderStatusIcon = (status) => {
    switch (String(status)) {
      case "COMPLETED":
        return <i className="fa-solid fa-check-circle status-icon success"></i>;
      case "RUNNING":
        return <i className="fa-solid fa-clock status-icon pending"></i>;
      case "FAILED":
        return <i className="fa-solid fa-times-circle status-icon failure"></i>;
      default:
        return <i className="fa-solid fa-circle-question status-icon default"></i>;
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
    <div className="table_container">
      <div className="report-list">
        <div className="header-item">
          <button className="refresh-button" onClick={handleRefresh} title="Refresh">
            <i className={`fa-solid fa-rotate-right icon${isLoading ? " rotating" : ""}`}></i>
          </button>
          <div className="report_container">
            <h1>Reports</h1>
            <ToggleButtonGroup value={alignment} exclusive onChange={handleChange} aria-label="Platform">
              <ToggleButton value="Vamanit" sx={{
                backgroundColor: alignment === "Vamanit",
                border: "1px solid #1a365dcc",
                color: "#1a365dcc",
                height: "2.2rem",
                borderRadius: "5px",
                textTransform: "capitalize",
                "&:hover": { backgroundColor: "transparent" },
                "&.Mui-selected": {
                  color: "#f5f5f5",
                  backgroundColor: "#1a365dcc",
                  "&:hover": { backgroundColor: "#1a365d" },
                },
              }}>
                <Typography sx={{ fontWeight: "600" }}>Vamanit Reports</Typography>
              </ToggleButton>
              <ToggleButton value="Horizon" sx={{
                backgroundColor: alignment === "Horizon",
                color: "#1a365dcc",
                border: "1px solid #1a365dcc",
                height: "2.2rem",
                borderRadius: "5px",
                textTransform: "capitalize",
                "&:hover": { backgroundColor: "transparent" },
                "&.Mui-selected": {
                  color: "#f5f5f5",
                  backgroundColor: "#1a365dcc",
                  "&:hover": { backgroundColor: "#1a365d" },
                },
              }}>
                <Typography sx={{ fontWeight: "600" }}>Horizon Reports</Typography>
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
        </div>

        {isLoading ? (
          <Box sx={{ width: "100%", mt: 2 }}>
            <table className="tableRow custom-scrollbar skeleton-loading">
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
            <table className="tableRow custom-scrollbar">
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
                {(!reports || reports.length === 0) ? (
                  <tr>
                    <td colSpan={8}>No Reports Found</td>
                  </tr>
                ) : (
                  reports.map((report, index) => (
                    <React.Fragment key={report.id}>
                      <tr onClick={() => handleRowClick(report)}>
                        <td>{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                        <td>
                          <span className="user_tooltip">
                            <div className="user_circle">{report.userEmail?.charAt(0).toUpperCase()}</div>
                            <span className="user_tooltiptext">{report.userEmail || "N/A"}</span>
                          </span>
                        </td>
                        <td>{report.reportName}</td>
                        <td>{report.time}</td>
                        <td>{report.schedule_type}</td>
                        <td>
                          <span className="tooltip">
                            <div className="circle">{report.receiverEmail?.charAt(0).toUpperCase()}</div>
                          </span>
                        </td>
                        <td>{renderStatusIcon(report.status)}</td>
                        <td>
                          <button className="edit-button" onClick={(e) => { e.stopPropagation(); handleEdit(report); }}>
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button className="delete-button" onClick={(e) => { e.stopPropagation(); handleDelete(report.id); }} disabled={!!deleteLoading[report.id]}>
                            {deleteLoading[report.id] ? (
                              <CircularProgress size={16} color="inherit" sx={{ color: "red" }} />
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
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button key={index + 1} onClick={() => paginate(index + 1)} className={currentPage === index + 1 ? "active" : ""}>{index + 1}</button>
                ))}
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
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
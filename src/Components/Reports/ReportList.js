import React, { useState, useEffect, useContext } from "react";
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
import { PoolContext } from "../../Context/PoolContext";
import {
  fetchReportsList,
  fetchScheduleStatus,
  deleteReportSchedule,
} from "Services/ReportsService";

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alignment, setAlignment] = useState("Vamanit");
  const [deleteLoading, setDeleteLoading] = useState({});
  const [totalCount, setTotalCount] = useState(0);
  const [reportDetails, setReportDetails] = useState({});

  const navigate = useNavigate();
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const pc = useContext(PoolContext);
  const token = pc.token;

  const handleChange = (event, newAlignment) => {
    if (newAlignment !== null && newAlignment !== alignment) {
      setAlignment(newAlignment);
      setCurrentPage(1);
    }
  };

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const data = await fetchReportsList(token, alignment, currentPage, itemsPerPage);
      if (!data || !data.items) {
        setReports([]);
        setTotalCount(0);
        return;
      }
      // Fetch status for each report
      const reportsWithStatus = await Promise.all(
        data.items.map(async (report) => {
          const status = await fetchScheduleStatus(token, report.schedule_id);
          return { ...report, status };
        })
      );
      setReports(reportsWithStatus);
      setTotalCount(data.total);
    } catch (error) {
      toast.error("Data Not Found. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line
  }, [alignment, currentPage]);

  const handleRefresh = () => {
    fetchReports();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete")) {
      setDeleteLoading((prev) => ({ ...prev, [id]: true }));
      try {
        await deleteReportSchedule(token, id);
        setReports((prev) => prev.filter((report) => report.id !== id));
        if (reports.length === 1 && currentPage > 1) {
          setCurrentPage((prevPage) => prevPage - 1);
        }
        toast.success("Report deleted successfully");
      } catch (error) {
        toast.error("Failed to delete report. Please check your credentials.");
      } finally {
        setDeleteLoading((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  const handleEdit = (report) => {
    navigate("/Schedule", { state: { report } });
  };

  const handleAdd = () => {
    navigate("/Schedule");
  };

  const handleRowClick = async (report) => {
    if (selectedReport && selectedReport.id === report.id) {
      setSelectedReport(null);
      return;
    }
    setSelectedReport(report);
    if (!reportDetails[report.id]) {
      setReportDetails((prev) => ({
        ...prev,
        [report.id]: {
          status: report.status,
        },
      }));
    }
  };

  const renderStatusIcon = (report) => {
    switch (report) {
      case "COMPLETED":
        return <i className="fa-solid fa-check-circle status-icon success"></i>;
      case "RUNNING":
        return <i className="fa-solid fa-clock status-icon pending"></i>;
      case "FAILED":
        return <i className="fa-solid fa-times-circle status-icon failure"></i>;
      default:
        return (
          <i className="fa-solid fa-circle-question status-icon default"></i>
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
    <div className="table_container">
      <div className="report-list">
        <div className="header-item">
          <button
            className="refresh-button"
            onClick={handleRefresh}
            title="Refresh"
          >
            <i
              className={`fa-solid fa-rotate-right icon${isLoading ? " rotating" : ""}`}
            ></i>
          </button>
          <div className="report_container">
            <h1>Reports</h1>
            <ToggleButtonGroup
              value={alignment}
              exclusive
              onChange={handleChange}
              aria-label="Platform"
            >
              <ToggleButton
                value="Vamanit"
                sx={{
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
                }}
              >
                <Typography sx={{ fontWeight: "600" }}>
                  Vamanit Reports
                </Typography>
              </ToggleButton>
              <ToggleButton
                value="Horizon"
                sx={{
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
                }}
              >
                <Typography sx={{ fontWeight: "600" }}>
                  Horizon Reports
                </Typography>
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
                {reports.length === 0 ? (
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
                        <td>{renderStatusIcon(report.status)}</td>
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
                            disabled={deleteLoading[report.id]}
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
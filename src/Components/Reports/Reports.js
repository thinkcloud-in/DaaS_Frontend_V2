import React, { useEffect, useRef } from "react";
import "./Reports.css";
import dayjs from "dayjs";
import { useReactToPrint } from "react-to-print";
import { ColorRing } from "react-loader-spinner";
import { DatePicker } from "antd";
// react-router navigation not used in this component after migration
import { useDispatch, useSelector } from 'react-redux';
import { selectAuthToken, selectAuthTokenParsed } from '../../redux/features/Auth/AuthSelectors';
import {
  fetchUsersForDateRange,
  fetchSessionReports as fetchSessionReportsThunk,
  fetchDayReports as fetchDayReportsThunk,
  fetchConsolidateReports as fetchConsolidateReportsThunk,
  fetchCompanyDetails as fetchCompanyDetailsThunk,
} from '../../redux/features/Reports/ReportsThunks';
import {
  selectUserOptions,
  selectSelectedUser,
  selectDateRange,
  selectSessionReports,
  selectDayReports,
  selectConsolidateReports,
  selectShowSessionReports,
  selectShowDayReports,
  selectShowConsolidateReports,
  selectLoader,
  selectPrint,
  selectCompany,
  selectActiveTab,
} from '../../redux/features/Reports/ReportsSelectors';
import { setUser, setDateRange, setActiveTab } from '../../redux/features/Reports/ReportsSlice';
const { RangePicker } = DatePicker;


// Utility function to format durations
const formatDuration = (seconds) => {
  if (seconds < 60) {
    return `${Math.floor(seconds)} seconds`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return ` ${minutes} minutes ${Math.floor(seconds % 60)} seconds`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} hours ${minutes} minutes ${Math.floor(
      seconds % 60
    )} seconds`;
  } else if (seconds >= 86400) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days} days ${hours} hours ${Math.floor(
      (seconds % 3600) / 60
    )} minutes ${Math.floor(seconds % 60)} seconds`;
  } else {
    return "NA";
  }
};


const formatDateTime = (dateTimeString) => {
  if (dateTimeString === "Not Applicable") {
    return "Not Applicable";
  } else {
    const date = new Date(dateTimeString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }
};
const formatHoursDuration = (totalDurationInSeconds) => {
  if (!totalDurationInSeconds || totalDurationInSeconds === "Not Applicable") {
    return "Not Applicable";
  }

  const hours = Math.floor(totalDurationInSeconds / 3600);
  const minutes = Math.floor((totalDurationInSeconds % 3600) / 60);
  const seconds = Math.round(totalDurationInSeconds % 60); // Round seconds

  return `${hours} hours ${minutes} minutes ${seconds} seconds`;
};

const Reports = (tokenParsed) => {
  const dispatch = useDispatch();
  const userOptions = useSelector(selectUserOptions);
  const user = useSelector(selectSelectedUser);
  const dateRange = useSelector(selectDateRange);
  const sessionReports = useSelector(selectSessionReports);
  const dayReports = useSelector(selectDayReports);
  const consolidateReports = useSelector(selectConsolidateReports);
  const showSessionReports = useSelector(selectShowSessionReports);
  const showDayReports = useSelector(selectShowDayReports);
  const showConsolidateReports = useSelector(selectShowConsolidateReports);
  const loader = useSelector(selectLoader);
  const print = useSelector(selectPrint);
  const company = useSelector(selectCompany);
  const activeTab = useSelector(selectActiveTab);
  const componentRef = useRef();
  const token = useSelector(selectAuthToken);
  const authTokenParsed = useSelector(selectAuthTokenParsed);
  const Userprofileicon = authTokenParsed?.name || tokenParsed?.tokenParsed?.name;
  const today = new Date();
  const formattedDateTime = today.toLocaleString();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  // This component always shows the Horizon Reports section
  const showHorizonReports = true;

  useEffect(() => {
    const { start, end } = dateRange || {};
    if (!start || !end) return;
    if (!token) return;
    dispatch(fetchUsersForDateRange({ token, start, end }));
  }, [dateRange, token, dispatch]);

  const fetchCompanyDetailsLocal = async (reportType) => {
    if (!token) return;
    try {
      await dispatch(fetchCompanyDetailsThunk({ token, reportType })).unwrap();
    } catch (_) {
      // ignore
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleValueChange = (dates) => {
    if (dates && dates.length === 2) {
      dispatch(setDateRange({
        start: dates[0].format("YYYY-MM-DD HH:mm:ss.SSSSSS"),
        end: dates[1].format("YYYY-MM-DD HH:mm:ss.SSSSSS"),
      }));
    } else {
      dispatch(setDateRange({ start: '', end: '' }));
      // clear view handled by slice or actions
    }
  };
  const fetchSessionReportsLocal = async () => {
    const { start, end } = dateRange || {};
    if (!start || !end || !token) return;
    await fetchCompanyDetailsLocal("Session Reports");
    try {
      await dispatch(fetchSessionReportsThunk({ token, start, end, user })).unwrap();
    } catch {
      // handled in slice
    }
  };

  const fetchDayReportsLocal = async () => {
    const { start, end } = dateRange || {};
    if (!start || !end || !token) return;
    await fetchCompanyDetailsLocal("Daily Reports");
    try {
      await dispatch(fetchDayReportsThunk({ token, start, end, user })).unwrap();
    } catch {
      // handled in slice
    }
  };

  const fetchConsolidateReportsLocal = async () => {
    const { start, end } = dateRange || {};
    if (!start || !end || !token) return;
    await fetchCompanyDetailsLocal("Consolidate Reports");
    try {
      await dispatch(fetchConsolidateReportsThunk({ token, start, end, user })).unwrap();
    } catch {
      // handled in slice
    }
  };
  
  // schedule navigation removed (was unused)
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-left items-start flex flex-col w-full relative">
      {/* Header */}
      <div className="pb-6 border-b border-gray-200 dark:border-gray-700 mb-6 w-full">
        <h1 className="text-2xl font-bold text-[#1a365d] dark:text-blue-300">Horizon Reports</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Generate and export session, daily, and consolidated usage reports.
        </p>
      </div>

      {showHorizonReports && (
        <form
          className="w-full flex flex-col"
          onSubmit={handleSubmit}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6 w-full">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Date Range:
                </label>
                <RangePicker
                  onChange={handleValueChange}
                  showTime={{
                    hideDisabledOptions: true,
                    defaultValue: [
                      dayjs("00:00:00", "HH:mm:ss"),
                      dayjs("23:59:59", "HH:mm:ss"),
                    ],
                  }}
                  format="YYYY-MM-DD HH:mm:ss"
                />
              </div>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="user"
                  className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap"
                >
                  Select User:
                </label>
                <select
                  id="user"
                  value={user}
                  onChange={(e) => dispatch(setUser(e.target.value))}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d]"
                >
                  <option value="All Users">All Users</option>
                  {userOptions.map((userName, index) => (
                    <option key={index} value={userName}>
                      {userName}
                    </option>
                  ))}
                </select>
                {loader && (
                  <ColorRing
                    visible={true}
                    height="28"
                    width="28"
                    ariaLabel="color-ring-loading"
                    wrapperStyle={{}}
                    wrapperClass="color-ring-wrapper"
                    colors={[
                      "#1a365dcc",
                      "#1a365dcc",
                      "#1a365dcc",
                      "#1a365dcc",
                      "#1a365dcc",
                    ]}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-6">
                {[
                  { key: "session", label: "Session Reports", onClick: fetchSessionReportsLocal },
                  { key: "day", label: "Day Reports", onClick: fetchDayReportsLocal },
                  { key: "consolidate", label: "Consolidate Reports", onClick: fetchConsolidateReportsLocal },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    className={`pb-3 text-sm relative transition-all duration-300 ${
                      activeTab === tab.key
                        ? "text-[#1a365d] dark:text-blue-300 font-semibold after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:w-full after:h-[3px] after:bg-[#1a365d]"
                        : "text-gray-600 dark:text-gray-400 hover:text-[#1a365d] dark:text-blue-300"
                    }`}
                    type="button"
                    onClick={() => {
                      dispatch(setActiveTab(tab.key));
                      tab.onClick();
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {print && (
                <button
                  className="flex items-center gap-1.5 px-4 py-2 mb-2 rounded-md bg-[#1a365d] text-white hover:bg-[#153056] text-xs font-semibold shadow-sm transition-all"
                  type="button"
                  onClick={handlePrint}
                >
                  Print
                </button>
              )}
            </div>
            {dateRange.start === "" && dateRange.end === "" && (
              <div className="text-gray-400 text-sm text-center py-16">
                Please select a date range to view reports.
              </div>
            )}
            <div ref={componentRef} className={dateRange.start ? "px-5 pb-5" : ""}>
              {/* Display Session Reports */}

              {showSessionReports && sessionReports.length > 0 && (
                <div className="Report_container fixed-header">
                  <table>
                    <thead className="report_thead">
                      <tr>
                        <th colSpan={3} className="company_name">
                          <h3 style={{ color: "black" }}>
                            Company Name :{" "}
                            <span style={{ color: "gray" }}>
                              {" "}
                              {company.company_name}
                            </span>{" "}
                          </h3>
                        </th>
                        <th rowSpan={2} className="company_logo">
                          <img
                            src={`data:image/png;base64,${company.company_logo}`}
                            alt="Company Logo"
                            className="company-logo"
                          />
                        </th>
                      </tr>
                      <tr>
                        <th>
                          Date Range:{" "}
                          <span>
                            {new Date(dateRange.start).toLocaleString()} -{" "}
                            {new Date(dateRange.end).toLocaleString()}
                          </span>
                        </th>

                        <th>
                          User Name :<span>{user}</span>
                        </th>
                        <th>
                          Report Type : <span>Session Reports</span>
                        </th>
                      </tr>
                    </thead>
                  </table>
                  <table>
                    <thead className="report_reports">
                      <tr>
                        <th>Username</th>
                        <th>Login Time</th>
                        <th>Logout Time</th>
                        <th>Machine Name</th>
                        <th>Session Duration</th>
                        {/* Add more headers as needed */}
                      </tr>
                    </thead>
                    <tbody className="report_tbody">
                      {sessionReports.map((report, index) => (
                        <tr key={index}>
                          <td>{report.username}</td>
                          <td>{formatDateTime(report.login_time)}</td>
                          <td>{formatDateTime(report.logout_time)}</td>
                          <td>{report.machine_name}</td>
                          <td>{formatDuration(report.session_duration)}</td>
                          {/* Add more cells as needed */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <table>
                    <tr>
                      <td>
                        <div className="info-row-container">
                          <div className="generated-by">
                            Generated By:{" "}
                            <span className="bold">{Userprofileicon}</span>
                          </div>
                          <div className="date">
                            Date:{" "}
                            <span className="bold">{formattedDateTime}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
              )}

              {/* Display Day Reports */}
              {showDayReports && dayReports.length > 0 && (
                <div className="Report_container">
                  <table>
                    <thead className="report_thead">
                      <tr>
                        <th colSpan={3} className="company_name">
                          <h3 style={{ color: "black" }}>
                            Company Name :{" "}
                            <span style={{ color: "gray" }}>
                              {" "}
                              {company.company_name}
                            </span>{" "}
                          </h3>
                        </th>
                        <th rowSpan={2} className="company_logo">
                          <img
                            src={`data:image/png;base64,${company.company_logo}`}
                            alt="Company Logo"
                            className="company-logo"
                          />
                        </th>
                      </tr>
                      <tr>
                        <th>
                          Date Range:{" "}
                          <span>
                            {new Date(dateRange.start).toLocaleString()} -{" "}
                            {new Date(dateRange.end).toLocaleString()}
                          </span>
                        </th>

                        <th>
                          User Name :<span>{user}</span>
                        </th>
                        <th>
                          Report Type : <span>Daily Reports</span>
                        </th>
                      </tr>
                    </thead>
                  </table>
                  <table>
                    <thead className="report_reports">
                      <tr>
                        <th>Username</th>
                        <th>Machine Name</th>
                        <th>Date</th>
                        <th>Day Session Count</th>
                        <th>Daily Duration</th>
                      </tr>
                    </thead>
                    <tbody className="report_tbody">
                      {dayReports.map((report, index) => (
                        <tr key={index}>
                          <td>{report.username}</td>
                          <td>{report.machine_name}</td>
                          <td>{report.date}</td>
                          <td>{report.day_session_count}</td>
                          <td>{formatDuration(report.daily_duration)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <table>
                    <tr>
                      <td>
                        <div className="info-row-container">
                          <div className="generated-by">
                            Generated By:{" "}
                            <span className="bold">{Userprofileicon}</span>
                          </div>
                          <div className="date">
                            Date:{" "}
                            <span className="bold">{formattedDateTime}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
              )}
              {/* Display Console Reports */}
              {showConsolidateReports && consolidateReports.length > 0 && (
                <div className="Report_container">
                  <table>
                    <thead className="report_thead">
                      <tr>
                        <th colSpan={3} className="company_name">
                          <h3 style={{ color: "black" }}>
                            Company Name :{" "}
                            <span style={{ color: "gray" }}>
                              {" "}
                              {company.company_name}
                            </span>{" "}
                          </h3>
                        </th>
                        <th rowSpan={2} className="company_logo">
                          <img
                            src={`data:image/png;base64,${company.company_logo}`}
                            alt="Company Logo"
                            className="company-logo"
                          />
                        </th>
                      </tr>
                      <tr>
                        <th>
                          Date Range:{" "}
                          <span>
                            {new Date(dateRange.start).toLocaleString()} -{" "}
                            {new Date(dateRange.end).toLocaleString()}
                          </span>
                        </th>

                        <th>
                          User Name :<span>{user}</span>
                        </th>
                        <th>
                          Report Type : <span>Consolidate Reports</span>
                        </th>
                      </tr>
                    </thead>
                  </table>
                  <table>
                    <thead className="report_reports">
                      <tr>
                        <th>Username</th>
                        <th>Machine Name</th>
                        <th>Session Count</th>
                        <th>Total Duration</th>
                      </tr>
                    </thead>
                    <tbody className="report_tbody">
                      {consolidateReports.map((report, index) => (
                        <tr key={index}>
                          <td>{report.username}</td>
                          <td>{report.machine_name}</td>

                          <td>{report.day_session_count}</td>
                          <td>{formatHoursDuration(report.total_duration)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <table>
                    <tr>
                      <td>
                        <div className="info-row-container">
                          <div className="generated-by">
                            Generated By:{" "}
                            <span className="bold">{Userprofileicon}</span>
                          </div>
                          <div className="date">
                            Date:{" "}
                            <span className="bold">{formattedDateTime}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default Reports;

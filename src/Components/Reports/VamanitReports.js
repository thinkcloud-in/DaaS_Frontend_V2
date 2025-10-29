import React, { useState, useEffect, useRef, useContext } from "react";
import "./Reports.css";
import {
  fetchVamanitAllUsers,
  fetchVamanitSessionReports,
  fetchVamanitDayReports,
  fetchVamanitConsolidateReports,
  fetchCompanyDetails,
} from "Services/ReportsService";
import dayjs from "dayjs";

import { useReactToPrint } from "react-to-print";
import { PoolContext } from "../../Context/PoolContext";
import { ColorRing } from "react-loader-spinner";
import { DatePicker } from "antd";
import { toast } from "react-toastify";

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
  const seconds = Math.round(totalDurationInSeconds % 60);

  return `${hours} hours ${minutes} minutes ${seconds} seconds`;
};

const VamanitReports = (tokenParsed) => {
  const [userOptions, setUserOptions] = useState([]);
  const [user, setUser] = useState("All Users");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [value, setValue] = useState({
    startDate: null,
    endDate: null,
  });
  const [sessionReports, setSessionReports] = useState([]);
  const [dayReports, setDayReports] = useState([]);
  const [showSessionReports, setShowSessionReports] = useState(false);
  const [showDayReports, setShowDayReports] = useState(false);
  const [loader, setLoader] = useState(false);
  const [print, setPrint] = useState(false);
  const [company, setCompany] = useState({
    company_name: "",
    company_logo: "",
  });
  const [consolidateReports, setConsolidateReports] = useState([]);
  const [showConsolidateReports, setShowConsolidateReports] = useState(false);
  const [activeTab, setActiveTab] = React.useState("");

  const pc = useContext(PoolContext);

  const componentRef = useRef();
  const token = pc.token;
  let Userprofile = tokenParsed.tokenParsed.name;
  const today = new Date();
  const formattedDateTime = today.toLocaleString();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  useEffect(() => {
    const { start, end } = dateRange;
    if (!start || !end) return;
    setLoader(true);
    fetchVamanitAllUsers(token, start, end)
      .then((data) => setUserOptions(data))
      .catch(() => setUserOptions([]))
      .finally(() => setLoader(false));
  }, [dateRange, token]);

  const fetchCompanyDetailsLocal = async (reportType) => {
    try {
      const response = await fetchCompanyDetails(token, reportType);
      const companyData = Array.isArray(response.data)
        ? response.data.find((company) => company.report_type === reportType)
        : response.data;
      if (companyData) {
        setCompany({
          company_name: companyData.company_name,
          company_logo: companyData.company_logo,
        });
      }
    } catch (error) {
      toast.error("Error fetching company details");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleValueChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange({
        start: dates[0].format("YYYY-MM-DD HH:mm:ss.SSSSSS"),
        end: dates[1].format("YYYY-MM-DD HH:mm:ss.SSSSSS"),
      });
    } else {
      // If dates are not selected or cleared, reset all reports and user options
      setDateRange({ start: "", end: "" });
      setSessionReports([]);
      setDayReports([]);
      setUserOptions([]);
      setShowSessionReports(false);
      setShowDayReports(false);
      setShowConsolidateReports(false);
    }
  };
  const fetchSessionReportsLocal = async () => {
    const { start, end } = dateRange;
    if (!start || !end) return;
    setLoader(true);
    await fetchCompanyDetailsLocal("Session Reports");
    try {
      const response = await fetchVamanitSessionReports(token, start, end, user);
      setSessionReports(response.data);
      setPrint(true);
      setShowSessionReports(true);
      setShowDayReports(false);
      setShowConsolidateReports(false);
      toast.success(response.msg);
    } catch (error) {
      setSessionReports([]);
      toast.error(error?.data?.msg || "Error fetching session reports");
    } finally {
      setLoader(false);
    }
  };
  const fetchDayReportsLocal = async () => {
    const { start, end } = dateRange;
    if (!start || !end) return;
    setLoader(true);
    await fetchCompanyDetailsLocal("Daily Reports");
    try {
      const response = await fetchVamanitDayReports(token, start, end, user);
      setDayReports(response.data);
      setPrint(true);
      setShowSessionReports(false);
      setShowDayReports(true);
      setShowConsolidateReports(false);
      toast.success(response.msg);
    } catch (error) {
      setDayReports([]);
      toast.error(error?.data?.msg || "Error fetching day reports");
    } finally {
      setLoader(false);
    }
  };
  const fetchConsolidateReportsLocal = async () => {
    const { start, end } = dateRange;
    if (!start || !end) return;
    setLoader(true);
    await fetchCompanyDetailsLocal("Consolidate Reports");
    try {
      const response = await fetchVamanitConsolidateReports(token, start, end, user);
      setConsolidateReports(response.data);
      setPrint(true);
      setShowSessionReports(false);
      setShowDayReports(false);
      setShowConsolidateReports(true);
      toast.success(response.msg);
    } catch (error) {
      setConsolidateReports([]);
      toast.error(error?.data?.msg || "Error fetching consolidate reports");
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className="Reports_main_container w-[98%] m-auto mt-5 p-5 rounded-[10px] bg-white overflow-hidden">
      <div className="Report_page w-[98%] m-auto mt-5 p-5 rounded-[10px] bg-white overflow-hidden">
        <div className="Reports_name">
          <div className="reports_title">
            <button className="report_type" type="button">
              Vamanit Daas Reports
            </button>
          </div>
        </div>

        <form className="report-form" onSubmit={handleSubmit}>
          <div className="form_main_container">
            <div className="form_sub_container">
              <div className="form-group">
                <label>Date Range : </label>
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
              <div className="form-group">
                <label htmlFor="user">Select User : </label>
                <select
                  id="user"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
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
                    height="50"
                    width="50"
                    ariaLabel="color-ring-loading"
                    wrapperStyle={{}}
                    wrapperClass="color-ring-wrapper"
                    colors={[
                      "#3725dddc",
                      "#3725dddc",
                      "#3725dddc",
                      "#3725dddc",
                      "#3725dddc",
                    ]}
                  />
                )}
              </div>
            </div>
            <div className="tab_container">
              <div className="tab_header">
                <div className="tab_buttons_group">
                  <button
                    className={`tab_button ${
                      activeTab === "session" ? "active" : ""
                    }`}
                    type="button"
                    onClick={() => {
                      setActiveTab("session");
                      fetchSessionReportsLocal();
                    }}
                  >
                    Session Reports
                  </button>
                  <button
                    className={`tab_button ${
                      activeTab === "day" ? "active" : ""
                    }`}
                    type="button"
                    onClick={() => {
                      setActiveTab("day");
                      fetchDayReportsLocal();
                    }}
                  >
                    Day Reports
                  </button>
                  <button
                    className={`tab_button ${
                      activeTab === "consolidate" ? "active" : ""
                    }`}
                    type="button"
                    onClick={() => {
                      setActiveTab("consolidate");
                      fetchConsolidateReportsLocal();
                    }}
                  >
                    Consolidate Reports
                  </button>
                </div>
                {print && (
                  <button
                    className="button"
                    type="button"
                    onClick={handlePrint}
                  >
                    Print
                  </button>
                )}
              </div>
              {dateRange.start === "" && dateRange.end === "" && (
                <div className="text-gray-500 mt-20 ">
                  Please select Date Range
                </div>
              )}
            </div>
          </div>
          <div ref={componentRef}>
            {showSessionReports && sessionReports.length > 0 && (
              <div className="Report_container fixed-header">
                <table>
                  <thead className="report_thead">
                    <tr>
                      <th colSpan={3} className="company_name">
                        <h2>{company.company_name}</h2>
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
                    </tr>
                  </thead>
                  <tbody className="report_tbody">
                    {sessionReports.map((report, index) => (
                      <tr key={index}>
                        <td>{report.username}</td>
                        <td>{formatDateTime(report.loginTime)}</td>
                        <td>{formatDateTime(report.logoutTime)}</td>
                        <td>{report.machineName}</td>
                        <td>{formatDuration(report.sessionDuration)}</td>
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
                          <span className="bold">{Userprofile}</span>
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
            {showDayReports && dayReports.length > 0 && (
              <div className="Report_container">
                <table>
                  <thead className="report_thead">
                    <tr>
                      <th colSpan={3} className="company_name">
                        <h2>{company.company_name}</h2>
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
                          <span className="bold">{Userprofile}</span>
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
                          Generated By: <span className="bold">user</span>
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
        </form>
      </div>
    </div>
  );
};

export default VamanitReports;

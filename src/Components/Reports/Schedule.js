import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import TextField from "@mui/material/TextField";
import { Radio, RadioGroup, FormControlLabel, FormLabel } from "@mui/material";
import { PoolContext } from "../../Context/PoolContext";
import { toast } from "react-toastify";
import axiosInstance from "Services/AxiosInstane";
import CircularProgress from "@mui/material/CircularProgress";
import { getEnv } from "utils/getEnv";
import { addOrUpdateSchedule } from "Services/ReportsService";

export default function Auto_Mail(tokenParsed) {
  const pc = useContext(PoolContext);
  let token = pc.token;
  
  const [formData, setFormData] = useState({
    userEmail: tokenParsed.tokenParsed.email,
    receiverEmail: "",
    reportName: "",
    report: "Vamanit",
    schedule_date: "",
    time: "",
    schedule_type: "",
    schedule_id: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();
  const reports = location.state?.report;

  useEffect(() => {
    if (reports) {
      setFormData({
        id: reports.id,
        userEmail: reports.userEmail,
        report: reports.report,
        reportName: reports.reportName,
        schedule_date: reports.schedule_date,
        time: reports.time,
        receiverEmail: reports.receiverEmail,
        schedule_type: reports.schedule_type,
        schedule_id: reports.schedule_id,
      });
    }
  }, [reports]);

  const handleChange = (e) => {
    let value = e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const formatDate = (date, includeTime = true) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    if (includeTime) {
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } else {
      return `${year}-${month}-${day}`;
    }
  };

  const handleRadioChange = (e) => {
    const curr_option = e.target.value;
    const date = new Date();
    let deliveredDate, reportStart, reportEnd;

    if (!curr_option) {
      alert("Please select a Duration option");
      return;
    }

    if (curr_option === "daily") {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      deliveredDate = formatDate(nextDay, false);
      reportStart = formatDate(new Date(date.setHours(0, 0, 0, 0)));
      reportEnd = formatDate(new Date(date.setHours(23, 59, 59, 999)));
    }

    if (curr_option === "weekly") {
      let recentSunday = new Date(date);
      recentSunday.setDate(date.getDate() - date.getDay());
      reportStart = formatDate(new Date(recentSunday.setHours(0, 0, 0, 0)));
      let reportEndDate = new Date(recentSunday);
      reportEndDate.setDate(recentSunday.getDate() + 6);
      reportEnd = formatDate(new Date(reportEndDate.setHours(23, 59, 59, 999)));
      let deliveryDate = new Date(reportEndDate);
      deliveryDate.setDate(reportEndDate.getDate() + 1);
      deliveredDate = formatDate(deliveryDate, false);
    } else if (curr_option === "monthly") {
      const currentMonthStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        1
      );
      const currentMonthEnd = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
      );
      reportStart = formatDate(
        new Date(currentMonthStart.setHours(0, 0, 0, 0))
      );
      reportEnd = formatDate(
        new Date(currentMonthEnd.setHours(23, 59, 59, 999))
      );
      const deliveryDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      deliveredDate = formatDate(deliveryDate, false);
    }

    setFormData((prevData) => ({
      ...prevData,
      schedule_type: curr_option,
      schedule_date: deliveredDate,
      report_start: reportStart,
      report_end: reportEnd,
    }));
  };

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();

    if (
      !formData.time ||
      !formData.reportName ||
      !formData.receiverEmail ||
      !formData.schedule_type ||
      !formData.reportName
    ) {
      toast.error("Please fill all the fields");
      setIsLoading(false);
      return;
    }
    if (!formData.schedule_type) {
      toast.error("Please select a schedule type");
      setIsLoading(false);
      return;
    }
    const emailList = formData.receiverEmail
      .split(",")
      .map((email) => email.trim());

    let email_valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const email of emailList) {
      if (!email_valid.test(email)) {
        toast.error(`Invalid email: ${email}`);
        setIsLoading(false);
        return;
      }
    }

    try {
      let response;
      if (reports) {
        response = await addOrUpdateSchedule(token, formData, true);
        toast.success("Report Updated Successfully");
      } else {
        response = await addOrUpdateSchedule(token, formData, false);
        if (response.data.code === 201){
          toast.success(response.data.msg || "Report Scheduled Successfully");
        }
      }
      navigate("/ReportList");
    } catch (error) {
      toast.error("Something went wrong, Report Is Not Scheduled");
    } finally {
      setIsLoading(false);
    }
  };
    const Goback = () => {
    navigate(-1);
  };
  return (
    <div className="w-[98%] h-[90vh] min-h-[75vh] bg-white rounded-lg flex flex-col justify-between text-center m-auto mt-[1.125rem] font-inter overflow-visible">
      <div className="w-full ">
        <nav className="flex items-center mb-12 w-full rounded-md h-[60px] mt-auto relative border-b-2 border-[#1a365d5]">
          <div
          onClick={Goback}
          className="ml-2 bg-[#1a365d]/80 text-[#f5f5f5] px-2 py-2 rounded-md hover:bg-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:ring-opacity-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </div>
          <h2 className="text-[1.7rem] font-bold text-[#1a365d] mx-auto">Schedule</h2>
        </nav>
        <div className="w-[35%] min-h-[60vh] bg-white p-5 rounded-lg shadow-md flex flex-col items-center m-auto overflow-y-auto pr-2 box-border custom-scrollbar overflow-scroll  md:w-[35%] sm:w-[60%] xs:w-[70%]">
          <form onSubmit={handleSubmit} className="flex flex-col w-full h-full">
            <div className="flex flex-col gap-4 max-h-[70vh]  min-h-[60vh] custom-scrollbar">
              <TextField
                label="Email Address"
                variant="outlined"
                type="text"
                name="receiverEmail"
                value={formData.receiverEmail}
                fullWidth
                margin="normal"
                required
                inputProps={{ style: { height: "10px", color: "#1a365d" } }}
                InputLabelProps={{ style: { color: "#1a365d" } }}
                onChange={handleChange}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#1a365d" },
                    "&:hover fieldset": { borderColor: "#1a365d" },
                    "&.Mui-focused fieldset": { borderColor: "#1a365d" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#1a365d" },
                }}
              />
              <div className="flex flex-col my-4">
                <select
                  name="report"
                  value={formData.report}
                  onChange={(e) =>
                    setFormData({ ...formData, report: e.target.value })
                  }
                  required
                  className="text-[#1a365d] border-[1.5px] border-[#1a365d] rounded px-3 py-2 font-medium focus:outline-none focus:border-[#1a365d] focus:ring-2 focus:ring-[#1a365d]/15 bg-white transition-colors"
                >
                  <option value="Vamanit"> Vamanit Daas Reports </option>
                  <option value="Horizon"> Horizon Reports </option>
                </select>
              </div>
              <div className="flex flex-col my-4">
                <select
                  id="report"
                  name="reportName"
                  value={formData.reportName}
                  onChange={handleChange}
                  required
                  className="text-[#1a365d] border-[1.5px] border-[#1a365d] rounded px-3 py-2 font-medium focus:outline-none focus:border-[#1a365d] focus:ring-2 focus:ring-[#1a365d]/15 bg-white transition-colors"
                >
                  <option value="">Select Report</option>
                  <option value="Session Reports">Session Reports</option>
                  <option value="Daily Reports">Daily Reports</option>
                  <option value="Consolidate Reports">
                    Consolidate Reports
                  </option>
                </select>
              </div>
              <TextField
                variant="outlined"
                type="time"
                fullWidth
                name="time"
                inputProps={{ style: { height: "10px" } }}
                value={formData.time}
                margin="normal"
                onChange={handleChange}
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#1a365d" },
                    "&:hover fieldset": { borderColor: "#1a365d" },
                    "&.Mui-focused fieldset": { borderColor: "#1a365d" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#1a365d" },
                }}
              />
              <FormLabel component="legend" className="text-left font-semibold text-[#1a365d]">
                Schedule Type{" "}
              </FormLabel>
              <RadioGroup
                onChange={handleRadioChange}
                value={formData.schedule_type}
                required
                sx={{
                  color: '#1a365d',
                  '& .MuiFormControlLabel-label': { color: '#1a365d' },
                }}
              >
                <FormControlLabel
                  value="daily"
                  control={<Radio sx={{ color: '#1a365d', '&.Mui-checked': { color: '#1a365d' } }} />}
                  label="Daily"
                />
                <FormControlLabel
                  value="weekly"
                  control={<Radio sx={{ color: '#1a365d', '&.Mui-checked': { color: '#1a365d' } }} />}
                  label="Weekly"
                />
                <FormControlLabel
                  value="monthly"
                  control={<Radio sx={{ color: '#1a365d', '&.Mui-checked': { color: '#1a365d' } }} />}
                  label="Monthly"
                />
              </RadioGroup>
              <div
                id="container-footer"
                style={{ display: formData.schedule_type ? "block" : "none" }}
              >
                <h6 className="text-[15px]">
                  Date Range From <strong> : </strong> {formData.report_start}
                </h6>
                <h6 className="text-[15px]">
                  Date Range To <strong> : </strong> {formData.report_end}
                </h6>
                <h6 className="text-[15px]">
                  Reports generates on <strong> : </strong>{" "}
                  {formData.schedule_date} <strong> at </strong> {formData.time}
                </h6>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              {isLoading ? (
                <div className="flex items-center gap-2 px-5 py-2 rounded bg-[#1a365d] text-[#f5f5f5] cursor-wait">
                  <CircularProgress size={18} style={{ color: "#f5f5f5" }} />
                  <span className="text-lg">Submitting...</span>
                </div>
              ) : (
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[#1a365d]/80 text-[#f5f5f5] hover:bg-[#1a365d] transition-colors font-medium"
                >
                  Submit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
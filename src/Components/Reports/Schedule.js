import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Radio, RadioGroup, FormControlLabel, FormLabel } from "@mui/material";
import { selectAuthToken, selectAuthTokenParsed } from '../../redux/features/Auth/AuthSelectors';
import { toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import { useDispatch, useSelector } from 'react-redux';
import { addOrUpdateSchedule } from '../../redux/features/Reports/ReportsThunks';
import { selectScheduleSaveLoading } from '../../redux/features/Reports/ReportsSelectors';
import { InputField, SelectField } from '../Common';


export default function Auto_Mail() {
  const token = useSelector(selectAuthToken);
  const tokenParsed = useSelector(selectAuthTokenParsed);

  const [formData, setFormData] = useState({
    userEmail: tokenParsed?.preferred_username,
    receiverEmail: "",
    reportName: "",
    report: "Vamanit",
    schedule_date: "",
    time: "",
    schedule_type: "",
    schedule_id: "",
  });
  const dispatch = useDispatch();
  const scheduleSaveLoading = useSelector(selectScheduleSaveLoading);

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
  e.preventDefault();

    if (
      !formData.time ||
      !formData.reportName ||
      !formData.receiverEmail ||
      !formData.schedule_type ||
      !formData.reportName
    ) {
      toast.error("Please fill all the fields");
      return;
    }
    if (!formData.schedule_type) {
      toast.error("Please select a schedule type");
      return;
    }
    const emailList = formData.receiverEmail
      .split(",")
      .map((email) => email.trim());

    let email_valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (const email of emailList) {
      if (!email_valid.test(email)) {
        toast.error(`Invalid email: ${email}`);
        return;
      }
    }

    try {
      const result = await dispatch(
        addOrUpdateSchedule({ token, formData, isUpdate: !!reports })
      ).unwrap();
      // show a success message depending on response
      if (reports) {
        toast.success("Report Updated Successfully");
      } else if (result && result.code === 201) {
        toast.success(result.msg || "Report Scheduled Successfully");
      } else {
        toast.success("Report scheduled");
      }
      navigate("/ReportList");
    } catch (error) {
      const msg = error?.msg || error?.message || "Something went wrong, Report Is Not Scheduled";
      toast.error(msg);
    }
  };
    const Goback = () => {
    navigate(-1);
  };
  return (
    <div className="w-full md:w-[98%] h-auto md:h-[90vh] min-h-[75vh] bg-white rounded-lg flex flex-col justify-start text-center m-auto mt-[1.125rem] font-inter overflow-auto md:overflow-hidden p-2 md:p-4 shadow-lg border border-gray-100">
      <div className="w-full ">
        <nav className="flex items-center mb-6 md:mb-12 w-full rounded-md h-[60px] relative border-b-2 border-gray-100">
          <div
          onClick={Goback}
          className="ml-2 bg-[#1a365d]/80 text-[#f5f5f5] px-2 py-2 rounded-md hover:bg-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:ring-opacity-10 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </div>
          <h2 className="text-[1.5rem] md:text-[1.7rem] font-bold text-[#1a365d] mx-auto">Schedule</h2>
        </nav>
        <div className={`w-[95%] max-w-4xl bg-white p-4 md:p-8 rounded-lg shadow-md flex flex-col mx-auto border border-gray-100 ${scheduleSaveLoading ? "opacity-50 pointer-events-none select-none transition-all" : ""}`}>
          <form onSubmit={handleSubmit} className="flex flex-col w-full h-full pr-2 text-left">
            <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar">

              <InputField
                label="Email Address"
                name="receiverEmail"
                iconClass="fa-envelope"
                value={formData.receiverEmail}
                onChange={handleChange}
                required={true}
                placeholder="Enter email addresses (comma separated)"
              />

              <SelectField
                label="Report Name"
                name="reportName"
                iconClass="fa-file-lines"
                value={formData.reportName}
                onChange={handleChange}
                required={true}
                options={[
                  { value: 'Session Reports', label: 'Session Reports' },
                  { value: 'Daily Reports', label: 'Daily Reports' },
                  { value: 'Consolidate Reports', label: 'Consolidate Reports' }
                ]}
              />

              <InputField
                label="Time"
                name="time"
                type="time"
                iconClass="fa-clock"
                value={formData.time}
                onChange={handleChange}
                required={true}
              />

              <div className="mb-6 flex items-start">
                <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px] mt-2">
                  <span><i className="fas fa-calendar-alt mr-2"></i></span> Schedule Type
                </label>
                <div className="flex-1 ml-2">
                  <RadioGroup
                    onChange={handleRadioChange}
                    value={formData.schedule_type}
                    required
                    className="flex flex-row flex-wrap mt-[0.3rem]"
                    sx={{
                      color: '#1a365d',
                      '& .MuiFormControlLabel-label': { color: '#1a365d', fontSize: '0.9rem' },
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
                </div>
              </div>

              <div
                id="container-footer"
                className="mt-4 p-4 lg:ml-[188px] bg-gray-50 rounded text-left border border-gray-100"
                style={{ display: formData.schedule_type ? "block" : "none" }}
              >
                <h6 className="text-[14px] text-gray-700 mb-1">
                  Date Range From: <span className="font-semibold text-[#1a365d]">{formData.report_start}</span>
                </h6>
                <h6 className="text-[14px] text-gray-700 mb-1">
                  Date Range To: <span className="font-semibold text-[#1a365d]">{formData.report_end}</span>
                </h6>
                <h6 className="text-[14px] text-gray-700">
                  Reports generated on: <span className="font-semibold text-[#1a365d]">{formData.schedule_date}</span> at <span className="font-semibold text-[#1a365d]">{formData.time}</span>
                </h6>
              </div>
            </div>

            <div className="flex justify-start lg:ml-[188px] mt-6 w-full">
              {scheduleSaveLoading ? (
                <div className="flex items-center gap-2 px-6 py-2 rounded bg-[#1a365d] text-[#f5f5f5] cursor-wait shadow-sm">
                  <CircularProgress size={16} style={{ color: "#f5f5f5" }} />
                  <span className="text-sm font-medium">Submitting...</span>
                </div>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 rounded bg-[#1a365d]/80 text-[#f5f5f5] hover:bg-[#1a365d] transition-all font-medium shadow-sm active:scale-95"
                >
                  {reports ? "Update Scheduler" : "Submit"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
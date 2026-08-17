import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Radio, RadioGroup, FormControlLabel, FormLabel } from "@mui/material";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
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
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-left items-start flex flex-col w-full relative">
      {/* Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-gray-200 dark:border-gray-700 mb-6 w-full">
        <button
          type="button"
          onClick={Goback}
          className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors text-gray-700 dark:text-gray-300"
        >
          <ArrowLeftIcon className="h-5 w-5 stroke-[2.5]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1a365d] dark:text-blue-300">
            {reports ? "Edit Schedule" : "Schedule Report"}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Configure a recurring report to be emailed automatically.
          </p>
        </div>
      </div>

      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-3xl mx-auto p-6 md:p-8 ${scheduleSaveLoading ? "opacity-50 pointer-events-none select-none transition-all" : ""}`}
      >
        <form onSubmit={handleSubmit} className="flex flex-col w-full text-left">
            <div className="flex flex-col gap-4">

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
                <label className="flex items-center gap-2 font-medium text-[#22223b] dark:text-gray-100 min-w-[180px] mt-2">
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
                className="mt-4 ml-[188px] max-w-[40rem] rounded-lg border border-blue-100 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/30 px-5 pt-4 pb-4 shadow-sm text-left"
                style={{ display: formData.schedule_type ? "block" : "none" }}
              >
                <p className="text-xs font-semibold text-[#1a365d]/70 dark:text-blue-300/70 uppercase tracking-wide mb-3">
                  Schedule Preview
                </p>
                <h6 className="text-[13px] text-gray-700 dark:text-gray-300 mb-1.5">
                  Date Range From: <span className="font-semibold text-[#1a365d] dark:text-blue-300">{formData.report_start}</span>
                </h6>
                <h6 className="text-[13px] text-gray-700 dark:text-gray-300 mb-1.5">
                  Date Range To: <span className="font-semibold text-[#1a365d] dark:text-blue-300">{formData.report_end}</span>
                </h6>
                <h6 className="text-[13px] text-gray-700 dark:text-gray-300">
                  Reports generated on: <span className="font-semibold text-[#1a365d] dark:text-blue-300">{formData.schedule_date}</span> at <span className="font-semibold text-[#1a365d] dark:text-blue-300">{formData.time}</span>
                </h6>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 w-full">
              <button
                type="button"
                onClick={Goback}
                className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={scheduleSaveLoading}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#1a365d] rounded-lg hover:bg-[#122744] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {scheduleSaveLoading && (
                  <CircularProgress size={14} style={{ color: "#fff" }} />
                )}
                {scheduleSaveLoading
                  ? "Submitting..."
                  : reports
                    ? "Update Scheduler"
                    : "Submit"}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
}
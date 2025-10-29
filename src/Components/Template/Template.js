import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import "./TemplatePreview.css";
import { fetchReports, updateReport } from "../../Services/TemplateService";
import "./Template.css";
import { PhotoIcon } from "@heroicons/react/24/solid";
import Popup from "../Popup/Popup";
import { PoolContext } from "../../Context/PoolContext";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton"; 
const Template = ({ tokenParsed }) => {
  const today = new Date();
  const formattedDateTime = today.toLocaleString();
  const userProfileIcon = tokenParsed.name;

  const [open, setOpen] = useState(false);
  const [image, setImage] = useState(null); 
  const [reportType, setReportType] = useState("");
  const [reports, setReports] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const pc = useContext(PoolContext);
  const token = pc.token;
  const handleFileOnChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1]; 
        setImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleOnChange = async (event) => {
    const selectedReportType = event.target.value;
    setReportType(selectedReportType);
    setIsLoading(true);
    try {
      const data = await fetchReports(token, selectedReportType);
      setReports(data);
      if (data.length > 0) {
        setImage(data[0].company_logo);
        setCompanyName(data[0].company_name);
      } else {
        setImage(null);
        setCompanyName("");
      }
    } catch (error) {
      toast.error("Failed to fetch reports");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySelection = (event) => {
    const selectedCompanyName = event.target.value;
    setCompanyName(selectedCompanyName);
  };
  const handleSubmit = async () => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("company_name", companyName);
    formData.append("report_type", reportType);
    if (image) {
      if (typeof image === "string") {
        formData.append("company_logo", image);
      } else {
        formData.append("company_logo", image);
      }
    }
    try {
      await updateReport(token, formData);
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-[98%] m-auto p-4 h-[90vh] min-h-[80vh] rounded-md bg-white flex justify-between items-stretch items-center overflow-visible">
      <div className="space-y-5 m-2 flex-1 template_class w-2/3 ml-10 mt-12">
        <Popup
          open={open}
          setOpen={setOpen}
          heading="Please confirm"
          text="Are you sure you want to submit?"
          color="yellow"
        />
        <div className="bg-white p-3 shadow-md text-[#1a365d] rounded-lg shadow-lg border flex-1 pdf_template w-5/6 h-5/6 m-10 overflow-y-auto">
          <h2 className="font-bold leading-7">PDF Template</h2>
          <div className="text-left table-auto mt-5 space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={200} />
              </div>
            ) : (
              <>
                <div className="tr flex items-center gap-x-4">
                  <div className="th w-1/3">
                    <label
                      htmlFor="report"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Report
                    </label>
                  </div>
                  <div className="td w-2/3">
                    <select
                      name="report"
                      value={reportType}
                      onChange={handleOnChange}
                      className="w-full cursor-pointer rounded-md py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[#1a365d]/100 sm:text-sm sm:leading-6"
                    >
                      <option value="">Select Report</option>
                      <option value="Session Reports">Session Reports</option>
                      <option value="Daily Reports">Daily Reports</option>
                      <option value="Consolidate Reports">
                        Consolidate Reports
                      </option>
                    </select>
                  </div>
                </div>
                <div className="tr flex items-center gap-x-4">
                  <div className="th w-1/3">
                    <label
                      htmlFor="companyName"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Company Name
                    </label>
                  </div>
                  <div className="td w-2/3">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset bg-white ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-[#1a365d]/100">
                      <input
                        type="text"
                        name="companyName"
                        list="company-names"
                        value={companyName}
                        onChange={handleCompanySelection}
                        className="block w-full bg-transparent py-1.5 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 rounded-md"
                      />
                    </div>
                  </div>
                </div>
                <div className="tr flex items-start gap-x-4">
                  <div className="th w-1/3">
                    <label
                      htmlFor="photo"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Company logo
                    </label>
                  </div>
                  <div className="td w-2/3">
                    {image ? (
                      <div className="space-y-2">
                        <div className="img rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 border-2 background_image">
                          <img
                            className="img max-h-32 object-contain"
                            src={
                              typeof image === "string"
                                ? `data:image/png;base64,${image}`
                                : URL.createObjectURL(image)
                            }
                            alt="Company logo"
                          />
                        </div>
                        <button
                          type="button"
                          className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 border-2"
                          onClick={() => setImage(null)}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center rounded-lg border-dashed border-gray-900/25 px-6 py-10 border-2 bg-white ">
                        <div className="text-center flex flex-col justify-center items-center">
                          <PhotoIcon
                            className="mx-auto h-12 w-12 text-gray-300"
                            aria-hidden="true"
                          />
                          <div className="flex text-sm leading-6 text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md font-semibold text-[#1a365d] focus-within:outline-none focus-within:ring-2 focus-within:ring-[#1a365d] focus-within:ring-offset-2 hover:text-[#1a365d]"
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleFileOnChange}
                              />
                            </label>
                          </div>
                          <p className="text-xs leading-5 text-gray-600">
                            PNG, JPG, JPEG up to 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="pl-5 text-left">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex items-center justify-center gap-2 rounded-md bg-[#1a365d]/80 px-3 py-2 text-sm font-semibold text-[#f5f5f5] shadow-sm ml-7
        ${
          isSubmitting ? "cursor-not-allowed opacity-70" : "hover:bg-[#1a365d]"
        } 
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a365d]/100`}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={16} color="inherit" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </div>
      <div className="report_divsion report-preview bg-white p-6 rounded-lg shadow-lg border felx-1 w-1/2 h-5/6 m-10 overflow-y-auto custom-scrollbar">
        <h2>PDF Template Preview</h2>
        <table className="report-table">
          <thead>
            <tr>
              <th colSpan={3} className="company_name">
                <span className="text-black">Company Name : </span>
                {companyName || (reports.length > 0 && reports[0].company_name)}
              </th>
              <th rowSpan={2} className="image">
                {image ? (
                  <img
                    className="img"
                    src={
                      typeof image === "string"
                        ? `data:image/png;base64,${image}`
                        : URL.createObjectURL(image)
                    }
                    alt="Company logo"
                  />
                ) : (
                  <img
                    src={`data:image/png;base64,${
                      reports.length > 0 ? reports[0].company_logo : ""
                    }`}
                    alt="Company logo"
                  />
                )}
              </th>
            </tr>
            <tr>
              <th className="text-black">Date Range</th>
              <th className="text-black">Username</th>
              <th>
                <span className="text-black">Report Type: </span>
                {reportType || (reports.length > 0 && reports[0].report_type)}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="data-row">
              <td colSpan={4}>
                <i className="text-gray-700 ">Report data is displayed here</i>
              </td>
            </tr>
            <tr>
              <td colSpan={4}>
                <div className="info-row-container">
                  <div className="generated-by">
                    <span className="text-black"> Generated By: </span>
                    <span className="bold">{userProfileIcon}</span>
                  </div>
                  <div className="date">
                    <span className="text-black">Date: </span>
                    <span className="bold">{formattedDateTime}</span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Template;

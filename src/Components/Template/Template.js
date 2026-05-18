import React, { useState } from "react";
import { toast } from "react-toastify";
import "./TemplatePreview.css";
import "./Template.css";
import { PhotoIcon } from "@heroicons/react/24/solid";
import Popup from "../Popup/Popup";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import { useDispatch, useSelector } from 'react-redux';
import { selectAuthToken } from '../../redux/features/Auth/AuthSelectors';
import { fetchReports, updateReport } from '../../redux/features/Template/TemplateThunks';
import { setReportType, setCompanyName, setImage } from '../../redux/features/Template/TemplateSlice';
import {
  selectReportType,
  selectReports,
  selectCompanyName,
  selectImage,
  selectIsLoading,
  selectIsSubmitting,
} from '../../redux/features/Template/TemplateSelectors';

const Template = ({ tokenParsed }) => {
  const today = new Date();
  const formattedDateTime = today.toLocaleString();
  const userProfileIcon = tokenParsed.name;

  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  // template state moved to redux
  const reportType = useSelector(selectReportType);
  const reports = useSelector(selectReports);
  const companyName = useSelector(selectCompanyName);
  const image = useSelector(selectImage);
  const isLoading = useSelector(selectIsLoading);
  const isSubmitting = useSelector(selectIsSubmitting);
  // auth token from redux state
  const token = useSelector(selectAuthToken);
  const handleFileOnChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid image type. Please upload a JPG, JPEG or PNG image.");
        return;
      }
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        dispatch(setImage(base64String));
      };
      reader.readAsDataURL(file);
    }
  };
  const handleOnChange = async (event) => {
    const selectedReportType = event.target.value;
    dispatch(setReportType(selectedReportType));
    // don't call API when placeholder/empty selection is chosen
    if (!selectedReportType) {
      // clear image and company name when user resets selection
      dispatch(setCompanyName(''));
      dispatch(setImage(null));
      return;
    }

    if (!token) {
      toast.error('Missing auth token');
      return;
    }
    try {
      await dispatch(fetchReports({ token, reportType: selectedReportType })).unwrap();
    } catch (err) {
      toast.error(err || 'Failed to fetch reports');
    }
  };

  const handleCompanySelection = (event) => {
    const selectedCompanyName = event.target.value;
    dispatch(setCompanyName(selectedCompanyName));
  };
  const handleSubmit = async () => {
    if (!token) {
      toast.error('Missing auth token');
      return;
    }
    const formData = new FormData();
    formData.append("company_name", companyName);
    formData.append("report_type", reportType);
    if (image) {
      formData.append("company_logo", image);
    }
    try {
      await dispatch(updateReport({ token, formData })).unwrap();
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error(error || "Failed to upload file");
    }
  };

  return (
    <div className="w-full md:w-[98%] m-auto p-2 md:p-4 h-auto md:h-[90vh] min-h-[80vh] rounded-md bg-white flex flex-col md:flex-row justify-between items-center md:items-stretch overflow-auto md:overflow-hidden gap-4">
      <div className="space-y-5 m-2 flex-1 template_class w-full md:w-2/3 md:ml-10 mt-6 md:mt-12">
        <Popup
          open={open}
          setOpen={setOpen}
          heading="Please confirm"
          text="Are you sure you want to submit?"
          color="yellow"
        />
        <div className="bg-white p-3 shadow-md text-[#1a365d] rounded-lg shadow-lg border flex-1 pdf_template w-full md:w-5/6 h-auto md:h-5/6 m-2 md:m-10 overflow-y-auto">
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
                          onClick={() => dispatch(setImage(null))}
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
                            PNG, JPG, JPEG up to 2MB
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
      <div className="report_divsion report-preview bg-white p-4 md:p-6 rounded-lg shadow-lg border flex-1 w-full md:w-1/2 h-auto md:h-5/6 m-2 md:m-10 overflow-y-auto custom-scrollbar">
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

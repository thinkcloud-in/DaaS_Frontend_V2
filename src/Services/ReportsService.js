import axiosInstance from "./AxiosInstane";
import { getEnv } from "utils/getEnv";

const backendUrl = getEnv("BACKEND_URL");
const HorizonReportsUrl = getEnv("HORIZON_REPORT_URL");

// Vamanit Reports APIs
export const fetchVamanitAllUsers = async (token, start, end) => {
  const response = await axiosInstance.get(
    `${backendUrl}/v1/guacamole/vamanit_allusers/${start}/${end}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.data;
};

export const fetchVamanitSessionReports = async (token, start, end, user = "All Users") => {
  let url = `${backendUrl}/v1/guacamole/vamanit_session_reports/${start}/${end}`;
  if (user !== "All Users") url += `/${user}`;
  const response = await axiosInstance.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchVamanitDayReports = async (token, start, end, user = "All Users") => {
  let url = `${backendUrl}/v1/guacamole/day_reports/${start}/${end}`;
  if (user !== "All Users") url += `/${user}`;
  const response = await axiosInstance.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchVamanitConsolidateReports = async (token, start, end, user = "All Users") => {
  let url = `${backendUrl}/v1/guacamole/total_durations_within_range/${start}/${end}`;
  if (user !== "All Users") url += `/${user}`;
  const response = await axiosInstance.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


// Report List APIs
export const fetchReportsList = async (token, alignment, currentPage, itemsPerPage) => {
  const offset = (currentPage - 1) * itemsPerPage;
  const response = await axiosInstance.get(
    `${backendUrl}/v1/schedule/get_schedules_report/${alignment}?limit=${itemsPerPage}&offset=${offset}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data?.data;
};

export const fetchScheduleStatus = async (token, reportId) => {
  const response = await axiosInstance.get(
    `${backendUrl}/v1/schedule/get_schedule_status/${reportId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data === "Docker Is Not Stared Yet"
    ? "Failed to get status"
    : response.data.data;
};

export const deleteReportSchedule = async (token, id) => {
  return axiosInstance.delete(
    `${backendUrl}/v1/schedule/delete_schedule/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
};

// Schedule APIs
export const addOrUpdateSchedule = async (token, formData, isUpdate) => {
  if (isUpdate) {
    return axiosInstance.put(
      `${backendUrl}/v1/schedule/update_schedule/${formData.id}`,
      formData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  } else {
    return axiosInstance.post(
      `${backendUrl}/v1/schedule/add_schedule`,
      formData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }
};

// Reports APIs (Horizon/Vamanit)
export const fetchSessionReports = async (token, start, end, user = "All Users") => {
  let url = `${HorizonReportsUrl}/user-session-durations/${start}/${end}`;
  if (user !== "All Users") url += `/${user}`;
  const response = await axiosInstance.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchDayReports = async (token, start, end, user = "All Users") => {
  let url = `${HorizonReportsUrl}/daily-report/${start}/${end}`;
  if (user !== "All Users") url += `/${user}`;
  const response = await axiosInstance.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchConsolidateReports = async (token, start, end, user = "All Users") => {
  let url = `${HorizonReportsUrl}/total_durations_within_range/${start}/${end}`;
  if (user !== "All Users") url += `/${user}`;
  const response = await axiosInstance.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Company Details
export const fetchCompanyDetails = async (token, reportType) => {
  const response = await axiosInstance.get(
    `${backendUrl}/v1/guacamole/reports/${reportType}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
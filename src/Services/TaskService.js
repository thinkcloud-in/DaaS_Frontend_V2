import axiosInstance from "./AxiosInstane";
import { getEnv } from "utils/getEnv";
import dayjs from "dayjs";

const backendUrl = getEnv("BACKEND_URL");

export const fetchWorkflows = async (userName, days) => {
  try {
    const response = await axiosInstance.get(`${backendUrl}/v1/workflows`);
    if (!response.data || !response.data.data) return [];

    const cutoffDate = dayjs().subtract(days, "day");

    return response.data.data
      .filter(
        (workflow) =>
          workflow.workflow_type && !/^get/i.test(workflow.workflow_type)
      )
      .filter((workflow) => {
        const start = dayjs(workflow.start_time);
        return start.isValid() && start.isAfter(cutoffDate);
      })
      .map((workflow, index) => ({
        sNo: index + 1,
        taskName: workflow.task_name || "N/A",
        action: workflow.action || "N/A",
        status: workflow.status
          ? workflow.status.charAt(0).toUpperCase() +
            workflow.status.slice(1).toLowerCase()
          : "Unknown",
        initiator: workflow.UserName || "N/A",
        duration: workflow.execution_time ? `${workflow.execution_time}` : "-",
        startTime: workflow.start_time ? `${workflow.start_time}` : "-",
        endTime: workflow.close_time ? `${workflow.close_time}` : "Ongoing",
      }));
  } catch (error) {
    return [];
  }
};
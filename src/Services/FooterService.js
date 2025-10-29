import axiosInstance from "./AxiosInstane";
import { getEnv } from "utils/getEnv";
import dayjs from "dayjs";

const backendUrl = getEnv("BACKEND_URL");

export const fetchFooterTasks = async (userName) => {
  try {
    const response = await axiosInstance.get(`${backendUrl}/v1/workflows`);
    if (!response.data.data) return [];
    const cutoff = dayjs().subtract(1, "day");
    const now = dayjs();
    return response.data.data
      .filter((wf) => wf.workflow_type && !/^get/i.test(wf.workflow_type))
      .filter((wf) => {
        const start = dayjs(wf.start_time);
        return start.isValid() && start.isAfter(cutoff) && start.isAfter(now.subtract(15, "minute"));
      })
      .filter((wf) => wf.UserName === userName)
      .sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
      .map((workflow, index) => ({
        sNo: index + 1,
        taskName: workflow.task_name || "N/A",
        action: workflow.action || "N/A",
        status: workflow.status
          ? workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1).toLowerCase()
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
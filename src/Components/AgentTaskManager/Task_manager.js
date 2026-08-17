import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  fetchVmDetails,
  fetchBackgroundProcesses,
  fetchHostStats,
  killProcesses,
} from "Services/TaskManagerService";
import { toast } from "react-toastify";
import { getEnv } from "utils/getEnv";
import { Loader2 } from "lucide-react";
import { useTheme } from "../../Context/ThemeContext";
import {
  ArrowLeftIcon,
  CpuChipIcon,
  CircleStackIcon,
  ServerIcon,
  TrashIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const TABS = [
  { key: "details", label: "Details" },
  { key: "processes", label: "Processes" },
  { key: "applications", label: "Applications" },
];

const TaskManagerPage = () => {
  const { theme } = useTheme();
  const { poolId, vmId } = useParams();
  const [vmDetails, setVmDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedRows, setSelectedRows] = useState([]);
  const [processData, setProcessData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hostStats, setHostStats] = useState({
    cpu: null,
    memory: null,
    diskio: null,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const osTypeFromProps = location.state?.os_type; // get os_type from navigation state
  const vmNameFromProps = location.state?.vm_name;
  const vmName = vmNameFromProps; // Prefer API value, fallback to prop

  const DASHBOARD_GRAFANA_URL = getEnv("GRAFANA_URL");
  // Linux Configuration
  const INFLUXDB_DATASOURCE_LINUX = getEnv("INFLUXDB_DATASOURCE_LINUX");
  const BUCKET_LINUX = getEnv("BUCKET_LINUX");
  const DASHBOARD_UID_LINUX = getEnv("DASHBOARD_UID_LINUX");
  const DASHBOARD_NAME_LINUX = getEnv("DASHBOARD_NAME_LINUX");

  // Windows Configuration
  const INFLUXDB_DATASOURCE_WINDOWS = getEnv("INFLUXDB_DATASOURCE_WINDOWS");
  const BUCKET_WINDOWS = getEnv("BUCKET_WINDOWS");
  const DASHBOARD_UID_WINDOWS = getEnv("DASHBOARD_UID_WINDOWS");
  const DASHBOARD_NAME_WINDOWS = getEnv("DASHBOARD_NAME_WINDOWS");

  // Function to get configuration based on VM OS type (no default, must be provided)
  const getVMConfig = (osType) => {
    if (!osType) return null;
    const normalizedOS = osType.toLowerCase();
    if (normalizedOS.includes("windows")) {
      return {
        datasource: INFLUXDB_DATASOURCE_WINDOWS,
        bucket: BUCKET_WINDOWS,
        dashboardUid: DASHBOARD_UID_WINDOWS,
        dashboardName: DASHBOARD_NAME_WINDOWS,
        pidField: "process_id",
      };
    } else if (normalizedOS.includes("linux")) {
      return {
        datasource: INFLUXDB_DATASOURCE_LINUX,
        bucket: BUCKET_LINUX,
        dashboardUid: DASHBOARD_UID_LINUX,
        dashboardName: DASHBOARD_NAME_LINUX,
        pidField: "pid",
      };
    }
    return null;
  };

  useEffect(() => {
    fetchVmDetails(vmId)
      .then((data) => setVmDetails(data))
      .catch(() => setVmDetails(null));
  }, [vmId]);

  const fetchAll = () => {
    const osType = osTypeFromProps;
    if (!osType) return;
    const config = getVMConfig(osTypeFromProps);
    if (!config) return;

    const normalizedOS = osTypeFromProps.toLowerCase().includes("windows")
      ? "windows"
      : "linux";

    const internalIp = getInternalIp(vmDetails);
    // Use VM name as primary, IP as fallback
    let hostName = vmName?.trim();
    let hostCandidates = [hostName, hostName?.toUpperCase(), internalIp].filter(
      Boolean,
    );
    hostCandidates = [...new Set(hostCandidates)]; // Unique candidates

    if (hostCandidates.length === 0) return;

    const tryFetch = async (index) => {
      if (index >= hostCandidates.length) {
        setProcessData([]);
        return;
      }
      const host = hostCandidates[index];
      try {
        const data = await fetchBackgroundProcesses(config, host, normalizedOS);
        if (data && data.length > 0) {
          setProcessData(data);
        } else {
          await tryFetch(index + 1);
        }
      } catch (err) {
        console.warn(`Fetch failed for host ${host}:`, err);
        await tryFetch(index + 1);
      }
    };

    const tryFetchStats = async (index) => {
      if (index >= hostCandidates.length) {
        setHostStats({ cpu: null, memory: null, diskio: null });
        return;
      }
      const host = hostCandidates[index];
      try {
        const data = await fetchHostStats(config, host, normalizedOS);
        if (data && (data.cpu !== null || data.memory !== null)) {
          setHostStats(data);
        } else {
          await tryFetchStats(index + 1);
        }
      } catch (err) {
        await tryFetchStats(index + 1);
      }
    };

    tryFetch(0);
    tryFetchStats(0);
  };

  useEffect(() => {
    let intervalId;
    const osType = osTypeFromProps;
    if (activeTab === "processes" && (vmDetails || vmName) && osType) {
      fetchAll();
      intervalId = setInterval(() => {
        // Skip refresh while rows are selected so a checked row's index
        // can't shift to a different process before Kill is clicked.
        if (selectedRows.length === 0) {
          fetchAll();
        }
      }, 5000);
    }
    return () => clearInterval(intervalId);
  }, [activeTab, vmDetails, osTypeFromProps, vmName, selectedRows]);

  const getInternalIp = (details) => {
    if (!details) return null;
    return (
      details.ip_addresses?.[0] ||
      details.ip_address?.[0] ||
      details.NetworkAdapters?.flatMap((na) => na.IPAddresses || [])?.[0] ||
      null
    );
  };

  const hostCpu =
    hostStats.cpu !== null ? `${Number(hostStats.cpu).toFixed(1)}%` : "N/A";
  const hostMemory =
    hostStats.memory !== null
      ? `${Number(hostStats.memory).toFixed(1)}%`
      : "N/A";
  const hostDiskIO =
    hostStats.diskio !== null
      ? `${Number(hostStats.diskio).toFixed(1)}`
      : "N/A";
  const processesCount = processData.length;

  // Helper functions to format process values similar to host stats
  const formatProcessCpu = (cpuValue) => {
    return cpuValue !== undefined && cpuValue !== null
      ? `${Number(cpuValue).toFixed(1)}`
      : "N/A";
  };
  const formatProcessMemory = (memoryValue) => {
    return memoryValue !== undefined && memoryValue !== null
      ? `${Number(memoryValue).toFixed(1)}`
      : "N/A";
  };
  const formatProcessDisk = (diskValue) => {
    return diskValue !== undefined && diskValue !== null
      ? `${Number(diskValue).toFixed(1)}`
      : "N/A";
  };

  // Checkbox logic
  const isAllSelected =
    selectedRows.length === processesCount && processesCount > 0;
  const isIndeterminate =
    selectedRows.length > 0 && selectedRows.length < processesCount;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(processData.map((_, idx) => idx));
    }
  };

  const handleSelectRow = (idx) => {
    setSelectedRows((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const handleKillProcess = async () => {
    if (selectedRows.length === 0) {
      toast.warning("Please select processes to kill");
      return;
    }
    setIsLoading(true);
    // Use os_type from vmDetails if available, else fallback to osTypeFromProps
    const osType = osTypeFromProps;
    if (!osType) {
      toast.error(
        "OS type is not available for this VM. Cannot kill processes.",
      );
      setIsLoading(false);
      return;
    }
    const config = getVMConfig(osTypeFromProps);
    if (!config) {
      toast.error("Unsupported OS type config.");
      setIsLoading(false);
      return;
    }
    const normalizedOS = osTypeFromProps.toLowerCase().includes("windows")
      ? "windows"
      : "linux";

    let pids = [];
    if (normalizedOS === "windows") {
      // For Windows, use ID_Process
      pids = selectedRows
        .map((idx) => processData[idx]?.ID_Process)
        .filter((pid) => pid !== undefined && pid !== null && pid !== "-");
    } else {
      // For Linux, use pidField (usually "pid")
      const pidField = config.pidField;
      pids = selectedRows
        .map((idx) => processData[idx]?.[pidField])
        .filter((pid) => pid !== undefined && pid !== null && pid !== "-");
    }
    if (!pids.length) {
      toast.error("No valid process IDs found");
      setIsLoading(false);
      return;
    }
    const processHost =
      processData[selectedRows[0]]?.host || processData[selectedRows[0]]?.source;

    if (!processHost) {
      toast.error("No host information found for selected processes");
      setIsLoading(false);
      return;
    }
    try {
      const vmNameToMatch = vmDetails?.VMName?.trim() || vmName?.trim();

      if (
        vmDetails &&
        vmNameToMatch?.toLowerCase() === processHost?.trim().toLowerCase()
      ) {
        const hostIp =
          vmDetails?.ip_addresses?.[0] ||
          vmDetails?.NetworkAdapters?.flatMap(
            (na) => na.IPAddresses || [],
          )?.find(
            (ip) => ip && !ip.startsWith("169.254") && !ip.startsWith("fe80"),
          ) ||
          null;

        if (!hostIp) {
          toast.error(
            "No IP address available for this VM. Cannot kill processes.",
          );
          return;
        }
        await killProcesses(processHost, hostIp, pids, osType);
        toast.success(`Successfully killed ${pids.length} process(es)`);
        fetchAll();
        setSelectedRows([]);
      } else {
        toast.error(
          "VM name doesn't match process host. Cannot kill processes.",
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail || error.message || "Unknown error";
      toast.error(`Failed to kill processes: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const Goback = () => {
    navigate(-1);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-left items-start flex flex-col w-full relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700 mb-6 w-full">
        <div
          onClick={Goback}
          className="flex-shrink-0 p-2.5 bg-[#1a365d]/80 hover:bg-[#1a365d] rounded-md text-white cursor-pointer transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1a365d] dark:text-blue-300 flex items-center gap-2">
            <ServerIcon className="h-5 w-5" />
            {vmName || vmId}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Live CPU/process monitoring and process management for this
            machine.
          </p>
        </div>
        {/* Tabs */}
        <div className="flex gap-6 md:ml-auto border-b-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`pb-2 text-sm relative transition-all duration-300 ${
                activeTab === tab.key
                  ? "text-[#1a365d] dark:text-blue-300 font-semibold after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:w-full after:h-[3px] after:bg-[#1a365d] after:z-10"
                  : "text-gray-600 dark:text-gray-400 hover:text-[#1a365d] dark:text-blue-300"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 w-full">
        {activeTab === "details" && (
          <div className="w-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
              <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ServerIcon className="h-4 w-4 text-[#1a365d] dark:text-blue-300" />
                Virtual Machine
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-y-3 gap-x-4 text-sm">
                <div>
                  <span className="text-gray-400 font-semibold uppercase tracking-wide text-[10px] block">
                    Computer Name
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 break-all">
                    {vmName || "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Grafana Dashboard */}
            {vmName && osTypeFromProps ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-1.5">
                    <ChartBarIcon className="h-4 w-4 text-[#1a365d] dark:text-blue-300" />
                    VM Metrics Dashboard
                  </h3>
                </div>
                {(() => {
                  const osType = osTypeFromProps;
                  const config = getVMConfig(osType);
                  if (!config) {
                    return (
                      <div className="p-5 text-sm text-red-500">
                        Unsupported or missing OS type for dashboard.
                      </div>
                    );
                  }
                  // Use internal IP as fallback for Grafana host variable
                  const internalIp = getInternalIp(vmDetails);
                  const hostForGrafana =
                    vmDetails?.name?.trim() ||
                    vmName?.trim() ||
                    internalIp ||
                    "";
                  return (
                    <>
                      <div className="px-5 py-2.5 bg-gray-50 dark:bg-gray-900/60 border-b border-gray-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          OS:{" "}
                          <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {osType.toUpperCase()}
                          </span>
                        </span>
                        <span>
                          Datasource:{" "}
                          <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {config.datasource}
                          </span>
                        </span>
                        <span>
                          Bucket:{" "}
                          <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {config.bucket}
                          </span>
                        </span>
                        {internalIp && (
                          <span>
                            Detected IP:{" "}
                            <span className="font-semibold text-gray-800 dark:text-gray-100">
                              {internalIp}
                            </span>
                          </span>
                        )}
                      </div>
                      <iframe
                        title="Grafana Dashboard"
                        src={
                          `${DASHBOARD_GRAFANA_URL}/d/${config.dashboardUid}/${config.dashboardName}` +
                          `?orgId=1` +
                          `&var-datasource=${encodeURIComponent(config.datasource)}` +
                          `&var-bucket=${encodeURIComponent(config.bucket)}` +
                          `&var-host=${encodeURIComponent(hostForGrafana)}` +
                          `&from=now-1h&to=now&theme=${theme}&disableLazyLoad=true&kiosk`
                        }
                        width="100%"
                        height="800"
                        style={{ border: "none" }}
                        allowFullScreen
                      />
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center text-sm text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                Dashboards are loading....
              </div>
            )}
          </div>
        )}

        {activeTab === "processes" && (
          <div className="flex flex-col h-full w-full">
            {/* Stat tiles + End Process */}
            <div className="flex flex-wrap items-stretch gap-3 mb-5">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-50">
                  <CpuChipIcon className="h-5 w-5 text-[#1a365d] dark:text-blue-300" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide block">
                    Host CPU
                  </span>
                  <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                    {hostCpu}
                  </span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
                <div className="p-2 rounded-md bg-violet-50">
                  <CircleStackIcon className="h-5 w-5 text-violet-700" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide block">
                    Host Memory
                  </span>
                  <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                    {hostMemory}
                  </span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
                <div className="p-2 rounded-md bg-emerald-50">
                  <ServerIcon className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide block">
                    Processes
                  </span>
                  <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                    {processesCount}
                  </span>
                </div>
              </div>

              <button
                className={`ml-auto flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold shadow-sm transition-all ${
                  selectedRows.length > 0 && !isLoading
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
                disabled={selectedRows.length === 0 || isLoading}
                onClick={handleKillProcess}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <TrashIcon className="h-4 w-4" />
                )}
                <span>{isLoading ? "Processing..." : "End Process"}</span>
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-auto max-h-full custom-scrollbar">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#1a365d] text-white text-xs font-semibold uppercase tracking-wider select-none">
                    <th className="py-3 px-4 text-left">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isIndeterminate;
                        }}
                        onChange={handleSelectAll}
                        aria-label="Select all processes"
                        className="rounded border-gray-300 dark:border-gray-600 text-[#1a365d] dark:text-blue-300 focus:ring-[#1a365d] cursor-pointer h-4 w-4"
                      />
                      {selectedRows.length > 0 && (
                        <span className="inline-flex items-center justify-center ml-2 h-4 px-1 rounded-full bg-emerald-400 text-[#1a365d] dark:text-blue-300 text-[10px] font-bold">
                          {selectedRows.length}
                        </span>
                      )}
                    </th>
                    <th className="py-3 px-4 text-left">Process Name</th>
                    <th className="py-3 px-4 text-left">Process ID</th>
                    <th className="py-3 px-4 text-left">CPU %</th>
                    <th className="py-3 px-4 text-left">Memory %</th>
                    <th className="py-3 px-4 text-left">Disk %</th>
                    <th className="py-3 px-4 text-left">Username</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 dark:text-gray-300">
                  {processData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-12 text-gray-400"
                      >
                        No process data available.
                      </td>
                    </tr>
                  ) : (
                    processData.map((proc, idx) => {
                      const osType = osTypeFromProps;
                      if (!osType) return null;
                      const config = getVMConfig(osType);
                      if (!config) return null;
                      // Windows mapping
                      if (osType.toLowerCase() === "windows") {
                        return (
                          <tr
                            key={proc.ID_Process || idx}
                            className="hover:bg-blue-50/20 transition-colors"
                            onClick={(e) => {
                              if (e.target.type !== "checkbox")
                                handleSelectRow(idx);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <td className="py-3.5 px-4 text-left">
                              <input
                                type="checkbox"
                                checked={selectedRows.includes(idx)}
                                onChange={() => handleSelectRow(idx)}
                                aria-label={`Select process ${proc.ID_Process || idx}`}
                                onClick={(e) => e.stopPropagation()}
                                className="rounded border-gray-300 dark:border-gray-600 text-[#1a365d] dark:text-blue-300 focus:ring-[#1a365d] cursor-pointer h-4 w-4"
                              />
                            </td>
                            <td className="py-3.5 px-4 text-left font-medium break-all">
                              {proc.instance || "-"}
                            </td>
                            <td className="py-3.5 px-4 text-left">
                              {proc.ID_Process !== undefined &&
                              proc.ID_Process !== null
                                ? proc.ID_Process
                                : "-"}
                            </td>
                            <td className="py-3.5 px-4 text-left">
                              {formatProcessCpu(proc.Percent_Processor_Time)}
                            </td>
                            <td className="py-3.5 px-4 text-left">
                              {formatProcessMemory(proc.Working_Set)}
                            </td>
                            <td className="py-3.5 px-4 text-left">
                              {formatProcessDisk(proc.Private_Bytes)}
                            </td>
                            <td className="py-3.5 px-4 text-left">
                              {proc.source || proc.host || "N/A"}
                            </td>
                          </tr>
                        );
                      } else {
                        // Linux mapping (default)
                        const pidField = config.pidField;
                        return (
                          <tr
                            key={proc[pidField] || proc.process_name || idx}
                            className="hover:bg-blue-50/20 transition-colors"
                            onClick={(e) => {
                              if (e.target.type !== "checkbox")
                                handleSelectRow(idx);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <td className="py-3.5 px-4 text-left">
                              <input
                                type="checkbox"
                                checked={selectedRows.includes(idx)}
                                onChange={() => handleSelectRow(idx)}
                                aria-label={`Select process ${proc.process_name || idx}`}
                                onClick={(e) => e.stopPropagation()}
                                className="rounded border-gray-300 dark:border-gray-600 text-[#1a365d] dark:text-blue-300 focus:ring-[#1a365d] cursor-pointer h-4 w-4"
                              />
                            </td>
                            <td className="py-3.5 px-4 text-left font-medium break-all">
                              {proc.process_name || "-"}
                            </td>
                            <td className="py-3.5 px-4 text-left">
                              {proc[pidField] || "-"}
                            </td>
                            <td className="py-3.5 px-4 text-left">
                              {formatProcessCpu(proc.cpu_usage)}
                            </td>
                            <td className="py-3.5 px-4 text-left">
                              {formatProcessMemory(proc.memory_usage)}
                            </td>
                            <td className="py-3.5 px-4 text-left">
                              {formatProcessDisk(proc.disk_usage)}
                            </td>
                            <td className="py-3.5 px-4 text-left">
                              {proc.user || "N/A"}
                            </td>
                          </tr>
                        );
                      }
                    })
                  )}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "applications" && (
          <div className="flex flex-col items-center py-12">
            <span className="text-gray-500 dark:text-gray-400">
              Applications view coming soon...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagerPage;

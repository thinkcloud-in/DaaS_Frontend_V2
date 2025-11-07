import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  fetchVmDetails,
  fetchBackgroundProcesses,
  fetchHostStats,
  killProcesses
} from "Services/TaskManagerService";
import { toast } from "react-toastify";
import { getEnv } from "utils/getEnv";
import { Loader2 } from "lucide-react";

const TABS = [
  { key: "details", label: "Details" },
  { key: "processes", label: "Processes" },
  { key: "applications", label: "Applications" },
];

const TaskManagerPage = () => {
  const { poolId, vmId } = useParams();
  const [vmDetails, setVmDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedRows, setSelectedRows] = useState([]);
  const [processData, setProcessData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hostStats, setHostStats] = useState({ cpu: null, memory: null, diskio: null });
  const navigate = useNavigate();
  const location = useLocation();
  const osTypeFromProps = location.state?.os_type; // get os_type from navigation state
  const vmNameFromProps = location.state?.vm_name;
  const vmName = vmNameFromProps; // Prefer API value, fallback to prop

  const DASHBOARD_GRAFANA_URL = getEnv('GRAFANA_URL');
  // Linux Configuration
  const INFLUXDB_DATASOURCE_LINUX = getEnv('INFLUXDB_DATASOURCE_LINUX');
  const BUCKET_LINUX = getEnv('BUCKET_LINUX');
  const DASHBOARD_UID_LINUX = getEnv('DASHBOARD_UID_LINUX');
  const DASHBOARD_NAME_LINUX = getEnv('DASHBOARD_NAME_LINUX');

  // Windows Configuration
  const INFLUXDB_DATASOURCE_WINDOWS = getEnv('INFLUXDB_DATASOURCE_WINDOWS');
  const BUCKET_WINDOWS = getEnv('BUCKET_WINDOWS');
  const DASHBOARD_UID_WINDOWS = getEnv('DASHBOARD_UID_WINDOWS');
  const DASHBOARD_NAME_WINDOWS = getEnv('DASHBOARD_NAME_WINDOWS');

  // Function to get configuration based on VM OS type (no default, must be provided)
  const getVMConfig = (osType) => {
    if (!osType) return null;
    const normalizedOS = osType.toLowerCase();
    if (normalizedOS === 'windows') {
      return {
        datasource: INFLUXDB_DATASOURCE_WINDOWS,
        bucket: BUCKET_WINDOWS,
        dashboardUid: DASHBOARD_UID_WINDOWS,
        dashboardName: DASHBOARD_NAME_WINDOWS,
        pidField: "process_id"
      };
    } else if (normalizedOS === 'linux') {
      return {
        datasource: INFLUXDB_DATASOURCE_LINUX,
        bucket: BUCKET_LINUX,
        dashboardUid: DASHBOARD_UID_LINUX,
        dashboardName: DASHBOARD_NAME_LINUX,
        pidField: "pid"
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
    if (!vmDetails?.name && !vmName) return;
    const osType = osTypeFromProps;
    if (!osType) return;
    const config = getVMConfig(osType);
    if (!config) return;

    let hostForApi = vmName?.trim();

    fetchBackgroundProcesses(config, hostForApi, osType)
      .then((data) => setProcessData(data))
      .catch(() => setProcessData([]));

    fetchHostStats(config, hostForApi, osType)
      .then((data) => setHostStats(data))
      .catch(() => setHostStats({ cpu: null, memory: null, diskio: null }));
  };

  useEffect(() => {
    let intervalId;
    // Use os_type from vmDetails or fallback to osTypeFromProps
    const osType =  osTypeFromProps;
    if (activeTab === "processes" && vmName && osType) {
      fetchAll();
      intervalId = setInterval(fetchAll, 5000);
    }
    return () => clearInterval(intervalId);
  }, [activeTab, vmDetails, osTypeFromProps]);

  const hostCpu = hostStats.cpu !== null ? `${Number(hostStats.cpu).toFixed(1)}%` : "N/A";
  const hostMemory = hostStats.memory !== null ? `${Number(hostStats.memory).toFixed(1)}%` : "N/A";
  const hostDiskIO = hostStats.diskio !== null ? `${Number(hostStats.diskio).toFixed(1)}` : "N/A";
  const processesCount = processData.length;

  // Helper functions to format process values similar to host stats
  const formatProcessCpu = (cpuValue) => {
    return cpuValue !== undefined && cpuValue !== null ? `${Number(cpuValue).toFixed(1)}` : "N/A";
  };
  const formatProcessMemory = (memoryValue) => {
    return memoryValue !== undefined && memoryValue !== null ? `${Number(memoryValue).toFixed(1)}` : "N/A";
  };
  const formatProcessDisk = (diskValue) => {
    return diskValue !== undefined && diskValue !== null ? `${Number(diskValue).toFixed(1)}` : "N/A";
  };

  // Checkbox logic
  const isAllSelected = selectedRows.length === processesCount && processesCount > 0;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < processesCount;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(processData.map((_, idx) => idx));
    }
  };

  const handleSelectRow = (idx) => {
    setSelectedRows((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
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
      toast.error("OS type is not available for this VM. Cannot kill processes.");
      return;
    }
    const config = getVMConfig(osType);
    if (!config) {
      toast.error("Unsupported or missing OS type. Cannot kill processes.");
      return;
    }
    // Get correct PID field for the OS
    let pids = [];
    if (osType.toLowerCase() === "windows") {
      // For Windows, use ID_Process
      pids = selectedRows
        .map(idx => processData[idx]?.ID_Process)
        .filter(pid => pid !== undefined && pid !== null && pid !== "-");
    } else {
      // For Linux, use pidField (usually "pid")
      const pidField = config.pidField;
      pids = selectedRows
        .map(idx => processData[idx]?.[pidField])
        .filter(pid => pid !== undefined && pid !== null && pid !== "-");
    }
    if (!pids.length) {
      toast.error("No valid process IDs found");
      return;
    }
    const processHost = processData[selectedRows[0]]?.host;
    
    if (!processHost) {
      toast.error("No host information found for selected processes");
      return;
    }
    try {
      if (vmDetails && vmDetails.name === processHost.trim()) {
        const hostIp = vmDetails.ip_addresses && vmDetails.ip_addresses.length > 0 
          ? vmDetails.ip_addresses[0] 
          : null;

        if (!hostIp) {
          toast.error("No IP address available for this VM. Cannot kill processes.");
          return;
        }
        await killProcesses( processHost, hostIp, pids, osType);
        toast.success(`Successfully killed ${pids.length} process(es)`);
        fetchAll();
        setSelectedRows([]);
      } else {
        toast.error("VM name doesn't match process host. Cannot kill processes.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || "Unknown error";
      toast.error(`Failed to kill processes: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const Goback = () => {
    navigate(-1);
  };

  return (
    <div className="w-[98%] h-[90vh] m-auto bg-white rounded-lg p-4 shadow-md flex flex-col overflow-hidden">
      {/* Back Button */}
      <div className="flex items-center gap-6 border-b pt-6 mb-2">
        <div
          onClick={Goback}
          className="flex items-center justify-center bg-gray-100 text-sm font-semibold text-gray-700 py-2 rounded-md hover:bg-gray-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:ring-opacity-10 cursor-pointer"
          style={{ minWidth: 40 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        {/* VM ID */}
        <h2 className="text-lg font-semibold text-gray-700 whitespace-nowrap">
          <span className="text-[#1a365d] font-semibold">{vmName || vmId}</span>
        </h2>
        {/* Tabs */}
        <div className="flex gap-6 ">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`pb-2 text-sm relative transition-all duration-300 ${
                activeTab === tab.key
                  ? "text-[#1a365d] font-semibold after:content-[''] after:absolute after:bottom-[-1px] after:left-0 after:w-full after:h-[3px] after:bg-[#1a365d] after:z-10"
                  : "text-gray-600 hover:text-[#1a365d]"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {activeTab === "details" && (
          <div className="px-4 py-6">
            <div className="font-semibold text-[18px] mb-4">VM</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-y-2 gap-x-4 text-[15px] mb-2">
              <div>
                <div className="text-gray-500">Computer Name:</div>
                <div className="font-medium break-all">{vmName || "-"}</div>
              </div>
            </div>
            {/* Grafana Dashboard */}
            {vmName && (osTypeFromProps) ? (
              <div className="mt-8">
                <div className="font-semibold text-[16px] mb-2">VM Metrics Dashboard</div>
                {(() => {
                  const osType = osTypeFromProps;
                  const config = getVMConfig(osType);
                  if (!config) {
                    return <div className="text-red-500">Unsupported or missing OS type for dashboard.</div>;
                  }
                  // Use VM name for Grafana host variable
                  const hostForGrafana = vmDetails?.name?.trim() || vmName?.trim() || "";
                  return (
                    <>
                      <div className="text-sm text-gray-600 mb-2">
                        Operating System: <span className="font-medium">{osType.toUpperCase()}</span> | 
                        Datasource: <span className="font-medium">{config.datasource}</span> | 
                        Bucket: <span className="font-medium">{config.bucket}</span>
                      </div>
                      <iframe
                        title="Grafana Dashboard"
                        src={
                          `${DASHBOARD_GRAFANA_URL}/d/${config.dashboardUid}/${config.dashboardName}` +
                          `?orgId=1` +
                          `&var-datasource=${encodeURIComponent(config.datasource)}` +
                          `&var-bucket=${encodeURIComponent(config.bucket)}` +
                          `&var-host=${encodeURIComponent(hostForGrafana)}` +
                          `&from=now-1h&to=now&theme=light&disableLazyLoad=true&kiosk`
                        }
                        width="100%"
                        height="800"
                        style={{ border: "1px solid #ccc", borderRadius: "8px" }}
                        allowFullScreen
                      />
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="mt-8 font-medium text-gray-600 mb-2">Dashboards are loading....</div>
            )}
          </div>
        )}

        {activeTab === "processes" && (
          <div className="flex flex-col h-full px-4 py-6">
            {/* Top summary */}
            <div className="flex flex-wrap items-center gap-8 text-[15px] mb-4">
              <div>
                <span className="text-gray-500">Host CPU:</span>{" "}
                <span className="font-medium">{hostCpu}</span>
              </div>
              <div>
                <span className="text-gray-500">Host Memory:</span>{" "}
                <span className="font-medium">{hostMemory}</span>
              </div>
              <div>
                <span className="text-gray-500">Processes:</span>{" "}
                <span className="font-medium">{processesCount}</span>
              </div>
              <button
                className={`ml-auto px-3 py-1 text-sm border border-gray-300 rounded bg-gray-100 flex items-center gap-1 ${
                  selectedRows.length > 0
                    ? "text-gray-700 cursor-pointer hover:bg-gray-200"
                    : "bg-gray-50 text-gray-300 cursor-not-allowed"
                }`}
                disabled={selectedRows.length === 0 || isLoading}
                onClick={handleKillProcess}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            <span>{isLoading ? "Processing" :"End Process"}</span>
              </button>
            </div>
            {/* Table */}
            <div className="flex-1 overflow-auto rounded-md bg-white border custom-scrollbar">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="py-2 px-3 font-semibold text-left border-b">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={el => {
                          if (el) el.indeterminate = isIndeterminate;
                        }}
                        onChange={handleSelectAll}
                        aria-label="Select all processes"
                      />
                      {selectedRows.length > 0 && (
                        <span
                          className="inline-flex items-center justify-center ml-2 h-4 px-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-400"
                        >
                          {selectedRows.length}
                        </span>
                      )}
                    </th>
                    <th className="py-2 px-3 font-semibold text-left border-b">Process Name</th>
                    <th className="py-2 px-3 font-semibold text-left border-b">Process ID</th>
                    <th className="py-2 px-3 font-semibold text-left border-b">CPU %</th>
                    <th className="py-2 px-3 font-semibold text-left border-b">Memory %</th>
                    <th className="py-2 px-3 font-semibold text-left border-b">Disk %</th>
                    <th className="py-2 px-3 font-semibold text-left border-b">Username</th>
                  </tr>
                </thead>
                <tbody>
                  {processData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-gray-400">
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
                            className="hover:bg-gray-50"
                            onClick={e => {
                              if (e.target.type !== "checkbox") handleSelectRow(idx);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <td className="py-2 px-3 text-left border-b">
                              <input
                                type="checkbox"
                                checked={selectedRows.includes(idx)}
                                onChange={() => handleSelectRow(idx)}
                                aria-label={`Select process ${proc.ID_Process || idx}`}
                                onClick={e => e.stopPropagation()}
                              />
                            </td>
                            <td className="py-2 px-3 text-left border-b font-medium break-all">
                              {proc.instance || "-"}
                            </td>
                            <td className="py-2 px-3 text-left border-b">
                              {proc.ID_Process !== undefined && proc.ID_Process !== null ? proc.ID_Process : "-"}
                            </td>
                            <td className="py-2 px-3 text-left border-b">
                              {formatProcessCpu(proc.Percent_Processor_Time)}
                            </td>
                            <td className="py-2 px-3 text-left border-b">
                              {formatProcessMemory(proc.Working_Set)}
                            </td>
                            <td className="py-2 px-3 text-left border-b">
                              {formatProcessDisk(proc.Private_Bytes)}
                            </td>
                            <td className="py-2 px-3 text-left border-b">
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
                            className="hover:bg-gray-50"
                            onClick={e => {
                              if (e.target.type !== "checkbox") handleSelectRow(idx);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <td className="py-2 px-3 text-left border-b">
                              <input
                                type="checkbox"
                                checked={selectedRows.includes(idx)}
                                onChange={() => handleSelectRow(idx)}
                                aria-label={`Select process ${proc.process_name || idx}`}
                                onClick={e => e.stopPropagation()}
                              />
                            </td>
                            <td className="py-2 px-3 text-left border-b font-medium break-all">
                              {proc.process_name || "-"}
                            </td>
                            <td className="py-2 px-3 text-left border-b">
                              {proc[pidField] || "-"}
                            </td>
                            <td className="py-2 px-3 text-left border-b">
                              {formatProcessCpu(proc.cpu_usage)}
                            </td>
                            <td className="py-2 px-3 text-left border-b">
                              {formatProcessMemory(proc.memory_usage)}
                            </td>
                            <td className="py-2 px-3 text-left border-b">
                              {formatProcessDisk(proc.disk_usage)}
                            </td>
                            <td className="py-2 px-3 text-left border-b">
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
        )}

        {activeTab === "applications" && (
          <div className="flex flex-col items-center py-12">
            <span className="text-gray-500">Applications view coming soon...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagerPage;


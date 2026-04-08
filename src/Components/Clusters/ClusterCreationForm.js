import React, { useState, useRef } from "react";
import "./css/ClusterCreationForm.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { InputField, PasswordField, SelectField } from "../Common";
import { Slide, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { useDispatch, useSelector } from "react-redux";
import {
  createClusterThunk,
  fetchInfluxdbDetailsThunk,
  addInfluxdbThunk,
  migrateMonitoringDataThunk,
} from "../../redux/features/Clusters/ClustersThunks";
import {
  verifyStandaloneHyperV,
  pingHyperVAgent,
} from "../../Services/ClusterService";
import { selectClustersLoading } from "../../redux/features/Clusters/ClustersSelectors";
import {
  selectAuthToken,
  selectAuthTokenParsed,
} from "../../redux/features/Auth/AuthSelectors";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const ClusterCreationForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = useSelector(selectAuthToken);
  const tokenParsed = useSelector(selectAuthTokenParsed);
  const userEmail = tokenParsed?.preferred_username;
  const isLoading = useSelector(selectClustersLoading);
  const monitoringLoading = useSelector(
    (state) => state.clusters.monitoring.monitoringLoading,
  );

  const [isDisabled] = useState(false);
  const checkboxRef = useRef(null);

  let clusterType = ["VMware", "Proxmox", "Hyper-V"];
  const [clusterDetails, setClusterDetails] = useState({
    type: "",
    name: "",
    ip: "",
    port: "",
    agent_port: "",
    username: "",
    password: "",
    tls: false,
  });
  const [hyperVNodeType, setHyperVNodeType] = useState({
    singleNode: false,
    multiNode: false,
  });
  const [createdClusterId, setCreatedClusterId] = useState(null);
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [monitoringData, setMonitoringData] = useState(null);
  const [showMonitoringConfirm, setShowMonitoringConfirm] = useState(false);
  const [isClusterCreated, setIsClusterCreated] = useState(false);
  const [influxAlreadyIntegrated, setInfluxAlreadyIntegrated] = useState(false);
  const [srcApiToken, setSrcApiToken] = useState("");
  const [migrateLoading, setMigrateLoading] = useState(false);
  const [showApiToken, setShowApiToken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerificationPanel, setShowVerificationPanel] = useState(false);
  const [verificationSteps, setVerificationSteps] = useState([
    { id: "agent_present", label: "Hyper-V agent is present", status: "idle" },
    { id: "agent_running", label: "Agent is running", status: "idle" },
    {
      id: "hyperv_enabled",
      label: "Hyper-V is enabled on host",
      status: "idle",
    },
    { id: "credentials", label: "Credentials verified", status: "idle" },
  ]);

  const setStepStatus = (indexes, status) => {
    setVerificationSteps((prev) =>
      prev.map((s, i) => (indexes.includes(i) ? { ...s, status } : s)),
    );
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    if (name === "ip") {
      setClusterDetails({ ...clusterDetails, ip: [value] });
    } else {
      setClusterDetails({ ...clusterDetails, [name]: value });
    }
  };

  const handleOnClick = async () => {
    let payload = { ...clusterDetails, email: userEmail };
    if (
      !clusterDetails.type ||
      !clusterDetails.name ||
      !clusterDetails.ip ||
      (clusterDetails.type !== "Hyper-V" && !clusterDetails.port) ||
      !clusterDetails.username ||
      !clusterDetails.password ||
      (!hyperVNodeType.singleNode && !hyperVNodeType.multiNode)
    ) {
      toast.error("Please fill all the fields", { transition: Slide });
      return;
    }
    if (clusterDetails.type === "Hyper-V") {
      payload.node_type = hyperVNodeType.singleNode
        ? "Single Node"
        : hyperVNodeType.multiNode
          ? "Multi Node"
          : null;

      if (hyperVNodeType.singleNode) {
        setIsVerifying(true);
        // Reset all steps to idle and show panel
        setVerificationSteps([
          {
            id: "agent_present",
            label: "Hyper-V agent is present",
            status: "idle",
          },
          { id: "agent_running", label: "Agent is running", status: "idle" },
          {
            id: "hyperv_enabled",
            label: "Hyper-V is enabled on host",
            status: "idle",
          },
          { id: "credentials", label: "Credentials verified", status: "idle" },
        ]);
        setShowVerificationPanel(true);

        // ── Steps 1 & 2: confirm the agent process is reachable 
        setStepStatus([0, 1], "loading");
        try {
          await pingHyperVAgent(token, {
            ip: clusterDetails.ip[0],
            port: Number(clusterDetails.agent_port) || 8765,
          });
          setStepStatus([0, 1], "success");
        } catch {
          setStepStatus([0, 1], "error");
          toast.error(
            "Hyper-V agent is not running or unreachable. Please start the agent and try again.",
            { transition: Slide },
          );
          setIsVerifying(false);
          return;
        }

        setStepStatus([2], "loading");
        let verifyResult;
        try {
          const verifyPayload = {
            ip: Array.isArray(clusterDetails.ip)
              ? clusterDetails.ip[0]
              : clusterDetails.ip,
            username: clusterDetails.username,
            password: clusterDetails.password,
            agent_port: Number(clusterDetails.agent_port) || 8765,
          };
          verifyResult = await verifyStandaloneHyperV(token, verifyPayload);
        } catch (error) {
          // Network / agent unreachable — mark both remaining steps failed
          const message =
            typeof error === "string"
              ? error
              : error?.response?.data?.detail ||
                error?.response?.data?.message ||
                error?.message ||
                "Failed to reach the Hyper-V agent";
          setStepStatus([2, 3], "error");
          toast.error(message, { transition: Slide });
          setIsVerifying(false);
          return;
        }

        const agentData = verifyResult?.data;

        // Step 3 — Hyper-V role check  →  is_verify_hyper_v
        if (!agentData?.is_verify_hyper_v) {
          setStepStatus([2], "error");
          setStepStatus([3], "idle"); // credentials step never reached
          toast.error(
            "Hyper-V role is not enabled on this host. Please install the Hyper-V Windows Feature and try again.",
            { transition: Slide },
          );
          setIsVerifying(false);
          return;
        }
        setStepStatus([2], "success");

        // Step 4 — Credentials check  →  is_user_verify
        setStepStatus([3], "loading");
        if (!agentData?.is_user_verify) {
          setStepStatus([3], "error");
          toast.error(
            "Credentials verification failed. Please check the username and password and try again.",
            { transition: Slide },
          );
          setIsVerifying(false);
          return;
        }
        setStepStatus([3], "success");

        setIsVerifying(false);
      }
    }

    if (!Array.isArray(payload.ip)) payload.ip = [payload.ip];
    try {
      const res = await dispatch(
        createClusterThunk({ token, payload }),
      ).unwrap();
      if (res.warning && res.message) {
        toast.warn(res.message, {
          transition: Slide,
        });
        setIsClusterCreated(false);
      } else if (res.cluster) {
        toast.success("Cluster created!", { transition: Slide });
        setCreatedClusterId(res.cluster.id);
        setIsClusterCreated(true);
        if (res.cluster.type === "VMware" || res.cluster.type === "Hyper-V") {
          setTimeout(() => navigate("/clusters"), 1000);
        }
      }
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error?.msg ||
            error?.message ||
            error?.detail ||
            "Failed to create cluster";
      toast.error(message, { transition: Slide });
    }
  };
  const handleChange = (e) => {
    setClusterDetails({ ...clusterDetails, tls: e.target.checked });
  };

  const handleMonitoringCheckbox = async (e) => {
    const checked = e.target.checked;
    if (checked && createdClusterId) {
      dispatch(
        fetchInfluxdbDetailsThunk({ token, clusterId: createdClusterId }),
      ).then(({ payload }) => {
        if (payload && !payload.error && Object.keys(payload).length > 0) {
          setMonitoringEnabled(true);
          setMonitoringData(payload);
          setShowMonitoringConfirm(false);
          setInfluxAlreadyIntegrated(true);
        } else {
          setMonitoringEnabled(false);
          setMonitoringData(null);
          setShowMonitoringConfirm(true);
          setInfluxAlreadyIntegrated(false);
        }
      });
    } else {
      setMonitoringEnabled(false);
      setShowMonitoringConfirm(false);
      setMonitoringData(null);
      setInfluxAlreadyIntegrated(false);
    }
  };

  const addInfluxdbWrapper = async (isCustomIntegration) => {
    try {
      await dispatch(
        addInfluxdbThunk({
          token,
          clusterId: createdClusterId,
          isCustomIntegration,
        }),
      );
      toast.success("InfluxDB integrated successfully");
      dispatch(
        fetchInfluxdbDetailsThunk({ token, clusterId: createdClusterId })
      );
      setTimeout(() => navigate("/clusters"), 2000);
    } catch {
      toast.error("Failed to integrate InfluxDB");
      setMonitoringEnabled(false);
      setMonitoringData(null);
    }
  };

  const handleMonitoringConfirm = async (confirm) => {
    setShowMonitoringConfirm(false);
    if (createdClusterId) {
      if (confirm) {
        await addInfluxdbWrapper(true);
      } else {
        setMonitoringEnabled(false);
        setMonitoringData(null);
      }
    } else {
      setMonitoringEnabled(false);
      setMonitoringData(null);
    }
  };

  const handleMigrate = async () => {
    const src_url = `http://${monitoringData.server}:${monitoringData.port}`;
    if (!srcApiToken) {
      toast.error("API token is required");
      return;
    }
    setMigrateLoading(true);
    try {
      const payload = {
        src_url,
        src_token: srcApiToken,
        src_org: monitoringData.organization,
        src_bucket: monitoringData.bucket,
        cluster_id: createdClusterId,
        email: userEmail,
      };
      await dispatch(migrateMonitoringDataThunk({ token, payload }));
      toast.success("Migration has started!");
      setSrcApiToken("");
      setTimeout(() => navigate("/clusters"), 1000);
    } catch {
      toast.error("Migration failed to start");
    } finally {
      setMigrateLoading(false);
    }
  };

  const handleHyperVNodeSelection = (type) => {
    if (type === "single") {
      setHyperVNodeType({
        singleNode: true,
        multiNode: false,
      });
    } else {
      setHyperVNodeType({
        singleNode: false,
        multiNode: true,
      });
    }
  };

  const Goback = () => {
    navigate("/clusters");
  };

  return (
    <div className="w-full md:w-[98%] mt-4 min-h-[75vh] h-[85vh] md:h-[90vh] m-auto bg-white rounded-lg p-2 md:p-4 shadow-md flex flex-col overflow-hidden">
      <div className="cluster-creation-form flex-1 overflow-auto rounded-md bg-white custom-scrollbar p-2 md:p-4">
        <div className="flex justify-start mb-6">
          <div
            onClick={Goback}
            className="bg-[#1a365dcc] text-[#f5f5f5] hover:bg-[#1a365d] hover:text-white px-2 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:ring-opacity-10 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
        </div>
        <div className="cluster-creation-form w-full">
          <div
            className={`space-y-5 m-2 ${isLoading || monitoringLoading || migrateLoading ? "opacity-50 pointer-events-none select-none" : ""}`}
          >
            <div className="bg-white p-3 w-full max-w-4xl mx-auto">
              <h2 className="font-bold leading-7 text-[#1a365d]">
                Create Cluster
              </h2>
              <div className="text-left w-full">
                <SelectField
                  label="Cluster Type"
                  name="type"
                  iconClass="fa-server"
                  value={clusterDetails.type}
                  onChange={handleOnChange}
                  disabled={isDisabled}
                  options={clusterType.map((item) => ({
                    value: item,
                    label: item,
                  }))}
                  required={true}
                />

                <InputField
                  label="Cluster Name"
                  name="name"
                  iconClass="fa-object-group"
                  value={clusterDetails.name}
                  onChange={handleOnChange}
                  disabled={isDisabled}
                  placeholder="Enter cluster name"
                  required={true}
                />

                {clusterDetails.type === "VMware" && (
                  <InputField
                    label="Vcenter IP / FQDN"
                    name="ip"
                    iconClass="fa-network-wired"
                    value={clusterDetails.ip[0] || ""}
                    onChange={handleOnChange}
                    disabled={isDisabled}
                    placeholder="Enter Vcenter IP or FQDN"
                    required={true}
                  />
                )}

                {clusterDetails.type === "Proxmox" && (
                  <InputField
                    label="Proxmox IP / FQDN"
                    name="ip"
                    iconClass="fa-network-wired"
                    value={clusterDetails.ip[0] || ""}
                    onChange={handleOnChange}
                    disabled={isDisabled}
                    placeholder="Enter Proxmox IP or FQDN"
                    required={true}
                  />
                )}

                {clusterDetails.type === "Hyper-V" && (
                  <InputField
                    label="Hyper-V IP / FQDN"
                    name="ip"
                    iconClass="fa-network-wired"
                    value={clusterDetails.ip[0] || ""}
                    onChange={handleOnChange}
                    disabled={isDisabled}
                    placeholder="Enter Hyper-V IP or FQDN"
                    required={true}
                  />
                )}

                {clusterDetails.type !== "Hyper-V" && (
                  <InputField
                    label="Port"
                    name="port"
                    type="number"
                    iconClass="fa-door-open"
                    value={clusterDetails.port}
                    onChange={handleOnChange}
                    disabled={isDisabled}
                    placeholder="Enter port"
                    required={true}
                  />
                )}

                {clusterDetails.type === "Hyper-V" && (
                  <InputField
                    label="Agent Port"
                    name="agent_port"
                    type="number"
                    iconClass="fa-door-open"
                    value={clusterDetails.agent_port || 8765}
                    onChange={handleOnChange}
                    disabled={isDisabled}
                    placeholder="Enter agent port"
                    tooltip="This is the port number for the Hyper-V agent if changed. (default: 8765)"
                    tooltipClass={"w-60"}
                  />
                )}

                <InputField
                  label="Username"
                  name="username"
                  iconClass="fa-user"
                  value={clusterDetails.username}
                  onChange={handleOnChange}
                  disabled={isDisabled}
                  placeholder="Enter username"
                  required={true}
                />

                <PasswordField
                  label="Password"
                  name="password"
                  value={clusterDetails.password}
                  onChange={handleOnChange}
                  disabled={isDisabled}
                  placeholder="Enter password"
                  required={true}
                />

                {clusterDetails.type === "Hyper-V" && (
                  <div className="mb-6 flex items-center">
                    <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px]">
                      <span>
                        <i className="fas fa-sitemap mr-2"></i>
                      </span>{" "}
                      Node Type
                    </label>
                    <div className="ml-2 flex flex-1 items-center gap-6">
                      <label className="flex items-center gap-2 whitespace-nowrap">
                        <input
                          type="radio"
                          checked={hyperVNodeType.singleNode}
                          value={"single"}
                          onChange={() => handleHyperVNodeSelection("single")}
                          name="nodeType"
                        />
                        <span>Standalone</span>
                      </label>
                      <label className="flex items-center gap-2 whitespace-nowrap">
                        <input
                          type="radio"
                          checked={hyperVNodeType.multiNode}
                          value={"multi"}
                          onChange={() => handleHyperVNodeSelection("multi")}
                          name="nodeType"
                        />
                        <span>Multi Node</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="mb-6 flex items-center">
                  <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px]">
                    <span>
                      <i className="fas fa-shield-halved mr-2"></i>
                    </span>{" "}
                    Insecure Skip Verify
                  </label>
                  <div className="ml-2 flex-1">
                    <label className="switch mt-1">
                      <input
                        type="checkbox"
                        name="tls"
                        disabled={isDisabled}
                        onChange={handleChange}
                        ref={checkboxRef}
                        checked={clusterDetails.tls}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {!isClusterCreated && (
            <div className="buttons mt-5 pl-5 flex items-start justify-start">
              <button
                onClick={handleOnClick}
                disabled={isDisabled || isLoading || isVerifying}
                type="submit"
                className="rounded-md bg-[#1a365dcc] px-4 py-3 text-sm font-semibold text-[#f5f5f5] shadow-sm hover:bg-[#1a365d] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a365d] flex items-center justify-center"
              >
                {isLoading || isVerifying ? (
                  <CircularProgress
                    size={20}
                    color="inherit"
                    className="mr-2"
                  />
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          )}

          {/* Hyper-V verification step panel */}
          {showVerificationPanel &&
            clusterDetails.type === "Hyper-V" &&
            hyperVNodeType.singleNode && (
              <div className="mt-4 pl-5">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 max-w-sm">
                  <h4 className="text-sm font-bold text-[#1a365d] mb-4 flex items-center gap-2">
                    <i className="fas fa-shield-halved text-[#1a365d]" />
                    Verification Status
                  </h4>
                  <div className="space-y-3">
                    {verificationSteps.map((step) => (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                          {step.status === "idle" && (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                          )}
                          {step.status === "loading" && (
                            <CircularProgress
                              size={16}
                              style={{ color: "#1a365d" }}
                            />
                          )}
                          {step.status === "success" && (
                            <svg
                              className="w-5 h-5 text-green-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                          {step.status === "error" && (
                            <svg
                              className="w-5 h-5 text-red-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          )}
                        </div>
                        <span
                          className={`text-sm ${
                            step.status === "success"
                              ? "text-green-600 font-semibold"
                              : step.status === "error"
                                ? "text-red-500 font-semibold"
                                : step.status === "loading"
                                  ? "text-[#1a365d] font-medium"
                                  : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>
        {createdClusterId && clusterDetails.type === "Proxmox" && (
          <div className="monitoring-section mt-4 p-3 relative bg-gray-50 rounded-lg">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={monitoringEnabled}
                onChange={handleMonitoringCheckbox}
                disabled={
                  monitoringLoading || clusterDetails.type !== "Proxmox"
                }
              />
              <span className="font-medium text-gray-800">Monitoring</span>
              {monitoringLoading && (
                <CircularProgress size={16} color="inherit" />
              )}
            </label>
            {showMonitoringConfirm && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <span className="text-base font-semibold text-gray-800 mb-4  text-center">
                    You want to integrate InfluxDB into Proxmox ?
                  </span>
                  <div className="flex gap-6">
                    <button
                      className="px-4 py-1 rounded-md bg-[#1a365d]/80 text-white font-semibold hover:bg-[#1a365d]`"
                      onClick={() => handleMonitoringConfirm(true)}
                    >
                      Yes
                    </button>
                    <button
                      className="px-4 py-1 rounded-md bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400"
                      onClick={() => handleMonitoringConfirm(false)}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            )}
            {influxAlreadyIntegrated && (
              <div className="mb-2 p-2 text-indigo-900 font-semibold text-center">
                InfluxDB integration to Proxmox is already there.
              </div>
            )}
            {monitoringEnabled && monitoringData && (
              <div className="p-8 rounded-md shadow-sm bg-white mt-0">
                <h3 className="text-lg font-semibold text-indigo-800 mb-1 pb-1">
                  InfluxDB Metric Server
                </h3>
                <div className="monitoring-table-form w-full max-w-4xl">
                  <div className="tr flex items-center mb-2 ">
                    <div className="th w-16 flex-shrink-0">
                      <label className="block mt-2 flex items-start text-sm font-medium text-gray-900 border-0">
                        Organization
                      </label>
                    </div>
                    <div className="td flex-1">
                      <input
                        type="text"
                        readOnly
                        value={monitoringData.organization || ""}
                        className={classNames(
                          isDisabled
                            ? "bg-gray-200 border-slate-300"
                            : "bg-white bg-transparent",
                          "w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400     border-2",
                        )}
                      />
                    </div>
                  </div>
                  <div className="tr flex items-center mb-2 ">
                    <div className="th w-24 flex-shrink-0">
                      <label className="block mt-2 flex items-start text-sm font-medium leading-6 text-gray-900 border-0">
                        Bucket
                      </label>
                    </div>
                    <div className="td flex-1">
                      <input
                        type="text"
                        readOnly
                        value={monitoringData.bucket || ""}
                        className={classNames(
                          isDisabled
                            ? "bg-gray-200 border-slate-300"
                            : "bg-white bg-transparent",
                          "w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400     border-2",
                        )}
                      />
                    </div>
                  </div>
                  <div className="tr flex items-center mb-2">
                    <div className="th w-40 flex-shrink-0">
                      <label className="block mt-2 flex items-start text-sm font-medium leading-6 text-gray-900 border-0">
                        Server
                      </label>
                    </div>
                    <div className="td flex-1">
                      <input
                        type="text"
                        readOnly
                        value={monitoringData.server || ""}
                        className={classNames(
                          isDisabled
                            ? "bg-gray-200 border-slate-300"
                            : "bg-white bg-transparent",
                          "w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400     border-2",
                        )}
                      />
                    </div>
                  </div>
                  <div className="tr flex items-center mb-2">
                    <div className="th w-40 flex-shrink-0">
                      <label className="block mt-2 flex items-start text-sm font-medium leading-6 text-gray-900 border-0">
                        Port
                      </label>
                    </div>
                    <div className="td flex-1">
                      <input
                        type="text"
                        readOnly
                        value={monitoringData.port || ""}
                        className={classNames(
                          isDisabled
                            ? "bg-gray-200 border-slate-300"
                            : "bg-white bg-transparent",
                          "w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400     border-2",
                        )}
                      />
                    </div>
                  </div>
                  <div className="tr flex items-center mb-2">
                    <div className="th w-40 flex-shrink-0">
                      <label className="block mt-2 flex items-start text-sm font-medium leading-6 text-gray-900 border-0">
                        Protocol
                      </label>
                    </div>
                    <div className="td flex-1">
                      <input
                        type="text"
                        readOnly
                        value={
                          monitoringData.influxdbproto ||
                          monitoringData.proto ||
                          ""
                        }
                        className={classNames(
                          isDisabled
                            ? "bg-gray-200 border-slate-300"
                            : "bg-white bg-transparent",
                          "w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400     border-2",
                        )}
                      />
                    </div>
                  </div>
                  <div className="tr flex items-center mb-2">
                    <div className="th w-40 flex-shrink-0">
                      <label className="block mt-2 flex items-start text-sm font-medium leading-6 text-gray-900 border-0">
                        InfluxDB API Token{" "}
                        <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="td flex-1 flex items-center">
                      <input
                        type={showApiToken ? "text" : "password"}
                        value={srcApiToken}
                        onChange={(e) => setSrcApiToken(e.target.value)}
                        placeholder="Enter source API token"
                        className={classNames(
                          "w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400 border-2",
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiToken((prev) => !prev)}
                        className="ml-2 flex items-center px-2 focus:outline-none"
                        tabIndex={-1}
                        aria-label={
                          showApiToken ? "Hide API token" : "Show API token"
                        }
                      >
                        {showApiToken ? (
                          <FaEyeSlash
                            style={{
                              border: "1px solid #d1d5db",
                              borderRadius: "3px",
                            }}
                          />
                        ) : (
                          <FaEye
                            style={{
                              border: "1px solid #d1d5db",
                              borderRadius: "3px",
                            }}
                          />
                        )}
                      </button>
                    </div>
                    <button
                      className="ml-4 px-4 py-2 bg-[#1a365d]/80 text-white rounded"
                      onClick={handleMigrate}
                      disabled={migrateLoading}
                    >
                      {migrateLoading ? "Starting..." : "OK"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {!monitoringEnabled && !showMonitoringConfirm && (
              <div className="flex justify-left mt-4">
                <button
                  className="px-4 py-2 bg-[#1a365d]/80 text-white rounded"
                  onClick={() => navigate("/clusters")}
                >
                  OK
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClusterCreationForm;

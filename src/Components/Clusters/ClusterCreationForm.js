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
  verifyHyperV,
  pingHyperVAgent,
  fetchHyperVClusterNodes,
} from "../../Services/ClusterService";
import { selectClustersLoading } from "../../redux/features/Clusters/ClustersSelectors";
import {
  selectAuthToken,
  selectAuthTokenParsed,
} from "../../redux/features/Auth/AuthSelectors";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// // ─── Build fresh per-node step list ──────────────────────────────────────────
// const buildNodeSteps = () => [
//   { id: "agent_running", label: "Agent is running", status: "idle" },
//   { id: "credentials", label: "Verify Credentials", status: "idle" },
//   { id: "hyperv", label: "Hyper-V Role Check", status: "idle" },
// ];

// ─── Shared step icon ─────────────────────────────────────────────────────────
const StepIcon = ({ status }) => {
  if (status === "idle")
    return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
  if (status === "loading")
    return <CircularProgress size={16} style={{ color: "#1a365d" }} />;
  if (status === "success")
    return (
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
    );
  return (
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
  );
};

// ─── Node health badge ────────────────────────────────────────────────────────
const NodeBadge = ({ health }) => {
  const h = health || "Unknown";
  const isChecking = h.toLowerCase() === "checking...";
  const up =
    !isChecking &&
    (h.toLowerCase() === "up" ||
      h.toLowerCase() === "online" ||
      h.toLowerCase() === "running");

  const badgeClass = isChecking
    ? "bg-blue-100 text-blue-700 animate-pulse"
    : up
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-600";

  const dotClass = isChecking
    ? "bg-blue-500"
    : up
      ? "bg-green-500"
      : "bg-red-500";

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {h}
    </span>
  );
};

// ─── Step label colour ────────────────────────────────────────────────────────
const stepTextClass = (status) =>
  ({
    success: "text-green-600 font-semibold",
    error: "text-red-500 font-semibold",
    loading: "text-[#1a365d] font-medium",
    idle: "text-gray-400",
  })[status] ?? "text-gray-400";

// ─────────────────────────────────────────────────────────────────────────────
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

  let clusterType = ["Proxmox", "Hyper-V"];

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
    standalone: false,
    cluster: false,
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
  const [showFailureConfirm, setShowFailureConfirm] = useState(false);
  const [failedNodes, setFailedNodes] = useState([]);
  const [pendingPayload, setPendingPayload] = useState(null);

  const BASE_STEPS = [
    { id: "agent_present", label: "Hyper-V agent is present", status: "idle" },
    { id: "agent_running", label: "Agent is running", status: "idle" },
    {
      id: "hyperv_enabled",
      label: "Hyper-V is enabled on host",
      status: "idle",
    },
    { id: "credentials", label: "Credentials verified", status: "idle" },
  ];

  const MULTI_NODE_STEPS = [
    { id: "cluster_ping", label: "Ping Cluster IP", status: "idle" },
    { id: "cluster_verify", label: "Verify Cluster Level", status: "idle" },
    { id: "node_discovery", label: "Node Verification", status: "idle" },
  ];

  // ── Standalone verification panel ────────────────────────────────────────
  const [showVerificationPanel, setShowVerificationPanel] = useState(false);
  const [verificationSteps, setVerificationSteps] = useState(BASE_STEPS);

  // ── Multi-node verification panel ────────────────────────────────────────
  const [nodeVerificationList, setNodeVerificationList] = useState([]);
  const [showMultiNodePanel, setShowMultiNodePanel] = useState(false);
  const [fetchingNodes, setFetchingNodes] = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getClusterIp = () =>
    Array.isArray(clusterDetails.ip) ? clusterDetails.ip[0] : clusterDetails.ip;

  const getAgentPort = () => Number(clusterDetails.agent_port) || 8765;

  const setStepStatus = (indexes, status) =>
    setVerificationSteps((prev) =>
      prev.map((s, i) => (indexes.includes(i) ? { ...s, status } : s)),
    );

  const setNodeStepStatus = (nodeIdx, stepIndexes, status) =>
    setNodeVerificationList((prev) =>
      prev.map((node, ni) => {
        if (ni !== nodeIdx) return node;
        return {
          ...node,
          steps: node.steps.map((s, si) =>
            stepIndexes.includes(si) ? { ...s, status } : s,
          ),
        };
      }),
    );

  const setNodeOverallStatus = (nodeIdx, overallStatus) =>
    setNodeVerificationList((prev) =>
      prev.map((node, ni) =>
        ni === nodeIdx ? { ...node, overallStatus } : node,
      ),
    );

  const patchNodeData = (nodeIdx, patch) =>
    setNodeVerificationList((prev) =>
      prev.map((node, ni) => (ni === nodeIdx ? { ...node, ...patch } : node)),
    );

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    if (name === "ip") setClusterDetails({ ...clusterDetails, ip: [value] });
    else setClusterDetails({ ...clusterDetails, [name]: value });
  };

  const runClusterLevelChecks = async (isStandalone) => {
    const clusterIp = getClusterIp();
    const agentPort = getAgentPort();

    setStepStatus([0, 1], "loading");
    try {
      await pingHyperVAgent(token, { ip: clusterIp, agent_port: agentPort });
      setStepStatus([0, 1], "success");
    } catch {
      setStepStatus([0, 1], "error");
      toast.error(
        `Hyper-V agent is not reachable on ${clusterIp} at port ${agentPort}. Please start the agent and try again.`,
      );
      return false;
    }

    // Step 2 & 3 — verify credentials
    setStepStatus([2], "loading");
    try {
      const verifyResult = await verifyHyperV(token, {
        ip: clusterIp,
        username: clusterDetails.username,
        password: clusterDetails.password,
        agent_port: agentPort,
        type: isStandalone ? "Standalone" : "Cluster",
      });
      const agentData = verifyResult?.data;
      if (!agentData?.is_hyper_v) {
        setStepStatus([2], "error");
        toast.error("Hyper-V role is not enabled on this host.");
        return false;
      }
      setStepStatus([2], "success");

      if (!agentData?.is_user_verify) {
        setStepStatus([3], "error");
        toast.error(
          `Invalid credentials for ${clusterIp}. Please check the username and password and try again.`,
        );
        return false;
      }
      setStepStatus([3], "success");
      return true;
    } catch (error) {
      setStepStatus([2, 3], "error");
      toast.error(error?.message || "Failed to verify host");
      return false;
    }
  };

  const runSingleNodeVerification = async () => {
    setVerificationSteps(BASE_STEPS.map((s) => ({ ...s })));
    setShowVerificationPanel(true);
    setIsVerifying(true);
    const ok = await runClusterLevelChecks(true);
    setIsVerifying(false);
    return ok;
  };

  const runMultiNodeVerification = async () => {
    setVerificationSteps(MULTI_NODE_STEPS.map((s) => ({ ...s })));
    setShowMultiNodePanel(true);
    setIsVerifying(true);
    setFetchingNodes(true);

    const clusterIp = getClusterIp();
    const agentPort = getAgentPort();

    // Step 0 - Ping Cluster
    setStepStatus([0], "loading");
    try {
      await pingHyperVAgent(token, { ip: clusterIp, agent_port: agentPort });
      setStepStatus([0], "success");
    } catch {
      setStepStatus([0], "error");
      toast.error(`Cluster agent unreachable on ${clusterIp}:${agentPort}`);
      setIsVerifying(false);
      setFetchingNodes(false);
      return false;
    }

    // Step 1 - Verify Cluster
    setStepStatus([1], "loading");
    try {
      const vRes = await verifyHyperV(token, {
        ip: clusterIp,
        username: clusterDetails.username,
        password: clusterDetails.password,
        agent_port: agentPort,
        type: "Cluster",
      });
      if (!vRes?.data?.is_user_verify) {
        setStepStatus([1], "error");
        toast.error(
          `Invalid credentials on cluster ${clusterIp}. Please check the username and password.`,
        );
        setIsVerifying(false);
        setFetchingNodes(false);
        return false;
      }

      if (!vRes?.data?.is_verify_hyper_v && !vRes?.data?.is_cluster) {
        setStepStatus([1], "error");
        toast.error(
          "Hyper-V role or Failover Clustering is not enabled on the cluster host.",
        );
        setIsVerifying(false);
        setFetchingNodes(false);
        return false;
      }
      setStepStatus([1], "success");
    } catch {
      setStepStatus([1], "error");
      setIsVerifying(false);
      setFetchingNodes(false);
      return false;
    }

    // Step 2 - Node Verification
    setStepStatus([2], "loading");
    try {
      const res = await fetchHyperVClusterNodes(token, {
        ip: clusterIp,
        agent_port: agentPort,
      });
      const nodes = res?.data?.data || [];
      const initialList = nodes.map((n) => ({
        ...n,
        displayHealth: "Checking...",
        originalHealth:
          n.Health || n.health || n.Status || n.status || "Unknown",
        steps: [
          { id: "ping", label: "Searching Agent Status", status: "idle" },
          { id: "creds", label: "Verify Credentials", status: "idle" },
          { id: "hyperv", label: "Hyper-V Role Check", status: "idle" },
        ],
        overallStatus: "pending",
      }));
      setNodeVerificationList(initialList);
      setFetchingNodes(false);

      let failures = [];
      for (let i = 0; i < nodes.length; i++) {
        const nodeIp = nodes[i].IP || nodes[i].ip || nodes[i].address;
        if (!nodeIp) continue;
        const ok = await verifyNode(i, nodeIp, agentPort);
        if (!ok) {
          failures.push({ name: nodes[i].Node_name || nodeIp, ip: nodeIp });
        }
      }

      setStepStatus([2], failures.length === 0 ? "success" : "error");
      setIsVerifying(false);

      if (failures.length > 0) {
        setFailedNodes(failures);
        return { success: false, hasFailures: true };
      }
      return { success: true, hasFailures: false };
    } catch (err) {
      setStepStatus([2], "error");
      setIsVerifying(false);
      setFetchingNodes(false);
      return { success: false, hasFailures: false };
    }
  };

  const verifyNode = async (nodeIdx, nodeIp, agentPort) => {
    setNodeOverallStatus(nodeIdx, "verifying");

    // Ping Agent
    setNodeStepStatus(nodeIdx, [0], "loading");
    try {
      const pingRes = await pingHyperVAgent(token, {
        ip: nodeIp,
        agent_port: agentPort,
      });

      const pingData = pingRes?.data || pingRes;

      const agentVer = pingData?.data?.version || "";
      const rawHvStatus = pingData?.data?.hyperv_status || "";

      const hvStatus =
        rawHvStatus.toLowerCase() === "installed" ||
        rawHvStatus.toLowerCase() === "ok"
          ? "Installed"
          : "Not Installed";

      setNodeVerificationList((prev) =>
        prev.map((node, ni) => {
          if (ni !== nodeIdx) return node;
          return {
            ...node,
            agentVersion: agentVer,
            hypervStatus: hvStatus,
            steps: node.steps.map((s, si) =>
              si === 0
                ? {
                    ...s,
                    label: `Agent is running`,
                    status: "success",
                  }
                : s,
            ),
          };
        }),
      );

      // We save the status for the final check
      if (hvStatus !== "Installed") {
        setNodeStepStatus(nodeIdx, [2], "error");
        setNodeOverallStatus(nodeIdx, "error");
        setNodeVerificationList((prev) =>
          prev.map((node, ni) => {
            if (ni !== nodeIdx) return node;
            return {
              ...node,
              displayHealth: "Down",
              steps: node.steps.map((s, si) =>
                si === 2
                  ? { ...s, label: `Hyper-V: ${hvStatus}`, status: "error" }
                  : s,
              ),
            };
          }),
        );
        toast.warn(`Hyper-V is not fully installed on node ${nodeIp}`, {
          transition: Slide,
        });
        return false;
      }
    } catch (err) {
      setNodeStepStatus(nodeIdx, [0], "error");
      setNodeOverallStatus(nodeIdx, "error");
      return false;
    }

    // Verify Credentials
    setNodeStepStatus(nodeIdx, [1], "loading");
    try {
      const vRes = await verifyHyperV(token, {
        ip: nodeIp,
        username: clusterDetails.username,
        password: clusterDetails.password,
        agent_port: agentPort,
        type: "Cluster",
      });
      const vData = vRes?.data || vRes;
      if (!vData?.is_user_verify) {
        setNodeStepStatus(nodeIdx, [1], "error");
        setNodeOverallStatus(nodeIdx, "error");
        return false;
      }
      setNodeStepStatus(nodeIdx, [1], "success");
    } catch {
      setNodeStepStatus(nodeIdx, [1], "error");
      setNodeOverallStatus(nodeIdx, "error");
      return false;
    }

    // Update the final Hyper-V status step to success
    setNodeVerificationList((prev) =>
      prev.map((node, ni) => {
        if (ni !== nodeIdx) return node;
        return {
          ...node,
          displayHealth: node.originalHealth,
          steps: node.steps.map((s, si) =>
            si === 2
              ? {
                  ...s,
                  label: `Hyper-V: Installed`,
                  status: "success",
                }
              : s,
          ),
          overallStatus: "success",
        };
      }),
    );

    return true;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleOnClick = async () => {
    if (
      !clusterDetails.type ||
      !clusterDetails.name ||
      !clusterDetails.ip ||
      (clusterDetails.type !== "Hyper-V" && !clusterDetails.port) ||
      !clusterDetails.username ||
      !clusterDetails.password ||
      (clusterDetails.type === "Hyper-V" &&
        !hyperVNodeType.standalone &&
        !hyperVNodeType.cluster)
    ) {
      toast.error("Please fill all the fields", { transition: Slide });
      return;
    }

    let payload = { ...clusterDetails, email: userEmail };
    if (clusterDetails.type === "Hyper-V") {
      payload.node_type = hyperVNodeType.standalone
        ? "Standalone"
        : hyperVNodeType.cluster
          ? "Cluster"
          : null;
    }

    // Run verification for Hyper-V
    if (clusterDetails.type === "Hyper-V") {
      if (hyperVNodeType.standalone) {
        const ok = await runSingleNodeVerification();
        if (!ok) return;
      } else if (hyperVNodeType.cluster) {
        const result = await runMultiNodeVerification();
        if (!result.success) {
          if (result.hasFailures) {
            setPendingPayload(payload);
            setShowFailureConfirm(true);
            return;
          }
          return; // Critical failure
        }
      }
    }

    // ── Create cluster ──────────────────────────────────────────────────────
    if (!Array.isArray(payload.ip)) payload.ip = [payload.ip];
    try {
      const res = await dispatch(
        createClusterThunk({ token, payload }),
      ).unwrap();
      if (res.warning && res.message) {
        toast.warn(res.message, { transition: Slide });
        setIsClusterCreated(false);
      } else if (res.cluster) {
        toast.success("Cluster created!", { transition: Slide });
        setCreatedClusterId(res.cluster.id);
        setIsClusterCreated(true);
        if (res.cluster.type === "Hyper-V") {
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

  const handleFailureConfirm = (proceed) => {
    if (proceed && pendingPayload) {
      const payload = pendingPayload;
      if (!Array.isArray(payload.ip)) payload.ip = [payload.ip];
      dispatch(createClusterThunk({ token, payload }))
        .unwrap()
        .then((res) => {
          if (res.cluster) {
            toast.success(
              "Cluster created successfully despite node failures",
              {
                transition: Slide,
              },
            );
            setCreatedClusterId(res.cluster.id);
            setIsClusterCreated(true);
            setTimeout(() => navigate("/clusters"), 1000);
          }
        })
        .catch((err) => {
          toast.error(err?.message || "Failed to create cluster");
        });
    }
    setShowFailureConfirm(false);
    setPendingPayload(null);
    setFailedNodes([]);
  };

  const handleChange = (e) =>
    setClusterDetails({ ...clusterDetails, tls: e.target.checked });

  const handleMonitoringCheckbox = async (e) => {
    const checked = e.target.checked;
    if (checked && createdClusterId) {
      try {
        const payload = await dispatch(
          fetchInfluxdbDetailsThunk({ token, clusterId: createdClusterId }),
        ).unwrap();
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
      } catch {
        setMonitoringEnabled(false);
        setMonitoringData(null);
        setShowMonitoringConfirm(true);
        setInfluxAlreadyIntegrated(false);
      }
    } else {
      setMonitoringEnabled(false);
      setShowMonitoringConfirm(false);
      setMonitoringData(null);
      setInfluxAlreadyIntegrated(false);
    }
  };

  const addInfluxdbWrapper = async (isCustomIntegration) => {
    try {
      const res = await dispatch(
        addInfluxdbThunk({
          token,
          clusterId: createdClusterId,
          isCustomIntegration,
        }),
      );
      if (res?.payload?.code !== 200) {
        toast.error(res?.payload?.data?.msg || "Failed to integrate InfluxDB");
        setMonitoringEnabled(false);
        return;
      }
      toast.success(
        res?.payload?.data?.msg || "InfluxDB integrated successfully",
      );
      dispatch(
        fetchInfluxdbDetailsThunk({ token, clusterId: createdClusterId }),
      );
      setTimeout(() => navigate("/clusters"), 2000);
    } catch (error) {
      const message =
        typeof error === "string"
          ? error
          : error?.msg || error?.message || "Failed to integrate InfluxDB";
      toast.error(message);
      setMonitoringEnabled(false);
      setMonitoringData(null);
    }
  };

  const handleMonitoringConfirm = async (confirm) => {
    setShowMonitoringConfirm(false);
    if (createdClusterId) {
      if (confirm) await addInfluxdbWrapper(true);
      else {
        setMonitoringEnabled(false);
        setMonitoringData(null);
      }
    } else {
      setMonitoringEnabled(false);
      setMonitoringData(null);
    }
  };

  const handleMigrate = async () => {
    if (!srcApiToken) {
      toast.error("API token is required");
      return;
    }
    setMigrateLoading(true);
    try {
      const payload = {
        src_url: `http://${monitoringData.server}:${monitoringData.port}`,
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
    setShowVerificationPanel(false);
    setShowMultiNodePanel(false);
    setNodeVerificationList([]);
    setHyperVNodeType(
      type === "standalone"
        ? { standalone: true, cluster: false }
        : { standalone: false, cluster: true },
    );
  };

  const Goback = () => navigate("/clusters");

  const multiNodeSummary = (() => {
    if (!nodeVerificationList.length) return null;
    const total = nodeVerificationList.length;
    const success = nodeVerificationList.filter(
      (n) => n.overallStatus === "success",
    ).length;
    const error = nodeVerificationList.filter(
      (n) => n.overallStatus === "error",
    ).length;
    const verifying = nodeVerificationList.filter(
      (n) => n.overallStatus === "verifying",
    ).length;
    return { total, success, error, verifying };
  })();

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full md:w-[98%] mt-4 min-h-[75vh] h-[85vh] md:h-[90vh] m-auto bg-white rounded-lg p-2 md:p-4 shadow-md flex flex-col overflow-hidden">
      <div className="cluster-creation-form flex-1 overflow-auto rounded-md bg-white custom-scrollbar p-2 md:p-4">
        {/* Back */}
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

                {/* {clusterDetails.type === "VMware" && (
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
                )} */}
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
                          checked={hyperVNodeType.standalone}
                          value="standalone"
                          onChange={() =>
                            handleHyperVNodeSelection("standalone")
                          }
                          name="nodeType"
                        />
                        <span>Standalone</span>
                      </label>
                      <label className="flex items-center gap-2 whitespace-nowrap">
                        <input
                          type="radio"
                          checked={hyperVNodeType.cluster}
                          value="cluster"
                          onChange={() => handleHyperVNodeSelection("cluster")}
                          name="nodeType"
                        />
                        <span>Failover Cluster</span>
                      </label>
                    </div>
                  </div>
                )}

                {clusterDetails.type.toLowerCase() !== "hyper-v" && (
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
                )}
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

          {/* ── STANDALONE verification panel ─────────────────────────── */}
          {showVerificationPanel &&
            clusterDetails.type === "Hyper-V" &&
            hyperVNodeType.standalone && (
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
                          <StepIcon status={step.status} />
                        </div>
                        <span
                          className={`text-sm ${stepTextClass(step.status)}`}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          {/* ── CLUSTER (multi-node) verification panel ───────────────── */}
          {showMultiNodePanel &&
            clusterDetails.type === "Hyper-V" &&
            hyperVNodeType.cluster && (
              <div className="mt-6 pl-5">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 max-w-3xl">
                  {/* Header + summary */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-[#1a365d] flex items-center gap-2">
                      <i className="fas fa-network-wired text-[#1a365d]" />
                      Cluster Node Verification
                    </h4>
                    {multiNodeSummary && !fetchingNodes && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                          {multiNodeSummary.total} nodes
                        </span>
                        {multiNodeSummary.success > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
                            ✓ {multiNodeSummary.success} passed
                          </span>
                        )}
                        {multiNodeSummary.error > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold">
                            ✗ {multiNodeSummary.error} failed
                          </span>
                        )}
                        {multiNodeSummary.verifying > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center gap-1">
                            <CircularProgress
                              size={10}
                              style={{ color: "#1d4ed8" }}
                            />
                            {multiNodeSummary.verifying} verifying
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Fetching loader */}
                  {fetchingNodes && (
                    <div className="flex items-center gap-3 py-6 justify-center">
                      <CircularProgress
                        size={20}
                        style={{ color: "#1a365d" }}
                      />
                      <span className="text-sm font-medium text-gray-600">
                        Fetching cluster nodes…
                      </span>
                    </div>
                  )}

                  {/* Node cards */}
                  {!fetchingNodes && nodeVerificationList.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {nodeVerificationList.map((node, nodeIdx) => {
                        const borderColor =
                          node.overallStatus === "success"
                            ? "border-green-400"
                            : node.overallStatus === "error"
                              ? "border-red-400"
                              : node.overallStatus === "verifying"
                                ? "border-blue-400"
                                : "border-gray-200";
                        const headerBg =
                          node.overallStatus === "success"
                            ? "bg-green-50"
                            : node.overallStatus === "error"
                              ? "bg-red-50"
                              : node.overallStatus === "verifying"
                                ? "bg-blue-50"
                                : "bg-gray-50";
                        return (
                          <div
                            key={nodeIdx}
                            className={`rounded-lg border-2 ${borderColor} overflow-hidden transition-all duration-300`}
                          >
                            {/* Card header: node name + health badge */}
                            <div
                              className={`${headerBg} px-4 py-2.5 flex items-center justify-between`}
                            >
                              <div className="flex items-center gap-2">
                                <i className="fas fa-server text-[#1a365d] text-xs" />
                                <span className="text-sm font-bold text-[#1a365d]">
                                  {node.Node_name}
                                </span>
                              </div>
                              <NodeBadge health={node.displayHealth} />
                            </div>

                            {/* Node meta: IP + VM count + agent/hyperv badges */}
                            <div className="px-4 py-2 bg-white flex items-center flex-wrap gap-3 border-b border-gray-100">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <i className="fas fa-network-wired text-gray-400 text-[10px]" />
                                {node.IP}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <i className="fas fa-desktop text-gray-400 text-[10px]" />
                                {node.VMCount} VM{node.VMCount !== 1 ? "s" : ""}
                              </span>
                              {/* Populated after pingHyperVAgent responds */}
                              {node.agentVersion && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600 font-medium">
                                  DevRaQ Hyper-v Agent v{node.agentVersion}
                                </span>
                              )}
                            </div>

                            {/* Verification steps */}
                            <div className="px-4 py-3 space-y-2.5 bg-white">
                              {node.steps.map((step) => (
                                <div
                                  key={step.id}
                                  className="flex items-center gap-2.5"
                                >
                                  <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                                    <StepIcon status={step.status} />
                                  </div>
                                  <span
                                    className={`text-xs ${stepTextClass(step.status)}`}
                                  >
                                    {step.label}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Bottom status strip */}
                            {node.overallStatus !== "pending" && (
                              <div
                                className={`px-4 py-1.5 text-xs font-semibold text-center ${
                                  node.overallStatus === "success"
                                    ? "bg-green-500 text-white"
                                    : node.overallStatus === "error"
                                      ? "bg-red-500 text-white"
                                      : "bg-blue-500 text-white"
                                }`}
                              >
                                {node.overallStatus === "success" &&
                                  "✓ Verified"}
                                {node.overallStatus === "error" &&
                                  "✗ Verification Failed"}
                                {node.overallStatus === "verifying" &&
                                  "Verifying…"}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>

        {/* ── Monitoring section (Proxmox only) ──────────────────────────── */}
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
                  <span className="text-base font-semibold text-gray-800 mb-4 text-center">
                    You want to integrate InfluxDB into Proxmox ?
                  </span>
                  <div className="flex gap-6">
                    <button
                      className="px-4 py-1 rounded-md bg-[#1a365d]/80 text-white font-semibold hover:bg-[#1a365d]"
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
                  {[
                    { label: "Organization", key: "organization" },
                    { label: "Bucket", key: "bucket" },
                    { label: "Server", key: "server" },
                    { label: "Port", key: "port" },
                  ].map(({ label, key }) => (
                    <div key={key} className="tr flex items-center mb-2">
                      <div className="th w-40 flex-shrink-0">
                        <label className="block mt-2 text-sm font-medium text-gray-900">
                          {label}
                        </label>
                      </div>
                      <div className="td flex-1">
                        <input
                          type="text"
                          readOnly
                          value={monitoringData[key] || ""}
                          className={classNames(
                            isDisabled
                              ? "bg-gray-200 border-slate-300"
                              : "bg-white bg-transparent",
                            "w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400 border-2",
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="tr flex items-center mb-2">
                    <div className="th w-40 flex-shrink-0">
                      <label className="block mt-2 text-sm font-medium text-gray-900">
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
                          "w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400 border-2",
                        )}
                      />
                    </div>
                  </div>
                  <div className="tr flex items-center mb-2">
                    <div className="th w-40 flex-shrink-0">
                      <label className="block mt-2 text-sm font-medium text-gray-900">
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
                        className="w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400 border-2"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiToken((p) => !p)}
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

        {showFailureConfirm && (
          <div className="modal-overlay">
            <div className="modal-content !max-w-md">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Verification Failures
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  The following nodes failed verification:
                </p>
                <div className="w-full bg-gray-50 rounded p-2 mb-6 max-h-32 overflow-y-auto">
                  {failedNodes.map((fn, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-red-600 font-medium mb-1 last:mb-0"
                    >
                      • {fn.name} ({fn.ip})
                    </div>
                  ))}
                </div>
                <p className="text-sm font-semibold text-gray-800 mb-6">
                  Do you still want to add this cluster?
                </p>
                <div className="flex gap-4 w-full">
                  <button
                    className="flex-1 px-4 py-2 rounded-md bg-[#1a365d] text-white font-semibold hover:bg-[#1a365d]/90 transition-colors"
                    onClick={() => handleFailureConfirm(true)}
                  >
                    Yes, Add Anyway
                  </button>
                  <button
                    className="flex-1 px-4 py-2 rounded-md bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors"
                    onClick={() => handleFailureConfirm(false)}
                  >
                    No, Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClusterCreationForm;

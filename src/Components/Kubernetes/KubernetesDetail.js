import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeftIcon,
  Square3Stack3DIcon,
  ServerIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { fetchKubernetesClusterDetail } from "Services/KubernetesService";

// Helper to generate initial random history data for charts
const generateInitialHistory = (pointsCount = 15, min = 20, max = 50) => {
  return Array.from({ length: pointsCount }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  );
};

const computeUptime = (isoString) => {
  const created = new Date(isoString);
  if (!isoString || Number.isNaN(created.getTime())) return "-";
  const diffMs = Date.now() - created.getTime();
  if (diffMs < 0) return "-";
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  return `${days}d ${hours}h`;
};

// Node capacity values come back as human strings ("3.6 GB", "63.1 GB", or
// older "64648Mi") — normalize any of those to a plain GB number.
const parseSizeToGb = (sizeStr) => {
  if (!sizeStr) return 0;
  const match = /([\d.]+)\s*([A-Za-z]+)?/.exec(String(sizeStr));
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = (match[2] || "").toLowerCase();
  if (unit.startsWith("ti") || unit === "tb") return value * 1024;
  if (unit.startsWith("mi") || unit === "mb") return value / 1024;
  return value; // Gi/GB, or unitless already treated as GB
};

// Maps a node from the real /v1/kubernetes/clusters/:id "nodes" payload
// (master_nodes / worker_nodes) into the shape the topology UI renders.
const mapApiNode = (n, isMaster) => {
  const podsLimit = parseInt(n.pod_capacity ?? n.capacity?.pods, 10) || 110;

  return {
    id: n.name,
    name: n.name,
    role: isMaster ? "Control Plane, Master" : "Worker",
    ip: n.internal_ip || n.external_ip || "-",
    cpuCores: parseInt(n.capacity?.cpu, 10) || 0,
    ramGb: parseSizeToGb(n.capacity?.memory),
    diskGb: parseSizeToGb(n.capacity?.storage),
    status: n.status || "Unknown",
    kubeletVersion: n.machine?.kubelet_version || "-",
    containerRuntime: n.machine?.container_runtime || "-",
    uptime: n.uptime || computeUptime(n.created_at),
    podsLimit,
    podsRunning: n.running_pods ?? 0,
  };
};

const KubernetesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [cluster, setCluster] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview, pods

  // Telemetry state
  const [cpuHistory, setCpuHistory] = useState([]);
  const [memHistory, setMemHistory] = useState([]);
  const [netHistory, setNetHistory] = useState([]);
  const [liveCpu, setLiveCpu] = useState(35);
  const [liveMem, setLiveMem] = useState(55);
  const [liveNetIn, setLiveNetIn] = useState(12.4);
  const [liveNetOut, setLiveNetOut] = useState(8.2);

  // Load cluster data: show whatever was passed via navigation state
  // immediately, then refresh with the latest data from the backend.
  useEffect(() => {
    let cancelled = false;

    if (location.state?.clusterData) {
      setCluster(location.state.clusterData);
    }

    const loadCluster = async () => {
      try {
        const data = await fetchKubernetesClusterDetail(id);
        if (!cancelled && data) {
          setCluster(data);
        }
      } catch (err) {
        if (cancelled) return;
        if (!location.state?.clusterData) {
          toast.error(
            err?.response?.data?.message || err?.message || "Unable to load cluster details."
          );
          // Fallback so the monitoring dashboard still has something to render.
          setCluster({
            id: id || "k8s-fallback",
            name: "Thinkcloud-K8s-Prod",
            headIp: "172.16.8.180",
            port: "6443",
            username: "admin-prod",
            nodeCount: 4,
            status: "Healthy",
            createdAt: "2026-07-10 10:24:15",
          });
        }
      }
    };

    loadCluster();

    return () => {
      cancelled = true;
    };
  }, [id, location.state]);

  // Regenerate the simulated node topology and telemetry whenever the
  // resolved cluster changes.
  useEffect(() => {
    if (!cluster) return;

    let generatedNodes;

    const hasRealNodes =
      cluster.nodesInfo && (cluster.nodesInfo.master_nodes?.length || cluster.nodesInfo.worker_nodes?.length);

    if (hasRealNodes) {
      generatedNodes = [
        ...(cluster.nodesInfo.master_nodes || []).map((n) => mapApiNode(n, true)),
        ...(cluster.nodesInfo.worker_nodes || []).map((n) => mapApiNode(n, false)),
      ];
    } else {
      // No detailed node data yet (e.g. only the list-summary was loaded) —
      // render a placeholder topology from the head node + node count.
      const ipBase = cluster.headIp.substring(0, cluster.headIp.lastIndexOf("."));
      const ipLast = parseInt(cluster.headIp.substring(cluster.headIp.lastIndexOf(".") + 1));

      generatedNodes = [
        {
          id: "master",
          name: `${cluster.name}-master`,
          role: "Control Plane, Master",
          ip: cluster.headIp,
          cpuCores: 4,
          ramGb: 8,
          diskGb: 80,
          status: "Ready",
          kubeletVersion: "v1.29.1",
          containerRuntime: "containerd://1.7.11",
          uptime: "12d 5h",
          podsLimit: 110,
          podsRunning: 18,
        },
      ];

      for (let i = 1; i < cluster.nodeCount; i++) {
        generatedNodes.push({
          id: `worker-${i}`,
          name: `${cluster.name}-worker-${i}`,
          role: "Worker",
          ip: `${ipBase}.${ipLast + i}`,
          cpuCores: i % 2 === 0 ? 8 : 4,
          ramGb: i % 2 === 0 ? 16 : 8,
          diskGb: i % 2 === 0 ? 150 : 100,
          status: "Ready",
          kubeletVersion: "v1.29.1",
          containerRuntime: "containerd://1.7.11",
          uptime: "12d 5h",
          podsLimit: 110,
          podsRunning: Math.floor(Math.random() * 30) + 10,
        });
      }
    }

    setNodes(generatedNodes);
    setSelectedNodeId(generatedNodes[0]?.id || null);

    // Initialize telemetry history
    setCpuHistory(generateInitialHistory(20, 20, 50));
    setMemHistory(generateInitialHistory(20, 45, 65));
    setNetHistory(generateInitialHistory(20, 5, 25));
  }, [cluster]);

  // Live updates simulator
  useEffect(() => {
    const timer = setInterval(() => {
      // Pick a random multiplier/delta
      const cpuDelta = (Math.random() - 0.5) * 8;
      const memDelta = (Math.random() - 0.5) * 3;
      const netInDelta = (Math.random() - 0.5) * 2;
      const netOutDelta = (Math.random() - 0.5) * 1.5;

      setLiveCpu((prev) => {
        const next = Math.max(10, Math.min(95, Math.round(prev + cpuDelta)));
        setCpuHistory((history) => [...history.slice(1), next]);
        return next;
      });

      setLiveMem((prev) => {
        const next = Math.max(20, Math.min(90, Math.round(prev + memDelta)));
        setMemHistory((history) => [...history.slice(1), next]);
        return next;
      });

      setLiveNetIn((prev) => {
        const next = parseFloat(Math.max(1.0, Math.min(99.0, prev + netInDelta)).toFixed(1));
        setNetHistory((history) => [...history.slice(1), Math.round(next)]);
        return next;
      });

      setLiveNetOut((prev) => {
        return parseFloat(Math.max(1.0, Math.min(99.0, prev + netOutDelta)).toFixed(1));
      });
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  if (!cluster || nodes.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto text-[#1a365d] dark:text-blue-300 mb-2" />
        Loading monitoring dashboard...
      </div>
    );
  }

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  // Helper to build SVG path from history array
  const buildSvgPath = (history, width = 500, height = 150, maxVal = 100) => {
    if (history.length === 0) return "";
    const step = width / (history.length - 1);
    return history
      .map((val, idx) => {
        const x = idx * step;
        const y = height - (val / maxVal) * height * 0.8 - height * 0.1; // scale with padding
        return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  // Helper to build closed SVG path for filled area chart
  const buildSvgAreaPath = (history, width = 500, height = 150, maxVal = 100) => {
    if (history.length === 0) return "";
    const linePath = buildSvgPath(history, width, height, maxVal);
    const endX = width;
    return `${linePath} L ${endX} ${height} L 0 ${height} Z`;
  };

  // Prefer the backend's authoritative cluster_summary; fall back to summing
  // the node list (e.g. before the full detail payload has loaded).
  const totalPodsCapacity = nodes.reduce((sum, n) => sum + n.podsLimit, 0);
  const totalPodsRunning = nodes.reduce((sum, n) => sum + n.podsRunning, 0);
  const podsRunningDisplay = cluster.clusterSummary?.pods?.running ?? totalPodsRunning;
  const podsCapacityDisplay = cluster.clusterSummary?.pods?.capacity ?? totalPodsCapacity;
  const podsUsagePercent =
    cluster.clusterSummary?.pods?.usage_percent ??
    (podsCapacityDisplay ? Math.round((podsRunningDisplay / podsCapacityDisplay) * 100) : 0);

  const nodesTotalDisplay = cluster.clusterSummary?.nodes?.total ?? nodes.length;
  const nodesReadyDisplay =
    cluster.clusterSummary?.nodes?.ready ?? nodes.filter((n) => n.status === "Ready").length;

  const statusLabel = cluster.status
    ? cluster.status.charAt(0).toUpperCase() + cluster.status.slice(1)
    : "Unknown";
  const isHealthyStatus = ["connected", "healthy", "ready"].includes((cluster.status || "").toLowerCase());
  const clusterVersion =
    nodes.find((n) => n.role.includes("Master"))?.kubeletVersion || nodes[0]?.kubeletVersion || "-";

  return (
    <div className="p-6 pb-32 bg-gray-50 dark:bg-gray-900 min-h-screen text-left items-start flex flex-col w-full">
      {/* Breadcrumb / Back button */}
      <div className="mb-4">
        <button
          onClick={() => navigate("/kubernetes")}
          className="flex items-center gap-1.5 text-[#1a365d] dark:text-blue-300 hover:text-[#153056] font-semibold text-sm transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Kubernetes Pools
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-5 border-b border-gray-200 dark:border-gray-700 mb-6 w-full gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{cluster.name}</h1>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm border ${
                isHealthyStatus
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${isHealthyStatus ? "bg-green-500" : "bg-gray-400"}`} />
              {statusLabel}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
            API Endpoint: https://{cluster.headIp}:{cluster.port} | Version: {clusterVersion}
          </p>
        </div>

        {/* Top level tabs */}
        <div className="flex bg-gray-200/60 p-0.5 rounded-lg border border-gray-200 dark:border-gray-700 shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "overview"
                ? "bg-white dark:bg-gray-800 text-[#1a365d] dark:text-blue-300 shadow-sm font-bold"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100"
            }`}
          >
            Cluster Overview
          </button>
          <button
            onClick={() => setActiveTab("pods")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "pods"
                ? "bg-white dark:bg-gray-800 text-[#1a365d] dark:text-blue-300 shadow-sm font-bold"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100"
            }`}
          >
            All Pods
          </button>
        </div>
      </div>

      {activeTab === "overview" ? (
        <>
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full mb-6">
            {/* Pods Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4 hover:shadow transition-shadow">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                <Square3Stack3DIcon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wide">
                  Pods Usage
                </span>
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-100 block mt-0.5">
                  {podsRunningDisplay} / {podsCapacityDisplay}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                  Usage: {podsUsagePercent}% Capacity
                </span>
                <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${podsUsagePercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Nodes Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex items-center gap-4 hover:shadow transition-shadow">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <ServerIcon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wide">
                  Nodes Status
                </span>
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-100 block mt-0.5">
                  {nodesReadyDisplay} / {nodesTotalDisplay} Ready
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                  {nodesReadyDisplay === nodesTotalDisplay
                    ? "All systems operating normally"
                    : "Some nodes are not ready"}
                </span>
                <div className="flex gap-1.5 mt-2.5">
                  {nodes.map((n, idx) => (
                    <span
                      key={idx}
                      className={`h-2 w-5 rounded-full inline-block ${
                        n.status === "Ready" ? "bg-green-500" : "bg-gray-300"
                      }`}
                      title={`${n.name}: ${n.status}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Topology Layout & Selected Node Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full mb-6">
            {/* Kubernetes Multi-node Topology schema */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 lg:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Cluster Multi-Node Topology
                </h3>
                <p className="text-xs text-gray-400 mb-6">
                  Select any node below to view its detail credentials, runtime and real-time hardware monitoring.
                </p>
              </div>

              {/* Graphical Schema representation */}
              <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900/60/50 rounded-xl border border-gray-200 dark:border-gray-700/50 min-h-[220px]">
                <div className="flex flex-col items-center gap-8 w-full">
                  {/* Master Card */}
                  {nodes.filter((n) => n.role.includes("Master")).map((masterNode) => (
                    <div
                      key={masterNode.id}
                      onClick={() => setSelectedNodeId(masterNode.id)}
                      className={`relative flex flex-col items-center p-4 bg-white dark:bg-gray-800 border rounded-xl shadow-sm cursor-pointer transition-all hover:-translate-y-1 w-64 text-center z-10
                        ${
                          selectedNodeId === masterNode.id
                            ? "ring-2 ring-[#1a365d] border-[#1a365d] bg-blue-50/10"
                            : "border-gray-200 dark:border-gray-700 hover:shadow-md"
                        }`}
                    >
                      {/* Connection point dot */}
                      <span className="absolute -bottom-1.5 h-3 w-3 bg-[#1a365d] rounded-full border-2 border-white" />
                      <ServerIcon className="h-7 w-7 text-[#1a365d] dark:text-blue-300 mb-1.5" />
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-100">{masterNode.name}</span>
                      <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 border border-blue-100">
                        Control Plane / Head
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5 font-mono">{masterNode.ip}</span>
                    </div>
                  ))}

                  {/* Horizontal Connector Line Container */}
                  <div className="w-full relative h-0.5 bg-gray-300 -mt-4">
                    {/* Vertical Connector Line to Master */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-10 w-0.5 h-10 bg-gray-300" />
                  </div>

                  {/* Workers Grid */}
                  <div className="flex flex-wrap justify-center gap-6 w-full -mt-4 z-10">
                    {nodes
                      .filter((n) => n.role === "Worker")
                      .map((workerNode) => (
                        <div
                          key={workerNode.id}
                          onClick={() => setSelectedNodeId(workerNode.id)}
                          className={`relative flex flex-col items-center p-4 bg-white dark:bg-gray-800 border rounded-xl shadow-sm cursor-pointer transition-all hover:-translate-y-1 w-44 text-center
                            ${
                              selectedNodeId === workerNode.id
                                ? "ring-2 ring-[#1a365d] border-[#1a365d] bg-blue-50/10"
                                : "border-gray-200 dark:border-gray-700 hover:shadow-md"
                            }`}
                        >
                          {/* Connection point dot */}
                          <span className="absolute -top-1.5 h-3 w-3 bg-gray-300 rounded-full border-2 border-white" />
                          <ServerIcon className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-1.5" />
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate w-full px-1">
                            {workerNode.name}
                          </span>
                          <span className="text-[9px] uppercase font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded mt-1">
                            Worker Node
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5 font-mono">{workerNode.ip}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Small Legend */}
              <div className="flex items-center gap-4 mt-4 text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Node Healthy / Ready
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-0.5 w-4 bg-gray-300 inline-block" />
                  Kube-Overlay / Core Network
                </span>
              </div>
            </div>

            {/* Selected Node details Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                    Node Metadata
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {selectedNode.status}
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-gray-400 font-semibold uppercase tracking-wide block">
                      Node Name
                    </span>
                    <span className="text-gray-800 dark:text-gray-100 font-bold block mt-0.5">{selectedNode.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold uppercase tracking-wide block">
                      Role / Type
                    </span>
                    <span className="text-gray-800 dark:text-gray-100 font-medium block mt-0.5">{selectedNode.role}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 font-semibold uppercase tracking-wide block">
                        IP Address
                      </span>
                      <span className="text-gray-800 dark:text-gray-100 font-mono font-medium block mt-0.5">
                        {selectedNode.ip}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold uppercase tracking-wide block">
                        Uptime
                      </span>
                      <span className="text-gray-800 dark:text-gray-100 block mt-0.5">{selectedNode.uptime}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-3" />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-gray-400 font-semibold uppercase tracking-wide block">
                        vCPU Cores
                      </span>
                      <span className="text-gray-800 dark:text-gray-100 font-bold block mt-0.5">
                        {selectedNode.cpuCores} Cores
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold uppercase tracking-wide block">
                        RAM Size
                      </span>
                      <span className="text-gray-800 dark:text-gray-100 font-bold block mt-0.5">
                        {selectedNode.ramGb} GB
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold uppercase tracking-wide block">
                        Storage Size
                      </span>
                      <span className="text-gray-800 dark:text-gray-100 font-bold block mt-0.5">
                        {selectedNode.diskGb} GB
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-3" />
                  <div>
                    <span className="text-gray-400 font-semibold uppercase tracking-wide block">
                      Container Runtime
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 font-mono block mt-0.5">
                      {selectedNode.containerRuntime}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold uppercase tracking-wide block">
                      Kubelet Version
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 font-mono block mt-0.5">
                      {selectedNode.kubeletVersion}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg p-3.5 mt-4">
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <span>Running Pods</span>
                  <span className="font-bold text-gray-800 dark:text-gray-100">
                    {selectedNode.podsRunning} / {selectedNode.podsLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-[#1a365d] h-1.5 rounded-full"
                    style={{ width: `${(selectedNode.podsRunning / selectedNode.podsLimit) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Machine Hardware Monitoring Title */}
          <div className="pb-3 border-b border-gray-200 dark:border-gray-700 mb-5 w-full flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-5 w-5 text-[#1a365d] dark:text-blue-300" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Machine Hardware Monitoring ({selectedNode.name})
            </h2>
          </div>

          {/* Real-time SVG Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* CPU Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wide">
                      Node CPU Usage
                    </span>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-0.5">
                      {liveCpu}%
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold">
                    vCPUs: {selectedNode.cpuCores}
                  </span>
                </div>
              </div>

              {/* SVG Area Chart */}
              <div className="h-[150px] w-full mt-4 relative bg-gray-50 dark:bg-gray-900/60/30 rounded border border-gray-100 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="37.5" x2="500" y2="37.5" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="112.5" x2="500" y2="112.5" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />

                  {/* Filled Area */}
                  <path
                    d={buildSvgAreaPath(cpuHistory, 500, 150, 100)}
                    fill="url(#cpuGrad)"
                    className="transition-all duration-1000 ease-in-out"
                  />
                  {/* Stroke Line */}
                  <path
                    d={buildSvgPath(cpuHistory, 500, 150, 100)}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-in-out"
                  />
                </svg>
              </div>
            </div>

            {/* RAM Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wide">
                      Node RAM Usage
                    </span>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-0.5">
                      {liveMem}%
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">
                    Capacity: {selectedNode.ramGb} GB
                  </span>
                </div>
              </div>

              {/* SVG Area Chart */}
              <div className="h-[150px] w-full mt-4 relative bg-gray-50 dark:bg-gray-900/60/30 rounded border border-gray-100 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="37.5" x2="500" y2="37.5" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="112.5" x2="500" y2="112.5" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />

                  {/* Filled Area */}
                  <path
                    d={buildSvgAreaPath(memHistory, 500, 150, 100)}
                    fill="url(#memGrad)"
                    className="transition-all duration-1000 ease-in-out"
                  />
                  {/* Stroke Line */}
                  <path
                    d={buildSvgPath(memHistory, 500, 150, 100)}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-in-out"
                  />
                </svg>
              </div>
            </div>

            {/* Network Traffic Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wide">
                      Network Throughput
                    </span>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 mt-1">
                      In: <span className="text-emerald-600 text-base">{liveNetIn} MB/s</span> | Out: <span className="text-indigo-600 text-base">{liveNetOut} MB/s</span>
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-[9px] uppercase font-bold tracking-wider">
                    kube-overlay
                  </span>
                </div>
              </div>

              {/* SVG Area Chart */}
              <div className="h-[150px] w-full mt-4 relative bg-gray-50 dark:bg-gray-900/60/30 rounded border border-gray-100 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="37.5" x2="500" y2="37.5" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4" />
                  <line x1="0" y1="112.5" x2="500" y2="112.5" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />

                  {/* Filled Area */}
                  <path
                    d={buildSvgAreaPath(netHistory, 500, 150, 50)} // Scale for network (max 50)
                    fill="url(#netGrad)"
                    className="transition-all duration-1000 ease-in-out"
                  />
                  {/* Stroke Line */}
                  <path
                    d={buildSvgPath(netHistory, 500, 150, 50)}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-in-out"
                  />
                </svg>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Pods Tab */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 w-full">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
              All Pods
            </h3>
            <p className="text-xs text-gray-400">
              The complete list of pods currently running in the cluster.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead>
                <tr className="bg-[#1a365d] text-white font-bold uppercase tracking-wide select-none">
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Namespace</th>
                  <th className="py-3 px-4 text-left">Node</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Ready</th>
                  <th className="py-3 px-4 text-center">Restarts</th>
                  <th className="py-3 px-4 text-left">Age</th>
                  <th className="py-3 px-4 text-left">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700 dark:text-gray-300">
                {!cluster.allPods || cluster.allPods.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-gray-400">
                      No pod data available for this cluster.
                    </td>
                  </tr>
                ) : (
                  cluster.allPods.map((pod, idx) => {
                    const isHealthy = (pod.status || "").toLowerCase() === "running";
                    return (
                      <tr key={idx} className="hover:bg-gray-50 dark:bg-gray-900/60/50">
                        <td className="py-3.5 px-4 font-bold text-gray-800 dark:text-gray-100">{pod.name}</td>
                        <td className="py-3.5 px-4 font-mono text-gray-500 dark:text-gray-400">{pod.namespace}</td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">{pod.node}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isHealthy
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {isHealthy ? (
                              <CheckCircleIcon className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <ExclamationCircleIcon className="h-3.5 w-3.5 text-amber-500" />
                            )}
                            {pod.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-gray-600 dark:text-gray-400">{pod.ready}</td>
                        <td className="py-3.5 px-4 text-center text-gray-600 dark:text-gray-400">{pod.restarts}</td>
                        <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400">{pod.age}</td>
                        <td className="py-3.5 px-4 font-mono text-gray-500 dark:text-gray-400">{pod.pod_ip}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default KubernetesDetail;

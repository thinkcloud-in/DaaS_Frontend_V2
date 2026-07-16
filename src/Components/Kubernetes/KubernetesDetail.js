import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeftIcon,
  CpuChipIcon,
  CircleStackIcon,
  Square3Stack3DIcon,
  ServerIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// Helper to generate initial random history data for charts
const generateInitialHistory = (pointsCount = 15, min = 20, max = 50) => {
  return Array.from({ length: pointsCount }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  );
};

const KubernetesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [cluster, setCluster] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview, components

  // Telemetry state
  const [cpuHistory, setCpuHistory] = useState([]);
  const [memHistory, setMemHistory] = useState([]);
  const [netHistory, setNetHistory] = useState([]);
  const [liveCpu, setLiveCpu] = useState(35);
  const [liveMem, setLiveMem] = useState(55);
  const [liveNetIn, setLiveNetIn] = useState(12.4);
  const [liveNetOut, setLiveNetOut] = useState(8.2);

  // Load cluster data
  useEffect(() => {
    let foundCluster = location.state?.clusterData;

    if (!foundCluster) {
      const stored = localStorage.getItem("thinkcloud_k8s_clusters");
      if (stored) {
        try {
          const list = JSON.parse(stored);
          foundCluster = list.find((c) => c.id === id);
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Fallback if not found
    if (!foundCluster) {
      foundCluster = {
        id: id || "k8s-fallback",
        name: "Thinkcloud-K8s-Prod",
        headIp: "172.16.8.180",
        port: "6443",
        username: "admin-prod",
        nodeCount: 4,
        status: "Healthy",
        createdAt: "2026-07-10 10:24:15",
      };
    }

    setCluster(foundCluster);

    // Generate Nodes
    const ipBase = foundCluster.headIp.substring(0, foundCluster.headIp.lastIndexOf("."));
    const ipLast = parseInt(foundCluster.headIp.substring(foundCluster.headIp.lastIndexOf(".") + 1));

    const generatedNodes = [
      {
        id: "master",
        name: `${foundCluster.name}-master`,
        role: "Control Plane, Master",
        ip: foundCluster.headIp,
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

    for (let i = 1; i < foundCluster.nodeCount; i++) {
      generatedNodes.push({
        id: `worker-${i}`,
        name: `${foundCluster.name}-worker-${i}`,
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

    setNodes(generatedNodes);
    setSelectedNodeId("master");

    // Initialize telemetry history
    setCpuHistory(generateInitialHistory(20, 20, 50));
    setMemHistory(generateInitialHistory(20, 45, 65));
    setNetHistory(generateInitialHistory(20, 5, 25));
  }, [id, location.state]);

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

  if (!cluster) {
    return (
      <div className="p-6 text-center text-gray-500">
        <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto text-[#1a365d] mb-2" />
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

  const totalPodsCapacity = nodes.reduce((sum, n) => sum + n.podsLimit, 0);
  const totalPodsRunning = nodes.reduce((sum, n) => sum + n.podsRunning, 0);
  const totalCores = nodes.reduce((sum, n) => sum + n.cpuCores, 0);
  const totalRamGb = nodes.reduce((sum, n) => sum + n.ramGb, 0);

  return (
    <div className="p-6 pb-32 bg-gray-50 min-h-screen text-left items-start flex flex-col w-full">
      {/* Breadcrumb / Back button */}
      <div className="mb-4">
        <button
          onClick={() => navigate("/kubernetes")}
          className="flex items-center gap-1.5 text-[#1a365d] hover:text-[#153056] font-semibold text-sm transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Kubernetes Pools
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-5 border-b border-gray-200 mb-6 w-full gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-900">{cluster.name}</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 shadow-sm border border-green-200">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Healthy
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-mono">
            API Endpoint: https://{cluster.headIp}:{cluster.port} | Version: v1.29.1
          </p>
        </div>

        {/* Top level tabs */}
        <div className="flex bg-gray-200/60 p-0.5 rounded-lg border border-gray-200 shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "overview"
                ? "bg-white text-[#1a365d] shadow-sm font-bold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Cluster Overview
          </button>
          <button
            onClick={() => setActiveTab("components")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "components"
                ? "bg-white text-[#1a365d] shadow-sm font-bold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            System Components
          </button>
        </div>
      </div>

      {activeTab === "overview" ? (
        <>
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 w-full mb-6">
            {/* CPU Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4 hover:shadow transition-shadow">
              <div className="p-3 bg-red-50 text-red-600 rounded-lg shrink-0">
                <CpuChipIcon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wide">
                  Cluster CPU
                </span>
                <span className="text-2xl font-bold text-gray-800 block mt-0.5">
                  {liveCpu}%
                </span>
                <span className="text-[10px] text-gray-500 block">
                  Allocated: {totalCores} vCPUs Total
                </span>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${liveCpu}%` }}
                  />
                </div>
              </div>
            </div>

            {/* RAM Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4 hover:shadow transition-shadow">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <CircleStackIcon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wide">
                  Cluster Memory
                </span>
                <span className="text-2xl font-bold text-gray-800 block mt-0.5">
                  {liveMem}%
                </span>
                <span className="text-[10px] text-gray-500 block">
                  Allocated: {totalRamGb} GB Total
                </span>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${liveMem}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Pods Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4 hover:shadow transition-shadow">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                <Square3Stack3DIcon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wide">
                  Pods Usage
                </span>
                <span className="text-2xl font-bold text-gray-800 block mt-0.5">
                  {totalPodsRunning} / {totalPodsCapacity}
                </span>
                <span className="text-[10px] text-gray-500 block">
                  Usage: {((totalPodsRunning / totalPodsCapacity) * 100).toFixed(0)}% Capacity
                </span>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${(totalPodsRunning / totalPodsCapacity) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Nodes Status Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4 hover:shadow transition-shadow">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <ServerIcon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wide">
                  Nodes Status
                </span>
                <span className="text-2xl font-bold text-gray-800 block mt-0.5">
                  {cluster.nodeCount} / {cluster.nodeCount} Ready
                </span>
                <span className="text-[10px] text-gray-500 block">
                  All systems operating normally
                </span>
                <div className="flex gap-1.5 mt-2.5">
                  {nodes.map((n, idx) => (
                    <span
                      key={idx}
                      className="h-2 w-5 bg-green-500 rounded-full inline-block"
                      title={`${n.name}: Ready`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Topology Layout & Selected Node Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full mb-6">
            {/* Kubernetes Multi-node Topology schema */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 lg:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  Cluster Multi-Node Topology
                </h3>
                <p className="text-xs text-gray-400 mb-6">
                  Select any node below to view its detail credentials, runtime and real-time hardware monitoring.
                </p>
              </div>

              {/* Graphical Schema representation */}
              <div className="flex flex-col items-center justify-center p-6 bg-gray-50/50 rounded-xl border border-gray-200/50 min-h-[220px]">
                <div className="flex flex-col items-center gap-8 w-full">
                  {/* Master Card */}
                  {nodes.filter((n) => n.role.includes("Master")).map((masterNode) => (
                    <div
                      key={masterNode.id}
                      onClick={() => setSelectedNodeId(masterNode.id)}
                      className={`relative flex flex-col items-center p-4 bg-white border rounded-xl shadow-sm cursor-pointer transition-all hover:-translate-y-1 w-64 text-center z-10
                        ${
                          selectedNodeId === masterNode.id
                            ? "ring-2 ring-[#1a365d] border-[#1a365d] bg-blue-50/10"
                            : "border-gray-200 hover:shadow-md"
                        }`}
                    >
                      {/* Connection point dot */}
                      <span className="absolute -bottom-1.5 h-3 w-3 bg-[#1a365d] rounded-full border-2 border-white" />
                      <ServerIcon className="h-7 w-7 text-[#1a365d] mb-1.5" />
                      <span className="text-sm font-bold text-gray-800">{masterNode.name}</span>
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
                          className={`relative flex flex-col items-center p-4 bg-white border rounded-xl shadow-sm cursor-pointer transition-all hover:-translate-y-1 w-44 text-center
                            ${
                              selectedNodeId === workerNode.id
                                ? "ring-2 ring-[#1a365d] border-[#1a365d] bg-blue-50/10"
                                : "border-gray-200 hover:shadow-md"
                            }`}
                        >
                          {/* Connection point dot */}
                          <span className="absolute -top-1.5 h-3 w-3 bg-gray-300 rounded-full border-2 border-white" />
                          <ServerIcon className="h-6 w-6 text-gray-600 mb-1.5" />
                          <span className="text-xs font-bold text-gray-800 truncate w-full px-1">
                            {workerNode.name}
                          </span>
                          <span className="text-[9px] uppercase font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded mt-1">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <h3 className="text-base font-bold text-gray-900">
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
                    <span className="text-gray-800 font-bold block mt-0.5">{selectedNode.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold uppercase tracking-wide block">
                      Role / Type
                    </span>
                    <span className="text-gray-800 font-medium block mt-0.5">{selectedNode.role}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400 font-semibold uppercase tracking-wide block">
                        IP Address
                      </span>
                      <span className="text-gray-800 font-mono font-medium block mt-0.5">
                        {selectedNode.ip}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold uppercase tracking-wide block">
                        Uptime
                      </span>
                      <span className="text-gray-800 block mt-0.5">{selectedNode.uptime}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-3" />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-gray-400 font-semibold uppercase tracking-wide block">
                        vCPU Cores
                      </span>
                      <span className="text-gray-800 font-bold block mt-0.5">
                        {selectedNode.cpuCores} Cores
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold uppercase tracking-wide block">
                        RAM Size
                      </span>
                      <span className="text-gray-800 font-bold block mt-0.5">
                        {selectedNode.ramGb} GB
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 font-semibold uppercase tracking-wide block">
                        Storage Size
                      </span>
                      <span className="text-gray-800 font-bold block mt-0.5">
                        {selectedNode.diskGb} GB
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-3" />
                  <div>
                    <span className="text-gray-400 font-semibold uppercase tracking-wide block">
                      Container Runtime
                    </span>
                    <span className="text-gray-700 font-mono block mt-0.5">
                      {selectedNode.containerRuntime}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold uppercase tracking-wide block">
                      Kubelet Version
                    </span>
                    <span className="text-gray-700 font-mono block mt-0.5">
                      {selectedNode.kubeletVersion}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 mt-4">
                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                  <span>Running Pods</span>
                  <span className="font-bold text-gray-800">
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
          <div className="pb-3 border-b border-gray-200 mb-5 w-full flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-5 w-5 text-[#1a365d]" />
            <h2 className="text-lg font-bold text-gray-900">
              Machine Hardware Monitoring ({selectedNode.name})
            </h2>
          </div>

          {/* Real-time SVG Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* CPU Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wide">
                      Node CPU Usage
                    </span>
                    <h4 className="text-xl font-bold text-gray-800 mt-0.5">
                      {liveCpu}%
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold">
                    vCPUs: {selectedNode.cpuCores}
                  </span>
                </div>
              </div>

              {/* SVG Area Chart */}
              <div className="h-[150px] w-full mt-4 relative bg-gray-50/30 rounded border border-gray-100 overflow-hidden">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wide">
                      Node RAM Usage
                    </span>
                    <h4 className="text-xl font-bold text-gray-800 mt-0.5">
                      {liveMem}%
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">
                    Capacity: {selectedNode.ramGb} GB
                  </span>
                </div>
              </div>

              {/* SVG Area Chart */}
              <div className="h-[150px] w-full mt-4 relative bg-gray-50/30 rounded border border-gray-100 overflow-hidden">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wide">
                      Network Throughput
                    </span>
                    <h4 className="text-sm font-bold text-gray-800 mt-1">
                      In: <span className="text-emerald-600 text-base">{liveNetIn} MB/s</span> | Out: <span className="text-indigo-600 text-base">{liveNetOut} MB/s</span>
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] uppercase font-bold tracking-wider">
                    kube-overlay
                  </span>
                </div>
              </div>

              {/* SVG Area Chart */}
              <div className="h-[150px] w-full mt-4 relative bg-gray-50/30 rounded border border-gray-100 overflow-hidden">
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
        /* System Components Tab */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full">
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-900 mb-1">
              Kubernetes Control Plane Component Status
            </h3>
            <p className="text-xs text-gray-400">
              The status of core Kubernetes services running in control-plane namespaces.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wide">
                <tr>
                  <th className="py-3 px-4 text-left">Component</th>
                  <th className="py-3 px-4 text-left">Namespace</th>
                  <th className="py-3 px-4 text-left">Type</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-left">Health Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {[
                  { name: "kube-apiserver", ns: "kube-system", type: "Static Pod", status: "Healthy", detail: "API Server responds normally. Rest Client Latency 4ms." },
                  { name: "kube-controller-manager", ns: "kube-system", type: "Static Pod", status: "Healthy", detail: "Leader election active. All core loops synchronized." },
                  { name: "kube-scheduler", ns: "kube-system", type: "Static Pod", status: "Healthy", detail: "Scheduler operating. Zero pending unschedulable pods." },
                  { name: "etcd-server", ns: "kube-system", type: "Static Pod", status: "Healthy", detail: "DB Size: 24.5 MB, Cluster Raft Index synchronized." },
                  { name: "kube-proxy", ns: "kube-system", type: "DaemonSet", status: "Healthy", detail: "IPTables rules applied (142 rules). Network endpoints bound." },
                  { name: "coredns", ns: "kube-system", type: "Deployment", status: "Healthy", detail: "Replicas (2/2) online. Upstream DNS query latency 1ms." },
                  { name: "calico-node", ns: "kube-system", type: "DaemonSet", status: "Healthy", detail: "BGP Peer session established. VXLAN tunnel interfaces active." }
                ].map((comp, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4 font-bold text-gray-800">{comp.name}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-500">{comp.ns}</td>
                    <td className="py-3.5 px-4 text-gray-600">{comp.type}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                        <CheckCircleIcon className="h-3.5 w-3.5 text-green-500" />
                        {comp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">{comp.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default KubernetesDetail;

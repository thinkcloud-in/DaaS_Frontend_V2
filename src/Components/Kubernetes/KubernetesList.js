import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowPathIcon,
  PlusIcon,
  CpuChipIcon,
  InformationCircleIcon,
  TrashIcon,
  XMarkIcon,
  ServerIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

// Default pre-seeded clusters
const DEFAULT_CLUSTERS = [
  {
    id: "k8s-prod-1",
    name: "Thinkcloud-K8s-Prod",
    headIp: "172.16.8.180",
    port: "6443",
    username: "admin-prod",
    nodeCount: 4,
    status: "Healthy",
    createdAt: "2026-07-10 10:24:15",
  },
  {
    id: "k8s-dev-2",
    name: "Thinkcloud-K8s-Dev",
    headIp: "172.16.8.195",
    port: "6443",
    username: "admin-dev",
    nodeCount: 3,
    status: "Healthy",
    createdAt: "2026-07-12 14:10:05",
  }
];

const KubernetesList = () => {
  const navigate = useNavigate();
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    headIp: "",
    port: "6443",
    username: "",
    password: "",
    token: "",
    kubeconfig: "",
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Load from local storage or set default
    const stored = localStorage.getItem("thinkcloud_k8s_clusters");
    if (stored) {
      try {
        setClusters(JSON.parse(stored));
      } catch (e) {
        setClusters(DEFAULT_CLUSTERS);
      }
    } else {
      localStorage.setItem("thinkcloud_k8s_clusters", JSON.stringify(DEFAULT_CLUSTERS));
      setClusters(DEFAULT_CLUSTERS);
    }
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Kubernetes list refreshed successfully");
    }, 800);
  };

  const handleRowClick = (item) => {
    navigate(`/kubernetes/detail/${item.id}`, { state: { clusterData: item } });
  };

  const handleDeleteClick = (e, item) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to disconnect cluster "${item.name}"?`)) {
      const updated = clusters.filter((c) => c.id !== item.id);
      setClusters(updated);
      localStorage.setItem("thinkcloud_k8s_clusters", JSON.stringify(updated));
      toast.success(`Cluster "${item.name}" disconnected`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Cluster Name is required";
    if (!formData.headIp.trim()) {
      errors.headIp = "Control Plane IP is required";
    } else {
      const ipPattern = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
      if (!ipPattern.test(formData.headIp.trim())) {
        errors.headIp = "Please enter a valid IP address";
      }
    }
    if (!formData.port.trim()) {
      errors.port = "Port is required";
    } else {
      const portNum = parseInt(formData.port);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        errors.port = "Port must be between 1 and 65535";
      }
    }
    if (!formData.username.trim()) errors.username = "Username is required";
    if (!formData.password.trim() && !formData.token.trim()) {
      errors.password = "Password or Token is required";
      errors.token = "Password or Token is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Simulate connecting
    setLoading(true);
    const toastId = toast.loading("Testing connection to Kubernetes control plane...");

    setTimeout(() => {
      setLoading(false);
      toast.dismiss(toastId);

      const newCluster = {
        id: "k8s-custom-" + Date.now(),
        name: formData.name.trim(),
        headIp: formData.headIp.trim(),
        port: formData.port.trim(),
        username: formData.username.trim(),
        nodeCount: Math.floor(Math.random() * 4) + 2, // Random nodes count 2 to 5
        status: "Healthy",
        createdAt: new Date().toISOString().replace("T", " ").split(".")[0],
      };

      const updated = [newCluster, ...clusters];
      setClusters(updated);
      localStorage.setItem("thinkcloud_k8s_clusters", JSON.stringify(updated));

      // Reset form
      setFormData({
        name: "",
        headIp: "",
        port: "6443",
        username: "",
        password: "",
        token: "",
        kubeconfig: "",
      });
      setShowConnectModal(false);
      toast.success(`Successfully connected to cluster "${newCluster.name}"!`);
    }, 1500);
  };

  return (
    <div className="p-6 pb-32 bg-gray-50 min-h-screen text-left items-start flex flex-col w-full relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200 mb-6 w-full">
        <div>
          <h1 className="text-2xl font-bold text-[#1a365d] flex items-center gap-2">
            <CpuChipIcon className="h-7 w-7 text-[#1a365d]" />
            Kubernetes Pools
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Connect existing Kubernetes clusters or deploy new ones. Click on any cluster row to view node-level monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium shadow-sm transition-all disabled:opacity-60"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          {/* Connect Button */}
          <button
            onClick={() => setShowConnectModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1a365d] text-white hover:bg-[#153056] text-sm font-medium shadow-sm transition-all"
          >
            <PlusIcon className="h-4 w-4" />
            Connect
          </button>

          {/* Deploy Button (Disabled) */}
          <button
            disabled
            title="Deployment features are coming soon"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-300 text-gray-500 cursor-not-allowed text-sm font-medium shadow-sm opacity-60"
          >
            <ServerIcon className="h-4 w-4" />
            Deploy (Disabled)
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#1a365d] text-white text-sm font-semibold select-none">
                <th className="py-3.5 px-6">Cluster Name</th>
                <th className="py-3.5 px-6">Control Plane IP</th>
                <th className="py-3.5 px-6">API Port</th>
                <th className="py-3.5 px-6">Username</th>
                <th className="py-3.5 px-6 text-center">Nodes</th>
                <th className="py-3.5 px-6">Created At</th>
                <th className="py-3.5 px-6 text-center">Status</th>
                <th className="py-3.5 px-6 text-center w-24">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
              {loading && clusters.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400">
                    <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto mb-2 text-[#1a365d]" />
                    Loading clusters...
                  </td>
                </tr>
              ) : clusters.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400">
                    No Kubernetes clusters connected. Click "Connect" to add your first cluster.
                  </td>
                </tr>
              ) : (
                clusters.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleRowClick(item)}
                    className="hover:bg-blue-50/20 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6 text-gray-900 font-bold whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-600">
                      {item.headIp}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-600">
                      {item.port}
                    </td>
                    <td className="py-4 px-6 text-gray-600">{item.username}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center bg-blue-50 border border-blue-200 text-[#1a365d] text-xs font-bold px-2.5 py-0.5 rounded-md min-w-[28px]">
                        {item.nodeCount}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">
                      {item.createdAt}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDeleteClick(e, item)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Disconnect Cluster"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] transition-opacity"
            onClick={() => setShowConnectModal(false)}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <CpuChipIcon className="h-6 w-6 text-[#1a365d]" />
                  <h3 className="text-lg font-bold text-gray-900">Connect Kubernetes Cluster</h3>
                </div>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar text-left">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 flex gap-2.5 text-xs text-[#1a365d]">
                    <InformationCircleIcon className="h-5 w-5 shrink-0 text-blue-500" />
                    <div>
                      Connect to an existing Kubernetes deployment. Provide the API Server address, credentials or kubeconfig token to establish a connection.
                    </div>
                  </div>

                  {/* Cluster Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Cluster Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. k8s-prod-cluster"
                      className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] transition-all
                        ${formErrors.name ? "border-red-500 bg-red-50/10" : "border-gray-300"}`}
                    />
                    {formErrors.name && (
                      <span className="text-xs text-red-500 mt-1 block">{formErrors.name}</span>
                    )}
                  </div>

                  {/* Host IP & Port */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Control Plane IP *
                      </label>
                      <input
                        type="text"
                        name="headIp"
                        value={formData.headIp}
                        onChange={handleInputChange}
                        placeholder="e.g. 192.168.1.100"
                        className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] transition-all
                          ${formErrors.headIp ? "border-red-500 bg-red-50/10" : "border-gray-300"}`}
                      />
                      {formErrors.headIp && (
                        <span className="text-xs text-red-500 mt-1 block">{formErrors.headIp}</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        API Port *
                      </label>
                      <input
                        type="text"
                        name="port"
                        value={formData.port}
                        onChange={handleInputChange}
                        placeholder="6443"
                        className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] transition-all
                          ${formErrors.port ? "border-red-500 bg-red-50/10" : "border-gray-300"}`}
                      />
                      {formErrors.port && (
                        <span className="text-xs text-red-500 mt-1 block">{formErrors.port}</span>
                      )}
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="e.g. cluster-admin"
                      className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] transition-all
                        ${formErrors.username ? "border-red-500 bg-red-50/10" : "border-gray-300"}`}
                    />
                    {formErrors.username && (
                      <span className="text-xs text-red-500 mt-1 block">{formErrors.username}</span>
                    )}
                  </div>

                  {/* Password & Token (Optional / Or Credentials) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] transition-all
                          ${formErrors.password ? "border-red-500 bg-red-50/10" : "border-gray-300"}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Auth Token
                      </label>
                      <input
                        type="password"
                        name="token"
                        value={formData.token}
                        onChange={handleInputChange}
                        placeholder="eyJhbGciOiJSUzI1Ni..."
                        className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] transition-all
                          ${formErrors.token ? "border-red-500 bg-red-50/10" : "border-gray-300"}`}
                      />
                    </div>
                  </div>
                  {(formErrors.password || formErrors.token) && (
                    <span className="text-xs text-red-500 block">Please provide either Password or Auth Token.</span>
                  )}

                  {/* Kubeconfig data */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Kubeconfig Token YAML (Optional)
                    </label>
                    <textarea
                      name="kubeconfig"
                      rows="3"
                      value={formData.kubeconfig}
                      onChange={handleInputChange}
                      placeholder="apiVersion: v1&#10;clusters: ...&#10;contexts: ..."
                      className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] font-mono text-xs transition-all"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowConnectModal(false)}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#1a365d] rounded-lg hover:bg-[#153056] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="h-4 w-4" />
                        Connect & Submit
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default KubernetesList;

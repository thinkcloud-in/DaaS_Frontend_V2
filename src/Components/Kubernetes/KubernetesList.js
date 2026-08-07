import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowPathIcon,
  PlusIcon,
  CpuChipIcon,
  InformationCircleIcon,
  TrashIcon,
  PencilSquareIcon,
  XMarkIcon,
  ServerIcon,
  LockClosedIcon,
  SignalIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import {
  testKubernetesConnection,
  addKubernetesCluster,
  fetchKubernetesClusters,
  deleteKubernetesCluster,
  updateKubernetesCluster,
} from "Services/KubernetesService";

// Password-style input with a show/hide toggle button.
const PasswordInput = ({ name, value, onChange, placeholder, error }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] transition-all
          ${error ? "border-red-500 bg-red-50/10" : "border-gray-300"}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {visible ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
      </button>
    </div>
  );
};

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
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionMode, setConnectionMode] = useState("credentials"); // "credentials" | "kubeconfig"

  // Edit (update control_ip / kubeconfig) modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editFormData, setEditFormData] = useState({ controlIp: "", kubeconfig: "", username: "", password: "" });
  const [editFormErrors, setEditFormErrors] = useState({});
  const [updatingCluster, setUpdatingCluster] = useState(false);

  const loadClusters = async () => {
    setLoading(true);
    try {
      const list = await fetchKubernetesClusters();
      setClusters(list);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Unable to load Kubernetes clusters.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClusters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    await loadClusters();
    toast.success("Kubernetes list refreshed successfully");
  };

  const handleRowClick = (item) => {
    navigate(`/kubernetes/detail/${item.id}`, { state: { clusterData: item } });
  };

  const handleDeleteClick = async (e, item) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to disconnect cluster "${item.name}"?`)) return;

    try {
      await deleteKubernetesCluster(item.id);
      setClusters((prev) => prev.filter((c) => c.id !== item.id));
      toast.success(`Cluster "${item.name}" disconnected`);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Unable to disconnect the cluster.";
      toast.error(message);
    }
  };

  const handleEditClick = (e, item) => {
    e.stopPropagation();
    setEditTarget(item);
    setEditFormData({
      controlIp: item.headIp || "",
      kubeconfig: "",
      username: item.username && item.username !== "-" ? item.username : "",
      password: "",
    });
    setEditFormErrors({});
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
    if (editFormErrors[name]) {
      setEditFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.controlIp.trim()) {
      errors.controlIp = "Control Plane IP is required";
    } else {
      const ipPattern = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
      if (!ipPattern.test(editFormData.controlIp.trim())) {
        errors.controlIp = "Please enter a valid IP address";
      }
    }
    if (!editFormData.kubeconfig.trim()) errors.kubeconfig = "Kubeconfig YAML is required";
    if (!editFormData.username.trim()) errors.username = "Username is required";
    if (!editFormData.password.trim()) errors.password = "Password is required";

    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    setUpdatingCluster(true);
    const toastId = toast.loading("Updating Kubernetes cluster...");

    try {
      await updateKubernetesCluster(editTarget.id, {
        controlIp: editFormData.controlIp.trim(),
        kubeconfig: editFormData.kubeconfig.trim(),
        username: editFormData.username.trim(),
        password: editFormData.password,
      });
      await loadClusters();
      setShowEditModal(false);
      setEditTarget(null);
      toast.update(toastId, {
        render: `Cluster "${editTarget.name}" updated successfully!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Unable to update the cluster.";
      toast.update(toastId, {
        render: `Update failed: ${message}`,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setUpdatingCluster(false);
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

  // Kubeconfig mode: the user types the Control Plane IP and pastes the YAML —
  // the raw YAML is sent to the backend as-is, which parses the server
  // address and credentials (token, password, or client-cert) out of it.
  const handleKubeconfigChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, kubeconfig: value }));
    if (formErrors.kubeconfig) {
      setFormErrors((prev) => ({ ...prev, kubeconfig: "" }));
    }
  };

  const handleModeChange = (mode) => {
    setConnectionMode(mode);
    setFormErrors({});
    // Username/Password (SSH) carry over between modes — only the
    // method-specific fields reset.
    setFormData((prev) => ({
      ...prev,
      headIp: "",
      port: "6443",
      token: "",
      kubeconfig: "",
    }));
  };

  // SSH Username/Password are required regardless of connection method.
  const validateSshCredentials = (errors) => {
    if (!formData.username.trim()) errors.username = "Username is required";
    if (!formData.password.trim()) errors.password = "Password is required";
  };

  // Shared by validateForm and validateConnectionFields: Control Plane IP is
  // typed manually; the kubeconfig YAML itself is handed to the backend as-is,
  // so no client-side parsing/validation of its contents is required.
  const validateKubeconfigFields = (errors) => {
    if (!formData.headIp.trim()) {
      errors.headIp = "Control Plane IP is required";
    } else {
      const ipPattern = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
      if (!ipPattern.test(formData.headIp.trim())) {
        errors.headIp = "Please enter a valid IP address";
      }
    }

    if (!formData.kubeconfig.trim()) {
      errors.kubeconfig = "Kubeconfig YAML is required";
    }

    validateSshCredentials(errors);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Cluster Name is required";

    if (connectionMode === "kubeconfig") {
      validateKubeconfigFields(errors);
    } else {
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
      validateSshCredentials(errors);
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateConnectionFields = () => {
    const errors = {};

    if (connectionMode === "kubeconfig") {
      validateKubeconfigFields(errors);
    } else {
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
      validateSshCredentials(errors);
    }

    setFormErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  // Builds the connection payload for Test Connection / Connect & Submit.
  // Username/password (SSH) are always included; kubeconfig mode additionally
  // sends the raw YAML, credentials mode sends port + optional auth token.
  const buildConnectionParams = () => {
    const base = {
      controlIp: formData.headIp.trim(),
      username: formData.username.trim(),
      password: formData.password,
    };

    if (connectionMode === "kubeconfig") {
      return {
        ...base,
        kubeconfig: formData.kubeconfig.trim(),
      };
    }

    return {
      ...base,
      port: formData.port.trim(),
      authToken: formData.token.trim() || undefined,
    };
  };

  const handleTestConnection = async () => {
    if (!validateConnectionFields()) return;

    setTestingConnection(true);
    const toastId = toast.loading("Testing connection to Kubernetes control plane...");

    try {
      await testKubernetesConnection(buildConnectionParams());
      toast.update(toastId, {
        render: "Connection successful! The control plane is reachable.",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Unable to reach the Kubernetes control plane.";
      toast.update(toastId, {
        render: `Connection test failed: ${message}`,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const toastId = toast.loading("Connecting to Kubernetes cluster...");

    try {
      const response = await addKubernetesCluster({
        name: formData.name.trim(),
        ...buildConnectionParams(),
      });

      // Backend is the source of truth for the list — refresh it instead of
      // guessing at the shape of a newly created cluster.
      await loadClusters();

      const clusterName = response?.name || formData.name.trim();

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
      setConnectionMode("credentials");
      setShowConnectModal(false);

      toast.update(toastId, {
        render: `Successfully connected to cluster "${clusterName}"!`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Unable to connect to the Kubernetes cluster.";
      toast.update(toastId, {
        render: `Connection failed: ${message}`,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
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
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => handleEditClick(e, item)}
                          className="p-1.5 text-[#1a365d] hover:bg-blue-50 rounded-md transition-colors"
                          title="Update Cluster Connection"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, item)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Disconnect Cluster"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
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

                  {/* Connection Method */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                      Connection Method
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="connectionMode"
                          value="credentials"
                          checked={connectionMode === "credentials"}
                          onChange={() => handleModeChange("credentials")}
                          className="accent-[#1a365d] h-4 w-4"
                        />
                        Credentials
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="connectionMode"
                          value="kubeconfig"
                          checked={connectionMode === "kubeconfig"}
                          onChange={() => handleModeChange("kubeconfig")}
                          className="accent-[#1a365d] h-4 w-4"
                        />
                        Kubeconfig YAML
                      </label>
                    </div>
                  </div>

                  {connectionMode === "credentials" ? (
                    /* Host IP & Port */
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
                  ) : (
                    /* Control Plane IP (manual) */
                    <div>
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
                  )}

                  {/* SSH Username & Password — required for both connection methods */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Username *
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="e.g. root"
                        className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] transition-all
                          ${formErrors.username ? "border-red-500 bg-red-50/10" : "border-gray-300"}`}
                      />
                      {formErrors.username && (
                        <span className="text-xs text-red-500 mt-1 block">{formErrors.username}</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Password *
                      </label>
                      <PasswordInput
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        error={formErrors.password}
                      />
                      {formErrors.password && (
                        <span className="text-xs text-red-500 mt-1 block">{formErrors.password}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 -mt-2 block">
                    This username and password are used for SSH access to the cluster's control plane node.
                  </span>

                  {connectionMode === "credentials" ? (
                    /* Auth Token (optional) */
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Auth Token
                      </label>
                      <PasswordInput
                        name="token"
                        value={formData.token}
                        onChange={handleInputChange}
                        placeholder="eyJhbGciOiJSUzI1Ni..."
                      />
                      <span className="text-xs text-gray-400 mt-1 block">
                        Optional — used for Kubernetes API authentication instead of the password above.
                      </span>
                    </div>
                  ) : (
                    /* Kubeconfig data */
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Kubeconfig YAML *
                      </label>
                      <textarea
                        name="kubeconfig"
                        rows="8"
                        value={formData.kubeconfig}
                        onChange={handleKubeconfigChange}
                        placeholder="apiVersion: v1&#10;clusters: ...&#10;contexts: ...&#10;users: ..."
                        className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] font-mono text-xs transition-all
                          ${formErrors.kubeconfig ? "border-red-500 bg-red-50/10" : "border-gray-300"}`}
                      />
                      {formErrors.kubeconfig ? (
                        <span className="text-xs text-red-500 mt-1 block">{formErrors.kubeconfig}</span>
                      ) : (
                        <span className="text-xs text-gray-400 mt-1 block">
                          The full kubeconfig is sent as-is — any auth type inside it (token, password, or client-certificate) is supported.
                        </span>
                      )}
                    </div>
                  )}
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
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testingConnection || loading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#1a365d] bg-white border border-[#1a365d]/30 rounded-lg hover:bg-blue-50 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {testingConnection ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <SignalIcon className="h-4 w-4" />
                        Test Connection
                      </>
                    )}
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

      {/* Edit / Update Modal */}
      {showEditModal && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] transition-opacity"
            onClick={() => setShowEditModal(false)}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <PencilSquareIcon className="h-6 w-6 text-[#1a365d]" />
                  <h3 className="text-lg font-bold text-gray-900">
                    Update Cluster {editTarget?.name ? `— ${editTarget.name}` : ""}
                  </h3>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleEditSubmit}>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar text-left">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 flex gap-2.5 text-xs text-[#1a365d]">
                    <InformationCircleIcon className="h-5 w-5 shrink-0 text-blue-500" />
                    <div>
                      Update the Control Plane IP and re-upload the kubeconfig for this cluster's connection.
                    </div>
                  </div>

                  {/* Control Plane IP */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Control Plane IP *
                    </label>
                    <input
                      type="text"
                      name="controlIp"
                      value={editFormData.controlIp}
                      onChange={handleEditInputChange}
                      placeholder="e.g. 192.168.1.100"
                      className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] transition-all
                        ${editFormErrors.controlIp ? "border-red-500 bg-red-50/10" : "border-gray-300"}`}
                    />
                    {editFormErrors.controlIp && (
                      <span className="text-xs text-red-500 mt-1 block">{editFormErrors.controlIp}</span>
                    )}
                  </div>

                  {/* SSH Username & Password */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Username *
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={editFormData.username}
                        onChange={handleEditInputChange}
                        placeholder="e.g. root"
                        className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] transition-all
                          ${editFormErrors.username ? "border-red-500 bg-red-50/10" : "border-gray-300"}`}
                      />
                      {editFormErrors.username && (
                        <span className="text-xs text-red-500 mt-1 block">{editFormErrors.username}</span>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Password *
                      </label>
                      <PasswordInput
                        name="password"
                        value={editFormData.password}
                        onChange={handleEditInputChange}
                        placeholder="••••••••"
                        error={editFormErrors.password}
                      />
                      {editFormErrors.password && (
                        <span className="text-xs text-red-500 mt-1 block">{editFormErrors.password}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 -mt-2 block">
                    This username and password are used for SSH access to the cluster's control plane node.
                  </span>

                  {/* Kubeconfig YAML */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Kubeconfig YAML *
                    </label>
                    <textarea
                      name="kubeconfig"
                      rows="8"
                      value={editFormData.kubeconfig}
                      onChange={handleEditInputChange}
                      placeholder="apiVersion: v1&#10;clusters: ...&#10;contexts: ...&#10;users: ..."
                      className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] font-mono text-xs transition-all
                        ${editFormErrors.kubeconfig ? "border-red-500 bg-red-50/10" : "border-gray-300"}`}
                    />
                    {editFormErrors.kubeconfig && (
                      <span className="text-xs text-red-500 mt-1 block">{editFormErrors.kubeconfig}</span>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingCluster}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#1a365d] rounded-lg hover:bg-[#153056] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {updatingCluster ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <PencilSquareIcon className="h-4 w-4" />
                        Update Cluster
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

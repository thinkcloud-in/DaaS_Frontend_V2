import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAuthToken,
  selectAuthTokenParsed,
} from "../../redux/features/Auth/AuthSelectors";
import { Loader2, ChevronDown, X } from "lucide-react";
import { toast } from "react-toastify";
import "../PoolCreation/css/PoolCreationForm.css";
import { SelectField, InputField } from "../Common";

import { fetchClustersThunk } from "../../redux/features/Clusters/ClustersThunks";
import { selectAllClusters } from "../../redux/features/Clusters/ClustersSelectors";
import {
  fetchClusterNodes,
  fetchIpPoolNames,
  fetchTemplates,
  fetchProxmoxStorages,
  fetchNodeGpus,
  createPrivateLLMThunk,
} from "../../redux/features/Pools/PoolsThunks";
import { clearNodeGpus } from "../../redux/features/Pools/PoolsSlice";
import { fetchFooterTasksThunk } from "../../redux/features/Footer/FooterThunks";
import {
  selectCreationNodes,
  selectCreationIpPoolNames,
  selectCreationTemplates,
  selectProxmoxStorages,
  selectNodeGpus,
  selectCreationNodesLoading,
  selectPrivateLLMCreateLoading,
} from "../../redux/features/Pools/PoolsSelectors";

const OS_TYPE_OPTIONS = [
  { value: "Windows 10", label: "Windows 10" },
  { value: "Windows 11", label: "Windows 11" },
  { value: "Windows server OS", label: "Windows (2019/2022/2025)" },
  { value: "Ubuntu desktop", label: "Linux (Ubuntu desktop)" },
];

const MultiSelectField = ({ label, iconClass, required, children }) => (
  <div className="mb-6 flex items-start">
    <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px] pt-2.5 flex-shrink-0">
      {iconClass && (
        <span>
          <i className={`fas ${iconClass} mr-2`} />
        </span>
      )}
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="flex-1 max-w-[40rem]">{children}</div>
  </div>
);

// options can be plain strings OR { value, label } objects
// maxSelections: when set, caps how many items can be selected; already-selected items can still be deselected
const MultiSelectDropdown = ({
  options = [],
  selectedValues = [],
  onChange,
  placeholder,
  loading,
  disabled,
  compact = false,
  maxSelections = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const optVal = (opt) => (typeof opt === "object" ? opt.value : opt);
  const optLabel = (opt) => (typeof opt === "object" ? opt.label : opt);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val) => {
    onChange(
      selectedValues.includes(val)
        ? selectedValues.filter((v) => v !== val)
        : [...selectedValues, val],
    );
  };

  const getLabelForValue = (val) => {
    const match = options.find((o) => optVal(o) === val);
    return match ? optLabel(match) : val;
  };

  const isDisabled = disabled || loading;
  const limitReached =
    maxSelections > 0 && selectedValues.length >= maxSelections;

  return (
    <div className="relative w-full" ref={ref}>
      <div
        onClick={() => !isDisabled && setIsOpen((o) => !o)}
        className={`w-full min-h-[38px] border rounded-lg px-3 py-1.5 flex items-center justify-between bg-white text-sm transition-all
          ${isDisabled ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300" : "cursor-pointer border-gray-300 hover:border-gray-400"}
          ${isOpen ? "border-[#1a365d] ring-2 ring-[#1a365d]/10" : ""}
        `}
      >
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {loading ? (
            <span className="flex items-center gap-1.5 text-gray-400 text-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading...
            </span>
          ) : selectedValues.length === 0 ? (
            <span className="text-[#94a3b8] text-sm">
              {placeholder || "Select items..."}
            </span>
          ) : compact && selectedValues.length > 1 ? (
            <span className="inline-flex items-center gap-1 bg-[#1a365d]/10 text-[#1a365d] text-xs font-medium px-2 py-0.5 rounded">
              {selectedValues.length} selected
            </span>
          ) : (
            selectedValues.map((val) => (
              <span
                key={val}
                className="inline-flex items-center gap-1 bg-[#1a365d]/10 text-[#1a365d] text-xs font-medium px-2 py-0.5 rounded"
              >
                {getLabelForValue(val)}
                <X
                  className="h-3 w-3 opacity-60 hover:opacity-100 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(val);
                  }}
                />
              </span>
            ))
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 flex-shrink-0 ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && !isDisabled && (
        <div className="absolute top-[calc(100%+2px)] left-0 w-full bg-white border border-gray-200 rounded-lg shadow-md z-50 max-h-48 overflow-y-auto">
          {options.length > 0 ? (
            options.map((opt) => {
              const val = optVal(opt);
              const isChecked = selectedValues.includes(val);
              const isOptionDisabled = limitReached && !isChecked;
              return (
                <label
                  key={val}
                  className={`flex items-center gap-2.5 px-3 py-2 text-sm
                    ${isOptionDisabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer text-gray-800"}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isOptionDisabled}
                    onChange={() => !isOptionDisabled && toggle(val)}
                    className="rounded border-gray-300 text-[#1a365d] h-4 w-4 disabled:cursor-not-allowed"
                  />
                  {optLabel(opt)}
                </label>
              );
            })
          ) : (
            <p className="px-3 py-3 text-xs text-gray-400 text-center">
              No options available
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const LLMInferenceCreate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector(selectAuthToken);
  const tokenParsed = useSelector(selectAuthTokenParsed);
  const userName = tokenParsed?.preferred_username;
  const isSubmitting = useSelector(selectPrivateLLMCreateLoading);
  const [loadingGpuNodes, setLoadingGpuNodes] = useState(new Set());

  // formData structure matches the API payload exactly
  const [formData, setFormData] = useState({
    clusterName: "",
    poolName: "",
    poolOSType: "",
    ipPools: [],
    template: "",
    nodes: [], // [{ node: "nodeName", gpu: ["gpuId", ...] }]
    storage: "",
    machine_name: "",
  });

  const allClusters = useSelector(selectAllClusters) || [];
  const creationNodes = useSelector(selectCreationNodes) || [];
  const ipPoolNames = useSelector(selectCreationIpPoolNames) || [];
  const templates = useSelector(selectCreationTemplates) || [];
  const storages = useSelector(selectProxmoxStorages) || [];
  const nodeGpus = useSelector(selectNodeGpus) || {};
  const nodesLoading = useSelector(selectCreationNodesLoading);

  const fetchedGpuNodes = useRef(new Set());

  const clusterOptions = allClusters
    .map((x) => {
      const v = typeof x === "object" ? x.name || x.cluster_name : x;
      return v ? { value: v, label: v } : null;
    })
    .filter(Boolean);

  const nodeOptions = creationNodes
    .map((n) =>
      String(
        typeof n === "object" ? n.name || n.node_name || n.Node_name || "" : n,
      ),
    )
    .filter(Boolean);

  const ipPoolOptions = ipPoolNames
    .map((ip) =>
      String(typeof ip === "object" ? ip.name || ip.pool_name || "" : ip),
    )
    .filter(Boolean);

  const templateOptions = templates
    .map((t) => {
      if (typeof t !== "object") return { value: String(t), label: String(t) };
      const id = String(
        t.vmid || t.id || t.template_id || t.name || t.template_name || "",
      );
      const label = t.name || t.template_name || id;
      return id ? { value: id, label: `${label} (${id})` } : null;
    })
    .filter(Boolean);

  const storageOptions = storages
    .map((s) => String(typeof s === "object" ? s.storage || s.name || "" : s))
    .filter(Boolean);

  const getNvidiaGpuOptions = (nodeName) => {
    const list = nodeGpus[nodeName] || [];
    return list
      .filter(
        (g) =>
          g?.vendor === "0x10de" ||
          g?.vendor_name?.toLowerCase().includes("nvidia") ||
          g?.subsystem_vendor_name?.toLowerCase().includes("nvidia"),
      )
      .map((g) => ({
        value: g.id || "",
        label: g.id
          ? `${g.vendor_name || "NVIDIA"} [${g.id}]`
          : g.vendor_name || "NVIDIA GPU",
      }))
      .filter((o) => o.value);
  };

  const getClusterId = (name) => {
    const c = allClusters.find(
      (x) => (typeof x === "object" ? x.name || x.cluster_name : x) === name,
    );
    const raw = c ? c.id || c.cluster_id || c._id : null;
    return raw != null ? String(raw) : null;
  };

  useEffect(() => {
    if (token) {
      dispatch(fetchClustersThunk(token));
      dispatch(fetchIpPoolNames(token));
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (token && formData.clusterName) {
      const id = getClusterId(formData.clusterName);
      if (id) {
        dispatch(fetchClusterNodes({ token, clusterId: id }));
        dispatch(fetchTemplates({ token, clusterId: id }));
      }
    }
  }, [formData.clusterName, token]);

  useEffect(() => {
    if (token && formData.nodes.length > 0 && formData.clusterName) {
      const id = getClusterId(formData.clusterName);
      if (id) {
        const nodeNames = formData.nodes.map((n) => n.node);
        dispatch(
          fetchProxmoxStorages({ token, clusterId: id, nodes: nodeNames }),
        );

        const newNodes = nodeNames.filter(
          (n) => !fetchedGpuNodes.current.has(n),
        );
        if (newNodes.length > 0) {
          newNodes.forEach((n) => fetchedGpuNodes.current.add(n));
          setLoadingGpuNodes((prev) => {
            const next = new Set(prev);
            newNodes.forEach((n) => next.add(n));
            return next;
          });
          dispatch(
            fetchNodeGpus({ token, clusterId: id, nodes: newNodes }),
          ).then(() => {
            setLoadingGpuNodes((prev) => {
              const next = new Set(prev);
              newNodes.forEach((n) => next.delete(n));
              return next;
            });
          });
        }
      }
    }
  }, [formData.nodes, token]);

  const set = (name, value) => setFormData((p) => ({ ...p, [name]: value }));
  const handleChange = (e) => set(e.target.name, e.target.value);

  const handleClusterChange = (e) => {
    fetchedGpuNodes.current = new Set();
    setLoadingGpuNodes(new Set());
    dispatch(clearNodeGpus());
    setFormData((p) => ({
      ...p,
      clusterName: e.target.value,
      nodes: [],
      template: "",
      storage: "",
    }));
  };

  // Toggle node checked state; preserve existing gpu selections
  const handleNodeToggle = (nodeName) => {
    setFormData((p) => {
      const exists = p.nodes.find((n) => n.node === nodeName);
      if (exists) {
        return {
          ...p,
          nodes: p.nodes.filter((n) => n.node !== nodeName),
          storage: "",
        };
      }
      return {
        ...p,
        nodes: [...p.nodes, { node: nodeName, gpu: [] }],
        storage: "",
      };
    });
  };

  // Update gpu array for a specific node inside formData.nodes.
  // If the first node's count changes, trim all other nodes to match.
  const handleGpuChange = (nodeName, selectedIds) => {
    setFormData((p) => {
      const updatedNodes = p.nodes.map((n) =>
        n.node === nodeName ? { ...n, gpu: selectedIds } : n,
      );
      const isFirstNode = p.nodes[0]?.node === nodeName;
      if (isFirstNode) {
        const newCount = selectedIds.length;
        return {
          ...p,
          nodes: updatedNodes.map((n, i) =>
            i === 0 ? n : { ...n, gpu: n.gpu.slice(0, newCount) },
          ),
        };
      }
      return { ...p, nodes: updatedNodes };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.template) {
      toast.error("Please select a template before submitting.");
      return;
    }

    // Validate: all selected nodes must have the same number of GPUs as the first node
    if (formData.nodes.length > 0) {
      const referenceCount = formData.nodes[0].gpu.length;
      const mismatch = formData.nodes.find(
        (n) => n.gpu.length !== referenceCount,
      );
      if (mismatch) {
        toast.error(
          `"${mismatch.node}" must have exactly ${referenceCount} GPU${referenceCount > 1 ? "s" : ""} selected (same as the first node)`,
        );
        return;
      }
      if (referenceCount === 0) {
        toast.error("Please select at least 1 GPU for each node");
        return;
      }
    }

    try {
      dispatch(fetchFooterTasksThunk(userName));
      await dispatch(
        createPrivateLLMThunk({ token, requestData: formData }),
      ).unwrap();
      toast.success("Private LLM pool created successfully!");
      dispatch(fetchFooterTasksThunk(userName));
      navigate("/inference");
    } catch (err) {
      const msg =
        typeof err === "string"
          ? err
          : err?.msg || err?.detail || err?.message || "Failed to create pool.";
      toast.error(msg);
    }
  };

  return (
    <div className="pool_creation w-[98%] h-[90vh] m-auto bg-white rounded-lg p-4 shadow-md flex flex-col overflow-hidden relative">
      <div className="flex justify-start mt-2 mb-1">
        <div
          onClick={() => navigate("/inference")}
          className="ml-2 bg-[#1a365d]/80 text-white px-2 py-2 rounded-md hover:bg-[#1a365d] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:ring-opacity-10"
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

      <div
        className={`pool-creation-form flex-1 overflow-y-auto rounded-md bg-white ${isSubmitting ? "opacity-50 pointer-events-none select-none" : ""}`}
      >
        <div className="space-y-5 m-2">
          <div className="w-full mx-auto p-3 rounded-md bg-white">
            <h2 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">
              Create New Pool
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="text-left w-full ml-5 max-w-4xl py-4">
                <SelectField
                  label="Cluster"
                  name="clusterName"
                  iconClass="fa-sitemap"
                  value={formData.clusterName}
                  onChange={handleClusterChange}
                  required
                  options={[
                    { value: "", label: "Select Cluster", disabled: true },
                    ...clusterOptions,
                  ]}
                />

                <InputField
                  label="Pool Name"
                  name="poolName"
                  iconClass="fa-diagram-project"
                  value={formData.poolName}
                  onChange={handleChange}
                  placeholder="Pool Name"
                  required
                />

                <SelectField
                  label="Pool OS Type"
                  name="poolOSType"
                  iconClass="fa-computer"
                  value={formData.poolOSType}
                  onChange={handleChange}
                  required
                  options={[
                    { value: "", label: "Select an option", disabled: true },
                    ...OS_TYPE_OPTIONS,
                  ]}
                />

                <MultiSelectField
                  label="Select IP Pools"
                  iconClass="fa-network-wired"
                  required
                >
                  <MultiSelectDropdown
                    options={ipPoolOptions}
                    selectedValues={formData.ipPools}
                    onChange={(vals) => set("ipPools", vals)}
                    placeholder="Select IP Pools"
                  />
                </MultiSelectField>

                <SelectField
                  label="Template"
                  name="template"
                  iconClass="fa-file-alt"
                  value={formData.template}
                  onChange={handleChange}
                  required
                  disabled={!formData.clusterName}
                  placeholder={formData.clusterName ? "Select Template" : "Select a cluster first"}
                  options={templateOptions}
                />

                {/* Node list with inline GPU multi-select */}
                <MultiSelectField label="Node" iconClass="fa-server" required>
                  {nodesLoading ? (
                    <span className="flex items-center gap-1.5 text-sm text-gray-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading
                      nodes...
                    </span>
                  ) : !formData.clusterName ? (
                    <span className="text-sm text-[#94a3b8]">
                      Select a cluster first
                    </span>
                  ) : nodeOptions.length === 0 ? (
                    <span className="text-sm text-gray-400">
                      No nodes available
                    </span>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {(() => {
                        const referenceGpuCount =
                          formData.nodes[0]?.gpu?.length || 0;
                        return nodeOptions.map((nodeName) => {
                          const nodeObj = formData.nodes.find(
                            (n) => n.node === nodeName,
                          );
                          const isChecked = !!nodeObj;
                          const gpuOpts = getNvidiaGpuOptions(nodeName);
                          const isFirstChecked =
                            formData.nodes[0]?.node === nodeName;
                          // Non-first nodes are limited to match the first node's GPU count
                          const maxSel =
                            !isFirstChecked && referenceGpuCount > 0
                              ? referenceGpuCount
                              : 0;
                          return (
                            <div key={nodeName} className="flex flex-col gap-1">
                              <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2.5 cursor-pointer group min-w-[140px] flex-shrink-0">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleNodeToggle(nodeName)}
                                    className="h-4 w-4 rounded border-gray-300 text-[#1a365d] focus:ring-[#1a365d] cursor-pointer"
                                  />
                                  <span className="text-sm text-gray-800 group-hover:text-[#1a365d] transition-colors">
                                    {nodeName}
                                  </span>
                                </label>

                                {isChecked &&
                                  (loadingGpuNodes.has(nodeName) ? (
                                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                      <Loader2 className="h-3 w-3 animate-spin" />{" "}
                                      Loading GPUs...
                                    </span>
                                  ) : (
                                    <div className="flex-1 max-w-xs">
                                      <MultiSelectDropdown
                                        options={gpuOpts}
                                        selectedValues={nodeObj?.gpu || []}
                                        onChange={(vals) =>
                                          handleGpuChange(nodeName, vals)
                                        }
                                        placeholder={
                                          gpuOpts.length === 0
                                            ? "No NVIDIA GPU available"
                                            : "Select GPU(s)"
                                        }
                                        disabled={gpuOpts.length === 0}
                                        compact
                                        maxSelections={maxSel}
                                      />
                                    </div>
                                  ))}
                              </div>

                              {/* Hint for non-first checked nodes */}
                              {isChecked &&
                                !isFirstChecked &&
                                referenceGpuCount > 0 && (
                                  <p className="ml-[172px] text-xs text-amber-600">
                                    Select {referenceGpuCount} GPU
                                    {referenceGpuCount > 1 ? "s" : ""}
                                    {nodeObj?.gpu?.length > 0
                                      ? ` (${nodeObj.gpu.length}/${referenceGpuCount} selected)`
                                      : ""}
                                  </p>
                                )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </MultiSelectField>

                <SelectField
                  label="Storage"
                  name="storage"
                  iconClass="fa-database"
                  value={formData.storage}
                  onChange={handleChange}
                  required
                  disabled={formData.nodes.length === 0}
                  placeholder={formData.nodes.length > 0 ? "Select Storage" : "Select nodes first"}
                  options={storageOptions.map((s) => ({ value: s, label: s }))}
                />

                <InputField
                  label="Machine Name"
                  name="machine_name"
                  iconClass="fa-font"
                  value={formData.machine_name}
                  onChange={handleChange}
                  placeholder="Naming Pattern (i.e example-{n:fixed=3})"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pr-4 pb-4">
                <button
                  type="button"
                  onClick={() => navigate("/inference")}
                  className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-[#1a365d] rounded-lg hover:bg-[#122744] disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLMInferenceCreate;

import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  selectAuthToken,
  selectAuthTokenParsed,
} from "../../redux/features/Auth/AuthSelectors";
import "./css/PoolCreationForm.css";
import VNCsettings from "./VNCsettings";
import SSHsettings from "./SSHsettings";
import RDPsettings from "./RDPsettings";
import CustomTabs from "../CustomTabs/CustomTabs";
import { getPoolByIdService } from "../../Services/PoolService";
import { useDispatch, useSelector } from "react-redux";
import {
  updatePool,
  fetchClusterNodes,
  fetchTemplates,
  fetchVmwareDCs,
  fetchVmwareFolders,
  fetchIpPoolNames,
  fetchSwitches,
} from "../../redux/features/Pools/PoolsThunks";
import { fetchClustersThunk } from "../../redux/features/Clusters/ClustersThunks";
import { selectAllClusters } from "../../redux/features/Clusters/ClustersSelectors";
import {
  selectCreationNodes,
  selectCreationTemplates,
  selectCreationIpPoolNames,
  selectCreationVmwareDCs,
  selectCreationVmwareFolders,
  selectPoolSaveLoading,
  selectCreationSwitches,
  selectCreationNodesLoading,
} from "../../redux/features/Pools/PoolsSelectors";
import { Loader2 } from "lucide-react";
import { Slide, toast } from "react-toastify";
import SkeletonEditPool from "./SkeletonEditPool";
import Select from "react-select";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { InputField, SelectField, PasswordField } from "../Common";

const poolType = ["Automated", "Manual"];

const EditPool = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: poolId } = useParams();
  const [poolDetails, setPoolDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("RDP");
  const nodes = useSelector(selectCreationNodes) || [];
  const templates = useSelector(selectCreationTemplates) || [];
  const ipPoolNames = useSelector(selectCreationIpPoolNames) || [];
  const vmwareDCs = useSelector(selectCreationVmwareDCs) || [];
  const vmwareFolders = useSelector(selectCreationVmwareFolders) || [];
  const switches = useSelector(selectCreationSwitches) || [];
  const poolSaveLoading = useSelector(selectPoolSaveLoading);
  const token = useSelector(selectAuthToken);
  const tokenParsed = useSelector(selectAuthTokenParsed);
  const userEmail = tokenParsed?.preferred_username || tokenParsed?.email || "";
  const clusters = useSelector(selectAllClusters) || [];
  const dispatch = useDispatch();
  const isNodesLoading = useSelector(selectCreationNodesLoading);

  const selectedCluster = useMemo(() => {
    if (!poolDetails.cluster_id || clusters.length === 0) return null;
    const clusterIdStr = String(poolDetails.cluster_id);
    const targetId = clusterIdStr.includes("_")
      ? clusterIdStr.split("_").pop()
      : clusterIdStr;
    return clusters.find((c) => String(c.id) === String(targetId));
  }, [poolDetails.cluster_id, clusters]);

  const selectStyles = {
    container: (base) => ({ ...base, width: "100%" }),
    control: (base, state) => ({
      ...base,
      minHeight: "2.25rem",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": { borderColor: "#3b82f6" },
    }),
    loadingIndicator: (base) => ({
      ...base,
      color: "#1a365d",
    }),
  };

  useEffect(() => {
    setLoading(true);
    getPoolByIdService(token, poolId)
      .then((res) => {
        const pool = res.data.data.pool;
        if (
          typeof pool.pool_template_vm_id === "string" &&
          pool.pool_template_vm_id.trim().startsWith("{")
        ) {
          try {
            pool.pool_template_vm_id = JSON.parse(pool.pool_template_vm_id);
          } catch (e) {
            console.error("Failed to parse pool_template_vm_id", e);
          }
        }
        setPoolDetails(pool);
        let clusterId = "";
        if (res.data.data.pool.cluster_id) {
          if (typeof res.data.data.pool.cluster_id === "string") {
            clusterId = res.data.data.pool.cluster_id.split("_").pop();
          } else {
            clusterId = res.data.data.pool.cluster_id;
          }
          dispatch(fetchClusterNodes({ token, clusterId }));
          dispatch(fetchTemplates({ token, clusterId }));
          if (res.data.data.pool.cluster_type === "VMware") {
            dispatch(fetchVmwareDCs({ token, clusterId }));
            dispatch(fetchVmwareFolders({ token, clusterId }));
          }
          if (res.data.data.pool.cluster_type === "Hyper-V") {
            dispatch(fetchSwitches({ token, clusterId }));
          }
        }
        if (res.data.data.pool.pool_type === "Automated") {
          dispatch(fetchIpPoolNames(token));
        }
      })
      .catch(() => setPoolDetails({}))
      .finally(() => setLoading(false));
  }, [poolId, dispatch, token]);

  useEffect(() => {
    if (poolDetails.pool_type === "Automated" && token && clusters.length === 0) {
      dispatch(fetchClustersThunk({ token, page: 1, pageSize: 100 }));
    }
  }, [token, poolDetails.pool_type, dispatch]);

  useEffect(() => {
    if (poolDetails.cluster_id && clusters.length > 0) {
      const clusterIdStr = String(poolDetails.cluster_id);
      const targetId = clusterIdStr.includes("_")
        ? clusterIdStr.split("_").pop()
        : clusterIdStr;
      const cluster = clusters.find((c) => String(c.id) === String(targetId));
      if (cluster && cluster.type === "Hyper-V") {
        const isCluster = ["multinode", "cluster"].includes(
          cluster.node_type.toLowerCase().replace(/\s/g, ""),
        );
        if (poolDetails.pool_template_vm_id?.is_cluster !== isCluster) {
          setTemplateField("is_cluster", isCluster);
        }
      }
    }
  }, [
    poolDetails.cluster_id,
    clusters,
    poolDetails.pool_template_vm_id?.is_cluster,
  ]);
  const isHyperV = poolDetails.cluster_type?.toLowerCase() === "hyper-v";

  useEffect(() => {
    if (isHyperV && poolDetails.pool_template_vm_id?.is_cluster && nodes.length > 0) {
      const allNodeValues = nodes.map(
        (n) => n.Node_name || n.name || n.IP || "Unknown Node",
      );
      if (
        JSON.stringify(poolDetails.pool_selected_nodes || []) !==
        JSON.stringify(allNodeValues)
      ) {
        setPoolDetails((prev) => ({
          ...prev,
          pool_selected_nodes: allNodeValues,
        }));
      }
    }
  }, [
    isHyperV,
    poolDetails.pool_template_vm_id?.is_cluster,
    nodes,
    poolDetails.pool_selected_nodes,
  ]);

  // Helper to update a nested field inside pool_template_vm_id
  const setTemplateField = (key, value) => {
    setPoolDetails((prev) => ({
      ...prev,
      pool_template_vm_id: {
        ...(prev.pool_template_vm_id || {}),
        [key]: value,
      },
    }));
  };

  const handleOnChange = (e) => {
    const { name, type, checked, value } = e.target;
    let newValue;
    if (type === "checkbox") {
      newValue = checked;
    } else if (
      [
        "pool_guacd_port",
        "pool_max_connections",
        "pool_max_connections_per_user",
        "pool_gateway_port",
        "pool_width",
        "pool_height",
        "pool_dpi",
        "pool_sftp_port",
        "pool_sftp_server_alive_interval",
        "pool_scrollback",
        "pool_font_size",
        "pool_destination_port",
        "pool_port",
        "pool_number_of_vms",
        "pool_template_vm_id",
        "hyperv_clone_type",
        "hyperv_destination_path",
      ].includes(name)
    ) {
      newValue = value ? parseInt(value, 10) : null;
    } else {
      newValue = value;
    }
    setPoolDetails((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleIpPoolsChange = (selectedOptions) => {
    setPoolDetails((prev) => ({
      ...prev,
      pool_ip_pool_names: (selectedOptions || []).map((opt) => opt.value),
    }));
  };

  const handleNodesChange = (selectedOptions) => {
    setPoolDetails((prev) => ({
      ...prev,
      pool_selected_nodes: (selectedOptions || []).map((opt) => opt.value),
    }));
  };

  const handleTemplateChange = (e) => {
    setPoolDetails((prev) => ({
      ...prev,
      pool_template_vm_id: e.target.value ? parseInt(e.target.value, 10) : null,
    }));
  };

  const handleNamingPatternChange = (e) => {
    setPoolDetails((prev) => ({
      ...prev,
      pool_naming_pattern: e.target.value,
    }));
  };

  const handleCountChange = (e) => {
    setPoolDetails((prev) => ({
      ...prev,
      pool_number_of_vms: Number(e.target.value),
    }));
  };

  const handleOnClick = () => {
    const requestData = { ...poolDetails, email: userEmail };

    try {
      // Fire the update request and handle completion in the background
      dispatch(updatePool({ token, poolId: poolDetails.id, requestData }))
        .unwrap()
        .then((payload) => {
          toast.success(payload?.msg || "Pool updated successfully", {
            position: "top-right",
            autoClose: 5000,
          });
        })
        .catch((err) => {
          toast.error(err?.detail || err?.msg || err?.message || "Pool update failed", {
            position: "top-right",
            autoClose: 5000,
          });
        });

      toast.info("Pool Updation Initialized", {
        position: "top-right",
        autoClose: 3000,
      });

      // Navigate immediately to the pools page
      navigate("/pools");
    } catch (err) {
      const message = err?.msg || err?.message || "Submission failed";
      toast.error(message, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const securityMode = [
    "None",
    "Any",
    "NLA",
    "RDP encryption",
    "TLS encryption",
    "Hyper-V / VMConnect",
  ];

  const Goback = () => navigate(-1);

  const nodeOptions = nodes.map((node) => ({
    label: node.Node_name || node.name || node.IP || "Unknown Node",
    value: node.Node_name || node.name || node.IP || "Unknown Node",
  }));

  
  const isDynamicMemory = poolDetails.pool_template_vm_id?.dynamic_memory;
  console.log("isDynamicMemory", isDynamicMemory);
  const hasJoinAD = !!poolDetails.pool_ad_username;

  return (
    <div className="pool_creation w-[98%] h-[86vh] m-auto flex-1 mx-auto bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md flex flex-col overflow-hidden relative">
      <div className="flex justify-start mt-5">
        <div
          onClick={Goback}
          className="ml-4 bg-[#1a365d]/80 text-white px-2 py-2 rounded-md hover:bg-[#1a365d] focus:outline-none focus:ring-opacity-10"
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

      <div className="pool-creation-form flex-1 overflow-y-auto rounded-md bg-white dark:bg-gray-800 custom-scrollbar">
        {loading ? (
          <SkeletonEditPool />
        ) : (
          <div
            className={`space-y-5 m-2 ${isLoading ? "opacity-60 pointer-events-none select-none" : ""}`}
          >
            <div className="w-full mx-auto p-3 rounded-md bg-white dark:bg-gray-800">
              <h2 className="font-semibold leading-7 text-gray-900 dark:text-gray-100">
                <span className="text-[#1a365d] dark:text-blue-300 text-xl">Edit </span>:{" "}
                <span className="text-[#00000099] dark:text-gray-100 text-xl">
                  {poolDetails.pool_name}
                </span>
              </h2>

              <div className="ml-5 mt-4">
                <SelectField
                  label="Pool Type"
                  name="pool_type"
                  iconClass="fa-layer-group"
                  value={poolDetails.pool_type || ""}
                  onChange={handleOnChange}
                  disabled={true}
                  options={[
                    { value: "", label: "Pool Type", disabled: true },
                    ...poolType.map((item) => ({ value: item, label: item })),
                  ]}
                />

                {poolDetails.pool_type && (
                  <InputField
                    label="Pool Name"
                    name="pool_name"
                    iconClass="fa-tag"
                    value={poolDetails.pool_name || ""}
                    onChange={handleOnChange}
                    disabled={true}
                  />
                )}

                {poolDetails.cluster_id && (
                  <InputField
                    label="Cluster"
                    name="cluster_name"
                    iconClass="fa-sitemap"
                    value={selectedCluster?.name || "N/A"}
                    disabled={true}
                  />
                )}

                {poolDetails.pool_type === "Automated" && (
                  <>
                    <SelectField
                      label="Pool OS Type"
                      name="pool_os_type"
                      iconClass="fa-desktop"
                      value={
                        isHyperV
                          ? poolDetails.pool_template_vm_id?.os_type ||
                            poolDetails.pool_os_type ||
                            ""
                          : poolDetails.pool_os_type || ""
                      }
                      onChange={handleOnChange}
                      required={true}
                      disabled={true}
                      options={[
                        { value: "", label: "Select OS", disabled: true },
                        { value: "Windows", label: "Windows" },
                        { value: "Linux", label: "Linux" },
                        { value: "MacOS", label: "MacOS" },
                      ]}
                    />
                    {/* IP Pools */}
                    <div className="mb-6 flex items-start">
                      <label className="flex items-center gap-2 font-medium text-[#22223b] dark:text-gray-100 min-w-[180px] pt-1">
                        <span>
                          <i className="fas fa-network-wired mr-2"></i>
                        </span>
                        Select IP Pools
                      </label>
                      <div className="flex-1 w-[40%] max-w-[40rem] ml-2">
                        <Select
                          isMulti
                          isDisabled={true}
                          name="pool_ip_pool_names"
                          value={ipPoolNames
                            .filter((name) =>
                              (poolDetails.pool_ip_pool_names || []).includes(
                                name,
                              ),
                            )
                            .map((name) => ({ label: name, value: name }))}
                          onChange={handleIpPoolsChange}
                          options={ipPoolNames.map((name) => ({
                            label: name,
                            value: name,
                          }))}
                          className="basic-multi-select bg-white dark:bg-gray-800"
                          classNamePrefix="select"
                          placeholder="Select IP Pools"
                        />
                      </div>
                    </div>

                    {/* Node */}
                    <div className="mb-6 flex items-start">
                      <label className="flex items-center gap-2 font-medium text-[#22223b] dark:text-gray-100 min-w-[180px] pt-1">
                        <span>
                          <i className="fas fa-server mr-2"></i>
                        </span>
                        Node
                      </label>
                      <div className="flex-1 w-[40%] max-w-[40rem] ml-2">
                        <Select
                          isMulti
                          name="pool_selected_nodes"
                          value={
                            isHyperV && poolDetails.pool_template_vm_id?.is_cluster
                              ? nodeOptions
                              : (poolDetails.pool_selected_nodes || []).map((val) =>
                                  nodeOptions.find((opt) => opt.value === val) || {
                                    label: val,
                                    value: val,
                                  },
                                )
                          }
                          onChange={handleNodesChange}
                          options={nodeOptions}
                          className="basic-multi-select bg-white dark:bg-gray-800"
                          classNamePrefix="select"
                          placeholder={
                            isHyperV && poolDetails.pool_template_vm_id?.is_cluster
                              ? "All cluster nodes"
                              : "Select Nodes"
                          }
                          isDisabled={true}
                          components={{
                            DropdownIndicator: () => null,
                            IndicatorSeparator: () => null,
                          }}
                          noOptionsMessage={() =>
                            isHyperV &&
                            poolDetails.pool_template_vm_id?.is_cluster
                              ? "All cluster nodes selected"
                              : "No nodes available"
                          }
                          isLoading={isHyperV && isNodesLoading}
                          styles={selectStyles}
                        />
                      </div>
                    </div>

                    {!isHyperV && (
                      <InputField
                        label="Template"
                        name="pool_template_vm_id"
                        iconClass="fa-file-invoice"
                        value={(() => {
                          const template = templates.find(
                            (t) =>
                              String(t.vmid) ===
                              String(poolDetails.pool_template_vm_id),
                          );
                          return template
                            ? `${template.vmid} (${template.name})`
                            : poolDetails.pool_template_vm_id?.vmid || "N/A";
                        })()}
                        onChange={handleOnChange}
                        disabled={true}
                      />
                    )}

                    <InputField
                      label="Naming Pattern"
                      name="pool_naming_pattern"
                      iconClass="fa-font"
                      value={poolDetails.pool_naming_pattern || ""}
                      onChange={handleNamingPatternChange}
                      placeholder="Naming Pattern"
                      disabled={true}
                    />

                    <InputField
                      label="Number of VMs"
                      type="number"
                      name="pool_number_of_vms"
                      iconClass="fa-list-ol"
                      value={poolDetails.pool_number_of_vms || ""}
                      onChange={handleCountChange}
                      placeholder="Number of VMs"
                      min="1"
                    />

                    {/* ── Join AD (read-only indicator + card) ──────────────── */}
                    <div className="mb-4 flex items-center">
                      <label className="flex items-center gap-2 font-medium text-[#22223b] dark:text-gray-100 min-w-[180px]">
                        <span>
                          <i className="fas fa-sitemap mr-2"></i>
                        </span>
                        Join AD{" "}
                        <span className="text-xs font-normal text-gray-400 ml-1">
                          (Windows only)
                        </span>
                      </label>
                      <div className="flex-1 w-[40%] max-w-[40rem] ml-2 flex items-center">
                        <input
                          type="checkbox"
                          name="join_ad"
                          className="w-4 h-4 text-[#1a365d] dark:text-blue-300 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[#1a365d] cursor-not-allowed"
                          checked={hasJoinAD}
                          disabled
                        />
                      </div>
                    </div>

                    {hasJoinAD && (
                      <div className="mb-5 ml-[188px] mr-0 max-w-[40rem] rounded-lg border border-blue-100 bg-blue-50/40 px-5 pt-4 pb-1 shadow-sm">
                        <p className="text-xs font-semibold text-[#1a365d] dark:text-blue-300/70 uppercase tracking-wide mb-3">
                          Active Directory Settings
                        </p>
                        <InputField
                          label="Domain"
                          name="pool_ad_domain"
                          iconClass="fa-globe"
                          value={poolDetails.pool_ad_domain || ""}
                          onChange={handleOnChange}
                          placeholder="e.g. corp.example.com"
                        />
                        <InputField
                          label="Path"
                          name="pool_ad_path"
                          iconClass="fa-folder-tree"
                          value={poolDetails.pool_ad_path || ""}
                          onChange={handleOnChange}
                          placeholder="OU=OU1,OU=OU11"
                        />
                        <InputField
                          label="Username"
                          name="pool_ad_username"
                          iconClass="fa-user"
                          value={poolDetails.pool_ad_username || ""}
                          onChange={handleOnChange}
                          placeholder="AD Username"
                          required={true}
                        />
                        <PasswordField
                          label="Password"
                          name="pool_ad_password"
                          iconClass="fa-key"
                          value={poolDetails.pool_ad_password || ""}
                          onChange={handleOnChange}
                          placeholder="AD Password"
                          required={true}
                        />
                      </div>
                    )}

                    {/* ── Hyper-V specific fields ───────────────────────────── */}
                    {isHyperV && (
                      <>
                        <div className="mb-4 flex items-center">
                          <label className="flex items-center gap-2 font-medium text-[#22223b] dark:text-gray-100 min-w-[180px]">
                            <span>
                              <i className="fas fa-sitemap mr-2"></i>
                            </span>
                            Is Cluster
                          </label>
                          <div className="flex-1 w-[40%] max-w-[40rem] ml-2 flex items-center">
                            <input
                              type="checkbox"
                              name="hyperv_is_cluster"
                              className="w-4 h-4 text-[#1a365d] dark:text-blue-300 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[#1a365d] cursor-not-allowed"
                              checked={
                                !!poolDetails.pool_template_vm_id?.is_cluster
                              }
                              disabled
                            />
                          </div>
                        </div>


                        <SelectField
                          label="Clone Type"
                          name="hyperv_clone_type"
                          iconClass="fa-copy"
                          value={
                            poolDetails.pool_template_vm_id?.clone_type ||
                            "Differencing Disk"
                          }
                          onChange={(e) =>
                            setTemplateField("clone_type", e.target.value)
                          }
                          disabled={true}
                          options={[
                            {
                              value: "Differencing Disk",
                              label: "Differencing Disk (Linked Clone)",
                            },
                            { value: "Full Clone", label: "Full Clone" },
                          ]}
                        />

                        {poolDetails.pool_template_vm_id?.clone_type ===
                        "Full Clone" ? (
                          <>
                            <InputField
                              label="Source VHD Path"
                              name="hyperv_vhdPath"
                              iconClass="fa-hard-drive"
                              value={poolDetails.pool_template_vm_id?.vhdPath || ""}
                              onChange={(e) =>
                                setTemplateField("vhdPath", e.target.value)
                              }
                              placeholder="Enter Source VHD Path"
                              required={true}
                              disabled={true}
                            />
                            <InputField
                              label="Destination Path"
                              name="hyperv_destination_path"
                              iconClass="fa-folder-open"
                              value={
                                poolDetails.pool_template_vm_id?.destination_path ||
                                ""
                              }
                              onChange={(e) =>
                                setTemplateField("destination_path", e.target.value)
                              }
                              placeholder="Enter Destination Path"
                              required={true}
                              disabled={true}
                            />
                          </>
                        ) : (
                          <>
                            <InputField
                              label="Child Disk Path"
                              name="hyperv_vhdPath"
                              iconClass="fa-hard-drive"
                              value={poolDetails.pool_template_vm_id?.vhdPath || ""}
                              onChange={(e) =>
                                setTemplateField("vhdPath", e.target.value)
                              }
                              placeholder="Enter Child Disk Path"
                              required={true}
                              disabled={true}
                            />
                            <InputField
                              label="Parent Disk Path"
                              name="hyperv_PvhdPath"
                              iconClass="fa-folder-open"
                              value={
                                poolDetails.pool_template_vm_id?.PvhdPath || ""
                              }
                              onChange={(e) =>
                                setTemplateField("PvhdPath", e.target.value)
                              }
                              placeholder="Enter Parent Disk Path"
                              disabled={true}
                            />
                          </>
                        )}

                        <PasswordField
                          label="Host Password"
                          name="hyperv_HostPassword"
                          iconClass="fa-key"
                          value={
                            poolDetails.pool_template_vm_id?.password || ""
                          }
                          onChange={(e) =>
                            setTemplateField("password", e.target.value)
                          }
                          placeholder="Enter Host password"
                        />
                        <SelectField
                          label="Generation"
                          name="hyperv_generation"
                          iconClass="fa-microchip"
                          value={
                            poolDetails.pool_template_vm_id?.generation === 1
                              ? "Gen1"
                              : poolDetails.pool_template_vm_id?.generation ===
                                  2
                                ? "Gen2"
                                : ""
                          }
                          onChange={(e) => {
                            const gen =
                              e.target.value === "Gen2"
                                ? 2
                                : e.target.value === "Gen1"
                                  ? 1
                                  : "";
                            setTemplateField("generation", gen);
                          }}
                          disabled={true}
                          options={[
                            {
                              value: "",
                              label: "Select Generation",
                              disabled: true,
                            },
                            { value: "Gen1", label: "Gen1" },
                            { value: "Gen2", label: "Gen2" },
                          ]}
                        />

                        {/* ── Memory (GB) ───────────────────────────────────── */}
                        <InputField
                          label="Memory (GB)"
                          type="number"
                          name="hyperv_memory"
                          iconClass="fa-memory"
                          value={poolDetails.pool_template_vm_id?.memory || ""}
                          onChange={(e) =>
                            setTemplateField(
                              "memory",
                              e.target.value
                                ? parseInt(e.target.value, 10)
                                : "",
                            )
                          }
                          placeholder="Enter memory size (GB)"
                          min="2"
                          step="1"
                          max="64"
                        />

                        {/* ── Enable Dynamic Memory checkbox ────────────────── */}
                        <div className="mb-4 flex items-center">
                          <label className="flex items-center gap-2 font-medium text-[#22223b] dark:text-gray-100 min-w-[180px]">
                            <span>
                              <i className="fas fa-sliders mr-2"></i>
                            </span>
                            Enable Dynamic Memory
                          </label>
                          <div className="flex-1 w-[40%] max-w-[40rem] ml-2 flex items-center">
                            <input
                              type="checkbox"
                              name="hyperv_dynamic_memory"
                              className="w-4 h-4 text-[#1a365d] dark:text-blue-300 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[#1a365d] cursor-pointer"
                              checked={isDynamicMemory}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setPoolDetails((prev) => ({
                                  ...prev,
                                  pool_template_vm_id: {
                                    ...(prev.pool_template_vm_id || {}),
                                    dynamic_memory: checked,
                                    // clear sub-fields when toggled off
                                    ...(!checked && {
                                      minimum_memory: "",
                                      maximum_memory: "",
                                      buffer_memory: "",
                                    }),
                                  },
                                }));
                              }}
                            />
                          </div>
                        </div>

                        {/* ── Dynamic Memory card ───────────────────────────── */}
                        {isDynamicMemory && (
                          <div className="mb-5 ml-[188px] mr-0 max-w-[40rem] rounded-lg border border-blue-100 bg-blue-50/40 px-5 pt-4 pb-1 shadow-sm">
                            <p className="text-xs font-semibold text-[#1a365d] dark:text-blue-300/70 uppercase tracking-wide mb-3">
                              Dynamic Memory Settings
                            </p>
                            <InputField
                              label="Min Memory (MB)"
                              name="hyperv_minimum_memory"
                              type="number"
                              iconClass="fa-memory"
                              value={
                                poolDetails.pool_template_vm_id
                                  ?.minimum_memory || ""
                              }
                              onChange={(e) =>
                                setTemplateField(
                                  "minimum_memory",
                                  e.target.value
                                    ? parseInt(e.target.value, 10)
                                    : "",
                                )
                              }
                              placeholder="Minimum memory (MB)"
                              required={true}
                              min="32"
                              step="2"
                              max={
                                poolDetails.pool_template_vm_id?.memory * 1024
                              }
                              disabled={true}
                            />
                            <InputField
                              label="Max Memory (MB)"
                              name="hyperv_maximum_memory"
                              type="number"
                              iconClass="fa-memory"
                              value={
                                poolDetails.pool_template_vm_id
                                  ?.maximum_memory || ""
                              }
                              onChange={(e) =>
                                setTemplateField(
                                  "maximum_memory",
                                  e.target.value
                                    ? parseInt(e.target.value, 10)
                                    : "",
                                )
                              }
                              placeholder="Maximum memory (MB)"
                              required={true}
                              min={
                                poolDetails.pool_template_vm_id?.memory * 1024
                              }
                              step="1"
                              max={128 * 1024}
                            />
                            <InputField
                              label="Buffer Memory (%)"
                              name="hyperv_buffer_memory"
                              type="number"
                              iconClass="fa-percent"
                              value={
                                poolDetails.pool_template_vm_id
                                  ?.buffer_memory || ""
                              }
                              onChange={(e) =>
                                setTemplateField(
                                  "buffer_memory",
                                  e.target.value
                                    ? parseInt(e.target.value, 10)
                                    : "",
                                )
                              }
                              placeholder="Buffer percentage (e.g. 20)"
                              required={true}
                              min="5"
                              step="1"
                              max="2000"
                            />
                          </div>
                        )}

                        {/* ── Processor Count ───────────────────────────────── */}
                        <InputField
                          label="Processor Count"
                          name="hyperv_processor_count"
                          type="number"
                          iconClass="fa-microchip"
                          value={
                            poolDetails.pool_template_vm_id?.processor_count ||
                            ""
                          }
                          onChange={(e) =>
                            setTemplateField(
                              "processor_count",
                              e.target.value
                                ? parseInt(e.target.value, 10)
                                : "",
                            )
                          }
                          placeholder="Enter number of processors"
                          min="1"
                          step="1"
                          max="1024"
                        />

                        {/* Priority Field — appears only if cluster is multi node */}
                        {poolDetails.pool_template_vm_id?.is_cluster && (
                          <SelectField
                            label="Priority"
                            name="hyperv_priority"
                            iconClass="fa-arrow-up-9-1"
                            value={
                              poolDetails.pool_template_vm_id?.priority ?? 2000
                            }
                            onChange={(e) =>
                              setTemplateField(
                                "priority",
                                e.target.value
                                  ? parseInt(e.target.value, 10)
                                  : 2000,
                              )
                            }
                            placeholder="Select Priority"
                            options={[
                              { label: "High Priority", value: 3000 },
                              { label: "Medium Priority", value: 2000 },
                              { label: "Low Priority", value: 1000 },
                              { label: "No Auto Start", value: 0 },
                            ]}
                            tooltip={`1. High Priority (3000)
What it is: These VMs are moved and started first.
Behavior: If a node is low on resources, the cluster may even "pre-empt" (shut down) Lower Priority VMs to make room for these.

2. Medium Priority (2000) - Default
What it is: The standard priority level for most virtual machines.
Behavior: These start only after the "High Priority" queue has been cleared.

3. Low Priority (1000)
What it is: These VMs are started last.
Behavior: These are the first to be saved or paused if the cluster nodes become overloaded.

4. No Auto Start (0)
What it is: The VM is part of the cluster, but the cluster will not automatically start it after a failure.`}
                            tooltipClass="w-96"
                          />
                        )}

                        <SelectField
                          label="Switch"
                          name="hyperv_switch"
                          iconClass="fa-network-wired"
                          value={poolDetails.pool_template_vm_id?.switch || ""}
                          onChange={(e) =>
                            setTemplateField("switch", e.target.value)
                          }
                          placeholder="Select Switch"
                          disabled={true}
                          options={[
                            {
                              value: "",
                              label: "Select Switch",
                              disabled: true,
                            },
                            ...(switches || []).map((sw) => ({
                              value: sw.Name,
                              label: sw.Name,
                            })),
                          ]}
                        />
                      </>
                    )}

                    {/* ── VMware specific fields ──────────────────────────────
                    {poolDetails.cluster_type === "VMware" && (
                      <>
                        <SelectField
                          label="Select DC"
                          name="pool_vmware_dc"
                          iconClass="fa-building"
                          value={poolDetails.pool_vmware_dc || ""}
                          onChange={handleVmwareDCChange}
                          options={[
                            { value: "", label: "Select DC", disabled: true },
                            ...vmwareDCs.map((dc) => ({
                              value: dc.name,
                              label: dc.name,
                            })),
                          ]}
                        />
                        <SelectField
                          label="Select Folder"
                          name="pool_vmware_folder"
                          iconClass="fa-folder"
                          value={poolDetails.pool_vmware_folder || ""}
                          onChange={handleVmwareFolderChange}
                          options={[
                            {
                              value: "",
                              label: "Select Folder",
                              disabled: true,
                            },
                            ...vmwareFolders.map((folder) => ({
                              value: folder.name,
                              label: folder.name,
                            })),
                          ]}
                        />
                      </>
                    )} */}
                  </>
                )}
              </div>
            </div>

            <div className="w-full rounded-md bg-white dark:bg-gray-800">
              <CustomTabs
                tablist={["RDP", "SSH", "VNC"].filter(
                  (tab) => tab === poolDetails.pool_protocol,
                )}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                handleTabSelection={setSelectedTab}
              />
              {selectedTab === "RDP" && poolDetails.pool_protocol === "RDP" && (
                <RDPsettings
                  onChange={handleOnChange}
                  poolDetails={poolDetails}
                  securityMode={securityMode}
                />
              )}
              {poolDetails.pool_protocol === "SSH" && (
                <SSHsettings
                  onChange={handleOnChange}
                  poolDetails={poolDetails}
                  securityMode={securityMode}
                />
              )}
              {poolDetails.pool_protocol === "VNC" && (
                <VNCsettings
                  onChange={handleOnChange}
                  poolDetails={poolDetails}
                  securityMode={securityMode}
                />
              )}
            </div>
          </div>
        )}

        <div className="mb-5 pl-5 flex items-start justify-start">
          <button
            onClick={handleOnClick}
            type="button"
            disabled={isLoading || poolSaveLoading}
            className={`rounded-md mb-4 px-3 py-2 text-sm font-semibold text-white shadow-sm flex items-center gap-2
              ${
                isLoading || poolSaveLoading
                  ? "bg-[#1a365d] cursor-not-allowed"
                  : "bg-[#1a365d]/80 hover:bg-[#1a365d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a365d]"
              }`}
          >
            {(isLoading || poolSaveLoading) && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            <span>
              {isLoading || poolSaveLoading ? "Updating..." : "Update"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPool;

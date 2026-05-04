import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./css/PoolCreationForm.css";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAuthToken,
  selectAuthTokenParsed,
} from "../../redux/features/Auth/AuthSelectors";
import {
  createPool,
  fetchIpPoolNames,
  fetchClusterNodes,
  fetchTemplates,
  fetchVmwareDCs,
  fetchVmwareFolders,
  fetchSwitches,
  fetchProxmoxStorages,
} from "../../redux/features/Pools/PoolsThunks";
import { fetchClustersThunk } from "../../redux/features/Clusters/ClustersThunks";
import {
  setPoolCreationDetails,
  resetPoolCreation,
} from "../../redux/features/Pools/PoolsSlice";
import {
  selectPoolCreationDetails,
  selectCreationNodes,
  selectCreationTemplates,
  selectCreationIpPoolNames,
  selectCreationVmwareDCs,
  selectCreationVmwareFolders,
  selectPoolSaveLoading,
  selectCreationSwitches,
  selectPoolsLoading,
} from "../../redux/features/Pools/PoolsSelectors";
import { selectAllClusters } from "../../redux/features/Clusters/ClustersSelectors";
import VNCsettings from "./VNCsettings";
import SSHsettings from "./SSHsettings";
import RDPsettings from "./RDPsettings";
import { initialPoolDetails } from "../../redux/features/Pools/poolDefaults";
import CustomTabs from "../CustomTabs/CustomTabs";
import { Slide, toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import Select from "react-select";
import { InputField, SelectField, PasswordField } from "../Common";
import { selectIpPools } from "../../redux/features/IP-Pools/IpPoolsSelectors";
import { fetchIpPoolsThunk } from "../../redux/features/IP-Pools/IpPoolsThunks";

const poolType = ["Automated", "Manual"];

const PoolCreationForm = () => {
  const [selectedTab, setSelectedTab] = useState("RDP");
  const [selectedProtocol, setSelectedProtocol] = useState("");
  const [error, setError] = useState(null);
  const isLoading = useSelector(selectPoolSaveLoading);
  const clustersRaw = useSelector(selectAllClusters);
  const clusters = useMemo(() => clustersRaw || [], [clustersRaw]);
  const poolDetails = useSelector(selectPoolCreationDetails) || {};
  const dispatch = useDispatch();
  const nodes = useSelector(selectCreationNodes) || [];
  const templates = useSelector(selectCreationTemplates) || [];
  const ipPoolNames = useSelector(selectCreationIpPoolNames) || [];
  const switches = useSelector(selectCreationSwitches) || [];
  const token = useSelector(selectAuthToken);
  const tokenParsed = useSelector(selectAuthTokenParsed);
  const storages = useSelector((state) => state.pools.proxmoxStorages);
  const userEmail = tokenParsed?.preferred_username;
  const pools = useSelector(selectIpPools);

  useEffect(() => {
    if (token) {
      dispatch(fetchIpPoolsThunk(token));
    }
  }, [dispatch, token]);

  const selectedCluster =
    (poolDetails?.cluster_id &&
      clusters.find((c) => String(c.id) === String(poolDetails.cluster_id))) ||
    null;

  const isHyperVCluster = selectedCluster && selectedCluster.type === "Hyper-V";
  const isProxmoxCluster =
    selectedCluster && selectedCluster.type === "Proxmox";
  // const isVmwareCluster = selectedCluster && selectedCluster.type === "VMware";

  useEffect(() => {
    if ((!clusters || clusters.length === 0) && token) {
      dispatch(fetchClustersThunk(token));
    }
  }, [dispatch, token, clusters]);

  useEffect(() => {
    if (poolDetails.pool_type === "Automated") {
      dispatch(fetchIpPoolNames(token)).catch(() => {});
    }
  }, [poolDetails.pool_type, token, dispatch]);

  useEffect(() => {
    if (
      isHyperVCluster &&
      poolDetails.pool_ip_pool_names?.length > 0 &&
      pools?.length > 0
    ) {
      const selectedPool = pools.find((p) =>
        poolDetails.pool_ip_pool_names.includes(p.Pool_name),
      );
      if (selectedPool) {
        const currentTemplate = poolDetails.pool_template_vm_id || {};
        const gatewayValue = selectedPool.Gateway || "";
        const subnetValue = selectedPool.Subnet || "";
        const dnsValue = selectedPool.DNS?.[0] || "";

        if (
          currentTemplate.gateway !== gatewayValue ||
          currentTemplate.subnet !== subnetValue ||
          currentTemplate.dns !== dnsValue ||
          poolDetails.gateway !== gatewayValue ||
          poolDetails.subnet !== subnetValue ||
          poolDetails.dns !== dnsValue
        ) {
          dispatch(
            setPoolCreationDetails({
              gateway: gatewayValue,
              subnet: subnetValue,
              dns: dnsValue,
              pool_template_vm_id: {
                ...currentTemplate,
                gateway: gatewayValue,
                subnet: subnetValue,
                dns: dnsValue,
              },
            }),
          );
        }
      }
    }
  }, [
    isHyperVCluster,
    poolDetails.pool_ip_pool_names,
    pools,
    dispatch,
    poolDetails.pool_template_vm_id,
  ]);
  
  useEffect(() => {
    if (
      isHyperVCluster &&
      poolDetails.pool_template_vm_id?.is_cluster &&
      nodes.length > 0
    ) {
      const allNodeValues = nodes.map(
        (n) => n.Node_name || n.name || n.IP || "Unknown Node",
      );
      if (
        JSON.stringify(poolDetails.pool_selected_nodes || []) !==
        JSON.stringify(allNodeValues)
      ) {
        dispatch(setPoolCreationDetails({ pool_selected_nodes: allNodeValues }));
      }
    }
  }, [
    isHyperVCluster,
    poolDetails.pool_template_vm_id?.is_cluster,
    nodes,
    dispatch,
    poolDetails.pool_selected_nodes,
  ]);

  const handleClusterSelect = async (e) => {
    const clusterId = e.target.value;
    const cluster = clusters.find((c) => String(c.id) === clusterId);

    let templateVmId = {};
    if (cluster?.type === "Hyper-V") {
      let genStr = poolDetails.pool_template_vm_id?.generation || "";
      let generation = genStr === "Gen2" ? 2 : genStr === "Gen1" ? 1 : "";
      const is_cluster =
        ["multinode", "cluster"].includes(cluster.node_type?.toLowerCase().replace(/\s/g, ""));
      templateVmId = {
        generation,
        memory: poolDetails.pool_template_vm_id?.memory || "",
        PvhdPath: poolDetails.pool_template_vm_id?.PvhdPath || "",
        switch: poolDetails.pool_template_vm_id?.switch || "",
        password: poolDetails.pool_template_vm_id?.password || "",
        os_type: poolDetails.pool_os_type || "",
        is_cluster: is_cluster,
      };
    }

    dispatch(
      setPoolCreationDetails({
        cluster_id: clusterId,
        pool_selected_nodes: [],
        pool_template_vm_id: templateVmId,
        pool_vmware_dc: "",
        pool_vmware_folder: "",
      }),
    );
    if (!clusterId) return;

    try {
      setError(null);
      if (cluster?.type === "Hyper-V") {
        await Promise.all([
          dispatch(fetchSwitches({ token, clusterId })).unwrap(),
          dispatch(
            fetchClusterNodes({ token, clusterId, type: "Hyper-V" }),
          ).unwrap(),
        ]);
      }
      if (cluster?.type === "Proxmox") {
        await Promise.all([
          dispatch(fetchClusterNodes({ token, clusterId })).unwrap(),
          dispatch(fetchTemplates({ token, clusterId })).unwrap(),
        ]);
      }
      // if (cluster?.type === "VMware") {
      //   await Promise.all([
      //     dispatch(fetchVmwareDCs({ token, clusterId })).unwrap(),
      //     dispatch(fetchVmwareFolders({ token, clusterId })).unwrap(),
      //   ]);
      // }
    } catch (err) {}
  };

  const handleOnChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue;

    if (name === "pool_os_type" && isHyperVCluster) {
      const prev = poolDetails.pool_template_vm_id || {};
      const hyperVOS = value;
      let guacOS = "";
      if (value.includes("Windows")) guacOS = "Windows";
      else if (value.includes("Linux") || value.includes("Ubuntu"))
        guacOS = "Linux";
      dispatch(
        setPoolCreationDetails({
          pool_os_type: guacOS,
          pool_template_vm_id: { ...prev, os_type: hyperVOS },
        }),
      );
      return;
    }

    // All hyperv_ prefixed fields + vmid → go into pool_template_vm_id
    if (
      [
        "hyperv_generation",
        "hyperv_memory",
        "hyperv_PvhdPath",
        "hyperv_switch",
        "hyperv_vhdPath",
        "vmid",
        "hyperv_HostPassword",
        "hyperv_OSType",
        "hyperv_dynamic_memory",
        "hyperv_minimum_memory",
        "hyperv_maximum_memory",
        "hyperv_buffer_memory",
        "hyperv_processor_count",
        "hyperv_priority",
        "hyperv_is_cluster",
      ].includes(name) &&
      isHyperVCluster
    ) {
      const prev = poolDetails.pool_template_vm_id || {};
      let fieldValue;
      let keyName;

      if (name === "hyperv_memory") {
        fieldValue = value ? parseInt(value, 10) : "";
        keyName = "memory";
      } else if (name === "hyperv_generation") {
        fieldValue = value === "Gen2" ? 2 : value === "Gen1" ? 1 : "";
        keyName = "generation";
      } else if (name === "hyperv_vhdPath") {
        fieldValue = value;
        keyName = "vhdPath";
      } else if (name === "vmid") {
        fieldValue = value;
        keyName = "vmid";
      } else if (name === "hyperv_HostPassword") {
        fieldValue = value;
        keyName = "password";
      } else if (name === "hyperv_OSType") {
        fieldValue = value;
        keyName = "pool_os_type";
      } else if (name === "hyperv_dynamic_memory") {
        // checkbox — use checked, and clear sub-fields when unchecked
        fieldValue = checked;
        keyName = "dynamic_memory";
        dispatch(
          setPoolCreationDetails({
            pool_template_vm_id: {
              ...prev,
              dynamic_memory: checked,
              // reset sub-fields when toggled off
              ...(!checked && {
                minimum_memory: "",
                maximum_memory: "",
                buffer_memory: "",
              }),
            },
          }),
        );
        return;
      } else if (name === "hyperv_minimum_memory") {
        fieldValue = value ? parseInt(value, 10) : "";
        keyName = "minimum_memory";
      } else if (name === "hyperv_maximum_memory") {
        fieldValue = value ? parseInt(value, 10) : "";
        keyName = "maximum_memory";
      } else if (name === "hyperv_buffer_memory") {
        fieldValue = value ? parseInt(value, 10) : "";
        keyName = "buffer_memory";
      } else if (name === "hyperv_processor_count") {
        fieldValue = value ? parseInt(value, 10) : "";
        keyName = "processor_count";
      } else if (name === "hyperv_priority") {
        fieldValue = value ? parseInt(value, 10) : "";
        keyName = "priority";
      } else if (name === "hyperv_is_cluster") {
        fieldValue = checked;
        keyName = "is_cluster";
      } else {
        fieldValue = value;
        keyName = name.replace("hyperv_", "");
      }

      dispatch(
        setPoolCreationDetails({
          pool_template_vm_id: { ...prev, [keyName]: fieldValue },
        }),
      );
    } else {
      if (type === "checkbox") {
        newValue = checked;
      } else if (
        [
          "pool_guacd_port",
          "pool_max_connections",
          "pool_max_connections_per_user",
          "pool_gateway_port",
          "pool_width",
          "pool_weight",
          "pool_height",
          "pool_dpi",
          "pool_sftp_port",
          "pool_sftp_server_alive_interval",
          "pool_scrollback",
          "pool_font_size",
          "pool_destination_port",
          "pool_port",
          "pool_template_vm_id",
        ].includes(name)
      ) {
        newValue = value ? parseInt(value, 10) : null;
      } else {
        newValue = value;
      }
      dispatch(setPoolCreationDetails({ [name]: newValue }));
    }
  };

  const handleProtocolChange = (e) => {
    const value = e.target.value;
    dispatch(setPoolCreationDetails({ [e.target.name]: value }));
    setSelectedProtocol(value);
    setSelectedTab(value);
  };

  const handleIpPoolsChange = (selectedOptions) => {
    dispatch(
      setPoolCreationDetails({
        pool_ip_pool_names: (selectedOptions || []).map((opt) => opt.value),
      }),
    );
  };

  const handleNodesChange = (selectedOptions) => {
    const selectedNodes = (selectedOptions || [])?.map((opt) => opt?.value);
    dispatch(setPoolCreationDetails({ pool_selected_nodes: selectedNodes }));
  };

  const handleStorageChange = (selectedOption) => {
    dispatch(
      setPoolCreationDetails({ pool_storage: selectedOption?.value || null }),
    );
  };

  useEffect(() => {
    if (
      isProxmoxCluster &&
      poolDetails.cluster_id &&
      poolDetails.pool_selected_nodes?.length > 0
    ) {
      dispatch(
        fetchProxmoxStorages({
          token,
          clusterId: poolDetails.cluster_id,
          nodes: poolDetails.pool_selected_nodes,
        }),
      );
    }
  }, [
    isProxmoxCluster,
    poolDetails.cluster_id,
    poolDetails.pool_selected_nodes,
    token,
    dispatch,
  ]);

  const handleTemplateChange = (e) => {
    const value = e.target.value;
    dispatch(
      setPoolCreationDetails({
        pool_template_vm_id: value ? { vmid: parseInt(value, 10) } : {},
      }),
    );
  };

  const handleNamingPatternChange = (e) => {
    dispatch(
      setPoolCreationDetails({ pool_naming_pattern: e.target.value.trim() }),
    );
  };

  const handleCountChange = (e) => {
    dispatch(
      setPoolCreationDetails({
        pool_number_of_vms: !e.target.value ? 1 : Number(e.target.value),
      }),
    );
  };

  const handleVmwareDCChange = (e) => {
    dispatch(setPoolCreationDetails({ pool_vmware_dc: e.target.value }));
  };

  const handleVmwareFolderChange = (e) => {
    dispatch(setPoolCreationDetails({ pool_vmware_folder: e.target.value }));
  };

  const handleOnClick = async () => {
    const checks = [
      [!poolDetails.pool_type, "Pool Type"],
      [!poolDetails.pool_protocol, "Protocol"],
      [!poolDetails.pool_name, "Pool Name"],
    ];

    if (poolDetails.pool_type === "Automated") {
      checks.push([
        !poolDetails.cluster_id ||
          String(poolDetails.cluster_id).toLowerCase() === "nan",
        "Cluster",
      ]);
      checks.push([
        !poolDetails.pool_os_type && !poolDetails.pool_template_vm_id?.os_type,
        "Pool OS Type",
      ]);
      checks.push([!poolDetails.pool_naming_pattern, "Naming Pattern"]);

      if (isProxmoxCluster) {
        checks.push([
          !(poolDetails.pool_ip_pool_names?.length > 0),
          "IP Pools",
        ]);
        checks.push([!poolDetails.pool_template_vm_id?.vmid, "Template"]);
        checks.push([!(poolDetails.pool_selected_nodes?.length > 0), "Node"]);
        checks.push([!poolDetails.pool_storage, "Storage"]);
      }

      if (isHyperVCluster) {
        checks.push([
          !(poolDetails.pool_ip_pool_names?.length > 0),
          "IP Pools (Hyper-V)",
        ]);
        checks.push([
          !poolDetails.pool_template_vm_id?.vhdPath,
          "Child Disk Path",
        ]);
        checks.push([
          !poolDetails.pool_template_vm_id?.PvhdPath,
          "Parent Disk Path",
        ]);
        checks.push([
          !poolDetails.pool_template_vm_id?.generation,
          "Generation",
        ]);
        checks.push([!poolDetails.pool_template_vm_id?.memory, "Memory (GB)"]);
        checks.push([!poolDetails.pool_template_vm_id?.switch, "Switch"]);
        checks.push([
          !poolDetails.pool_template_vm_id?.processor_count,
          "Processor Count",
        ]);
        // Validate dynamic memory sub-fields only when enabled
        if (poolDetails.pool_template_vm_id?.dynamic_memory) {
          checks.push([
            !poolDetails.pool_template_vm_id?.minimum_memory,
            "Minimum Memory",
          ]);
          checks.push([
            !poolDetails.pool_template_vm_id?.maximum_memory,
            "Maximum Memory",
          ]);
          checks.push([
            !poolDetails.pool_template_vm_id?.buffer_memory,
            "Buffer Memory (%)",
          ]);
        }
      }

      if (poolDetails.join_ad) {
        checks.push([!poolDetails.pool_ad_domain, "AD Domain"]);
        checks.push([!poolDetails.pool_ad_path, "AD Path"]);
        checks.push([!poolDetails.pool_ad_username, "AD Username"]);
        checks.push([!poolDetails.pool_ad_password, "AD Password"]);
      }
    }

    const failing = checks.find(([condition]) => condition);
    if (failing) {
      toast.error(`Please fill in the required field: "${failing[1]}"`, {
        position: "top-right",
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true,
        theme: "light",
        transition: Slide,
      });
      return;
    }

    let requestData = {
      ...initialPoolDetails,
      ...poolDetails,
      pool_number_of_vms:
        poolDetails.pool_number_of_vms || initialPoolDetails.pool_number_of_vms,
      email: userEmail,
    };

    try {
      const payload = await dispatch(
        createPool({ token, requestData }),
      ).unwrap();
      const msg = payload?.msg || "Pool created";
      toast.success(msg, { position: "top-right", autoClose: 5000 });
      navigate("/pools");
      dispatch(resetPoolCreation());
    } catch (err) {
      const message = err?.msg || err?.message || "Pool creation failed";
      toast.error(message, { position: "top-right", autoClose: 5000 });
      navigate("/pools/pool-creation-form");
    }
  };

  const navigate = useNavigate();

  const Goback = () => {
    dispatch(resetPoolCreation());
    navigate("/pools");
  };

  const nodeOptions = nodes.map((node) => ({
    label: node.Node_name || node.name || node.IP || "Unknown Node",
    value: node.Node_name || node.name || node.IP || "Unknown Node",
  }));

  const selectedStorageOption =
    storages
      ?.map((s) => ({ label: s.storage, value: s.storage }))
      ?.find((opt) => opt.value === poolDetails?.pool_storage) || null;

  const isDynamicMemory = !!poolDetails.pool_template_vm_id?.dynamic_memory;

  return (
    <div className="pool_creation w-[98%] h-[90vh] m-auto bg-white rounded-lg p-4 shadow-md flex flex-col overflow-hidden relative">
      <div className="flex justify-start mt-5">
        <div
          onClick={Goback}
          className="ml-2 bg-[#1a365d]/80 text-white px-2 py-2 rounded-md hover:bg-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:ring-opacity-10"
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
        className={`pool-creation-form flex-1 overflow-y-auto rounded-md bg-white custom-scrollbar ${isLoading ? "opacity-50 pointer-events-none select-none" : ""}`}
      >
        <div className="space-y-5 m-2">
          <div className="w-full mx-auto p-3 rounded-md bg-white">
            <h2 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">
              Create New Pool
            </h2>
            {error && (
              <div className="text-red-600 mt-2" role="alert">
                {error}
              </div>
            )}

            <div className="text-left w-full ml-5 max-w-4xl py-4">
              <SelectField
                label="Pool Type"
                name="pool_type"
                iconClass="fa-server"
                value={poolDetails.pool_type || ""}
                onChange={(e) =>
                  handleOnChange({
                    target: { name: "pool_type", value: e.target.value },
                  })
                }
                required={true}
                options={[
                  { value: "", label: "Pool Type", disabled: true },
                  ...poolType.map((item) => ({ value: item, label: item })),
                ]}
              />

              <SelectField
                label="Protocol"
                name="pool_protocol"
                iconClass="fa-network-wired"
                value={poolDetails.pool_protocol || ""}
                onChange={handleProtocolChange}
                required={true}
                options={[
                  { value: "", label: "Select Protocol", disabled: true },
                  { value: "RDP", label: "RDP" },
                  { value: "SSH", label: "SSH" },
                  { value: "VNC", label: "VNC" },
                ]}
              />

              {poolDetails.pool_type === "Automated" && (
                <SelectField
                  label="Cluster"
                  name="cluster_id"
                  iconClass="fa-sitemap"
                  value={poolDetails.cluster_id || ""}
                  onChange={handleClusterSelect}
                  required={true}
                  error={error}
                  options={[
                    { value: "", label: "Select Cluster", disabled: true },
                    ...clusters.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                />
              )}

              {poolDetails.pool_type && (
                <InputField
                  label="Pool Name"
                  name="pool_name"
                  iconClass="fa-diagram-project"
                  value={poolDetails.pool_name || ""}
                  onChange={handleOnChange}
                  required={true}
                  placeholder="Pool Name"
                />
              )}

              {poolDetails.pool_type === "Automated" && selectedCluster && (
                <>
                  {poolDetails.cluster_id && (
                    <SelectField
                      label="Pool OS Type"
                      name="pool_os_type"
                      iconClass="fa-computer"
                      value={
                        isHyperVCluster
                          ? poolDetails.pool_template_vm_id?.os_type || ""
                          : poolDetails.pool_os_type || ""
                      }
                      onChange={handleOnChange}
                      required={true}
                      options={[
                        { value: "", label: "Select OS", disabled: true },
                        ...(isHyperVCluster
                          ? [
                              { value: "Windows 10", label: "Windows 10" },
                              { value: "Windows 11", label: "Windows 11" },
                              {
                                value: "Windows server OS",
                                label: "Windows (2019/2022/2025)",
                              },
                              {
                                value: "Ubuntu desktop",
                                label: "Linux (Ubuntu desktop)",
                              },
                            ]
                          : [
                              { value: "Windows", label: "Windows" },
                              { value: "Linux", label: "Linux" },
                            ]),
                      ]}
                    />
                  )}

                  {/* VMware-specific fields */}
                  {/* {isVmwareCluster && (
                    <>
                      <SelectField
                        label="Select DC"
                        name="pool_vmware_dc"
                        iconClass="fa-folder-tree"
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
                        iconClass="fa-folder-open"
                        value={poolDetails.pool_vmware_folder || ""}
                        onChange={handleVmwareFolderChange}
                        options={[
                          { value: "", label: "Select Folder", disabled: true },
                          ...vmwareFolders.map((folder) => ({
                            value: folder.name,
                            label: folder.name,
                          })),
                        ]}
                      />
                    </>
                  )} */}

                  {isProxmoxCluster && (
                    <>
                      <div className="mb-6 flex items-start">
                        <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px] pt-1">
                          <span>
                            <i className="fas fa-network-wired mr-2"></i>
                          </span>
                          Select IP Pools{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1 w-[40%] max-w-[40rem] ml-2">
                          <Select
                            isMulti
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
                            className="basic-multi-select bg-white"
                            classNamePrefix="select"
                            placeholder="Select IP Pools"
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-6 flex items-start">
                        <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px] pt-1">
                          <span>
                            <i className="fas fa-file-invoice mr-2"></i>
                          </span>
                          Template <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1 w-[40%] max-w-[40rem] ml-2">
                          <select
                            name="pool_template_vm_id"
                            onChange={handleTemplateChange}
                            value={
                              poolDetails.pool_template_vm_id?.vmid
                                ? String(poolDetails.pool_template_vm_id.vmid)
                                : ""
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#1a365d]/100 text-base bg-white"
                            required
                          >
                            <option value="">Select Template</option>
                            {templates.map((template) => (
                              <option
                                key={template.vmid}
                                value={String(template.vmid)}
                              >
                                {template.vmid} ({template.name})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mb-6 flex items-start">
                        <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px] pt-1">
                          <span>
                            <i className="fas fa-server mr-2"></i>
                          </span>
                          Node <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1 w-[40%] max-w-[40rem] ml-2">
                          <Select
                            isMulti
                            name="pool_selected_nodes"
                            value={nodeOptions.filter((opt) =>
                              (poolDetails.pool_selected_nodes || []).includes(
                                opt.value,
                              ),
                            )}
                            onChange={handleNodesChange}
                            options={nodeOptions}
                            className="basic-multi-select bg-white"
                            classNamePrefix="select"
                            placeholder="Select Nodes"
                            noOptionsMessage={() => "No nodes available"}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-6 flex items-start">
                        <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px] pt-1">
                          <span>
                            <i className="fas fa-database mr-2"></i>
                          </span>
                          Storage <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1 w-[40%] max-w-[40rem] ml-2">
                          <Select
                            name="pool_storage"
                            value={selectedStorageOption}
                            onChange={handleStorageChange}
                            options={storages.map((s) => ({
                              label: s.storage,
                              value: s.storage,
                            }))}
                            className="basic-single bg-white"
                            classNamePrefix="select"
                            placeholder="Select Storage"
                            isClearable={true}
                            noOptionsMessage={() => "No storages available"}
                            required
                          />
                        </div>
                      </div>

                      <InputField
                        label="Naming Pattern"
                        name="pool_naming_pattern"
                        iconClass="fa-font"
                        value={poolDetails.pool_naming_pattern || ""}
                        onChange={handleNamingPatternChange}
                        required={true}
                        placeholder="Naming Pattern"
                      />

                      <InputField
                        label="Number of VMs"
                        type="number"
                        name="pool_number_of_vms"
                        iconClass="fa-list-ol"
                        value={poolDetails.pool_number_of_vms || 1}
                        onChange={handleCountChange}
                        placeholder="Number of VMs"
                        min="1"
                      />
                    </>
                  )}

                  {/* Hyper-V-specific fields */}
                  {isHyperVCluster && (
                    <>
                      <div className="mb-6 flex items-start">
                        <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px] pt-1">
                          <span>
                            <i className="fas fa-network-wired mr-2"></i>
                          </span>
                          Select IP Pools{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex-1 w-[40%] max-w-[40rem] ml-2">
                          <Select
                            isMulti
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
                            className="basic-multi-select bg-white"
                            classNamePrefix="select"
                            placeholder="Select IP Pools"
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-6 flex items-start">
                        <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px] pt-1">
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
                              isHyperVCluster &&
                              poolDetails.pool_template_vm_id?.is_cluster
                                ? nodeOptions
                                : nodeOptions.filter((opt) =>
                                    (
                                      poolDetails.pool_selected_nodes || []
                                    ).includes(opt.value),
                                  )
                            }
                            onChange={handleNodesChange}
                            options={nodeOptions}
                            className="basic-multi-select bg-white"
                            classNamePrefix="select"
                            placeholder={
                              isHyperVCluster &&
                              poolDetails.pool_template_vm_id?.is_cluster
                                ? "All cluster nodes"
                                : "Select Nodes"
                            }
                            isDisabled={true}
                            noOptionsMessage={() => "No nodes available"}
                            required
                          />
                        </div>
                      </div>

                      <InputField
                        label="Child Disk path"
                        name="hyperv_vhdPath"
                        iconClass="fa-hard-drive"
                        value={poolDetails.pool_template_vm_id?.vhdPath || ""}
                        onChange={handleOnChange}
                        placeholder="Enter Child Disk Path"
                        required={true}
                        tooltip="It should be the root folder where the VM's all structure will be created!"
                      />

                      <InputField
                        label="Parent Disk Path"
                        name="hyperv_PvhdPath"
                        iconClass="fa-folder-open"
                        value={poolDetails.pool_template_vm_id?.PvhdPath || ""}
                        onChange={handleOnChange}
                        placeholder="Enter Parent Disk Path"
                        required={true}
                      />

                      <PasswordField
                        label="Host Password"
                        name="hyperv_HostPassword"
                        iconClass="fa-key"
                        value={poolDetails.pool_template_vm_id?.password || ""}
                        onChange={handleOnChange}
                        placeholder="Enter Host password"
                        tooltip="It is used only for Linux. If Pool OS Type is Windows then you may skip it!"
                      />

                      <SelectField
                        label="Generation"
                        name="hyperv_generation"
                        iconClass="fa-microchip"
                        value={
                          poolDetails.pool_template_vm_id?.generation === 1
                            ? "Gen1"
                            : poolDetails.pool_template_vm_id?.generation === 2
                              ? "Gen2"
                              : ""
                        }
                        onChange={handleOnChange}
                        required={true}
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

                      <InputField
                        label="Memory (GB)"
                        name="hyperv_memory"
                        type="number"
                        iconClass="fa-memory"
                        value={poolDetails.pool_template_vm_id?.memory || ""}
                        onChange={handleOnChange}
                        placeholder="Enter memory size (GB)"
                        required={true}
                        min="2"
                        step="1"
                        max="64"
                      />

                      <div className="mb-4 flex items-center">
                        <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px]">
                          <span>
                            <i className="fas fa-sliders mr-2"></i>
                          </span>
                          Enable Dynamic Memory
                        </label>
                        <div className="flex-1 w-[40%] max-w-[40rem] ml-2 flex items-center">
                          <input
                            type="checkbox"
                            name="hyperv_dynamic_memory"
                            className="w-4 h-4 text-[#1a365d] bg-gray-100 border-gray-300 rounded focus:ring-[#1a365d] cursor-pointer"
                            checked={isDynamicMemory}
                            onChange={handleOnChange}
                          />
                        </div>
                      </div>

                      {/* Dynamic Memory sub-fields — appear as a card when checked */}
                      {isDynamicMemory && (
                        <div className="mb-5 ml-[188px] mr-0 max-w-[40rem] rounded-lg border border-blue-100 bg-blue-50/40 px-5 pt-4 pb-1 shadow-sm">
                          <p className="text-xs font-semibold text-[#1a365d]/70 uppercase tracking-wide mb-3">
                            Dynamic Memory Settings
                          </p>
                          <InputField
                            label="Min Memory (MB)"
                            name="hyperv_minimum_memory"
                            type="number"
                            iconClass="fa-memory"
                            value={
                              poolDetails.pool_template_vm_id?.minimum_memory ||
                              512
                            }
                            onChange={handleOnChange}
                            placeholder="Minimum memory (MB)"
                            required={true}
                            min="32"
                            step="2"
                            max={poolDetails.pool_template_vm_id?.memory * 1024}
                          />
                          <InputField
                            label="Max Memory (MB)"
                            name="hyperv_maximum_memory"
                            type="number"
                            iconClass="fa-memory"
                            value={
                              poolDetails.pool_template_vm_id?.maximum_memory ||
                              2048
                            }
                            onChange={handleOnChange}
                            placeholder="Maximum memory (MB)"
                            required={true}
                            min={poolDetails.pool_template_vm_id?.memory * 1024}
                            step="1"
                            max={128 * 1024}
                          />
                          <InputField
                            label="Buffer Memory (%)"
                            name="hyperv_buffer_memory"
                            type="number"
                            iconClass="fa-percent"
                            value={
                              poolDetails.pool_template_vm_id?.buffer_memory ||
                              ""
                            }
                            onChange={handleOnChange}
                            placeholder="Buffer percentage (e.g. 20)"
                            required={true}
                            min="5"
                            step="1"
                            max="2000"
                          />
                        </div>
                      )}

                      {/* Processor Count */}
                      <InputField
                        label="Processor Count"
                        name="hyperv_processor_count"
                        type="number"
                        iconClass="fa-microchip"
                        value={
                          poolDetails.pool_template_vm_id?.processor_count || ""
                        }
                        onChange={handleOnChange}
                        placeholder="Enter number of processors"
                        required={true}
                        min="1"
                        step="1"
                        max="1024"
                      />
                      {/* Priority Field — appears only if cluster and pool type is Automated */}
                      {poolDetails.pool_type === "Automated" &&
                        ["multinode", "cluster"].includes(
                          selectedCluster?.node_type?.toLowerCase().replace(/\s/g, "")
                        ) && (
                          <SelectField
                            label="Priority"
                            name="hyperv_priority"
                            iconClass="fa-arrow-up-9-1"
                            value={
                              poolDetails.pool_template_vm_id?.priority ?? 2000
                            }
                            onChange={handleOnChange}
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
                        onChange={handleOnChange}
                        required={true}
                        options={[
                          { value: "", label: "Select Switch", disabled: true },
                          ...(switches || []).map((sw) => ({
                            value: sw.Name,
                            label: sw.Name,
                          })),
                        ]}
                      />

                      <InputField
                        label="Naming Pattern"
                        name="pool_naming_pattern"
                        iconClass="fa-font"
                        value={poolDetails.pool_naming_pattern || ""}
                        onChange={handleNamingPatternChange}
                        placeholder="Naming Pattern (i.e example-{n:fixed=3})"
                        required={true}
                        tooltip={`Naming Pattern should be like 'example-{n:fixed=3}'
                          i.e example-001, example-002, etc.
                          (where 3 means number of digits after the name)`}
                        tooltipClass="w-40"
                      />

                      <InputField
                        label="Number of VMs"
                        type="number"
                        name="pool_number_of_vms"
                        iconClass="fa-list-ol"
                        value={poolDetails.pool_number_of_vms || 1}
                        onChange={handleCountChange}
                        placeholder="Number of VMs"
                        min="1"
                      />
                    </>
                  )}

                  {/* Join AD Checkbox - visible for Proxmox and Hyper-V */}
                  {(isProxmoxCluster || isHyperVCluster) && (
                    <>
                      <div className="mb-4 flex items-center">
                        <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px]">
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
                            className="w-4 h-4 text-[#1a365d] bg-gray-100 border-gray-300 rounded focus:ring-[#1a365d] cursor-pointer"
                            checked={poolDetails.join_ad || false}
                            onChange={handleOnChange}
                          />
                        </div>
                      </div>

                      {poolDetails.join_ad && (
                        <div className="mb-5 ml-[188px] mr-0 max-w-[40rem] rounded-lg border border-blue-100 bg-blue-50/40 px-5 pt-4 pb-1 shadow-sm">
                          <p className="text-xs font-semibold text-[#1a365d]/70 uppercase tracking-wide mb-3">
                            Active Directory Settings
                          </p>
                          <InputField
                            label="Domain"
                            name="pool_ad_domain"
                            iconClass="fa-globe"
                            value={poolDetails.pool_ad_domain || ""}
                            onChange={handleOnChange}
                            placeholder="e.g. corp.example.com"
                            required={true}
                          />
                          <InputField
                            label="Path"
                            name="pool_ad_path"
                            iconClass="fa-folder-tree"
                            value={poolDetails.pool_ad_path || ""}
                            onChange={handleOnChange}
                            placeholder="OU=department,OU=HR OR department/HR"
                            required={true}
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
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="w-full rounded-md bg-white">
            {selectedProtocol && (
              <CustomTabs
                tablist={["RDP", "SSH", "VNC"].filter(
                  (tab) => tab === selectedProtocol,
                )}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
                handleTabSelection={(tab) => setSelectedTab(tab)}
              />
            )}
            {selectedProtocol === "RDP" && (
              <RDPsettings
                onChange={handleOnChange}
                poolDetails={poolDetails}
              />
            )}
            {selectedProtocol === "SSH" && (
              <SSHsettings
                onChange={handleOnChange}
                poolDetails={poolDetails}
              />
            )}
            {selectedProtocol === "VNC" && (
              <VNCsettings
                onChange={handleOnChange}
                poolDetails={poolDetails}
              />
            )}
          </div>
        </div>

        <div className="pl-5 flex items-start justify-start">
          <button
            onClick={handleOnClick}
            type="button"
            disabled={isLoading}
            className={`rounded-md mb-4 px-3 py-2 text-sm font-semibold text-white shadow-sm flex items-center gap-2
            ${
              isLoading
                ? "bg-[#1a365d]/80 cursor-not-allowed"
                : "bg-[#1a365d]/80 hover:bg-[#1a365d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a365d]"
            }`}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isLoading ? "Submitting..." : "Submit"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PoolCreationForm;

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PoolContext } from "../../Context/PoolContext";
import "./css/PoolCreationForm.css";
import { getIpPoolNames, getClusterNodes, getTemplates, getVmwareDCs, getVmwareFolders, createPool } from "../../Services/PoolService";
import VNCsettings from "./VNCsettings";
import SSHsettings from "./SSHsettings";
import RDPsettings from "./RDPsettings";
import CustomTabs from "../CustomTabs/CustomTabs";
import { Slide, toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import Select from "react-select";
const poolType = ["Automated", "Manual"];

const initialPoolDetails = {
  pool_protocol: "",
  pool_port: null,
  pool_hostname: "",
  pool_type: "",
  pool_name: "",
  entitled: null,
  pool_machines: [],
  pool_os_type: "",
  pool_username: "",
  pool_password: "",
  pool_security: "",
  pool_weight: 0,
  pool_domain: "",
  pool_disable_auth: false,
  pool_ignore_cert: false,
  pool_max_connections: null,
  pool_max_connections_per_user: null,
  pool_guacd_hostname: "",
  pool_guacd_port: null,
  pool_guacd_encryption: "",
  pool_gateway_port: null,
  pool_gateway_username: "",
  pool_gateway_password: "",
  pool_gateway_domain: "",
  pool_initial_program: "",
  pool_client_name: "",
  pool_timezone: "",
  pool_console: false,
  pool_width: null,
  pool_height: null,
  pool_dpi: null,
  pool_color_depth: "",
  pool_resize_method: "",
  pool_read_only: false,
  pool_clipboard_encoding: "",
  pool_disable_copy: false,
  pool_disable_paste: false,
  pool_console_audio: false,
  pool_enable_audio_input: false,
  pool_enable_printing: false,
  pool_printer_name: "",
  pool_enable_drive: false,
  pool_drive_name: "",
  pool_drive_path: "",
  pool_cursor: "",
  pool_enable_wallpaper: false,
  pool_enable_theming: false,
  pool_enable_font_smoothing: false,
  pool_enable_full_window_drag: false,
  pool_enable_desktop_composition: false,
  pool_enable_menu_animations: false,
  pool_disable_bitmap_caching: false,
  pool_disable_offscreen_caching: false,
  pool_disable_glyph_caching: false,
  pool_load_balance_info: "",
  pool_recording_path: "",
  pool_recording_name: "",
  pool_create_recording_path: false,
  pool_recording_exclude_mouse: false,
  pool_recording_include_keys: false,
  pool_exclude_touch_events: false,
  pool_enable_sftp: false,
  pool_sftp_port: null,
  pool_sftp_username: "",
  pool_font_name: "",
  pool_sftp_password: "",
  pool_sftp_host_key: "",
  pool_sftp_private_key: "",
  pool_sftp_passphrase: "",
  pool_sftp_root_directory: "",
  pool_sftp_directory: "",
  pool_sftp_server_alive_interval: null,
  pool_private_key: "",
  pool_passphrase: "",
  pool_color_scheme: "",
  pool_custom_font_name: "",
  pool_scrollback: 0,
  pool_font_size: 0,
  pool_backspace: "",
  pool_terminal_type: "",
  pool_typescript_path: "",
  pool_typescript_name: "",
  pool_create_typescript_path: false,
  pool_swap_red_blue: false,
  pool_dest_host: "",
  pool_dest_port: null,
  pool_exclude_mouse: false,
  pool_exclude_graphics_streams: false,
  pool_enable_audio: false,
  pool_audio_servername: "",
  pool_failover_only: "false",
  pool_args: [],
  pool_vmids: [],
  cluster_id: "",
  pool_ip_pool_names: [],
  pool_number_of_vms: null,
  pool_naming_pattern: "",
  pool_template_vm_id: null,
  pool_selected_nodes: [],
  pool_vmware_dc: "",
  pool_vmware_folder: "",
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const PoolCreationForm = (props) => {

  const [selectedTab, setSelectedTab] = useState("RDP");
  const [selectedProtocol, setSelectedProtocol] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rename, setRename] = useState("");
  let token = props.token;
  let userEmail = props.tokenParsed.preferred_username;
  const [poolDetails, setPoolDetails] = useState(initialPoolDetails);
  const pc = useContext(PoolContext);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [ipPoolNames, setIpPoolNames] = useState([]);
  const [vmwareDCs, setVmwareDCs] = useState([]);
  const [vmwareFolders, setVmwareFolders] = useState([]);
  const [error, setError] = useState(null);

  let navigate = useNavigate();
  useEffect(() => {
    if (poolDetails.pool_type === "Automated") {
      getIpPoolNames(token)
        .then((data) => setIpPoolNames(data))
        .catch(() => setIpPoolNames([]));
    }
  }, [poolDetails.pool_type, token]);
  const handleClusterSelect = async (e) => {
    const clusterId = e.target.value;
    setPoolDetails((prev) => ({
      ...prev,
      cluster_id: clusterId,
      pool_selected_nodes: [],
      pool_template_vm_id: "",
      pool_vmware_dc: "",
      pool_vmware_folder: "",
    }));
    setSelectedCluster(null);
    setNodes([]);
    setTemplates([]);
    setVmwareDCs([]);
    setVmwareFolders([]);
    if (!clusterId) return;
    const cluster = pc.availableClusters.find((c) => String(c.id) === clusterId);
    setSelectedCluster(cluster);
    try {
      setError(null);
      const [nodes, templates] = await Promise.all([
        getClusterNodes(token, cluster.id),
        getTemplates(token, cluster.id),
      ]);
      setNodes(nodes);
      setTemplates(templates);

      // Fetch VMware DCs/Folders if cluster is VMware
      if (cluster.type === "VMware") {
        const [dcs, folders] = await Promise.all([
          getVmwareDCs(token, cluster.id),
          getVmwareFolders(token, cluster.id),
        ]);
        setVmwareDCs(dcs);
        setVmwareFolders(folders);
      }
    } catch (err) {
      setError("Failed to fetch cluster nodes/templates/DCs/folders.");
      setNodes([]);
      setTemplates([]);
      setVmwareDCs([]);
      setVmwareFolders([]);
    }
  };

  // General handler for non-automated fields
  const handleOnChange = (e) => {
    const { name, value, type, checked } = e.target;
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
        "pool_weight",
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
      ].includes(name)
    ) {
      newValue = value ? parseInt(value, 10) : null;
    } else {
      newValue = value;
    }
    setPoolDetails((prevState) => ({
      ...prevState,
      [name]: newValue,
    }));
  };
  const handleProtocolChange = (e) => {
    const value = e.target.value;
    setPoolDetails((prev) => ({ ...prev, [e.target.name]: value }));
    setSelectedProtocol(value);
    setSelectedTab(value);
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
  const handleVmwareDCChange = (e) => {
    setPoolDetails((prev) => ({
      ...prev,
      pool_vmware_dc: e.target.value,
    }));
  };
  const handleVmwareFolderChange = (e) => {
    setPoolDetails((prev) => ({
      ...prev,
      pool_vmware_folder: e.target.value,
    }));
  };

  const handleOnClick = async () => {
    setIsLoading(true);
    if (
      !poolDetails.pool_type ||
      !poolDetails.pool_protocol ||
      !poolDetails.pool_name
    ) {
      toast.error(
        "Please fill all mandatory fields (Pool Type, Pool Name, and Protocol)",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Slide,
        }
      );
      setIsLoading(false);
      return;
    }
    let requestData = { ...poolDetails, email: userEmail };
    try {
      const res = await createPool(token, requestData);
      const msg = res.data?.data?.msg;
      if (res.data.code === 200) {
        toast.success(msg, { position: "top-right", autoClose: 5000 });
        pc.setAvailablePools([...pc.availablePools, res.data?.data?.pool]);
        pc.setIsPoolAvailable(true);
        navigate("/pools");
        setPoolDetails(initialPoolDetails);
      } else {
        setRename(msg);
        toast.error(msg, { position: "top-right", autoClose: 5000 });
        navigate("/pools/pool-creation-form");
      }
    } catch {
      toast.error("Pool creation failed", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const Goback = () => {
    navigate(-1);
  };

  const nodeOptions = nodes.map((node) => ({
    label: node.name,
    value: node.name,
  }));

  return (
    <div className="pool_creation w-[98%] h-[90vh] m-auto  bg-white rounded-lg p-4 shadow-md flex flex-col overflow-hidden">
      <div className="flex justify-start mt-5">
           <div
          onClick={Goback}
          className="ml-2 bg-[#1a365d]/80 text-white px-2 py-2 rounded-md hover:bg-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:ring-opacity-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </div>
      </div>
      <div className="pool-creation-form flex-1 overflow-y-auto rounded-md bg-white custom-scrollbar ">
        <div className="space-y-5 m-2">
          <div className="w-full mx-auto p-3 rounded-md  bg-white">
            <h2 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">
              Create New Pool
            </h2>
            <div className="text-left table-auto ml-5">
              <div className="tr">
                <div className="th">
                  <label className="block text-sm font-medium leading-6 text-gray-900  border-0">
                    Pool Type <span className="text-red-500 text-xl">*</span>
                  </label>
                </div>
                <div className="td">
                  <div className="mt-2 border-0 ">
                    <select
                      onChange={handleOnChange}
                      value={poolDetails.pool_type}
                      name="pool_type"
                      required
                      className="block  cursor-pointer  py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                    >
                      <option value="">Pool Type</option>
                      {poolType.map((item) => {
                        return (
                          <option
                            key={item}
                            value={item}
                            className="capitalize px-1"
                          >
                            {item}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>
              <div className="protocol_field mb-4 mt-3">
                <div className="tr">
                  <div className="th">
                    <label
                      htmlFor="protocol"
                      className="block text-sm font-medium leading-6 text-gray-900 border-0"
                    >
                      Protocol <span className="text-red-500 text-xl">*</span>
                    </label>
                  </div>
                  <div className="td">
                    <div className="mt-2 border-0">
                      <div className="flex ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                        <select
                          id="protocol"
                          name="pool_protocol"
                          onChange={handleProtocolChange}
                          value={poolDetails.pool_protocol || ""}
                          className="block flex-1  bg-transparent py-1.5 pl-1 text-black placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                        >
                          <option value="">Select Protocol</option>
                          <option value="RDP">RDP</option>
                          <option value="SSH">SSH</option>
                          <option value="VNC">VNC</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {poolDetails.pool_type && (
                <div className="tr">
                  <div className="th">
                    <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                      Pool Name <span className="text-red-500 text-xl">*</span>
                    </label>
                  </div>
                  <div className="td">
                    <div className="mt-2  border-0">
                      <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                        <input
                          type="text"
                          name="pool_name"
                          value={poolDetails.pool_name}
                          onChange={handleOnChange}
                          required
                          className="block flex-1 bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400  sm:text-sm sm:leading-6 "
                        />
                      </div>
                      <div style={{ color: "red" }}>{rename}</div>
                    </div>
                  </div>
                </div>
              )}
              {poolDetails.pool_type === "Automated" && (
                <>
                <div className="protocol_field mb-4 mt-3">
                <div className="tr">
                  <div className="th">
                    <label
                      htmlFor="protocol"
                      className="block text-sm font-medium leading-6 text-gray-900 border-0"
                    >
                      Pool OS Type <span className="text-red-500 text-xl">*</span>
                    </label>
                  </div>
                  <div className="td">
                    <div className="mt-2 border-0">
                      <div className="flex ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                        <select
                          id="protocol"
                          name="pool_os_type"
                          onChange={handleOnChange}
                          value={poolDetails.pool_os_type || ""}
                          className="block flex-1  bg-transparent py-1.5 pl-1 text-black placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                        >
                          <option value="">Select OS</option>
                          <option value="Windows">Windows</option>
                          <option value="Linux">Linux</option> 
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                  <div className="tr">
                    <div className="th">
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        Select IP Pools <span className="text-red-500 text-xl">*</span>
                      </label>
                    </div>
                    <div className="td">
                      <div className="mt-2 border-0">
                        <Select
                          isMulti
                          name="pool_ip_pool_names"
                          value={ipPoolNames
                            .filter((name) =>
                              (poolDetails.pool_ip_pool_names || []).includes(name)
                            )
                            .map((name) => ({ label: name, value: name }))}
                          onChange={handleIpPoolsChange}
                          options={ipPoolNames.map((name) => ({
                            label: name,
                            value: name,
                          }))}
                          className="basic-multi-select text-xs"
                          classNamePrefix="select"
                          placeholder="Select IP Pools"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="tr">
                    <div className="th">
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        Cluster
                      </label>
                    </div>
                    <div className="td">
                      <div className="mt-2  border-0">
                        <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                          <select
                            onChange={handleClusterSelect}
                            value={poolDetails.cluster_id || ""}
                            className="block flex-1 bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400  sm:text-sm sm:leading-6"
                          >
                            <option value="">Select Cluster</option>
                            {pc.availableClusters.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="tr">
                    <div className="th">
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        Node
                      </label>
                    </div>
                    <div className="td">
                      <div className="mt-2 border-0">
                        <Select
                          isMulti
                          name="pool_selected_nodes"
                          value={nodeOptions.filter((opt) =>
                            (poolDetails.pool_selected_nodes || []).includes(opt.value)
                          )}
                          onChange={handleNodesChange}
                          options={nodeOptions}
                          className="basic-multi-select text-xs"
                          classNamePrefix="select"
                          placeholder="Select Nodes"
                          isDisabled={nodes.length === 0}
                          noOptionsMessage={() => "No nodes available"}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="tr">
                    <div className="th">
                      <label className="block text-sm font-medium leading-6 text-gray-900">
                        Template
                      </label>
                    </div>
                    <div className="td">
                      <div className="mt-2  border-0">
                        <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                          <select
                            name="pool_template_vm_id"
                            onChange={handleTemplateChange}
                            value={poolDetails.pool_template_vm_id || ""}
                            className="block flex-1 bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 sm:text-sm sm:leading-6"
                          >
                            <option value="">Select Template</option>
                            {templates.map((template) => (
                              <option key={template.vmid} value={template.vmid}>
                                {template.vmid} ({template.name})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="tr">
                    <div className="th">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Naming Pattern
                      </label>
                    </div>
                    <div className="td">
                      <div className="mt-2 border-0">
                        <input
                          type="text"
                          name="pool_naming_pattern"
                          className="block flex-1 bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                          value={poolDetails.pool_naming_pattern || ""}
                          onChange={handleNamingPatternChange}
                          placeholder="Naming Pattern"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="tr">
                    <div className="th">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Number of VMs
                      </label>
                    </div>
                    <div className="td">
                      <div className="mt-2 border-0">
                        <input
                          type="number"
                          min={1}
                          name="pool_number_of_vms"
                          className="block flex-1 bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                          value={poolDetails.pool_number_of_vms || ""}
                          onChange={handleCountChange}
                          placeholder="Number of VMs"
                        />
                      </div>
                    </div>
                  </div>
                  {selectedCluster && selectedCluster.type === "VMware" && (
                    <>
                      <div className="tr">
                        <div className="th">
                          <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                            Select DC
                          </label>
                        </div>
                        <div className="td">
                          <div className="mt-2 border-0">
                            <select
                              name="pool_vmware_dc"
                              value={poolDetails.pool_vmware_dc || ""}
                              onChange={handleVmwareDCChange}
                              className="w-full cursor-pointer py-1.5 text-gray-900 border-2"
                            >
                              <option value="">Select DC</option>
                              {vmwareDCs.map((dc) => (
                                <option key={dc.id || dc.name} value={dc.name}>
                                  {dc.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="tr">
                        <div className="th">
                          <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                            Select Folder
                          </label>
                        </div>
                        <div className="td">
                          <div className="mt-2 border-0">
                            <select
                              name="pool_vmware_folder"
                              value={poolDetails.pool_vmware_folder || ""}
                              onChange={handleVmwareFolderChange}
                              className="w-full cursor-pointer py-1.5 text-gray-900 border-2"
                            >
                              <option value="">Select Folder</option>
                              {vmwareFolders.map((folder) => (
                                <option key={folder.id || folder.name} value={folder.name}>
                                  {folder.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="w-full rounded-md bg-white ">
            {selectedProtocol && (
              <CustomTabs
                tablist={["RDP", "SSH", "VNC"].filter((tab) => tab === selectedProtocol)}
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
            }
          `}
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


import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PoolContext } from "../../Context/PoolContext";
import "./css/PoolCreationForm.css";
import VNCsettings from "./VNCsettings";
import SSHsettings from "./SSHsettings";
import RDPsettings from "./RDPsettings";
import CustomTabs from "../CustomTabs/CustomTabs";
import {
  getPoolByIdService,
  getClusterNodes,
  getTemplates,
  getVmwareDCs,
  getVmwareFolders,
  getIpPoolNames,
  updatePoolService
} from "../../Services/PoolService";
import { Loader2 } from "lucide-react";
import { Slide, toast } from "react-toastify";
import SkeletonEditPool from "./SkeletonEditPool";
import Select from "react-select";
const poolType = ["Automated", "Manual"];
const EditPool = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: poolId } = useParams();
  const [poolDetails, setPoolDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("RDP");
  const [nodes, setNodes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [ipPoolNames, setIpPoolNames] = useState([]);
  const [vmwareDCs, setVmwareDCs] = useState([]);
  const [vmwareFolders, setVmwareFolders] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const pc = useContext(PoolContext);
  const token = pc.token;
  const userEmail = pc.tokenParsed.preferred_username;

  const selectStyles = {
    container: (base) => ({
      ...base,
      width: "100%", 
    }),
    control: (base, state) => ({
      ...base,
      minHeight: "2.25rem",
      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db", 
      boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
  };
  useEffect(() => {
    setLoading(true);
    getPoolByIdService(token, poolId)
      .then((res) => {
        setPoolDetails(res.data.data.pool);
        let clusterId = "";
        if (res.data.data.pool.cluster_id) {
          if (typeof res.data.data.pool.cluster_id === "string") {
            clusterId = res.data.data.pool.cluster_id.split("_").pop();
          } else {
            clusterId = res.data.data.pool.cluster_id;
          }
          fetchNodesAndTemplates(
            clusterId,
            res.data.data.pool.cluster_type 
          );
        }
        if (res.data.data.pool.pool_type === "Automated") {
          fetchIpPools();
        }
      })
      .catch((err) => {
        setPoolDetails({});
      })
      .finally(() => {
        setLoading(false);
      });
  }, [poolId]);

  const fetchNodesAndTemplates = async (clusterId, clusterType) => {
    try {
      const [nodesData, templatesData] = await Promise.all([
        getClusterNodes(token, clusterId),
        getTemplates(token, clusterId),
      ]);
      setNodes(nodesData);
      setTemplates(templatesData);

      // Fetch VMware DCs/Folders if cluster is VMware
      if (clusterType === "VMware") {
        const [dcsData, foldersData] = await Promise.all([
          getVmwareDCs(token, clusterId),
          getVmwareFolders(token, clusterId),
        ]);
        setVmwareDCs(dcsData?.data);
        setVmwareFolders(foldersData?.data);
      }
    } catch (err) {
      setNodes([]);
      setTemplates([]);
      setVmwareDCs([]);
      setVmwareFolders([]);
    }
  };

  const fetchIpPools = () => {
    getIpPoolNames(token)
      .then((data) => {
        setIpPoolNames(data);
      })
      .catch(() => {
        setIpPoolNames([]);
      });
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
      ].includes(name)
    ) {
      newValue = value ? parseInt(value, 10) : null;
    } else {
      newValue = value;
    }

    setPoolDetails((prev) => ({
      ...prev,
      [name]: newValue,
    }));
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
  const handleOnClick = () => {
    setIsLoading(true);

    const requestData = {
      ...poolDetails,
      email: userEmail,
    };

    updatePoolService(token, poolDetails.id, requestData)
      .then((res) => {
        if (res.data?.data?.pool) {
          setPoolDetails(res.data.data.pool);
          if (pc.setAvailablePools) {
            pc.setAvailablePools((prevPools) =>
              prevPools.map((pool) =>
                pool.id === res.data.data.pool.id ? res.data?.data?.pool : pool
              )
            );
          }
        }
        toast.success(res.data.msg, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Slide,
        });
        navigate("/pools");
        pc.getPools();
      })
      .catch((err) => {
        setPoolDetails({});
        toast.error("Pool modification failed", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Slide,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  let securityMode = [
    "None",
    "Any",
    "NLA",
    "RDP encryption",
    "TLS encryption",
    "Hyper-V / VMConnect",
  ];

  const Goback = () => {
    navigate(-1);
  };

  const nodeOptions = nodes.map((node) => ({
    label: node.name,
    value: node.name,
  }));

  return (
    <div className="pool_creation w-[98%] h-[86vh]  m-auto flex-1 mx-auto bg-white rounded-lg p-4 shadow-md flex flex-col overflow-hidden">
      <div className="flex justify-start mt-5">
        <div
          onClick={Goback}
          className="ml-4 bg-[#1a365d]/80 text-white px-2 py-2 rounded-md hover:bg-[#1a365d] focus:outline-none  focus:ring-opacity-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </div>
      </div>
      <div className="pool-creation-form flex-1 overflow-y-auto rounded-md bg-white custom-scrollbar">
        {loading ? (
          <SkeletonEditPool />
        ) : (
          <div className="space-y-5 m-2">
            <div className="w-full mx-auto p-3 rounded-md  bg-white">
              <h2 className="font-semibold leading-7 text-gray-900">
                <span className="text-[#1a365d] text-xl">Edit </span> :{" "}
                <span className="text-[#00000099] text-xl">
                  {poolDetails.pool_name}
                </span>
              </h2>
              <div className="text-left table-auto ml-5">
                <div className="tr">
                  <div className="th">
                    <label className="block text-sm font-medium leading-6 text-gray-900  border-0">
                      Pool Type
                    </label>
                  </div>
                  <div className="td">
                    <div className="mt-2 border-0">
                      <select
                        onChange={handleOnChange}
                        value={poolDetails.pool_type}
                        name="pool_type"
                        disabled
                        className="block cursor-pointer  py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      >
                        <option value="" disabled>
                          Pool Type
                        </option>
                        {poolType.map((item) => (
                          <option
                            key={item}
                            value={item}
                            className="capitalize px-1"
                          >
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                {poolDetails.pool_type && (
                  <div className="tr ">
                    <div className="th">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Pool Name
                      </label>
                    </div>
                    <div className="td">
                      <div className="mt-2 border-0">
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                          <input
                            type="text"
                            name="pool_name"
                            onChange={handleOnChange}
                            value={poolDetails.pool_name || ""}
                            className="block flex-1 rounded-md bg-gray-400   py-1.5 pl-1 text-gray-900   placeholder:text-black focus:ring-0 sm:text-sm sm:leading-6 border-2"
                            disabled
                          />
                        </div>
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
                          <option value="MacOS">MacOS</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                    <div className="tr w-full">
                      <div className="th w-full">
                        <label className="block text-sm font-medium leading-6 text-gray-900">
                          Select IP Pools
                        </label>
                      </div>
                      <div className="td w-full">
                        <div className="mt-2 border-0">
                          <Select
                            isMulti
                            name="pool_ip_pool_names"
                            value={ipPoolNames
                              .filter((name) =>
                                (poolDetails.pool_ip_pool_names || []).includes(
                                  name
                                )
                              )
                              .map((name) => ({
                                label: name,
                                value: name,
                              }))}
                            onChange={handleIpPoolsChange}
                            options={ipPoolNames.map((name) => ({
                              label: name,
                              value: name,
                            }))}
                            className="basic-multi-select text-xs"
                            classNamePrefix="select"
                            styles={{
                              ...selectStyles,
                              container: (base) => ({
                                ...base,
                                width: "100%",
                              }),
                            }}
                            placeholder="Select IP Pools"
                          />
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
                              (poolDetails.pool_selected_nodes || []).includes(
                                opt.value
                              )
                            )}
                            onChange={handleNodesChange}
                            options={nodeOptions}
                            className="basic-multi-select text-xs "
                            classNamePrefix="select"
                            placeholder="Select Nodes"
                            isDisabled={nodes.length === 0}
                            styles={{
                              ...selectStyles,
                              container: (base) => ({
                                ...base,
                                width: "100%",
                              }),
                            }}
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
                        <div className="mt-2 border-0 w-full">
                          <input
                            type="text"
                            name="pool_template_vm_id"
                            className="block flex-1 w-full bg-white   py-1.5 pl-1 text-gray-900   placeholder:text-black focus:ring-0 sm:text-sm sm:leading-6 border-2"
                            value={(() => {
                              const template = templates.find(
                                (t) =>
                                  String(t.vmid) ===
                                  String(poolDetails.pool_template_vm_id)
                              );
                              return template
                                ? `${template.vmid} (${template.name})`
                                : poolDetails.pool_template_vm_id || "N/A";
                            })()}
                            disabled
                          />
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
                        <div className="mt-2 border-0 w-full">
                          <input
                            type="text"
                            name="pool_naming_pattern"
                            className="block flex-1 w-full bg-white   py-1.5 pl-1 text-gray-900   placeholder:text-black focus:ring-0 sm:text-sm sm:leading-6 border-2"
                            value={poolDetails.pool_naming_pattern || ""}
                            onChange={handleNamingPatternChange}
                            placeholder="Naming Pattern"
                            disabled
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
                        <div className="mt-2 border-0 w-full">
                          <input
                            type="number"
                            min={1}
                            name="pool_number_of_vms"
                            className="block flex-1 w-full bg-white py-1.5 pl-1 text-gray-900  placeholder:text-black focus:ring-0 sm:text-sm sm:leading-6 border-2"
                            value={poolDetails.pool_number_of_vms || ""}
                            onChange={handleCountChange}
                            placeholder="Number of VMs"
                            
                            
                          />
                        </div>
                      </div>
                    </div>
                    {poolDetails.cluster_type === "VMware" && (
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
                                  <option
                                    key={dc.id || dc.name}
                                    value={dc.name}
                                  >
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
                                  <option
                                    key={folder.id || folder.name}
                                    value={folder.name}
                                  >
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
            <div className="w-full rounded-md bg-white">
              <CustomTabs
                tablist={["RDP", "SSH", "VNC"].filter(
                  (tab) => tab === poolDetails.pool_protocol
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

        {/* Buttons */}
        <div className="mb-5 pl-5 flex items-start justify-start">
          <button
            onClick={handleOnClick}
            type="button"
            disabled={isLoading}
            className={`rounded-md mb-4 px-3 py-2 text-sm font-semibold text-white shadow-sm flex items-center gap-2
              ${
                isLoading
                  ? "bg-[#1a365d] cursor-not-allowed"
                  : "bg-[#1a365d]/80 hover:bg-[#1a365d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a365d]"
              }
            `}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isLoading ? "Updating..." : "Update"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPool;

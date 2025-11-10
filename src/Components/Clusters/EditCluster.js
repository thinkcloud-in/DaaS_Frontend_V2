import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Slide, toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchClusterByIdThunk,
  updateClusterThunk,
  fetchEditInfluxdbDetailsThunk,
  fetchInfluxdbDetailsThunk,
  addInfluxdbThunk,
  deleteInfluxdbThunk,
} from "../../redux/features/Clusters/ClustersThunks";
import {
  selectClusterDetails,
  selectClustersLoading,
  selectMonitoring,
} from "../../redux/features/Clusters/ClustersSelectors";
import "./css/ClusterCreationForm.css";
import { selectAuthToken, selectAuthTokenParsed } from "../../redux/features/Auth/AuthSelectors";

// Skeleton loader
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="space-y-5 m-2">
      <div className="mx-10 p-3 rounded-md w-3/4 ">
        <div className="h-7 bg-gray-200 rounded w-1/4 mb-10"></div>
        <div className="space-y-6">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div key={index} className="flex items-center">
              <div className="w-1/4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="flex-1">
                <div className="h-9 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="ml-10 mt-5 pl-5">
        <div className="h-10 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  </div>
);

const EditCluster = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: clusterId } = useParams();

  const token = useSelector(selectAuthToken);
  const tokenParsed = useSelector(selectAuthTokenParsed);
  const userEmail = tokenParsed?.preferred_username;

  // Redux state
  const loading = useSelector(selectClustersLoading);
  const cluster = useSelector(selectClusterDetails) || {};
  const monitoring = useSelector(selectMonitoring);

  // Local edit state
  const [formCluster, setFormCluster] = useState(cluster);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Monitoring
  const [monitoringChecked, setMonitoringChecked] = useState(false);
  const [showMonitoringConfirm, setShowMonitoringConfirm] = useState(false);

  // On mount: fetch cluster details and fill form
  useEffect(() => {
    dispatch(fetchClusterByIdThunk({ token, clusterId }));
  }, [token, clusterId, dispatch]);

  // On cluster detail update, set local form state
  useEffect(() => {
    setFormCluster(cluster);
    if (cluster?.type === "Proxmox") {
      dispatch(fetchEditInfluxdbDetailsThunk({ token, clusterId }));
    }
    // Set to checked if there is monitoring data in Redux
    setMonitoringChecked(
      !!(monitoring &&
        monitoring.monitoringData &&
        (monitoring.monitoringData.monitoring || monitoring.monitoringData.organization))
    );
  }, [cluster, token, clusterId, dispatch]);

  // When user checks or unchecks the monitoring box
  const handleMonitoringCheckbox = async (e) => {
    if (formCluster.type !== "Proxmox") return;
    const checked = e.target.checked;
    setMonitoringChecked(checked);
    if (checked) {
      const action = await dispatch(
        fetchInfluxdbDetailsThunk({ token, clusterId })
      );
      const influxdb = action?.payload;
      if (!influxdb || influxdb.error) {
        setShowMonitoringConfirm(true);
      } else {
        setShowMonitoringConfirm(false);
      }
    } else {
      setShowMonitoringConfirm(false);
    }
  };

  // Handle monitoring confirmation dialog
  const handleMonitoringConfirm = async (confirm) => {
    if (formCluster.type !== "Proxmox") return;
    setShowMonitoringConfirm(false);
    if (confirm) {
      try {
        await dispatch(
          addInfluxdbThunk({ token, clusterId, isCustomIntegration: true })
        );
        dispatch(fetchEditInfluxdbDetailsThunk({ token, clusterId }));
        toast.success("Monitoring integration added successfully");
        setMonitoringChecked(true);
      } catch {
        toast.error("Failed to add monitoring integration");
        setMonitoringChecked(false);
      }
    } else {
      setMonitoringChecked(false);
    }
  };

  // Handle form input change
  let handleOnChange = (e) => {
    setFormCluster({ ...formCluster, [e.target.name]: e.target.value });
  };
  let handleChange = (e) => {
    setFormCluster({ ...formCluster, [e.target.name]: e.target.checked });
  };

  // Save/submit
  let handleOnClick = async () => {
    setIsLoading(true);
    try {
      // If removing monitoring in Proxmox, delete influxdb integration
      if (formCluster.type === "Proxmox" && !monitoringChecked) {
        await dispatch(deleteInfluxdbThunk({ token, clusterId }));
      }
      const payload = {
        ...formCluster,
        email: userEmail,
        ip: Array.isArray(formCluster.ip) ? formCluster.ip : [formCluster.ip],
      };
      await dispatch(updateClusterThunk({ token, clusterId, payload }));
      toast.success("Cluster updated successfully", { transition: Slide });
      navigate("/clusters");
    } catch {
      toast.error("Failed to update cluster", { transition: Slide });
    } finally {
      setIsLoading(false);
    }
  };

  const Goback = () => {
    navigate("/clusters");
  };

  // Still loading skeleton loader
  if (loading || !formCluster || !formCluster.type) {
    return (
      <div className="w-[95%] min-h-[90vh] m-auto rounded-md bg-white">
        <div className="flex justify-start ml=0 mt-5">
          <div className="ml-12 h-10 w-16 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="w-[98%] mt-4 h-[90vh] min-h-[75vh] m-auto bg-white rounded-lg  shadow-md flex flex-col overflow-hidden">
      <div className="flex justify-start ml-2 mt-5">
        <div
          onClick={Goback}
          className="ml-12 bg-[#1a365dcc] text-[#f5f5f5] hover:bg-[#1a365d] hover:text-white px-2 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:ring-opacity-10"
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
      <div className="cluster-creation-form overflow-y-auto rounded-md bg-white custom-scrollbar ">
        <div className="space-y-5 m-2">
          <div className="mx-10 p-3 rounded-md w-3/4">
            <h2 className="font-bold leading-7 text-gray-900 text-left">
              Edit Cluster
            </h2>
            <div className="text-left table-auto mt-10">
              {/* CLUSTER FORM */}
              <div className="tr">
                <div className="th">
                  <label className="text-sm font-medium leading-6 text-gray-900  border-0 ">
                    Cluster Type
                  </label>
                </div>
                <div className="td">
                  <div className="mt-2 border-0 ">
                    <select
                      disabled
                      value={formCluster.type}
                      name="clusterType"
                      className="block cursor-pointer rounded-md py-1.5 text-gray-900  shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 border-2"
                    >
                      <option value={formCluster.type} disabled>
                        {formCluster.type}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="tr">
                <div className="th">
                  <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                    Cluster Name
                  </label>
                </div>
                <div className="td">
                  <div className="mt-2  border-0">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 ">
                      <input
                        disabled
                        type="text"
                        name="name"
                        onChange={handleOnChange}
                        value={formCluster.name || ""}
                        className="block flex-1 rounded-md  py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Cluster type IP/FQDN fields */}
              {formCluster.type === "VMware" && (
                <div className="tr">
                  <div className="th">
                    <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                      Vcenter IP / FQDN
                    </label>
                  </div>
                  <div className="td">
                    <div className="mt-2  border-0">
                      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 ">
                        <input
                          type="text"
                          name="vcenterIP"
                          disabled
                          onChange={handleOnChange}
                          value={
                            Array.isArray(formCluster.ip)
                              ? formCluster.ip[0]
                              : formCluster.ip
                          }
                          className="block flex-1 rounded-md   py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {formCluster.type === "KVM" && (
                <div className="tr">
                  <div className="th">
                    <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                      KVM IP / FQDN
                    </label>
                  </div>
                  <div className="td">
                    <div className="mt-2  border-0">
                      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 ">
                        <input
                          type="text"
                          name="KvmIP"
                          disabled
                          onChange={handleOnChange}
                          value={
                            Array.isArray(formCluster.ip)
                              ? formCluster.ip[0]
                              : formCluster.ip
                          }
                          className="block flex-1 rounded-md bg-zinc-300 py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {formCluster.type === "Proxmox" && (
                <div className="tr">
                  <div className="th">
                    <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                      Proxmox IP / FQDN
                    </label>
                  </div>
                  <div className="td">
                    <div className="mt-2  border-0">
                      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 ">
                        <input
                          type="text"
                          name="ip"
                          disabled
                          onChange={handleOnChange}
                          value={
                            Array.isArray(formCluster.ip)
                              ? formCluster.ip[0]
                              : formCluster.ip
                          }
                          className="block flex-1 rounded-md py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* End cluster type specific */}
              <div className="tr">
                <div className="th">
                  <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                    Port
                  </label>
                </div>
                <div className="td">
                  <div className="mt-2  border-0">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 ">
                      <input
                        onChange={handleOnChange}
                        value={formCluster.port || ""}
                        type="number"
                        name="port"
                        className="block flex-1 rounded-md bg-white bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="tr">
                <div className="th">
                  <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                    Username
                  </label>
                </div>
                <div className="td">
                  <div className="mt-2  border-0">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 ">
                      <input
                        type="text"
                        name="username"
                        onChange={handleOnChange}
                        value={formCluster.username || ""}
                        className="block flex-1 rounded-md bg-white bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="tr">
                <div className="th">
                  <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                    Password
                  </label>
                </div>
                <div className="td">
                  <div className="mt-2 border-0 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      onChange={handleOnChange}
                      value={formCluster.password || ""}
                      className="block w-full rounded-md border border-gray-300 py-1.5 pl-2 pr-8 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="tr">
                <div className="th">
                  <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                    Insecure Skip Verify
                  </label>
                </div>
                <div className="td">
                  <div className="mt-2 border-0">
                    <label className="switch">
                      <input
                        type="checkbox"
                        onChange={handleChange}
                        name="tls"
                        checked={!!formCluster.tls}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Monitoring Section (Proxmox only) */}
        {formCluster.type === "Proxmox" && (
          <div className="monitoring-section mt-0 mx-10 p-3 relative">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={monitoringChecked}
                onChange={handleMonitoringCheckbox}
                disabled={monitoring.monitoringLoading}
              />
              <span className="font-medium text-gray-800">Monitoring</span>
              {monitoring.monitoringLoading && (
                <CircularProgress size={16} color="inherit" />
              )}
            </label>
            {showMonitoringConfirm && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <span className="text-base font-semibold text-gray-800 mb-4 text-center">
                    Do you want to integrate InfluxDB into Proxmox?
                  </span>
                  <div className="flex gap-6">
                    <button
                      className="px-4 py-1 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
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
            {/* Show current monitoring data if enabled */}
            {monitoringChecked && monitoring.monitoringData && (
              <div className="p-8 rounded-md shadow-sm bg-white mt-0">
                <h3 className="text-lg font-semibold text-[#00000099] mb-1 pb-1">
                  InfluxDB Metric Server
                </h3>
                <div className="monitoring-table-form w-[60%]">
                  <div className="tr flex items-center mb-2 ">
                    <div className="th w-16 flex-shrink-0">
                      <label className="block mt-2 flex items-start text-sm font-medium text-gray-900 border-0">
                        Organization
                      </label>
                    </div>
                    <div className="td flex-1">
                      <input
                        type="text"
                        readOnly
                        value={monitoring.monitoringData.organization || ""}
                        className={classNames(
                          "w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400  focus:ring-indigo-600 border-2"
                        )}
                      />
                    </div>
                  </div>
                  <div className="tr flex items-center mb-2 ">
                    <div className="th w-24 flex-shrink-0">
                      <label className="block mt-2 flex items-start text-sm font-medium leading-6 text-gray-900 border-0">
                        Bucket
                      </label>
                    </div>
                    <div className="td flex-1">
                      <input
                        type="text"
                        readOnly
                        value={monitoring.monitoringData.bucket || ""}
                        className={classNames(
                          "w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400 focus:ring-indigo-600 border-2"
                        )}
                      />
                    </div>
                  </div>
                  <div className="tr flex items-center mb-2">
                    <div className="th w-40 flex-shrink-0">
                      <label className="block mt-2 flex items-start text-sm font-medium leading-6 text-gray-900 border-0">
                        Token
                      </label>
                    </div>
                    <div className="td flex-1">
                      <input
                        type="text"
                        value={monitoring.monitoringData.token || ""}
                        className={classNames(
                          "w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400 focus:ring-indigo-600 border-2"
                        )}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="tr flex items-center mb-2">
                    <div className="th w-40 flex-shrink-0">
                      <label className="block mt-2 flex items-start text-sm font-medium leading-6 text-gray-900 border-0">
                        Server
                      </label>
                    </div>
                    <div className="td flex-1">
                      <input
                        type="text"
                        readOnly
                        value={monitoring.monitoringData.server || ""}
                        className={classNames(
                          "w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400 focus:ring-indigo-600 border-2"
                        )}
                      />
                    </div>
                  </div>
                  <div className="tr flex items-center mb-2">
                    <div className="th w-40 flex-shrink-0">
                      <label className="block mt-2 flex items-start text-sm font-medium leading-6 text-gray-900 border-0">
                        Port
                      </label>
                    </div>
                    <div className="td flex-1">
                      <input
                        type="text"
                        readOnly
                        value={monitoring.monitoringData.port || ""}
                        className={classNames(
                          "w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400 focus:ring-indigo-600 border-2"
                        )}
                      />
                    </div>
                  </div>
                  <div className="tr flex items-center mb-2">
                    <div className="th w-40 flex-shrink-0">
                      <label className="block mt-2 flex items-start text-sm font-medium leading-6 text-gray-900 border-0">
                        Protocol
                      </label>
                    </div>
                    <div className="td flex-1">
                      <input
                        type="text"
                        readOnly
                        value={
                          monitoring.monitoringData.influxdbproto ||
                          monitoring.monitoringData.proto ||
                          ""
                        }
                        className={classNames(
                          "w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400 focus:ring-indigo-600 border-2"
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="buttons ml-10 mt-5 pl-5 flex items-start justify-start">
          <button
            onClick={handleOnClick}
            disabled={isLoading}
            type="submit"
            className="rounded-md bg-[#1a365dcc] px-4 py-3 text-sm font-semibold text-[#f5f5f5] shadow-sm hover:bg-[#1a365d] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a365d] flex items-center justify-center"
          >
            {isLoading ? (
              <CircularProgress size={20} color="inherit" className="mr-2" />
            ) : (
              "Submit"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCluster;






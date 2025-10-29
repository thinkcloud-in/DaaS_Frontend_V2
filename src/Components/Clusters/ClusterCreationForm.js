import React, { useState, useContext, useRef } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { PoolContext } from "../../Context/PoolContext";
import "./css/ClusterCreationForm.css";
import { Slide, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { getEnv } from "utils/getEnv";
import {
  createCluster,
  fetchInfluxdbDetails,
  addInfluxdb,
  migrateMonitoringData,
} from "Services/ClusterService";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const ClusterCreationForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const checkboxRef = useRef(null);
  const pc = useContext(PoolContext);
  const token = pc.token;
  const userEmail = pc.tokenParsed.preferred_username;
  let clusterType = ["VMware", "Proxmox"];
  let [isDisabled, setIsDisabled] = useState(false);
  const [clusterDetails, setClusterDetails] = useState({
    type: "",
    name: "",
    ip: "",
    port: "",
    username: "",
    password: "",
    tls: false,
  });
  const [createdClusterId, setCreatedClusterId] = useState(null);
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [monitoringLoading, setMonitoringLoading] = useState(false);
  const [monitoringData, setMonitoringData] = useState(null);
  const [showMonitoringConfirm, setShowMonitoringConfirm] = useState(false);
  const [isClusterCreated, setIsClusterCreated] = useState(false);
  const [influxAlreadyIntegrated, setInfluxAlreadyIntegrated] = useState(false);
  const [srcApiToken, setSrcApiToken] = useState("");
  const [migrateLoading, setMigrateLoading] = useState(false);
  const [showApiToken, setShowApiToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    if (name === "ip") {
      setClusterDetails({ ...clusterDetails, ip: [value] });
    } else {
      setClusterDetails({ ...clusterDetails, [name]: value });
    }
  };

  const handleOnClick = async () => {
    setIsLoading(true);
    setError(null);
    let payload = { ...clusterDetails, email: userEmail };
    if (!Array.isArray(payload.ip)) {
      payload.ip = [payload.ip];
    }
    try {
      const res = await createCluster(token, payload);
      let msg = res.msg;
      let cluster = res?.data?.cluster;
      toast.success(msg, {
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
      pc.setAvailableClusters([...pc.availableClusters, cluster]);
      pc.setIsClusterAvailable(true);
      setCreatedClusterId(cluster.id);
      setIsClusterCreated(true);
      if (cluster.type === "VMware") {
        setTimeout(() => navigate("/clusters"), 1000);
      }
    } catch (err) {
      toast.error("Pool creation failed", {
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setClusterDetails({ ...clusterDetails, tls: e.target.checked });
  };

  const handleMonitoringCheckbox = (e) => {
    const checked = e.target.checked;
    if (checked && createdClusterId) {
      fetchInfluxdbDetailsWrapper(createdClusterId);
    } else {
      setMonitoringEnabled(false);
      setShowMonitoringConfirm(false);
      setMonitoringData(null);
      setInfluxAlreadyIntegrated(false);
    }
  };

  const fetchInfluxdbDetailsWrapper = async (cid) => {
    setMonitoringLoading(true);
    try {
      const influxdb = await fetchInfluxdbDetails(token, cid);
      if (influxdb && !influxdb.error && Object.keys(influxdb).length > 0) {
        setMonitoringEnabled(true);
        setMonitoringData(influxdb);
        setShowMonitoringConfirm(false);
        setInfluxAlreadyIntegrated(true);
      } else {
        setMonitoringEnabled(false);
        setMonitoringData(null);
        setShowMonitoringConfirm(true);
        setInfluxAlreadyIntegrated(false);
      }
    } catch (err) {
      toast.error("Failed to fetch monitoring details");
      setMonitoringEnabled(false);
      setMonitoringData(null);
      setShowMonitoringConfirm(false);
      setInfluxAlreadyIntegrated(false);
    } finally {
      setMonitoringLoading(false);
    }
  };

  const addInfluxdbWrapper = async (isCustomIntegration) => {
    setMonitoringLoading(true);
    try {
      await addInfluxdb(token, createdClusterId, isCustomIntegration);
      toast.success("InfluxDB integrated successfully");
      await fetchInfluxdbDetailsWrapper(createdClusterId);
      setTimeout(() => {
        navigate("/clusters");
      }, 2000);
    } catch (err) {
      toast.error("Failed to integrate InfluxDB");
      setMonitoringEnabled(false);
      setMonitoringData(null);
    } finally {
      setMonitoringLoading(false);
    }
  };

  const handleMonitoringConfirm = async (confirm) => {
    setShowMonitoringConfirm(false);
    if (createdClusterId) {
      if (confirm) {
        await addInfluxdbWrapper(true);
      } else {
        setMonitoringEnabled(false);
        setMonitoringData(null);
      }
    } else {
      setMonitoringEnabled(false);
      setMonitoringData(null);
    }
  };

  const handleMigrate = async () => {
    const src_url = `http://${monitoringData.server}:${monitoringData.port}`;
    if (!srcApiToken) {
      toast.error("API token is required");
      return;
    }
    setMigrateLoading(true);
    try {
      const payload = {
        src_url: src_url,
        src_token: srcApiToken,
        src_org: monitoringData.organization,
        src_bucket: monitoringData.bucket,
        cluster_id: createdClusterId,
        email: userEmail,
      };
      await migrateMonitoringData(token, payload);
      toast.success("Migration has started!");
      setSrcApiToken("");
      setTimeout(() => navigate("/clusters"), 1000);
    } catch (err) {
      toast.error("Migration failed to start");
    } finally {
      setMigrateLoading(false);
    }
  };

  const Goback = () => {
    navigate("/clusters");
  };

  return (
    <div className="w-[98%] mt-4 min-h-[75vh] h-[90vh] m-auto bg-white rounded-lg p-4 shadow-md flex flex-col overflow-hidden">
      <div className="cluster-creation-form overflow-y-auto rounded-md bg-white custom-scrollbar">
        <div className="flex justify-start ml-0 mt-5">
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
        <div className="cluster-creation-form w-full">
          <div className="space-y-5 m-2">
            <div className="bg-white mx-10 p-3 w-3/4">
              <h2 className="font-bold leading-7 text-[#1a365d]">
                Create Cluster
              </h2>
              <div className="text-left table-auto">
                <div className="tr">
                  <div className="th">
                    <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                      Cluster Type
                    </label>
                  </div>
                  <div className="td">
                    <div className="mt-2 border-0">
                      <select
                        onChange={handleOnChange}
                        value={clusterDetails.type}
                        name="type"
                        className="block cursor-pointer rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset    sm:text-sm sm:leading-6"
                      >
                        <option value="" disabled>
                          Cluster Type
                        </option>
                        {clusterType.map((item) => (
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
                <div className="tr">
                  <div className="th">
                    <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                      Cluster Name
                    </label>
                  </div>
                  <div className="td">
                    <div className="mt-2 border-0">
                      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset    ">
                        <input
                          type="text"
                          name="name"
                          disabled={isDisabled}
                          onChange={handleOnChange}
                          value={clusterDetails.name}
                          className={classNames(
                            isDisabled
                              ? "bg-gray-200 border-slate-300"
                              : "bg-white bg-transparent",
                            "block flex-1 rounded-md py-2 px-3 text-base text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {clusterDetails.type === "VMware" && (
                  <div className="tr">
                    <div className="th">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Vcenter IP / FQDN
                      </label>
                    </div>
                    <div className="td">
                      <div className="mt-2 border-0">
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset">
                          <input
                            type="text"
                            name="ip"
                            disabled={isDisabled}
                            onChange={handleOnChange}
                            value={clusterDetails.ip[0] || ""}
                            className={classNames(
                              isDisabled
                                ? "bg-gray-200 border-slate-300 w-300"
                                : "bg-white bg-transparent",
                              "block flex-1 rounded-md py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {clusterDetails.type === "Proxmox" && (
                  <div className="tr">
                    <div className="th">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Proxmox IP / FQDN
                      </label>
                    </div>
                    <div className="td">
                      <div className="mt-2 border-0">
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset    ">
                          <input
                            type="text"
                            name="ip"
                            disabled={isDisabled}
                            onChange={handleOnChange}
                            value={clusterDetails.ip[0] || ""}
                            className={classNames(
                              isDisabled
                                ? "bg-gray-200 border-slate-300 w-300"
                                : "bg-white bg-transparent",
                              "block flex-1 rounded-md py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="tr">
                  <div className="th">
                    <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                      Port
                    </label>
                  </div>
                  <div className="td">
                    <div className="mt-2 border-0">
                      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset    ">
                        <input
                          onChange={handleOnChange}
                          value={clusterDetails.port}
                          disabled={isDisabled}
                          type="number"
                          name="port"
                          className={classNames(
                            isDisabled
                              ? "bg-gray-200 border-slate-300"
                              : "bg-white bg-transparent",
                            "block flex-1 rounded-md py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                          )}
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
                    <div className="mt-2 border-0">
                      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset    ">
                        <input
                          type="text"
                          name="username"
                          disabled={isDisabled}
                          onChange={handleOnChange}
                          value={clusterDetails.username}
                          className={classNames(
                            isDisabled
                              ? "bg-gray-200 border-slate-300"
                              : "bg-white bg-transparent",
                            "block flex-1 rounded-md py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                          )}
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
                    <div className="mt-2 border-0">
                      <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          disabled={isDisabled}
                          onChange={handleOnChange}
                          value={clusterDetails.password}
                          className={classNames(
                            isDisabled
                              ? "bg-gray-200 border-slate-300"
                              : "bg-white bg-transparent",
                            "block flex-1 rounded-md py-1.5 pl-1 pr-8 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <i className="fa-solid fa-eye-slash"></i>
                          ) : (
                            <i className="fa-solid fa-eye"></i>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="tr">
                  <div className="th">
                    <label
                      htmlFor="username"
                      className="block text-sm font-medium leading-6 text-gray-900 border-0"
                    >
                      Insecure Skip Verify
                    </label>
                  </div>
                  <div className="td">
                    <div className="mt-2 border-0">
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="tls"
                          disabled={isDisabled}
                          onChange={handleChange}
                          ref={checkboxRef}
                          checked={clusterDetails.tls}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {!isClusterCreated && (
            <div className="buttons ml-10 mt-5 pl-5 flex items-start justify-start">
              <button
                onClick={handleOnClick}
                disabled={isDisabled || isLoading}
                type="submit"
                className="rounded-md bg-[#1a365dcc] px-4 py-3 text-sm font-semibold text-[#f5f5f5] shadow-sm hover:bg-[#1a365d] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a365d] flex items-center justify-center"
              >
                {isLoading ? (
                  <CircularProgress
                    size={20}
                    color="inherit"
                    className="mr-2"
                  />
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          )}
        </div>
        {createdClusterId && clusterDetails.type === "Proxmox" && (
          <div className="monitoring-section mt-0 mx-10 p-3 relative">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={monitoringEnabled}
                onChange={handleMonitoringCheckbox}
                disabled={
                  monitoringLoading || clusterDetails.type !== "Proxmox"
                }
              />
              <span className="font-medium text-gray-800">Monitoring</span>
              {monitoringLoading && (
                <CircularProgress size={16} color="inherit" />
              )}
            </label>
            {showMonitoringConfirm && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <span className="text-base font-semibold text-gray-800 mb-4  text-center">
                    You want to integrate InfluxDB into Proxmox ?
                  </span>
                  <div className="flex gap-6">
                    <button
                      className="px-4 py-1 rounded-md bg-[#1a365d]/80 text-white font-semibold hover:bg-[#1a365d]`"
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
            {influxAlreadyIntegrated && (
              <div className="mb-2 p-2 text-indigo-900 font-semibold text-center">
                InfluxDB integration to Proxmox is already there.
              </div>
            )}
            {monitoringEnabled && monitoringData && (
              <div className="p-8 rounded-md shadow-sm bg-white mt-0">
                <h3 className="text-lg font-semibold text-indigo-800 mb-1 pb-1">
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
                        value={monitoringData.organization || ""}
                        className={classNames(
                          isDisabled
                            ? "bg-gray-200 border-slate-300"
                            : "bg-white bg-transparent",
                          "w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400     border-2"
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
                        value={monitoringData.bucket || ""}
                        className={classNames(
                          isDisabled
                            ? "bg-gray-200 border-slate-300"
                            : "bg-white bg-transparent",
                          "w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400     border-2"
                        )}
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
                        value={monitoringData.server || ""}
                        className={classNames(
                          isDisabled
                            ? "bg-gray-200 border-slate-300"
                            : "bg-white bg-transparent",
                          "w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400     border-2"
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
                        value={monitoringData.port || ""}
                        className={classNames(
                          isDisabled
                            ? "bg-gray-200 border-slate-300"
                            : "bg-white bg-transparent",
                          "w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400     border-2"
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
                          monitoringData.influxdbproto ||
                          monitoringData.proto ||
                          ""
                        }
                        className={classNames(
                          isDisabled
                            ? "bg-gray-200 border-slate-300"
                            : "bg-white bg-transparent",
                          "w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400     border-2"
                        )}
                      />
                    </div>
                  </div>
                  <div className="tr flex items-center mb-2">
                    <div className="th w-40 flex-shrink-0">
                      <label className="block mt-2 flex items-start text-sm font-medium leading-6 text-gray-900 border-0">
                        InfluxDB API Token{" "}
                        <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="td flex-1 flex items-center">
                      <input
                        type={showApiToken ? "text" : "password"}
                        value={srcApiToken}
                        onChange={(e) => setSrcApiToken(e.target.value)}
                        placeholder="Enter source API token"
                        className={classNames(
                          "w-72 rounded-md py-1 px-2 text-base text-gray-900 placeholder:text-gray-400 border-2"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiToken((prev) => !prev)}
                        className="ml-2 flex items-center px-2 focus:outline-none"
                        tabIndex={-1}
                        aria-label={
                          showApiToken ? "Hide API token" : "Show API token"
                        }
                      >
                        {showApiToken ? (
                          <FaEyeSlash
                            style={{
                              border: "1px solid #d1d5db",
                              borderRadius: "3px",
                              border: "none",
                            }}
                          />
                        ) : (
                          <FaEye
                            style={{
                              border: "1px solid #d1d5db",
                              borderRadius: "3px",
                              border: "none",
                            }}
                          />
                        )}
                      </button>
                    </div>
                    <button
                      className="ml-4 px-4 py-2 bg-[#1a365d]/80 text-white rounded"
                      onClick={handleMigrate}
                      disabled={migrateLoading}
                    >
                      {migrateLoading ? "Starting..." : "OK"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {!monitoringEnabled && !showMonitoringConfirm && (
              <div className="flex justify-left mt-4">
                <button
                  className="px-4 py-2 bg-[#1a365d]/80 text-white rounded"
                  onClick={() => navigate("/clusters")}
                >
                  OK
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClusterCreationForm;
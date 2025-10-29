import React, { useContext, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { PoolContext } from "../../Context/PoolContext";
import {
  fetchAssignedUsersService,
  fetchMachineDetailsService,
  deleteAssignedUserService,
  addUserToMachineService,
  deletePoolService,
  deleteVMService,
  listGuacamoleUsersService,
  rebootVMService,
  shutdownVMService,
  startVMService,
  stopVMService,
  rebuildVMService,
  fetchPoolMachinesService
} from "../../Services/PoolService";
import "./css/ShowPools.css";
import styles from "./ManagePool.module.css";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import EditMachinePopover from "./EditMachinePopover";
import EntitleUser from "./EntitleUser";
import { Slide, toast } from "react-toastify";
import {
  FaCheckCircle,
  FaPowerOff,
  FaRedo,
  FaPlay,
  FaStop,
  FaTrash,
} from "react-icons/fa";
import {
  AiOutlineLoading3Quarters,
  AiOutlineCloseCircle,
} from "react-icons/ai";
import AddMachinePopover from "./AddMachinePopover";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { Box, Skeleton } from "@mui/material";
import { Loader2 } from "lucide-react";
import CircularProgress from "@mui/material/CircularProgress";
import "../Reports/ReportList.css";
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const ManagePool = (props) => {
  const [usersLoading, setUsersLoading] = useState(false);
  const [machinesLoading, setMachinesLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const [deletingMachine, setDeletingMachine] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const token = props.token;
  let userEmail = props.tokenParsed?.preferred_username || "Unknown User";
  const pc = useContext(PoolContext);
  const pools = pc.availablePools || [];
  const [selectedPoolDetails, setSelectedPoolDetails] = useState({});
  const [loading, setLoading] = useState(false);
  let [poolId, setPoolId] = useState(useParams().id);
  const [isLoadingMachine, setIsLoadingMachine] = useState(false);
  useEffect(() => {
    const foundPool = pools.find((pool) => String(pool.id) === String(poolId));
    setSelectedPoolDetails(foundPool || {});
  }, [poolId, pools]);
  const navigate = useNavigate();
  let [vmAvailable, setVmAvailable] = useState([]);
  let [assignedUsers, setAssignedUsers] = useState([]);
  let [users, setUsers] = useState([]);
  let [selectedVm, setSelectedVm] = useState();
  let [selectedVmIdentifier, setSelectedVmIdentifier] = useState();
  const [showEntitlePopup, setShowEntitlePopup] = useState(false);
  const [open, setOpen] = useState(false);
  const [editMachinePopupOpen, setEditMachinePopupOpen] = useState(false);
  const [poolType, setPoolType] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(users);
  const [powerActionLoading, setPowerActionLoading] = useState(null);
  const [selectedTab, setSelectedTab] = useState("users");
  const [selectedVmDetails, setSelectedVmDetails] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [actionDropdown, setActionDropdown] = useState(null); 
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const ellipsisRefs = useRef({});
  const entitlePopup = () => {
    if (selectedVm != null) {
      setShowEntitlePopup(true);
    } else {
      setShowEntitlePopup(false);
      toast.error("Select any machine to entitle", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
    }
  };

  const editPool = () => {
    navigate(`/pools/edit-pool/${selectedPoolDetails.id}`);
  };

  const fetchAssignedUsers = async (machineIdentifier, machineId) => {
    setUsersLoading(true);
    setSelectedVm(machineId);
    setSelectedVmIdentifier(machineIdentifier);
    try {
      const assignedUsersData = await fetchAssignedUsersService(token, machineId);
      setAssignedUsers(assignedUsersData);
    } catch (error) {
      setAssignedUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const [vmDetailsMap, setVmDetailsMap] = useState({});

  useEffect(() => {
    if (!Array.isArray(vmAvailable) || vmAvailable.length === 0) return;
    const vmIds = vmAvailable.map((vm) => vm.vm_id).filter(Boolean);

    const fetchAllVmDetails = async () => {
      try {
        const promises = vmIds.map((vmid) =>
          fetchMachineDetailsService(token, vmid)
        );
        const results = await Promise.allSettled(promises);

        const detailsMap = {};
        results.forEach((result, idx) => {
          if (result.status === "fulfilled" && result.value) {
            detailsMap[vmIds[idx]] = result.value;
          }
        });
        setVmDetailsMap(detailsMap);
      } catch (err) {
        setVmDetailsMap({});
      }
    };

    fetchAllVmDetails();
  }, [vmAvailable, token]);

  let fetchMachineDetails = async (vm_id) => {
    setIsLoadingMachine(true);
    try {
      const details = await fetchMachineDetailsService(token, vm_id);
      setSelectedVmDetails(details);
    } catch (err) {
      setSelectedVmDetails(null);
    } finally {
      setIsLoadingMachine(false);
    }
  };

  let handleMachineRowClick = (
    machineIdentifier,
    machineId,
    vm_id,
    pool_type
  ) => {
    if (selectedVm === machineId) {
      setSelectedVm(null);
      setSelectedVmIdentifier(null);
      setAssignedUsers([]);
      setSelectedVmDetails(null);
      return;
    }
    setSelectedVm(machineId);
    setSelectedVmIdentifier(machineIdentifier);
    fetchAssignedUsers(machineIdentifier, machineId);
    if (pool_type === "Automated") {
      fetchMachineDetails(vm_id);
    }
  };

  let deleteAssignedUser = async (user) => {
    setDeletingUser(user);
    try {
      const res = await deleteAssignedUserService(token, selectedVmIdentifier, user);
      if (res.data && res.data?.data?.users_assigned) {
        setAssignedUsers([...res.data.data.users_assigned]);
        toast.success(res.data.msg, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Slide,
        });
      }
      pc.setAvailablePools(res.data?.data?.pools);
    } catch (error) {
      toast.error("Failed", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
    } finally {
      setDeletingUser(null);
    }
  };

  useEffect(() => {
    const fetchVMs = async () => {
      if (!selectedPoolDetails.id) return;
      setMachinesLoading(true);
      try {
        const data = await fetchPoolMachinesService(token, selectedPoolDetails.id);
        if (Array.isArray(data)) {
          setVmAvailable(data);
        } else {
          setVmAvailable([]);
        }
      } catch (err) {
        setVmAvailable([]);
      } finally {
        setMachinesLoading(false);
      }
    };
    fetchVMs();
  }, [selectedPoolDetails.id, token]);

  const handleSearch = (e) => {
    try {
      const searchText = e.target.value.toLowerCase();
      const filteredResults = users.filter((user) =>
        user.username.toLowerCase().includes(searchText)
      );
      setFilteredData(filteredResults);
      setSearchTerm(searchText);
    } catch (err) {
      setFilteredData([]);
    }
  };

  let entitleUser = async (usr) => {
    setUsersLoading(true);
    try {
      const res = await addUserToMachineService(token, selectedVmIdentifier, usr);
      if (res.data && res.data?.data?.users_assigned) {
        setAssignedUsers([...res.data?.data?.users_assigned]);
        toast.success(res.data.msg, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Slide,
        });
      }
      pc.setAvailablePools(res.data?.data?.pools);
    } catch (error) {
      toast.error("Failed", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
    } finally {
      setUsersLoading(false);
    }
  };

  let deletePool = async () => {
    if (!window.confirm("Are you sure you want to delete this pool?")) {
      return;
    }
    setIsLoading(true);
    let userEmail = props.tokenParsed?.preferred_username || "Unknown User";
    try {
      const res = await deletePoolService(token, selectedPoolDetails.id, userEmail);
      if (res.data.code === 200) {
        pc.setAvailablePools(res.data?.data?.pools);
        toast.success("Pool deleted successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Slide,
        });
        navigate("/pools");
        if (res.data?.data?.available_pools.length === 0) {
          pc.setIsPoolAvailable(false);
        }
      } else {
        setLoading(false);
        toast.error("Failed to delete machine", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Slide,
        });
      }
    } catch (err) {
      setLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  let [editMachineDetails, setEditMachineDetails] = useState();
  let editVM = (mach) => {
    setEditMachineDetails(mach);
    setEditMachinePopupOpen(true);
  };

  let deleteVM = async (mach) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this machine?"
    );
    if (!confirmed) return;
    setDeletingMachine(mach);
    let userEmail = props.tokenParsed?.preferred_username || "Unknown User";
    try {
      const res = await deleteVMService(token, mach, userEmail);
      setVmAvailable([...res.data?.data?.machines] || []);
      toast.success(res.data.msg, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
    } catch (err) {
      setLoading(false);
      toast.error("Failed to delete machine", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
    } finally {
      setDeletingMachine(null);
    }
  };

  useEffect(() => {
    listGuacamoleUsersService(token)
      .then((res) => {
        const availableUsers = res.data?.data.filter(
          (user) => !assignedUsers.includes(user.username)
        );
        setUsers(availableUsers);
        setFilteredData(availableUsers);
      })
      .catch((err) => {
        setUsers([]);
        setFilteredData([]);
      });
  }, [assignedUsers, token]);

  const refreshMachines = async () => {
    if (!selectedPoolDetails.id) return;
    try {
      const data = await fetchPoolMachinesService(token, selectedPoolDetails.id);
      if (Array.isArray(data)) {
        setVmAvailable(data);
      }
    } catch (err) {
      setVmAvailable([]);
    }
  };

  const checkboxRef = useRef(null);
  const Goback = () => {
    navigate("/pools");
  };

  function capitalizeStatus(status) {
    if (!status) return "";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  const selectedVmObj = vmAvailable.find((vm) => vm.id === selectedVm);

  const handleReboot = async () => {
    if (!selectedVm) return;
    setPowerActionLoading("reboot");
    try {
      await rebootVMService(token, userEmail, selectedVmObj.vm_id, poolId);
      toast.success("VM reboot triggered");
      refreshMachines();
    } catch (err) {
      toast.error("Failed to reboot VM");
    } finally {
      setPowerActionLoading(null);
    }
  };

  const handleShutdown = async () => {
    if (!selectedVm) return;
    setPowerActionLoading("shutdown");
    try {
      await shutdownVMService(token, userEmail, selectedVmObj.vm_id, poolId);
      toast.success("VM shutdown triggered");
      refreshMachines();
    } catch (err) {
      toast.error("Failed to shutdown VM");
    } finally {
      setPowerActionLoading(null);
    }
  };

  const handleStart = async () => {
    if (!selectedVm) return;
    setPowerActionLoading("start");
    try {
      await startVMService(token, userEmail, selectedVmObj.vm_id, poolId);
      toast.success("VM started successfully");
      refreshMachines();
    } catch (err) {
      toast.error("Failed to start VM");
    } finally {
      setPowerActionLoading(null);
    }
  };

  const handleStop = async () => {
    if (!selectedVm) return;
    setPowerActionLoading("stop");
    try {
      await stopVMService(token, userEmail, selectedVmObj.vm_id, poolId);
      toast.success("VM stopped successfully");
      refreshMachines();
    } catch (err) {
      toast.error("Failed to stop VM");
    } finally {
      setPowerActionLoading(null);
    }
  };

  const handleRebuildVM = async (item) => {
    if (!item?.identifier) return;

    // Show confirmation dialog before proceeding
    const confirmed = window.confirm("Do you want to rebuild this machine?");
    if (!confirmed) return;

    setPowerActionLoading("rebuild-" + item.identifier);

    try {
      const data = await rebuildVMService(token, userEmail, item.vm_id, poolId);
      if (data.error || (data.status && data.status === "error")) {
        toast.error(data.msg || "Failed to rebuild VM");
      } else {
        toast.success(data.msg || "VM rebuild triggered");
        refreshMachines();
      }
    } catch (err) {
      toast.error("Failed to rebuild VM");
    } finally {
      setPowerActionLoading(null);
    }
  };
  // Checkbox select all handler (optional, for header checkbox)
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(vmAvailable.map((vm) => vm.id));
    } else {
      setSelectedRows([]);
    }
  };

  // Single row checkbox handler
  const handleRowCheckbox = (vmId) => {
    setSelectedRows((prev) =>
      prev.includes(vmId) ? prev.filter((id) => id !== vmId) : [...prev, vmId]
    );
  };

  const skeletonCellWidths = [
    "w-32", // Name
    "w-16", // Protocol
    "w-14", // Port
    "w-28", // IP Address
    "w-24", // Host/Node
    "w-24", // Datastores
    "w-20", // Agent Enabled
    "w-20", // Entitle
    "w-24", // Status
    "w-20", // Custom Settings
    "w-28", // Actions
  ];

  const skeletonRows = Array.from({ length: 8 }).map((_, i) => (
    <tr key={i} className="border-b border-gray-100">
      {skeletonCellWidths.map((width, j) =>
        j === 10 ? (
          // Actions: Circle placeholders for icons/buttons
          <td key={j} className="py-4 px-3">
            <div className="flex gap-2">
              <div className="h-6 w-6 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-6 w-6 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-6 w-12 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          </td>
        ) : (
          <td key={j} className="py-4 px-3">
            <div
              className={`h-5 ${width} bg-gray-100 rounded-md animate-pulse`}
            />
          </td>
        )
      )}
    </tr>
  ));

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    setMachinesLoading(true);
    try {
      await refreshMachines();
    } finally {
      setRefreshing(false);
      setMachinesLoading(false);
    }
  };
  return (
    <div className="w-[98%] h-[90vh] m-auto bg-white rounded-lg p-4 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-4">
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
        <h2 className="text-lg font-semibold text-gray-700">
          Pool Name:{" "}
          <span className="font-normal text-gray-600">
            {selectedPoolDetails.pool_name || "—"}
          </span>
        </h2>
        <div className="flex gap-2 items-center">
          {/* <div className="relative"> */}
          {/* <button
              onClick={() => setShowStatusDropdown((prev) => !prev)}
              className="bg-indigo-500 hover:bg-indigo-700 hover:text-gray-300 text-white rounded-md px-3 py-2 text-sm font-medium"
            >
              Status
            </button>
            {showStatusDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded border border-gray-200 z-50">
                <button
                  onClick={() =>
                    selectedRows.length > 0 && handleStatusAction("enable")
                  }
                  disabled={selectedRows.length === 0}
                  className={`px-4 py-2 text-sm  text-left whitespace-nowrap ${
                    selectedRows.length === 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "hover:bg-indigo-50"
                  }`}
                >
                  Enter maintenance mode
                </button>
                <button
                  onClick={() =>
                    selectedRows.length > 0 && handleStatusAction("disable")
                  }
                  disabled={selectedRows.length === 0}
                  className={`px-4 py-2 text-sm w-full text-left whitespace-nowrap ${
                    selectedRows.length === 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "hover:bg-indigo-50"
                  }`}
                >
                  Exit maintenance mode
                </button>
              </div>
            )}
          </div> */}

          {/* Add Machine button and popover */}
          <div className="relative">
            <div className="bg-[#1a365d]/80 hover:bg-[#1a365d] hover:text-white text-[#f5f5f5] rounded-md px-3 py-2 text-sm font-medium flex items-center gap-1 cursor-pointer">
              <PlusIcon className="h-4 w-4 text" />
              <button
                type="button"
                id="options-menu"
                aria-expanded="true"
                aria-haspopup="true"
                onClick={() => setOpen(!props.isOpen)}
              >
                Add Machine
              </button>
            </div>
            <AddMachinePopover
              open={open}
              setOpen={setOpen}
              poolId={poolId}
              vmAvailable={vmAvailable}
              setVmAvailable={setVmAvailable}
              selectedPoolDetails={selectedPoolDetails}
              onSuccess={refreshMachines}
            />
            <EditMachinePopover
              open={editMachinePopupOpen}
              setOpen={setEditMachinePopupOpen}
              poolId={poolId}
              vmAvailable={vmAvailable}
              setVmAvailable={setVmAvailable}
              selectedPoolDetails={selectedPoolDetails}
              machineDetails={editMachineDetails}
              onSuccess={refreshMachines}
            />
          </div>

          <button
            className="bg-[#1a365d]/80 hover:bg-[#1a365d] hover:text-white text-[#f5f5f5] rounded-md px-3 py-2 text-sm font-medium"
            onClick={entitlePopup}
          >
            Entitle
          </button>

          <button
            className="bg-[#1a365d]/80 text-[#f5f5f5] hover:bg-[#1a365d] rounded-md px-3 py-2 text-sm font-medium"
            onClick={editPool}
          >
            Edit Pool
          </button>

          <button
            className={`bg-red-500 hover:bg-red-600 text-white rounded-md px-3 py-2 text-sm font-semibold flex items-center gap-2 ${
              isLoading ? "cursor-not-allowed opacity-75" : ""
            }`}
            onClick={deletePool}
            type="button"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isLoading ? "Deleting..." : "Delete Pool"}</span>
          </button>

          <button
            className={`bg-[#1a365d]/80 text-[#f5f5f5] hover:bg-[#1a365d] rounded-md px-3 py-2 text-sm font-medium flex items-center gap-2 ${
              refreshing || machinesLoading
                ? "cursor-not-allowed opacity-75"
                : ""
            }`}
            onClick={handleRefresh}
            title="Refresh"
            disabled={refreshing || machinesLoading}
          >
            {refreshing || machinesLoading ? (
              <AiOutlineLoading3Quarters className="animate-spin h-4 w-4" />
            ) : (
              <FaRedo className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto rounded-md bg-white custom-scrollbar border border-gray-100">
          {machinesLoading ? (
            <Box sx={{ width: "100%", mt: 2 }}>
              <div className={styles["table-responsive"]}>
                <table className="tableRow  custom-scrollbar skeleton-loading">
                  <thead className="bg-[#F0F8FFCC] text-[#00000099] font-bold uppercase text-[0.8rem] leading-normal sticky top-0 z-10">
                    <tr>
                      {/* Add the header checkbox for select all */}
                      {/* <th className="py-2 px-3 text-left whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.length > 0 &&
                        selectedRows.length === vmAvailable.length
                      }
                      onChange={handleSelectAll}
                      aria-label="Select all machines"
                    />
                  </th> */}
                      {[
                        "Name",
                        "Protocol",
                        "Port",
                        "IP Address",
                        "Host/Node",
                        "Datastores",
                        "Agent Enabled",
                        "Entitle",
                        "Status",
                        "Custom Settings",
                        "Actions",
                      ].map((header, index) => (
                        <th
                          key={index}
                          className="py-2 px-3 text-center whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>{skeletonRows}</tbody>
                </table>
              </div>
            </Box>
          ) : vmAvailable.length > 0 ? (
            <div className={styles["table-responsive"]}>
              <table className="min-w-full bg-white text-sm border-collapse">
                <thead className="bg-[#F0F8FFCC] text-[#00000099] font-bold uppercase text-[0.8rem] leading-normal sticky top-0 z-10">
                  <tr>
                    {/* Add the header checkbox for select all */}
                    {/* <th className="py-2 px-3 text-left whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.length > 0 &&
                        selectedRows.length === vmAvailable.length
                      }
                      onChange={handleSelectAll}
                      aria-label="Select all machines"
                    />
                  </th> */}
                    {[
                      "Name",
                      "Protocol",
                      "Port",
                      "IP Address",
                      ...(selectedPoolDetails.pool_type !== "Manual"
                        ? ["Host/Node"]
                        : []),
                      ...(selectedPoolDetails.pool_type !== "Manual"
                        ? ["Datastores"]
                        : []),
                      ...(selectedPoolDetails.pool_type !== "Manual"
                        ? ["Agent Enabled"]
                        : []),
                      "Entitle",
                      ...(selectedPoolDetails.pool_type !== "Manual"
                        ? ["Status"]
                        : []),
                      "Custom Settings",
                      "Actions",
                    ].map((header, index) => (
                      <th
                        key={index}
                        className="py-2 px-3 text-center whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vmAvailable
                    .sort((a, b) => {
                      const nameA = a.name || "";
                      const nameB = b.name || "";
                      return nameA.localeCompare(nameB);
                    })
                    .map((item) => (
                      <tr
                        key={item.identifier}
                        className={`text-center border-b border-gray-200 ${
                          selectedVm === item.id
                            ? "bg-[#F0F8FFCC] cursor-pointer"
                            : "hover:bg-[#F0F8FFCC] cursor-pointer"
                        }`}
                        onClick={() =>
                          handleMachineRowClick(
                            item.identifier,
                            item.id,
                            item.vm_id,
                            selectedPoolDetails.pool_type
                          )
                        }
                      >
                        {/* Add the row checkbox */}
                        {/* <td className="py-2 px-3" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.id)}
                          onChange={() => handleRowCheckbox(item.id)}
                          aria-label={`Select machine ${item.name}`}
                        />
                      </td> */}
                        <td className="py-2 px-3">{item.name}</td>
                        <td className="py-2 px-3">{item.protocol}</td>
                        <td className="py-2 px-3">{item.port}</td>
                        <td className="py-2 px-3">
                          {vmDetailsMap[item.vm_id]?.ip_address?.join(", ") ||
                            item.hostname ||
                            "N/A"}
                        </td>
                        {selectedPoolDetails.pool_type !== "Manual" && (
                          <td className="py-2 px-3">
                            {vmDetailsMap[item.vm_id]?.node ||
                              item.node ||
                              "Loading..."}
                          </td>
                        )}
                        {/* Datastores column (only for non-Manual) */}
                        {selectedPoolDetails.pool_type !== "Manual" && (
                          <td className="py-2 px-3">
                            {vmDetailsMap[item.vm_id]?.datastores?.join(", ") ||
                              item.datastore ||
                              "Loading..."}
                          </td>
                        )}
                        {/* Agent Enabled column (only for non-Manual) */}
                        {selectedPoolDetails.pool_type !== "Manual" && (
                          <td className="py-2 px-3">
                            {vmDetailsMap[item.vm_id]?.agent_enabled
                              ? "Yes"
                              : "No"}
                          </td>
                        )}
                        <td className="py-2 px-3">
                          {Array.isArray(item.users_assigned) &&
                          item.users_assigned.length > 0
                            ? item.users_assigned.length === 1
                              ? item.users_assigned[0]
                              : `${item.users_assigned[0]}.....`
                            : "—"}
                        </td>
                        {/* Status column (only for non-Manual) */}
                        {selectedPoolDetails.pool_type !== "Manual" && (
                          <td className="py-2 px-3">
                            {item.status === "COMPLETED" && (
                              <span className="flex items-center gap-1">
                                <FaCheckCircle className="text-green-500 text-sm" />
                                <span className="text-green-600">
                                  {capitalizeStatus(item.status)}
                                </span>
                                <span className="text-gray-600">
                                  {item.error_message &&
                                    ` - ${item.error_message}`}
                                </span>
                              </span>
                            )}
                            {item.status === "RUNNING" && (
                              <span className="flex items-center gap-1">
                                <AiOutlineLoading3Quarters className="animate-spin text-blue-500 text-sm" />
                                <span className="text-blue-600">
                                  {capitalizeStatus(item.status)}
                                </span>
                                <span className="text-gray-700">
                                  {item.error_message &&
                                    ` - ${item.error_message}`}
                                </span>
                              </span>
                            )}
                            {item.status === "FAILED" && (
                              <span className="flex items-center gap-1">
                                <AiOutlineCloseCircle className="text-red-500 text-sm" />
                                <span className="text-red-600">
                                  {capitalizeStatus(item.status)}
                                </span>
                                <span className="text-gray-700">
                                  {item.error_message &&
                                    ` - ${item.error_message}`}
                                </span>
                              </span>
                            )}
                            {item.status === "TERMINATED" && (
                              <span className="flex items-center gap-1">
                                <Loader2 className="animate-spin text-yellow-500 text-sm" />
                                <span className="text-yellow-600">
                                  {capitalizeStatus(item.status)}
                                </span>
                                <span className="text-gray-700">
                                  {item.error_message &&
                                    ` - ${item.error_message}`}
                                </span>
                              </span>
                            )}
                            {item.status === "CANCELED" && (
                              <span className="flex items-center gap-1">
                                <Loader2 className="animate-spin text-gray-500 text-sm" />
                                <span className="text-gray-600">
                                  {capitalizeStatus(item.status)}
                                </span>
                                <span className="text-gray-700">
                                  {item.error_message &&
                                    ` - ${item.error_message}`}
                                </span>
                              </span>
                            )}
                          </td>
                        )}
                        <td
                          className="py-2 px-3 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {item.is_custom_machine ? (
                            // <i className="fa-regular fa-circle-check text-indigo-500 text-lg hover:text-indigo-700"></i>
                            <p className="text-green-600 font-semibold">
                              Enabled
                            </p>
                          ) : (
                            // <i className="fa-regular fa-circle-xmark text-red-400 text-lg hover:text-red-700"></i>
                            <p className="text-red-600 font-semibold">
                              Disabled
                            </p>
                          )}
                        </td>
                        <td
                          className="py-2 px-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-3">
                            <i
                              className="fa-solid fa-ellipsis-vertical text-xl cursor-pointer hover:text-indigo-700"
                              ref={(el) =>
                                (ellipsisRefs.current[item.identifier] = el)
                              }
                              onClick={(e) => {
                                if (actionDropdown === item.identifier) {
                                  setActionDropdown(null);
                                } else {
                                  const rect =
                                    ellipsisRefs.current[
                                      item.identifier
                                    ]?.getBoundingClientRect();
                                  setDropdownPos({
                                    top: rect
                                      ? rect.bottom + window.scrollY
                                      : 0,
                                    left: rect
                                      ? rect.left + window.scrollX - 115
                                      : 0, // shift left by dropdown width
                                  });
                                  setActionDropdown(item.identifier);
                                }
                              }}
                            ></i>
                            {actionDropdown === item.identifier &&
                              createPortal(
                                <div
                                  style={{
                                    position: "absolute",
                                    top: dropdownPos.top,
                                    left: dropdownPos.left,
                                    zIndex: 9999,
                                    minWidth: 140,
                                    background: "white",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: 8,
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
                                >
                                  <button
                                    className="px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2 text-left"
                                    onClick={(e) => {
                                      editVM(item);
                                    }}
                                  >
                                    <PencilSquareIcon className="h-4 w-4 text-indigo-400" />{" "}
                                    Edit
                                  </button>
                                  <button
                                    className="px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2 text-left"
                                    onClick={(e) => {
                                      if (!deletingMachine) {
                                        deleteVM(item.identifier);
                                      }
                                    }}
                                    disabled={!!deletingMachine}
                                  >
                                    {deletingMachine === item.identifier ? (
                                      <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                                    ) : (
                                      <TrashIcon className="h-4 w-4 text-red-400" />
                                    )}
                                    {deletingMachine === item.identifier
                                      ? "Deleting..."
                                      : "Delete"}
                                  </button>
                                  {selectedPoolDetails.pool_type ==
                                    "Automated" &&
                                    item.status !== "RUNNING" && (
                                      <button
                                        className={`px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2 text-left ${
                                          powerActionLoading ===
                                          "rebuild-" + item.identifier
                                            ? "text-black cursor-not-allowed"
                                            : "text-black"
                                        }`}
                                        onClick={(e) => {
                                          handleRebuildVM(item);
                                        }}
                                        disabled={
                                          powerActionLoading ===
                                          "rebuild-" + item.identifier
                                        }
                                      >
                                        {powerActionLoading ===
                                        "rebuild-" + item.identifier ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <FaRedo className="h-4 w-4" />
                                        )}
                                        Rebuild
                                      </button>
                                    )}
                                  {selectedPoolDetails.pool_type ==
                                    "Automated" && (
                                    <button
                                      className={`px-4 py-2 hover:bg-blue-50 text-sm flex items-center gap-2 text-left  border-t border-gray-100`}
                                      onClick={() => {
                                        navigate(
                                          `/pools/${poolId}/vm/${item.vm_id}/task-manager`,
                                          {
                                            state: {
                                              os_type: item.os_type, 
                                              vm_name: item.name, 
                                            },
                                          }
                                        );
                                      }}
                                    >
                                      <i className="fa-solid fa-list-check text-blue-500"></i>{" "}
                                      Task Manager
                                    </button>
                                  )}
                                </div>,
                                document.body
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-[60vh] w-full flex justify-center items-center text-gray-500">
              No machines available
            </div>
          )}
        </div>

        {selectedVm && (
          <div className="w-1/3 min-w-[280px] max-w-[380px] bg-white rounded-md border border-gray-100 p-4 flex flex-col">
            <div className="mb-4">
              <div className="flex gap-3 border-b">
                <button
                  className={`pb-2 text-sm relative transition-all duration-300 ${
                    selectedTab === "users"
                      ? "text-[#1a365d] font-semibold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#1a365d]"
                      : "text-gray-600 hover:text-[#1a365d]"
                  }`}
                  onClick={() => setSelectedTab("users")}
                >
                  Assigned Users
                </button>
                {selectedPoolDetails.pool_type == "Automated" && (
                  <button
                    className={`pb-2 text-sm relative transition-all duration-300 ${
                      selectedTab === "VM-Details"
                        ? "text-[#1a365d]  font-semibold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#1a365d]"
                        : "text-gray-600 hover:text-[#1a365d]"
                    }`}
                    onClick={() => setSelectedTab("VM-Details")}
                  >
                    Machine Details
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {selectedTab === "users" && (
                <>
                  {usersLoading ? (
                    <div className="py-6">
                      {[...Array(4)].map((_, idx) => (
                        <div
                          className="flex justify-between items-center border-b py-2"
                          key={idx}
                        >
                          <Skeleton variant="text" width={120} height={24} />
                          <Skeleton variant="circular" width={20} height={20} />
                        </div>
                      ))}
                    </div>
                  ) : assignedUsers.length > 0 ? (
                    assignedUsers.sort().map((item) => (
                      <div
                        className="flex justify-between items-center border-b py-2"
                        key={item}
                      >
                        <p className="text-gray-600 text-sm">{item}</p>
                        {deletingUser === item ? (
                          <CircularProgress
                            size={20}
                            style={{ color: "red" }}
                          />
                        ) : (
                          <FaTrash
                            className="text-red-400 cursor-pointer hover:text-red-600"
                            onClick={() => deleteAssignedUser(item)}
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center">
                      No Users Assigned
                    </p>
                  )}
                </>
              )}

              {selectedTab === "VM-Details" && (
                <div className="mt-2 p-2 rounded text-sm text-gray-800 mb-2">
                  {isLoadingMachine ? (
                    <div className="flex flex-col gap-3 w-full">
                      {[...Array(4)].map((_, idx) => (
                        <div
                          key={idx}
                          className="mb-3 flex flex-row items-start"
                        >
                          <Skeleton variant="text" width={120} height={24} />
                          <span className="mx-3 text-gray-700 font-bold">
                            :
                          </span>
                          <Skeleton variant="text" width={140} height={24} />
                        </div>
                      ))}
                    </div>
                  ) : selectedVmDetails ? (
                    <div className="flex flex-col w-full">
                      <div className="ml-1">
                        {[
                          {
                            label: "Host",
                            value:
                              selectedVmDetails.node ||
                              selectedVmDetails.host ||
                              "N/A",
                          },
                          {
                            label: "Datastores",
                            value:
                              selectedVmDetails.datastores?.join(", ") || "N/A",
                          },
                          {
                            label: "IP Addresses",
                            value:
                              selectedVmDetails.ip_addresses?.join(", ") ||
                              "N/A",
                          },
                          {
                            label: "Agent Enabled",
                            value: selectedVmDetails.agent_enabled
                              ? "Yes"
                              : "No",
                          },
                        ].map(({ label, value }) => (
                          <div
                            key={label}
                            className="mb-3 flex flex-row items-start"
                          >
                            <span className="text-gray-800 min-w-[120px]">
                              {label}
                            </span>
                            <span className="mx-3 text-gray-700 font-bold">
                              :
                            </span>
                            <span className="text-gray-600">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">No details available.</div>
                  )}
                </div>
              )}
            </div>

            {selectedPoolDetails.pool_type == "Automated" &&
              selectedVmObj.status === "COMPLETED" && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
                    Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Start */}
                    <button
                      onClick={handleStart}
                      className={`
              flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${
                selectedVmObj.error_message === "power-off" &&
                !powerActionLoading
                  ? "bg-white hover:bg-gray-200 text-green-600"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
              }
            `}
                      disabled={
                        selectedVmObj.error_message !== "power-off" ||
                        powerActionLoading === "start"
                      }
                    >
                      {powerActionLoading === "start" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FaPlay className="w-3 h-3" />
                      )}
                      Start
                    </button>

                    {/* Stop */}
                    <button
                      onClick={handleStop}
                      className={`
              flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${
                selectedVmObj.error_message === "power-on" &&
                !powerActionLoading
                  ? "bg-white hover:bg-gray-200 text-red-600"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
              }
            `}
                      disabled={
                        selectedVmObj.error_message !== "power-on" ||
                        powerActionLoading === "stop"
                      }
                    >
                      {powerActionLoading === "stop" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FaStop className="w-3 h-3" />
                      )}
                      Stop
                    </button>
                    {selectedVmObj.error_message === "power-on" && (
                      <>
                        <button
                          onClick={handleReboot}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-200 text-yellow-500 rounded-md text-sm font-medium transition-colors"
                          disabled={powerActionLoading === "reboot"}
                        >
                          {powerActionLoading === "reboot" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <FaRedo className="w-3 h-3" />
                          )}
                          Reboot
                        </button>

                        <button
                          onClick={handleShutdown}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-gray-200 text-gray-600 rounded-md text-sm font-medium transition-colors"
                          disabled={powerActionLoading === "shutdown"}
                        >
                          {powerActionLoading === "shutdown" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <FaPowerOff className="w-3 h-3" />
                          )}
                          Shutdown
                        </button>
                      </>
                    )}
                    {selectedVmObj.error_message === "power-off" && (
                      <>
                        <button
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 text-yellow-400 rounded-md text-sm font-medium cursor-not-allowed opacity-60"
                          disabled
                        >
                          <FaRedo className="w-3 h-3" />
                          Reboot
                        </button>

                        <button
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 text-gray-400 rounded-md text-sm font-medium cursor-not-allowed opacity-60"
                          disabled
                        >
                          <FaPowerOff className="w-3 h-3" />
                          Shutdown
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      <EntitleUser
        showPopup={showEntitlePopup}
        setShowPopup={setShowEntitlePopup}
        selectedVm={selectedVm}
        poolId={selectedPoolDetails.id}
        assignedUsers={assignedUsers}
        setAssignedUsers={setAssignedUsers}
        entitleUser={entitleUser}
        handleSearch={handleSearch}
        searchTerm={searchTerm}
        filteredData={filteredData}
      />
    </div>
  );
};

export default ManagePool;

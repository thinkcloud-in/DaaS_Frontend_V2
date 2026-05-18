import { updatePoolStatus } from "../../Services/PoolService";
import React, { useState } from "react";
import { selectAuthToken } from "../../redux/features/Auth/AuthSelectors";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAvailablePools,
  selectIsPoolAvailable,
} from "../../redux/features/Pools/PoolsSelectors";
import "./css/ShowPools.css";
import { useNavigate } from "react-router-dom";
import { fetchPools } from "../../redux/features/Pools/PoolsThunks";

const ShowPools = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector(selectAuthToken);
  const availablePools = useSelector(selectAvailablePools);
  const isPoolAvailable = useSelector(selectIsPoolAvailable);

  // useEffect(() => {
  //   if (token) {
  //     dispatch(fetchPools(token));
  //   }
  // }, [token, dispatch]);
  const [selectedPools, setSelectedPools] = useState([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!token) return;
    setIsRefreshing(true);
    try {
      await dispatch(fetchPools(token)).unwrap();
    } catch (error) {
      console.error("Failed to refresh pools:", error);
    } finally {
      // Ensure the animation runs for at least a bit
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  let handlePoolSelection = (pool) => {
    navigate(`/pools/manage-pool/${pool.id}`, { state: { pool: pool } });
  };
  const Goback = () => {
    navigate("/");
  };

  const handleStatusAction = async (action) => {
    if (selectedPools.length === 0) return;
    const status = action === "enable" ? "enabled" : "disabled";
    try {
      const data = await updatePoolStatus(selectedPools, status);
      alert(`Pools updated: ${data.updated_pools.join(", ")}`);
      setShowStatusDropdown(false);
    } catch (error) {
      alert("Error updating pool status");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div
          onClick={Goback}
          className="ml-2 bg-[#1a365d]/80 text-[#f5f5f5] px-2 py-2 rounded-md hover:bg-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:ring-opacity-10"
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
        <h2 className="text-lg font-semibold text-gray-700">Available Pools</h2>
        <div className="flex gap-2 items-center ">
          {/* <div className="relative">
          <button
              onClick={() => setShowStatusDropdown((prev) => !prev)}
              className="bg-indigo-500 hover:bg-indigo-700 hover:text-gray-300 text-white rounded-md px-3 py-2 text-sm font-medium"
            >
              Status
            </button>
            {showStatusDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded border border-gray-200 z-50">
                <button
                  onClick={() => selectedPools.length > 0 && handleStatusAction("enable")}
                  disabled={selectedPools.length === 0}
                  className={` px-4 py-2 text-sm text-left whitespace-nowrap ${
                    selectedPools.length === 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "hover:bg-indigo-50"
                  }`}
                >
                  Enable VDI Pool
                </button>
                <button
                  onClick={() => selectedPools.length > 0 && handleStatusAction("disable")}
                  disabled={selectedPools.length === 0}
                  className={`px-4 py-2 text-sm text-left whitespace-nowrap ${
                    selectedPools.length === 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "hover:bg-indigo-50"
                  }`}
                >
                  Disable VDI Pool
                </button>
              </div>
            )}
          </div> */}

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-[#1a365d]/80 hover:bg-[#1a365d] text-[#f5f5f5] rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 flex items-center justify-center"
            title="Refresh Pools"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ${isRefreshing ? "animate-spin-custom" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          <button
            onClick={() => navigate("/pools/pool-creation-form")}
            className="bg-[#1a365d]/80 hover:bg-[#1a365d] text-[#f5f5f5] rounded-md px-3 py-2 text-sm font-medium"
          >
            + New Pool
          </button>
        </div>
      </div>

      {/* Table */}
      {isPoolAvailable && (
        <div className="flex-1 overflow-visible rounded-md bg-white table-container custom-scrollbar">
          <table className="min-w-full bg-white text-sm border-collapse">
            <thead className="bg-[#F0F8FFCC] text-[#00000099] font-bold uppercase text-[0.8rem] leading-normal sticky top-0 z-10">
              <tr>
                {/* <th className="py-2 px-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      pc.availablePools.length > 0 &&
                      selectedPools.length === pc.availablePools.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPools(pc.availablePools.map((p) => p.id));
                      } else {
                        setSelectedPools([]);
                      }
                    }}
                  />
                </th> */}
                {["Name", "Type", "Cluster Name", "Entitled", "Machines"].map(
                  (header, index) => (
                    <th
                      key={index}
                      className="py-2 px-3 text-left whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {Array.isArray(availablePools) &&
                availablePools
                  .slice()
                  .filter((item) => item && typeof item.pool_name === "string")
                  .sort((a, b) => a.pool_name.localeCompare(b.pool_name))
                  .map((item) => (
                    <tr
                      key={item.id}
                      className="text-left border-b border-gray-200 hover:bg-[#F0F8FFCC]"
                    >
                      {/* <td className="py-2 px-3">
                        <input
                          type="checkbox"
                          checked={selectedPools.includes(item.id)}
                          onChange={() => handleCheckboxChange(item.id)}
                        />
                      </td> */}
                      <td
                        className="py-2 px-3 cursor-pointer"
                        onClick={() => handlePoolSelection(item)}
                      >
                        {item.pool_name}
                      </td>
                      <td
                        className="py-2 px-3 cursor-pointer"
                        onClick={() => handlePoolSelection(item)}
                      >
                        {item.pool_type}
                      </td>
                      <td
                        className="py-2 px-3 cursor-pointer"
                        onClick={() => handlePoolSelection(item)}
                      >
                        {item.cluster ? item.cluster : "fetching..."}
                      </td>
                      <td
                        className="py-2 px-3 cursor-pointer"
                        onClick={() => handlePoolSelection(item)}
                      >
                        {item.entitled ? item.entitled : 0}
                      </td>
                      <td
                        className="py-2 px-3 cursor-pointer"
                        onClick={() => handlePoolSelection(item)}
                      >
                        {Array.isArray(item.pool_machines) &&
                        item.pool_machines.length > 0
                          ? `${item.pool_machines.length} machine${
                              item.pool_machines.length > 1 ? "s" : ""
                            }`
                          : "No machines"}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ShowPools;

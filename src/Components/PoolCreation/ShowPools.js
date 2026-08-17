import { updatePoolStatus } from "../../Services/PoolService";
import React, { useState, useEffect, useCallback } from "react";
import { selectAuthToken } from "../../redux/features/Auth/AuthSelectors";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAvailablePools,
  selectPoolsPagination,
  selectPoolsLoading,
} from "../../redux/features/Pools/PoolsSelectors";
import "./css/ShowPools.css";
import { useNavigate } from "react-router-dom";
import { Pagination } from "../Common";
import { fetchPools } from "../../redux/features/Pools/PoolsThunks";
import {
  ArrowPathIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const ShowPools = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector(selectAuthToken);
  const availablePools = useSelector(selectAvailablePools);
  const pagination = useSelector(selectPoolsPagination);
  const poolsLoading = useSelector(selectPoolsLoading);

  // const [selectedPools, setSelectedPools] = useState([]);
  // const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchList = useCallback(
    (page, size) => {
      if (token) dispatch(fetchPools({ token, page, pageSize: size }));
    },
    [token, dispatch],
  );

  useEffect(() => {
    fetchList(currentPage, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleRefresh = async () => {
    if (!token) return;
    setIsRefreshing(true);
    try {
      await dispatch(
        fetchPools({ token, page: currentPage, pageSize }),
      ).unwrap();
    } catch (error) {
      console.error("Failed to refresh pools:", error);
    } finally {
      // Ensure the animation runs for at least a bit
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchList(page, pageSize);
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
    fetchList(1, newSize);
  };

  let handlePoolSelection = (pool) => {
    navigate(`/pools/manage-pool/${pool.id}`, { state: { pool: pool } });
  };

  // const handleStatusAction = async (action) => {
  //   if (selectedPools.length === 0) return;
  //   const status = action === "enable" ? "enabled" : "disabled";
  //   try {
  //     const data = await updatePoolStatus(selectedPools, status);
  //     alert(`Pools updated: ${data.updated_pools.join(", ")}`);
  //     setShowStatusDropdown(false);
  //   } catch (error) {
  //     alert("Error updating pool status");
  //   }
  // };

  const {
    total = 0,
    total_pages = 1,
    has_next = false,
    has_prev = false,
  } = pagination;
  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  const getPageNumbers = () => {
    if (total_pages <= 7)
      return Array.from({ length: total_pages }, (_, i) => i + 1);
    const pages = [];
    const delta = 2;
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(total_pages - 1, currentPage + delta);
    pages.push(1);
    if (left > 2) pages.push("...");
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total_pages - 1) pages.push("...");
    pages.push(total_pages);
    return pages;
  };

  // Server already returns this page's pools sorted by name -- this is just
  // a defensive filter against malformed rows, not a resort.
  const pools = (Array.isArray(availablePools) ? availablePools : []).filter(
    (item) => item && typeof item.pool_name === "string",
  );

  return (
    <div className="min-h-screen text-left items-start flex flex-col w-full relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200 dark:border-gray-700 mb-6 w-full">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#1a365d] dark:text-blue-300">
              Developer Desktop Pools
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Click on any pool row to manage its virtual machines.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0">
          {/* <div className="relative">
          <button
              onClick={() => setShowStatusDropdown((prev) => !prev)}
              className="bg-indigo-500 hover:bg-indigo-700 hover:text-gray-300 text-white rounded-md px-3 py-2 text-sm font-medium"
            >
              Status
            </button>
            {showStatusDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded border border-gray-200 dark:border-gray-700 z-50">
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
            disabled={isRefreshing || poolsLoading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900/60 text-sm font-medium shadow-sm transition-all disabled:opacity-60"
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${isRefreshing || poolsLoading ? "animate-spin" : ""}`}
            />
            {isRefreshing || poolsLoading ? "Loading..." : "Refresh"}
          </button>

          <button
            onClick={() => navigate("/pools/pool-creation-form")}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1a365d] text-white hover:bg-[#153056] text-sm font-medium shadow-sm transition-all"
          >
            <PlusIcon className="h-4 w-4" />
            Create Pool
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-transparent overflow-hidden w-full">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-[#1a365d] text-white text-sm font-semibold select-none">
                {/* <th className="py-3 px-4 w-12 text-center">
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
                    <th key={index} className="py-3 px-4 whitespace-nowrap">
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm text-gray-700 dark:text-gray-300">
              {poolsLoading && pools.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <ArrowPathIcon className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading pools...
                  </td>
                </tr>
              ) : pools.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No Pools Available
                  </td>
                </tr>
              ) : (
                pools.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-blue-50/20 cursor-pointer transition-colors"
                  >
                    {/* <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedPools.includes(item.id)}
                          onChange={() => handleCheckboxChange(item.id)}
                        />
                      </td> */}
                    <td
                      className="py-3.5 px-4"
                      onClick={() => handlePoolSelection(item)}
                    >
                      {item.pool_name}
                    </td>
                    <td
                      className="py-3.5 px-4"
                      onClick={() => handlePoolSelection(item)}
                    >
                      {item.pool_type}
                    </td>
                    <td
                      className="py-3.5 px-4"
                      onClick={() => handlePoolSelection(item)}
                    >
                      {item.cluster ? item.cluster : "fetching..."}
                    </td>
                    <td
                      className="py-3.5 px-4"
                      onClick={() => handlePoolSelection(item)}
                    >
                      {item.entitled ? item.entitled : 0}
                    </td>
                    <td
                      className="py-3.5 px-4"
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {total > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={total_pages}
            onPageChange={handlePageChange}
            totalItems={total}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            itemLabel="pools"
            loading={poolsLoading}
            hasPrev={has_prev}
            hasNext={has_next}
          />
        )}
      </div>
    </div>
  );
};

export default ShowPools;

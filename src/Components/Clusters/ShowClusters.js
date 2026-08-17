import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Slide, toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import {
  deleteClusterThunk,
  fetchClustersThunk,
  updateProxmoxNodesThunk,
} from "../../redux/features/Clusters/ClustersThunks";
import {
  selectAllClusters,
  selectClustersPagination,
  selectClustersLoading,
} from "../../redux/features/Clusters/ClustersSelectors";
import {
  selectAuthToken,
  selectAuthTokenParsed,
} from "../../redux/features/Auth/AuthSelectors";
import { Pagination } from "../Common";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const columns = [
  { header: "Name", key: "name", align: "left" },
  { header: "Type", key: "type", align: "left" },
  { header: "IP", key: "ip", align: "left" },
  { header: "Port", key: "port", align: "left" },
];

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const SkeletonLoaderRow = () => (
  <tr>
    {[...Array(columns.length + 1)].map((_, i) => (
      <td key={i} className="py-3 px-3">
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
      </td>
    ))}
  </tr>
);

const ShowClusters = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = useSelector(selectAuthToken);
  const tokenParsed = useSelector(selectAuthTokenParsed);
  const userEmail = tokenParsed?.preferred_username;

  const clusters = useSelector(selectAllClusters);
  const pagination = useSelector(selectClustersPagination);
  const isLoading = useSelector(selectClustersLoading);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const clusterList = clusters || [];
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  useEffect(() => {
    if (token) {
      dispatch(fetchClustersThunk({ token, page: currentPage, pageSize }));
    }
  }, [dispatch, token, currentPage, pageSize]);

  const [updating, setUpdating] = useState(false);
  const [deletingClusterId, setDeletingClusterId] = useState(null);

  let handleClusterSelection = (cluster) => {
    navigate(`/cluster/edit-cluster/${cluster.id}`);
  };

  let handleDeleteCluster = async (cluster_id) => {
    if (!window.confirm("Are you sure you want to delete this cluster?"))
      return;
    setDeletingClusterId(cluster_id);

    try {
      await dispatch(
        deleteClusterThunk({ token, cluster_id, email: userEmail }),
      ).unwrap();
      toast.success("Cluster deleted", { transition: Slide });
      // Re-fetch current page so pagination totals stay accurate after a delete.
      await dispatch(fetchClustersThunk({ token, page: currentPage, pageSize })).unwrap();
    } catch (err) {
      const errorMsg = err?.detail || err?.message || (typeof err === 'string' ? err : "Failed to delete cluster due to active connected pools.");
      toast.error(errorMsg, { transition: Slide });
    } finally {
      setDeletingClusterId(null);
    }
  };

  const handleUpdateProxmoxNodes = async () => {
    setUpdating(true);
    try {
      const res = await dispatch(updateProxmoxNodesThunk({ token, page: currentPage, pageSize })).unwrap();
      toast.success("Node Updated Successfully", { transition: Slide });
      const warnings = res.update?.data;

      if (warnings && typeof warnings === "object") {
        Object.entries(warnings).forEach(([node, message]) => {
          toast.warn(`${node}: ${message}`, { transition: Slide });
        });
      }
    } catch {
      toast.error("Failed to update nodes");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-left flex flex-col w-full relative select-none">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200 dark:border-gray-700 mb-5 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1a365d] dark:text-blue-300">Available Clusters</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Proxmox and Hyper-V clusters connected to this environment.
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap self-start sm:self-auto">
          <button
            onClick={handleUpdateProxmoxNodes}
            disabled={updating}
            className={classNames(
              "inline-flex items-center gap-2 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-4 py-2 text-xs font-bold shadow-sm transition-all uppercase tracking-wider",
              updating ? "opacity-50 cursor-not-allowed" : "",
            )}
          >
            {updating ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="inline w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C6.477 0 2 4.477 2 10h2zm2 5.291A7.962 7.962 0 014 12H2c0 2.042.784 3.895 2.059 5.291z"
                  ></path>
                </svg>
                Updating...
              </span>
            ) : (
              "Update"
            )}
          </button>
          <button
            onClick={() => navigate("/cluster/cluster-create-form")}
            className="inline-flex items-center gap-2 rounded-md bg-[#1a365d] hover:bg-[#122744] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all uppercase tracking-wider"
          >
            + New Cluster
          </button>
        </div>
      </div>
      {/* Table or Empty State */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#1a365d] text-white font-bold uppercase text-[0.8rem] leading-normal select-none">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-2 px-3 text-${col.align} whitespace-nowrap`}
                >
                  {col.header}
                </th>
              ))}
              <th className="py-2 px-3 text-center whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, index) => <SkeletonLoaderRow key={index} />)
            ) : clusters && clusters.length > 0 ? (
              clusterList.map((item) => (
                <tr
                  key={item.id}
                  className="text-left border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50/40 dark:hover:bg-gray-700/60 cursor-pointer transition-colors"
                  onClick={() => handleClusterSelection(item)}
                >
                  {columns.map((col) => (
                    <td
                      key={`${item.id}-${col.key}`}
                      className={`py-2 px-3 text-${col.align}`}
                    >
                      {col.key === "port"
                        ? item.type === "Hyper-V"
                          ? item.agent_port
                          : item.port
                        : item[col.key]}
                    </td>
                  ))}
                  <td className="py-2 px-3 text-center">
                    {deletingClusterId === item.id ? (
                      <svg
                        className="inline w-6 h-6 text-gray-400 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C6.477 0 2 4.477 2 10h2zm2 5.291A7.962 7.962 0 014 12H2c0 2.042.784 3.895 2.059 5.291z"
                        ></path>
                      </svg>
                    ) : (
                      <i
                        className={classNames(
                          "fa-solid fa-trash cursor-pointer text-lg inline-block",
                          deletingClusterId
                            ? "opacity-60 cursor-not-allowed"
                            : "",
                        )}
                        style={{ color: "#f84545b9" }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.color = "red")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.color = "#f84545b9")
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!deletingClusterId) handleDeleteCluster(item.id);
                        }}
                        title="Delete"
                      ></i>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-8 text-gray-500 dark:text-gray-400"
                >
                  No Clusters Available. Click "+ New Cluster" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
        {clusterList.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination?.total_pages}
            onPageChange={setCurrentPage}
            totalItems={pagination?.total}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            itemLabel="clusters"
            loading={isLoading}
            hasPrev={pagination?.has_prev}
            hasNext={pagination?.has_next}
          />
        )}
      </div>
    </div>
  );
};

export default ShowClusters;

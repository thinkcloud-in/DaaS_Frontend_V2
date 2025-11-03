import React, { useContext, useState } from "react";
import { PoolContext } from "../../Context/PoolContext";
import { useNavigate } from "react-router-dom";
import { Slide, toast } from "react-toastify";
import { deleteCluster, fetchClusters, updateProxmoxNodes } from "Services/ClusterService";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const ShowClusters = () => {
  const navigate = useNavigate();
  const pc = useContext(PoolContext);
  let token = pc.token;
  let userEmail = pc.tokenParsed.preferred_username;
  const [updating, setUpdating] = useState(false);
  const [deletingClusterId, setDeletingClusterId] = useState(null);

  let handleClusterSelection = (cluster) => {
    navigate(`/cluster/edit-cluster/${cluster.id}`);
  };

  let handleDeleteCluster = async (cluster_id) => {
    if (!window.confirm("Are you sure you want to delete this cluster?")) {
      return;
    }
    setDeletingClusterId(cluster_id);
    try {
      const res = await deleteCluster(token, cluster_id, userEmail);
      // Refresh clusters list after delete
      const clustersRes = await fetchClusters(token);
      pc.setAvailableClusters([...clustersRes] || []);
      toast.success(res?.msg, {
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
      console.error("Error deleting cluster:", err);
      toast.error("Failed to delete cluster", {
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
      setDeletingClusterId(null);
    }
  };

  // Define columns with their alignment preferences
  const columns = [
    { header: "Name", key: "name", align: "left" },
    { header: "Type", key: "type", align: "left" },
    { header: "IP", key: "ip", align: "left" },
    { header: "Port", key: "port", align: "left" },
  ];

  const handleUpdateProxmoxNodes = async () => {
    setUpdating(true);
    try {
      const res = await updateProxmoxNodes(token);
      // Now fetch the updated clusters list
      const clustersRes = await fetchClusters(token);
      pc.setAvailableClusters([...clustersRes] || []);
      toast.success(res?.msg || "Nodes updated successfully", { position: "top-right", autoClose: 3000 });
    } catch (error) {
      toast.error(error?.data?.msg || "Failed to update nodes");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="w-[98%] h-[90vh] m-auto bg-white rounded-lg p-4 flex flex-col overflow-hidden ">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Available Clusters</h2>
        <div className="flex gap-2 items-center ">
          <button
            onClick={handleUpdateProxmoxNodes}
            disabled={updating}
            className={classNames(
              "bg-[#1a365dcc] hover:bg-[#1a365d] hover:text-white text-[#f5f5f5] rounded-md px-3 py-2 text-sm font-medium",
              updating ? "opacity-50 cursor-not-allowed" : ""
            )}
          >
            {updating ? (
              <span>
                <svg
                  className="inline w-4 h-4 mr-2 animate-spin"
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
            className="bg-[#1a365dcc] hover:bg-[#1a365d] hover:text-white text-[#f5f5f5] rounded-md px-3 py-2 text-sm font-medium"
          >
            + New Cluster
          </button>
        </div>
      </div>
      {/* Table */}
      {pc.isClusterAvailable && (
        <div className="flex-1 overflow-y-auto rounded-md bg-white custom-scrollbar">
          <table className="min-w-full bg-white text-sm border-collapse">
            <thead className="bg-[#F0F8FFCC] text-[#00000099] font-bold uppercase text-[0.8rem] leading-normal sticky top-0 z-10">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`py-2 px-3 text-${col.align} whitespace-nowrap`}
                  >
                    {col.header}
                  </th>
                ))}
                <th className="py-2 px-3 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pc.availableClusters.map((item) => (
                <tr
                  key={item.id}
                  className="text-left border-b border-gray-200 hover:bg-[#F0F8FFCC] cursor-pointer"
                  onClick={() => handleClusterSelection(item)}
                >
                  {columns.map((col) => (
                    <td
                      key={`${item.id}-${col.key}`}
                      className={`py-2 px-3 text-${col.align}`}
                    >
                      {item[col.key]}
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
                          deletingClusterId ? "opacity-60 cursor-not-allowed" : ""
                        )}
                        style={{color:'#f84545b9'}} 
                        onMouseOver={e=>e.currentTarget.style.color='red'}
                        onMouseOut={e=>e.currentTarget.style.color='#f84545b9'}
                        onClick={e => {
                          e.stopPropagation();
                          if (!deletingClusterId) {
                            handleDeleteCluster(item.id);
                          }
                        }}
                        title="Delete"
                      ></i>
                    )}
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

export default ShowClusters;
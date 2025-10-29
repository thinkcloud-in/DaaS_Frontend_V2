import React, { useEffect, useState,useContext } from 'react';
import { useNavigate } from "react-router-dom";
import axiosInstance from "Services/AxiosInstane";
import { getEnv } from "utils/getEnv";
import { toast } from "react-toastify";
import { PoolContext } from "../../Context/PoolContext";
import { fetchIpPools, deleteIpPoolByName } from "Services/IP_PoolService";

const SkeletonLoader = () => (
  <tr>
    {[...Array(7)].map((_, i) => ( 
      <td key={i} className="py-4 px-3">
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
      </td>
    ))}
  </tr>
);
const IpPoolsList = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  let navigate = useNavigate();
  const pc = useContext(PoolContext);
  const token = pc.token;
  
  // const fetchPools = async () => {
  //   setLoading(true);
  //   setApiError('');
  //   try {
  //     const res = await axiosInstance.get(
  //       `${backendUrl}/v1/ips/get_all_ips`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     setPools(res.data?.data || []);
  //   } catch (err) {
  //     setApiError(err.response?.data?.msg);
  //     toast.error(err.response?.data?.msg);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // useEffect(() => {
  //   fetchPools();
  // }, []);

  const fetchPools = async () => {
    setLoading(true);
    setApiError('');
    try {
      const data = await fetchIpPools(token);
      setPools(data);
    } catch (err) {
      setApiError(err.response?.data?.msg);
      toast.error(err.response?.data?.msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
  }, []);

    // const handleDelete = async (poolName) => {
  //   if (!window.confirm(`Are you sure you want to delete pool "${poolName}"?`)) return;
  //   try {
  //     const response = await axiosInstance.delete(
  //       `${backendUrl}/v1/ips/delete_pool_by_name/${encodeURIComponent(poolName)}`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     toast.success(response?.data?.msg || `IP Pool "${poolName}" deleted successfully.`);
  //     // Refresh list
  //     fetchPools();
  //   } catch (err) {
  //     toast.warn(err.response?.data?.msg);
  //   }
  // };


  const handleDelete = async (poolName) => {
    if (!window.confirm(`Are you sure you want to delete pool "${poolName}"?`)) return;
    try {
      const response = await deleteIpPoolByName(token, poolName);
      toast.success(response?.msg || `IP Pool "${poolName}" deleted successfully.`);
      fetchPools();
    } catch (err) {
      toast.warn(err.response?.data?.msg);
    }
  };

  const handleCreate = () => {
    navigate("/ip-pools/create");
  };

  const handleBack = () => {
    navigate(-1);
  };


  return (
    <div className="w-[98%] h-[90vh] min-h-[75vh] mt-4 m-auto bg-white rounded-lg p-4 shadow-md flex flex-col overflow-hidden">
      <div className="relative mb-4">
        <h2 className="text-lg font-semibold text-center text-gray-700">IP-Pool List</h2>
        <div className="absolute left-0 top-0">
          <button
            onClick={handleBack}
            className="bg-[#1a365d]/80 text-white w-8 h-8 rounded-md hover:bg-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d]/100 focus:ring-opacity-10 flex items-center justify-center"
            title="Back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="absolute right-0 top-0">
          <button
            onClick={handleCreate}
            className="bg-[#1a365d]/80 hover:bg-[#1a365d] hover:text-white text-[#f5f5f5] rounded-md px-5 py-2 text-sm font-medium"
          >
            + New IP-Pool
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto rounded-md bg-white custom-scrollbar">
        <table className="min-w-full bg-white text-[0.9rem] border-collapse">
          <thead className="bg-[#F0F8FFCC] text-[#00000099] font-bold uppercase text-[0.8rem] leading-normal sticky top-0 z-10">
            <tr>
              <th className="py-2 px-3">NAME</th>
              <th className="py-2 px-3">START IP</th>
              <th className="py-2 px-3">END IP</th>
              <th className="py-2 px-3">SUBNET</th>
              <th className="py-2 px-3">GATEWAY</th>
              <th className="py-2 px-3">DNS</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, index) => <SkeletonLoader key={index} />)
            ) : apiError ? (
              <tr>
                <td colSpan={7} className="text-red-600 text-center py-8">{apiError}</td>
              </tr>
            ) : pools.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">No Pools found.</td>
              </tr>
            ) : (
              pools.map((pool, idx) => (
                <tr
                  key={pool.id || pool.Pool_name || idx}
                  className="text-center border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-2 px-3 font-medium">{pool.Pool_name}</td>
                  <td className="py-2 px-3">{pool.Starting_ip}</td>
                  <td className="py-2 px-3">{pool.Ending_ip}</td>
                  <td className="py-2 px-3">{pool.Subnet}</td>
                  <td className="py-2 px-3">{pool.Gateway}</td>
                  <td className="py-2 px-3">{Array.isArray(pool.DNS) ? pool.DNS.join(", ") : pool.DNS}</td>
                  <td className="py-2 px-3">
                    <button
                      onClick={() => handleDelete(pool.Pool_name)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete IP Pool"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IpPoolsList;
import React, { useEffect, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PoolContext } from "../../Context/PoolContext";
import { 
  fetchIpPoolsThunk, 
  deleteIpPoolThunk 
} from '../../redux/features/IP-Pools/IpPoolsThunks';
import { 
  selectIpPools, 
  selectIpPoolsLoading, 
  selectIpPoolsError, 
  selectIsPoolDeleteLoading 
} from '../../redux/features/IP-Pools/IpPoolsSelectors';
import { clearError } from '../../redux/features/IP-Pools/IpPoolsSlice';
import { selectAuthToken, selectAuthTokenParsed } from '../../redux/features/Auth/AuthSelectors';

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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const token = useSelector(selectAuthToken);
  const tokenParsed = useSelector(selectAuthTokenParsed);
  const userName = tokenParsed?.preferred_username;

  // Redux selectors
  const pools = useSelector(selectIpPools);
  const loading = useSelector(selectIpPoolsLoading);
  const error = useSelector(selectIpPoolsError);

  useEffect(() => {
    if (token) {
      dispatch(fetchIpPoolsThunk(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleDelete = async (poolName) => {
    if (!window.confirm(`Are you sure you want to delete pool "${poolName}"?`)) return;
    
    try {
      const result = await dispatch(deleteIpPoolThunk({ token, poolName })).unwrap();
      toast.success(result?.msg || `IP Pool "${poolName}" deleted successfully.`);
    } catch (error) {
      // toast.error(error || 'Failed to delete IP pool');
    }
  };

  const handleCreate = () => {
    navigate("/ip-pools/create");
  };

  const handleBack = () => {
    navigate(-1);
  };

  const DeleteButton = ({ poolName }) => {
    const isDeleting = useSelector(state => selectIsPoolDeleteLoading(state, poolName));
    
    return (
      <button
        onClick={() => handleDelete(poolName)}
        className="text-red-600 hover:text-red-800"
        title="Delete IP Pool"
        disabled={isDeleting}
      >
        {isDeleting ? (
          <svg className="inline w-4 h-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C6.477 0 2 4.477 2 10h2zm2 5.291A7.962 7.962 0 014 12H2c0 2.042.784 3.895 2.059 5.291z"></path>
          </svg>
        ) : (
          <i className="fa-solid fa-trash"></i>
        )}
      </button>
    );
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
                    <DeleteButton poolName={pool.Pool_name} />
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
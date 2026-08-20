import React, { useEffect, useContext, useState } from 'react';
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
  selectIpPoolsPagination,
  selectIpPoolsLoading,
  selectIpPoolsError,
  selectIsPoolDeleteLoading
} from '../../redux/features/IP-Pools/IpPoolsSelectors';
import { clearError } from '../../redux/features/IP-Pools/IpPoolsSlice';
import { selectAuthToken, selectAuthTokenParsed } from '../../redux/features/Auth/AuthSelectors';
import { Pagination } from "../Common";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

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
  const pagination = useSelector(selectIpPoolsPagination);
  const loading = useSelector(selectIpPoolsLoading);
  const error = useSelector(selectIpPoolsError);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  useEffect(() => {
    if (token) {
      dispatch(fetchIpPoolsThunk({ token, page: currentPage, pageSize }));
    }
  }, [dispatch, token, currentPage, pageSize]);

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
      // Re-fetch current page so pagination totals stay accurate after a delete.
      dispatch(fetchIpPoolsThunk({ token, page: currentPage, pageSize }));
    } catch (error) {
      // toast.error(error || 'Failed to delete IP pool');
    }
  };

  const handleCreate = () => {
    navigate("/ip-pools/create");
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
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-left flex flex-col w-full relative select-none">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200 dark:border-gray-700 mb-5 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1a365d] dark:text-blue-300">IP Pools</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            IP address ranges available for VM/pool provisioning.
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap self-start sm:self-auto">
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 rounded-md bg-[#1a365d] hover:bg-[#122744] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all uppercase tracking-wider"
          >
            + New IP-Pool
          </button>
        </div>
      </div>
      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 text-[0.9rem] border-collapse">
            <thead>
              <tr className="bg-[#1a365d] text-white font-bold uppercase text-[0.8rem] leading-normal select-none">
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
                  <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">No Pools found.</td>
                </tr>
              ) : (
                pools.map((pool, idx) => (
                  <tr
                    key={pool.id || pool.Pool_name || idx}
                    className="text-center border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50/40 dark:hover:bg-gray-700/60 transition-colors"
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
        {pools.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination?.total_pages}
            onPageChange={setCurrentPage}
            totalItems={pagination?.total}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            itemLabel="IP pools"
            loading={loading}
            hasPrev={pagination?.has_prev}
            hasNext={pagination?.has_next}
          />
        )}
      </div>
    </div>
  );
};

export default IpPoolsList;
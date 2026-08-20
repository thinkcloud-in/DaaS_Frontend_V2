import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { PoolContext } from "../../Context/PoolContext";
import ShowIpmi from "./ShowIpmi";
import CreateNewIpmi from "./CreateNewIpmi";
import { toast } from "react-toastify";
import { fetchIpmiListThunk } from '../../redux/features/IPMI/IpmiThunks';
import {
  selectIpmiList,
  selectIpmiPagination,
  selectIpmiLoading,
  selectIpmiError
} from '../../redux/features/IPMI/IpmiSelectors';
import { clearError } from '../../redux/features/IPMI/IpmiSlice';
import { selectAuthToken, selectAuthTokenParsed } from '../../redux/features/Auth/AuthSelectors';

const columnStyles = [
  "w-[20%] text-center", 
  "w-[20%] text-center", 
  "w-[20%] text-center", 
  "w-[20%] text-center", 
  "w-[20%] text-center", 
];
 
const SkeletonRow = () => (
  <tr>
    {columnStyles.map((style, idx) => (
      <td key={idx} className={`py-2 px-4 ${style}`}>
        <div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div>
      </td>
    ))}
  </tr>
);

const SkeletonLoader = ({ rows = 5 }) => (
  <div className="w-[98%]  m-auto bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col overflow-hidden">
    <div className="relative mb-4">
      <h2 className="text-lg font-semibold text-center text-gray-700 dark:text-gray-300">Available IPMI Devices</h2>
      <div className="absolute right-0 top-0">
        <div className="bg-[#1a365d]/80 text-white rounded-md px-5 py-2 text-sm font-medium opacity-50">
          <div className="h-5 w-24 bg-[#1a365d]/80 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto rounded-md bg-white dark:bg-gray-800 custom-scrollbar">
      <table className="min-w-full bg-white dark:bg-gray-800 text-[0.9rem] border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="bg-[#1a365d] text-white font-bold uppercase text-[0.8rem] leading-normal select-none">
            <th className={`py-2 px-4 ${columnStyles[0]}`}>IPMI IP</th>
            <th className={`py-2 px-4 ${columnStyles[1]}`}>NAME</th>
            <th className={`py-2 px-4 ${columnStyles[2]}`}>USERNAME</th>
            <th className={`py-2 px-4 ${columnStyles[3]}`}>EDIT</th>
            <th className={`py-2 px-4 ${columnStyles[4]}`}>DELETE</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, idx) => (
            <SkeletonRow key={idx} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
 
const IPMI = () => {
  const dispatch = useDispatch();
  
  const token = useSelector(selectAuthToken);
  const tokenParsed = useSelector(selectAuthTokenParsed);
  const userEmail = tokenParsed?.preferred_username;

  // Redux selectors
  const ipmiList = useSelector(selectIpmiList);
  const pagination = useSelector(selectIpmiPagination);
  const loading = useSelector(selectIpmiLoading);
  const error = useSelector(selectIpmiError);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  useEffect(() => {
    if (token) {
      dispatch(fetchIpmiListThunk({ token, page: currentPage, pageSize }));
    }
  }, [dispatch, token, currentPage, pageSize]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const refreshIpmiList = () => {
    if (token) {
      dispatch(fetchIpmiListThunk({ token, page: currentPage, pageSize }));
    }
  };

  return (
    <div className="pools w-[98%] h-[90vh] min-h-[75vh] mt-4 m-auto bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md overflow-hidden">
      <div className="flex justify-start ml-4 mt-3 mb-2">
      </div>
      <div className="flex-1 overflow-auto">
        {loading ? (
          <SkeletonLoader />
        ) : ipmiList.length > 0 || (pagination?.total || 0) > 0 ? (
          <ShowIpmi
            ipmiList={ipmiList}
            refreshIpmiList={refreshIpmiList}
            pagination={pagination}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
            loading={loading}
          />
        ) : (
          <CreateNewIpmi />
        )}
      </div>
    </div>
  );
};
 
export default IPMI;
import React, { useContext, useEffect, useState } from "react";
import { PoolContext } from "../../Context/PoolContext";
import ShowIpmi from "./ShowIpmi";
import { getEnv } from "utils/getEnv";
import CreateNewIpmi from "./CreateNewIpmi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {GetAllIpmiLists} from "Services/IPMI_Service";
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
  <div className="w-[98%]  m-auto bg-white rounded-lg p-4 flex flex-col overflow-hidden">
    <div className="relative mb-4">
      <h2 className="text-lg font-semibold text-center text-gray-700">Available IPMI Devices</h2>
      <div className="absolute right-0 top-0">
        <div className="bg-[#1a365d]/80 text-white rounded-md px-5 py-2 text-sm font-medium opacity-50">
          <div className="h-5 w-24 bg-[#1a365d]/80 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto rounded-md bg-white custom-scrollbar">
      <table className="min-w-full bg-white text-[0.9rem] border-collapse">
        <thead className="bg-[#F0F8FFCC] text-[#00000099] font-bold uppercase text-[0.8rem] leading-normal sticky top-0 z-10">
          <tr>
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
  const navigate = useNavigate();
  const [AvailableIpmi, setAvailableIpmi] = useState([]);
  const [loading, setLoading] = useState(true); // <-- loading state
  const pc = useContext(PoolContext);
  const token = pc.token;
  const userEmail = pc.tokenParsed.preferred_username;
  const backendUrl = getEnv("BACKEND_URL");
 
  // const fetchIpmiList = () => {
  //   setLoading(true);
  //   axiosInstance
  //     .get(`${backendUrl}/v1/ipmi/get_all_ipmi_servers`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     })
  //     .then((response) => {
  //       setAvailableIpmi(response.data?.data || []);
  //     })
  //     .catch((error) => {
  //       toast.error(error.response?.data?.msg || "Failed to fetch IPMI list", { position: "top-right", autoClose: 3000 });
  //     })
  //     .finally(() => {
  //       setLoading(false);
  //     });
  // };
 const fetchIpmiList = async () => {
    setLoading(true);
    try {
      const ipmiList = await GetAllIpmiLists(token);
      setAvailableIpmi(ipmiList);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to fetch IPMI list", { position: "top-right", autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIpmiList();
  }, []);
 
  return (
    <div className="pools w-[98%] h-[90vh] min-h-[75vh] mt-4 m-auto bg-white rounded-lg p-4 shadow-md overflow-hidden">
      <div className="flex justify-start ml-4 mt-3 mb-2">
        <div
          onClick={() => navigate("/")}
          className="bg-[#1a365d]/80 text-[#f5f5f5] hover:text-white px-2 py-2 rounded-md hover:bg-[#1a365d] focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {loading ? (
          <SkeletonLoader />
        ) : AvailableIpmi.length > 0 ? (
          <ShowIpmi ipmiList={AvailableIpmi} refreshIpmiList={fetchIpmiList} />
        ) : (
          <CreateNewIpmi />
        )}
      </div>
    </div>
  );
};
 
export default IPMI;
 
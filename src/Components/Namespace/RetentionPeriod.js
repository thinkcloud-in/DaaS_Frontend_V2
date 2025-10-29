import React, { useState, useContext, useEffect } from "react";
import { PoolContext } from "../../Context/PoolContext";
import ShowRetentionDetails from "./ShowRetentionDetails";
import axiosInstance from "Services/AxiosInstane";
import { getEnv } from "utils/getEnv";
import { useNavigate } from "react-router-dom";

const RetentionPeriod = () => {
  const navigate = useNavigate();
  const [namespaces, setNamespaces] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const backendUrl = getEnv('BACKEND_URL');

  useEffect(() => {
    fetchNamespaces();
  }, []);

  const fetchNamespaces = async () => {
    try {
      const response = await axiosInstance.get(`${backendUrl}/v1/namespace/get_namespaces`);
      
      setNamespaces(response?.data || null);
    } catch (err) {
      setError('Failed to load namespaces');
    } finally {
      setLoading(false);
    }
  };

  const pc = useContext(PoolContext);

  const Goback = () => {
    navigate("/");
  };

  return (
    <div className="p-4 h-screen overflow-y-hidden">
      <div className="max-w-[100%] h-[90vh] mx-auto bg-white rounded-lg p-4 shadow-lg ">
        <div className="flex justify-start ml-16 mt-3 mb-2">
          <div
            onClick={Goback}
            className="ml-4 bg-[#1a365d]/80 text-white px-2 py-2 rounded-md hover:bg-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:ring-opacity-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </div>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : namespaces ? (
          <ShowRetentionDetails namespaces={namespaces} />
        ) : (
          <p className="text-center text-gray-500">No namespace data available.</p>
        )}
      </div>
    </div>
  );
};

export default RetentionPeriod;

import React from "react";
import { useNavigate } from "react-router-dom";
const SSL = () => {
  const navigate = useNavigate();
  const Goback = () => {
    navigate("/");
  };
  return (
    <div className="mt-5 flex flex-col space-y-6 w-[98%]  h-[90vh] m-auto bg-white">
      <div className="flex justify-start ml=0 mt-5">
        <div
          onClick={Goback}
          className="ml-4 bg-[#1a365d]/80 hover:bg-[#1a365d] text-[#f5f5f5] hover:text-white px-2 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:ring-opacity-10"
        >
         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg> 
        </div>
      </div>
    <div className="p-8 rounded-lg  flex flex-col items-start m-10 bg-white ">
      <h1 className="text-xl font-bold mb-4 text-gray-900 border-b-2 border-gray-200">SSL Certificate</h1>
      <div className="mb-4 flex flex-col items-start">
        <label htmlFor="privateKey" className="text-sm font-medium text-gray-900 mb-1 ml-1">Private Key:</label>
        <input
          type="file"
          id="privateKey"
          name="privateKey"
          accept=".key"
          className=" p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-[#1a365d]/100 w-80"
        />
      </div>
      <div className="mb-4 flex flex-col items-start">
        <label htmlFor="publicCertificate" className="text-sm font-medium text-gray-900 mb-1 ml-1">Public Certificate:</label>
        <input
          type="file"
          id="publicCertificate"
          name="publicCertificate"
          accept=".crt"
          className="w-80 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-[#1a365d]/100"
        />
      </div>
  <button className="bg-[#1a365d]/80 hover:bg-[#1a365d] text-[#f5f5f5] hover:text-white font-medium px-4 py-2 rounded-md">Submit</button>
    </div>
    </div>
  );
};

export default SSL;

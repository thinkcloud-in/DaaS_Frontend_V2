import React, { useContext } from "react";
import { PoolContext } from "../../Context/PoolContext";
import ShowClusters from "./ShowClusters";
import CreateNewCluster from "./CreateNewCluster";
import { useNavigate } from "react-router-dom";
const Clusters = () => {
  const navigate=useNavigate()
  //pool context
  const pc = useContext(PoolContext);
  const Goback = () => {
    navigate("/");
  };
  return (
    <div className="pools w-[98%] h-[90vh] min-h-[75vh] mt-4 m-auto bg-white rounded-lg p-4 shadow-md overflow-hidden ">
        <div className="flex justify-start ml-16 mt-3 mb-2">
        <div
          onClick={Goback}
          className="ml-4 bg-[#1a365dcc] text-[#f5f5f5] hover:bg-[#1a365d] hover:text-white px-2 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:ring-opacity-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </div>
      </div>
      <div  className="flex-1 overflow-auto">
      {pc.isClusterAvailable ? <ShowClusters /> : <CreateNewCluster />}
      </div>
    </div>
  );
};

export default Clusters;

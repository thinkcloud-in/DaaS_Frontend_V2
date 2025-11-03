import React, { useContext, useState, useEffect } from "react";
import { PoolContext } from "../../Context/PoolContext";
import CreateNewPool from "./CreateNewPool";
import ShowPools from "./ShowPools";
import ShowPoolsSkeleton from "./ShowPoolsSkeleton";
import "./css/Pools.css";

const Pools = () => {
  const pc = useContext(PoolContext);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchPools = async () => {
      setIsLoading(true);
      try {
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    fetchPools();
  }, []);

  return (
    <div className="pools-wrapper flex flex-col h-[90vh]  min-h-[75vh] w-[98%] m-auto mt-4 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-y-auto">
        {isLoading ? (
          <ShowPoolsSkeleton />
        ) : pc.isPoolAvailable ? (
          <ShowPools />
        ) : (
          <CreateNewPool />
        )}
      </div>
    </div>
  );
};

export default Pools;

import React, { useContext } from "react";
import { PoolContext } from "../../Context/PoolContext";
import ShowDomains from "./ShowDomains";
const Domain = () => {
  const pc = useContext(PoolContext);
  return (
    <div className="w-[98%] m-auto mt-5 p-5 rounded-[10px] bg-white overflow-hidden">
      <ShowDomains />
      
    </div>
  );
};

export default Domain;

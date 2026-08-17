import React from "react";
import ShowPools from "./ShowPools";
import "./css/Pools.css";

const Pools = () => {
  // ShowPools owns the fetch (with pagination) and its own loading state --
  // it must stay mounted throughout, otherwise unmounting it while a fetch
  // is in flight (e.g. to swap in a skeleton here) tears down the effect
  // that triggered the fetch and re-fires it on remount, looping forever.
  return (
    <div>
      <div className="flex-1 overflow-auto rounded-md bg-white dark:bg-gray-800 table-container custom-scrollbar">
        <ShowPools />
      </div>
    </div>
  );
};

export default Pools;

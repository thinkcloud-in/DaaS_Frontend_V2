import React, { createContext, useState, useEffect, useCallback } from "react";
import { fetchClusters } from "Services/ContextService";

export const PoolContext = createContext();

const PoolContextProvider = ({ children, token, tokenParsed }) => {
  let [users, setUsers] = useState([]);
  let [isClusterAvailable, setIsClusterAvailable] = useState(false);
  let [availableClusters, setAvailableClusters] = useState([]);
  const getClusters = useCallback(async () => {
    try {
      const data = await fetchClusters(token);
      if (data && data.length > 0) {
        setIsClusterAvailable(true);
        setAvailableClusters(data);
      } else {
        setIsClusterAvailable(false);
        setAvailableClusters([]);
      }
    } catch {
      setIsClusterAvailable(false);
      setAvailableClusters([]);
    }
  }, [token]);


  useEffect(() => {
    if (token) {
      getClusters();
    }
  }, [token, getClusters]);

  let value = {
    users,
    setUsers,
    isClusterAvailable,
    setIsClusterAvailable,
    availableClusters,
    setAvailableClusters,
    getClusters,

    token,
    tokenParsed,
  };

  return (
    <PoolContext.Provider value={value}>
      {children}
    </PoolContext.Provider>
  );
};

export default PoolContextProvider;
import React, { createContext, useState, useEffect } from "react";
import { fetchPools, fetchClusters, fetchDomains } from "Services/ContextService";

export const PoolContext = createContext();

const PoolContextProvider = ({ children, token, tokenParsed }) => {
  let [isPoolAvailable, setIsPoolAvailable] = useState(false);
  let [availablePools, setAvailablePools] = useState([]);
  let [users, setUsers] = useState([]);
  let [isClusterAvailable, setIsClusterAvailable] = useState(false);
  let [availableClusters, setAvailableClusters] = useState([]);
  let [isDomainAvailable, setisDomainAvailable] = useState(false);
  let [availableDomains, setAvailableDomains] = useState([]);

  let getPools = async () => {
    try {
      const data = await fetchPools(token);
      if (data.length > 0) {
        setIsPoolAvailable(true);
        setAvailablePools(data);
      } else {
        setIsPoolAvailable(false);
        setAvailablePools([]);
      }
    } catch {
      setIsPoolAvailable(false);
      setAvailablePools([]);
    }
  };

  let getClusters = async () => {
    try {
      const data = await fetchClusters(token);
      if (data.length > 0) {
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
  };

  let getDomains = async () => {
    try {
      const data = await fetchDomains(token);
      if (data.length > 0) {
        setisDomainAvailable(true);
        setAvailableDomains(data);
      } else {
        setisDomainAvailable(false);
        setAvailableDomains([]);
      }
    } catch {
      setisDomainAvailable(false);
      setAvailableDomains([]);
    }
  };

  useEffect(() => {
    if (token) {
      getPools();
      getClusters();
      getDomains();
    }
  }, [token]);

  let value = {
    isPoolAvailable,
    setIsPoolAvailable,
    availablePools,
    setAvailablePools,
    users,
    setUsers,
    isClusterAvailable,
    setIsClusterAvailable,
    availableClusters,
    setAvailableClusters,
    getClusters,
    getPools,
    isDomainAvailable,
    setisDomainAvailable,
    availableDomains,
    setAvailableDomains,
    token,
    tokenParsed
  };

  return (
    <PoolContext.Provider value={value}>
      {children}
    </PoolContext.Provider>
  );
};

export default PoolContextProvider;
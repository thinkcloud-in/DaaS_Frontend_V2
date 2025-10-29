import React, { useContext, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import TimeRangeSelector from "./TimeRangeSelector";
import AutoRefresh from "./AutoRefresh";
import axios from "axios";
import { PoolContext } from "../../Context/PoolContext";
import { GrafanaToolbarContext } from "../../Context/GrafanaToolbarContext";
import { getEnv } from "utils/getEnv";
 
const VMs = () => {
  const backendUrl = getEnv('BACKEND_URL');
  const GRAFANA_URL = getEnv('GRAFANA_URL2');
  const DASHBOARD_GRAFANA_URL = getEnv('GRAFANA_URL')
 
  const gc = useContext(GrafanaToolbarContext);
  const pc = useContext(PoolContext);
  const token = pc.token;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [templatingVariables, setTemplatingVariables] = useState([]);
  const [vcenterValues, setVcenterValues] = useState([]);
  const [selections, setSelections] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchValues, setSearchValues] = useState({});
  const [vcenterNames, setVcenterNames] = useState([]);  // Changed to array
  const [clusterNames, setClusterNames] = useState([]);  // Changed to array
  
 
  useEffect(() => {
    axios
      .get(`${GRAFANA_URL}/api/dashboards/uid/vsphereVMs`)
      .then((res) => {
        const templatingList = res.data.dashboard.templating.list;
        if (templatingList.length > 0) {
          setTemplatingVariables(templatingList);
          templatingList.forEach((variable) => {
            fetchVariableValues(variable);
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);
 
  useEffect(() => {
    if (vcenterNames.length > 0 || clusterNames.length > 0) {
      templatingVariables
        .filter((variable) => variable.name !== "vcenter")
        .forEach((variable) => {
          fetchVariableValues(variable);
        });
    }
  }, [vcenterNames, clusterNames]);
 
  const fetchVariableValues = async (variable) => {
    try {
      let values = [];
      if (variable.name === "inter") {
        const response = await axios.post(
          `${backendUrl}/v1/api/query`,
          {
            body: {
              from: `${gc.timeStamp.startDate}`,
              to: `${gc.timeStamp.endDate}`,
              datasourceId: variable.datasourceId,
              query: variable.query,
              vcenter: vcenterNames.join(','),  // Join multiple vcenters
              clustername: clusterNames.join(','),  // Join multiple clusters
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
 
        values = extractValuesFromResponse(response.data);
 
        if (!values || values.length === 0) {
          values = variable.options.map((option) => option.value);
        }
      } else {
        const response = await axios.post(
          `${backendUrl}/v1/api/query`,
          {
            body: {
              from: `${gc.timeStamp.startDate}`,
              to: `${gc.timeStamp.endDate}`,
              datasourceId: variable.datasourceId,
              query: variable.query,
              vcenter: vcenterNames.join(','),
              clustername: clusterNames.join(','),
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
 
        values = extractValuesFromResponse(response.data);
      }
 
      if (variable.name === "vcenter") {
        setVcenterValues(values);
      } else {
        setTemplatingVariables((prev) =>
          prev.map((v) => (v.name === variable.name ? { ...v, values } : v))
        );
      }
    } catch (err) {
      if (variable.name === "inter") {
        const fallbackValues = variable.options.map((option) => option.value);
        setTemplatingVariables((prev) =>
          prev.map((v) =>
            v.name === variable.name ? { ...v, values: fallbackValues } : v
          )
        );
      }
    }
  };
 
  const extractValuesFromResponse = (responseData) => {
    if (responseData?.results?.A?.frames) {
      const frames = responseData.results.A.frames;
      return frames[0]?.data?.values?.[0] || [];
    }
    return [];
  };
 
  const handleSelectionChange = (variableName, value) => {
    if (variableName === "clustername") {
      handleClusterChange(value);
    } else if (variableName === "vcenter") {
      handleVCenterChange(value);
    } else {
      setSelections((prev) => {
        const currentValues = prev[variableName] || [];
        const isSelected = !currentValues.includes(value);
        return {
          ...prev,
          [variableName]: isSelected
            ? [...currentValues, value]
            : currentValues.filter((v) => v !== value),
        };
      });
    }
  };
 
  const handleVCenterChange = (value) => {
    setSelections((prev) => {
      const currentValues = prev.vcenter || [];
      const isSelected = !currentValues.includes(value);
      const newValues = isSelected
        ? [...currentValues, value]
        : currentValues.filter((v) => v !== value);
      setVcenterNames(newValues);
      return { ...prev, vcenter: newValues };
    });
   
  };
  const handleClusterChange = (value) => {
    setSelections((prev) => {
      const currentValues = prev.clustername || [];
      const isSelected = !currentValues.includes(value);
      const newValues = isSelected
        ? [...currentValues, value]
        : currentValues.filter((v) => v !== value);
      setClusterNames(newValues);
      return { ...prev, clustername: newValues };
    });
  };
 
  const handleToggleDropdown = (variableName) => {
    setOpenDropdown(openDropdown === variableName ? null : variableName);
    if (openDropdown === variableName) {
      setSearchValues((prev) => ({ ...prev, [variableName]: "" }));
    }
  };
 
  const handleSearch = (variableName, value) => {
    setSearchValues((prev) => ({ ...prev, [variableName]: value }));
  };
 
  const buildIframeUrl = () => {
    let url = `${DASHBOARD_GRAFANA_URL}/d/vsphereVMs/vmware-vsphere-vms?orgId=1&from=${gc.timeStamp.startDate}&to=${gc.timeStamp.endDate}&theme=light&disableLazyLoad=true&kiosk`;
    Object.entries(selections).forEach(([name, values]) => {
      if (values.length > 0) {
        values.forEach((value) => {
          url += `&var-${name}=${encodeURIComponent(value)}`;
        });
      }
    });
    return url;
  };
 
  const handleSelectAll = (variableName, values, isChecked) => {
    if (!values || !Array.isArray(values)) values = [];
   
    if (variableName === "clustername") {
      if (isChecked) {
        setClusterNames(values);
        setSelections((prev) => ({ ...prev, clustername: values }));
      } else {
        setClusterNames([]);
        setSelections((prev) => ({ ...prev, clustername: [] }));
      }
    } else if (variableName === "vcenter") {
      if (isChecked) {
        setVcenterNames(values);
        setSelections((prev) => ({ ...prev, vcenter: values }));
      } else {
        setVcenterNames([]);
        setSelections((prev) => ({ ...prev, vcenter: [] }));
      }
    } else {
      setSelections((prev) => ({
        ...prev,
        [variableName]: isChecked ? values : [],
      }));
    }
  };
 
  const isAllSelected = (variableName, filteredValues) => {
    if (!filteredValues || !Array.isArray(filteredValues) || filteredValues.length === 0)
      return false;
    if (!selections[variableName] || !Array.isArray(selections[variableName]))
      return false;
    return filteredValues.every((value) =>
      selections[variableName].includes(value)
    );
  };
 
  const renderDropdown = (variable) => {
    const isVCenter = variable.name === "vcenter";
    const isCluster = variable.name === "clustername";
    const values = isVCenter ? vcenterValues : variable.values;
    const currentSelection = selections[variable.name] || [];
 
    if (variable.name === "inter") {
      return (
        <button className="flex items-center bg-white text-gray-700 font-bold px-4 py-2 rounded-lg border border-gray-300 min-w-[160px] text-sm transition-colors">
          <span className="mr-2">{variable.label || "Sampling"}</span>
          <select
            className="flex items-center text-gray-600 mr-2 bg-white border-2 border-gray-200 px-2 py-1 ml-2 rounded-lg"
            value={selections["inter"] || "auto"}
            onChange={(e) => handleSelectionChange("inter", e.target.value)}
          >
            {variable.values?.map((value, idx) => (
              <option key={idx} value={value}>
                {value === "$__auto_interval_inter" ? "auto" : value}
              </option>
            ))}
          </select>
        </button>
      );
    }
 
    return (
      <>
        <button
          onClick={() => handleToggleDropdown(variable.name)}
          className="flex items-center bg-white text-gray-700 font-bold px-4 py-2 rounded-lg border border-gray-300 min-w-[160px] text-sm transition-colors"
        >
          <span className="mr-2">{variable.label || variable.name}</span>
          <div className="flex items-center border-2 border-gray-200 px-2 py-1 ml-2 rounded-lg">
            <span className="text-gray-600">
              {currentSelection.length > 0
                ? `Selected (${currentSelection.length})`
                : "All"}
            </span>
            <ChevronDown className="ml-2 h-4 w-4" />
          </div>
        </button>
 
        {openDropdown === variable.name && (
          <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg">
            <div className="p-3 border-b border-gray-300">
              <input
                type="text"
                value={searchValues[variable.name] || ""}
                onChange={(e) => handleSearch(variable.name, e.target.value)}
                placeholder={`Search ${variable.label || variable.name}`}
                className="w-full px-3 py-2 bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div className="p-2 border-b border-gray-300">
              <label className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={isAllSelected(
                    variable.name,
                    values?.filter((value) =>
                      value
                        ?.toLowerCase()
                        .includes((searchValues[variable.name] || "").toLowerCase())
                    ) || []
                  )}
                  onChange={(e) => {
                    const filteredValues = values?.filter((value) =>
                      value
                        ?.toLowerCase()
                        .includes((searchValues[variable.name] || "").toLowerCase())
                    );
                    handleSelectAll(variable.name, filteredValues, e.target.checked);
                  }}
                />
                <span className="text-gray-700 text-sm font-medium">Select All</span>
              </label>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {values
                ?.filter((value) =>
                  value
                    ?.toLowerCase()
                    .includes((searchValues[variable.name] || "").toLowerCase())
                )
                .map((value, idx) => (
                  <label
                    key={idx}
                    className="flex items-center px-3 py-2 hover:bg-gray-200 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selections[variable.name]?.includes(value)}
                      onChange={() => handleSelectionChange(variable.name, value)}
                    />
                    <span className="text-gray-700 text-sm">{value}</span>
                  </label>
                ))}
            </div>
          </div>
        )}
      </>
    );
  };
 
  return (
    <div className="w-full">
      <div className="nav-toolbar h-auto flex flex-wrap text-gray-700 border-b border-gray-200 rounded-lg p-4">
        <TimeRangeSelector />
        <AutoRefresh />
      </div>
 
      <div className="p-4 rounded-lg">
        {loading ? (
          <div className="text-gray-700">Loading variables...</div>
        ) : error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : (
          <div className="flex flex-wrap items-center">
            {templatingVariables.map((variable, index) => (
              <div
                key={`var-${index}`}
                className="relative inline-block mr-2 mb-4"
              >
                {renderDropdown(variable)}
              </div>
            ))}
          </div>
        )}
      </div>
 
      <iframe
        title="VMs"
        className="w-full h-screen border-0 rounded-lg shadow-md"
        src={buildIframeUrl()}
      />
    </div>
  );
};
 
export default VMs;
 

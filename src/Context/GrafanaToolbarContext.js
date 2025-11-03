import React, { createContext, useState, useEffect } from "react";
import dayjs from "dayjs";

export const GrafanaToolbarContext = createContext();

const GrafanaToolbarContextProvider = ({ children }) => {

  let menu=['All','menu1','menu2']
  //state fot menu items for user selections default values
  let [samplingMenu,setSamplingMenu]=useState(['All'])
  let [vcenterServerMenu,setVcenterServerMenu]=useState(['All'])
  let [clusterMenu,setClusterMenu]=useState(['All'])
  let [ESXiServerMenu,setESXiServerMenu]=useState(['All'])
  let [dataStoresMenu,setDataStoresMenu]=useState(['default'])
  let [ESXiARMServermenu,setESXiARMServerMenu]=useState(['All'])
  let [vmMenu,setVmMenu]=useState(['All'])

  //set interval id
  let [intervalId, setIntervalId] = useState(-1);
  // function for auto refresh 
  const rangePresets = [
    {
      key: "last5Minutes",
      label: "Last 5 Minutes",
      value: () => [dayjs().subtract(5, "minutes"), dayjs()],
    },
    {
      key: "last15Minutes",
      label: "Last 15 Minutes",
      value: () => [dayjs().subtract(15, "minutes"), dayjs()],
    },
    {
      key: "last30Minutes",
      label: "Last 30 Minutes",
      value: () => [dayjs().subtract(30, "minutes"), dayjs()],
    },
    {
      key: "last1Hour",
      label: "Last 1 Hour",
      value: () => [dayjs().subtract(1, "hour"), dayjs()],
    },
    {
      key: "last3Hours",
      label: "Last 3 Hours",
      value: () => [dayjs().subtract(3, "hours"), dayjs()],
    },
    {
      key: "last6Hours",
      label: "Last 6 Hours",
      value: () => [dayjs().subtract(6, "hours"), dayjs()],
    },
    {
      key: "last12Hours",
      label: "Last 12 Hours",
      value: () => [dayjs().subtract(12, "hours"), dayjs()],
    },
    {
      key: "last24Hours",
      label: "Last 24 Hours",
      value: () => [dayjs().subtract(24, "hours"), dayjs()],
    },
    {
      key: "last2Days",
      label: "Last 2 Days",
      value: () => [dayjs().subtract(2, "days"), dayjs()],
    },
    {
      key: "last7Days",
      label: "Last 7 Days",
      value: () => [dayjs().subtract(7, "days"), dayjs()],
    },
    {
      key: "last30Days",
      label: "Last 30 Days",
      value: () => [dayjs().subtract(30, "days"), dayjs()],
    },
    {
      key: "last90Days",
      label: "Last 90 Days",
      value: () => [dayjs().subtract(90, "days"), dayjs()],
    },
    {
      key: "last6Months",
      label: "Last 6 Months",
      value: () => [dayjs().subtract(6, "months"), dayjs()],
    },
    {
      key: "last1Year",
      label: "Last 1 Year",
      value: () => [dayjs().subtract(1, "year"), dayjs()],
    },
    {
      key: "last2Years",
      label: "Last 2 Years",
      value: () => [dayjs().subtract(2, "years"), dayjs()],
    },
    {
      key: "last5Years",
      label: "Last 5 Years",
      value: () => [dayjs().subtract(5, "years"), dayjs()],
    },
    {
      key: "today",
      label: "Today",
      value: () => [dayjs().startOf("day"), dayjs().endOf("day")],
    },
    {
      key: "yesterday",
      label: "Yesterday",
      value: () => [dayjs().subtract(1, "day"), dayjs()],
    },
    {
      key: "dayBeforeYesterday",
      label: "Day Before Yesterday",
      value: () => [dayjs().subtract(2, "days"), dayjs()],
    },
    {
      key: "thisDayLastWeek",
      label: "This Day Last Week",
      value: () => [
        dayjs().subtract(1, "week").startOf("day"),
        dayjs().subtract(1, "week").endOf("day"),
      ],
    },
    {
      key: "previousWeek",
      label: "Previous Week",
      value: () => [
        dayjs().subtract(1, "week").startOf("week"),
        dayjs().subtract(1, "week").endOf("week"),
      ],
    },
    {
      key: "previousMonth",
      label: "Previous Month",
      value: () => [
        dayjs().subtract(1, "month").startOf("month"),
        dayjs().subtract(1, "month").endOf("month"),
      ],
    },
  ];

  const [dateRange, setDateRange] = useState({
    startDate: dayjs().startOf("day"),
    endDate: dayjs(),
  });

  const [timeStamp, setTimeStamp] = useState({
    startDate: Date.parse(dayjs().startOf("day")),
    endDate: Date.parse(dayjs()),
  });

  const [autoOption, setAutoOption] = useState("");

  const onRangeChange = (dates, dateStrings) => {
    // Implement your range change logic here...
    if (dates) {
      setTimeStamp({
        startDate: Date.parse(dates[0]),
        endDate: Date.parse(dates[1]),
      });
      setDateRange({
        startDate: dates[0],
        endDate: dates[1],
      });
      localStorage.setItem(
        "grafanaDateRange",
        JSON.stringify({ startDate: dates[0], endDate: dates[1] })
      );
      localStorage.setItem(
        "grafanaDateRangeTimeStamp",
        JSON.stringify({
          startDate: Date.parse(dates[0]),
          endDate: Date.parse(dates[1]),
        })
      );
    }
  };
//function to update timestamp --------------------------->

  const autoUpdateTimeStamp = (newInterval) => {
    // Implement your auto update timestamp logic here...
    if (intervalId === -1) {
      setIntervalId();
    }
    setIntervalId(
      setInterval(() => {
        setTimeStamp((prevValue) => ({
          startDate: prevValue.startDate + newInterval,
          endDate: prevValue.endDate + newInterval,
        }));
      }, newInterval)
    );
  };

  useEffect(() => {
    // Implement your effect logic here...
    switch (autoOption) {
      case "off":
        clearInterval(intervalId);
        setIntervalId(-1);
        break;
      case "10s":
        clearInterval(intervalId);
        setIntervalId(-1);
        autoUpdateTimeStamp(10 * 1000);
        break;
      case "30s":
        clearInterval(intervalId);
        setIntervalId(-1);
        autoUpdateTimeStamp(30 * 1000);
        break;
      case "1m":
        clearInterval(intervalId);
        setIntervalId(-1);
        autoUpdateTimeStamp(60 * 1000);
        break;
      case "5m":
        clearInterval(intervalId);
        setIntervalId(-1);
        autoUpdateTimeStamp(5 * 60 * 1000);
        break;
      case "15m":
        clearInterval(intervalId);
        setIntervalId(-1);
        autoUpdateTimeStamp(15 * 60 * 1000);
        break;
      case "30m":
        clearInterval(intervalId);
        setIntervalId(-1);
        autoUpdateTimeStamp(30 * 60 * 1000);
        break;
      case "1hr":
        clearInterval(intervalId);
        setIntervalId(-1);
        autoUpdateTimeStamp(60 * 60 * 1000);
        break;
      case "2hr":
        clearInterval(intervalId);
        setIntervalId(-1);
        autoUpdateTimeStamp(2 * 60 * 60 * 1000);
        break;
      case "1day":
        clearInterval(intervalId);
        setIntervalId(-1);
        autoUpdateTimeStamp(24 * 60 * 60 * 1000);
        break;
      default:
        clearInterval(intervalId);
        setIntervalId(-1);
    }
  }, [autoOption]);

  const value = {
    rangePresets:rangePresets,
    onRangeChange:onRangeChange,
    timeStamp:timeStamp,
    setTimeStamp:setTimeStamp,
    autoOption:autoOption,
    setAutoOption:setAutoOption,
    dateRange:dateRange,
    samplingMenu:samplingMenu,
    setSamplingMenu:setSamplingMenu,
    vcenterServerMenu:vcenterServerMenu,
    setVcenterServerMenu:setVcenterServerMenu,
    clusterMenu:clusterMenu,
    setClusterMenu:setClusterMenu,
    ESXiServerMenu:ESXiServerMenu,
    setESXiServerMenu:setESXiServerMenu,
    dataStoresMenu:dataStoresMenu,
    ESXiARMServermenu:ESXiARMServermenu,
    setESXiARMServerMenu:setESXiARMServerMenu,
    vmMenu:vmMenu,
    setVmMenu:setVmMenu,
    menu:menu,
  };

  return (
    <GrafanaToolbarContext.Provider value={value}>
      {children}
    </GrafanaToolbarContext.Provider>
  );
};

export default GrafanaToolbarContextProvider;

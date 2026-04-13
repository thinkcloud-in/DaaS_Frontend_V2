import React from "react";
import "../css/Dashboard.css";
import { useContext } from "react";
import TimeRangeSelector from "../TimeRangeSelector";
import AutoRefresh from "../AutoRefresh";
import { GrafanaToolbarContext } from '../../../Context/GrafanaToolbarContext';
import { getEnv } from "utils/getEnv";

const HVHosts = () => {
  const gc = useContext(GrafanaToolbarContext);
  const grafanaUrl = getEnv("GRAFANA_URL");

  const iframeSrc =
    `${grafanaUrl}/grafana/d/hyperv-monitoring-002/hyper-v-host-monitoring` +
    `?orgId=1` +
    `&from=${gc.timeStamp.startDate}` +
    `&to=${gc.timeStamp.endDate}` +
    `&theme=light` +
    `&kiosk`;

  return (
    <div className='w-full'>
      <div className="nav-toolbar h-auto flex flex-wrap">
        <TimeRangeSelector />
        <AutoRefresh />
      </div>
      <iframe
        title='hyperv-hosts-dashboard'
        src={iframeSrc}
        width="100%"
        height="900"
        style={{ border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "white" }}
      ></iframe>
    </div>
  );
};

export default HVHosts;

import React from "react";
import "../css/Dashboard.css";
import '../css/Dashboard.css';
import { useContext } from "react";
import TimeRangeSelector from "../TimeRangeSelector";
import AutoRefresh from "../AutoRefresh";
import { GrafanaToolbarContext } from '../../../Context/GrafanaToolbarContext';
import { getEnv } from "utils/getEnv";

const HyperV = () => {
  const gc = useContext(GrafanaToolbarContext);
  const grafanaUrl = getEnv("GRAFANA_URL");

  const iframeSrc =
    `${grafanaUrl}/d/hyperv-monitoring-002/hyper-v-host-monitoring` +//`${grafanaUrl}/d/cbcfea7a-2f3f-4150-ab89-8c602bc54b34/hyper-v-wmi` +
    `?orgId=1` +
    `&from=${gc.timeStamp.startDate}` +
    `&to=${gc.timeStamp.endDate}` +
    `&theme=light` +
    `&kiosk`;
  //http://172.16.0.103:3001/d/cbcfea7a-2f3f-4150-ab89-8c602bc54b34/hyper-v-wmi?orgId=1&from=1764111532475&to=1764133132475
  return (
    <div className='w-full'>
      <div className="nav-toolbar h-auto flex flex-wrap">
        <TimeRangeSelector />
        <AutoRefresh />
      </div>
      <iframe
        title='vamanit-server-dashboard'
        src={iframeSrc}
        width="100%"
        height="900"
        style={{ border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "white" }}
      ></iframe>
    </div>
  );
};

export default HyperV;

import React from "react";
import '../css/Dashboard.css'
import { useContext } from "react";
import TimeRangeSelector from "../TimeRangeSelector";
import AutoRefresh from "../AutoRefresh";
import { GrafanaToolbarContext } from '../../../Context/GrafanaToolbarContext';
import { PoolContext } from "../../../Context/PoolContext";
 
let ProxmoxVMs = () => {
  let gc = useContext(GrafanaToolbarContext);
  let pc = useContext(PoolContext);
 
  // Update these if you want to make variables dynamic
  const grafanaUrl = process.env.REACT_APP_GRAFANA_URL;
  const dashboardUid = "e0b353ea-7df0-43b5-8f57-c0dcf5776022";
  const dashboardName = "vms";
 
  const iframeSrc = `${grafanaUrl}/d/${dashboardUid}/${dashboardName}` +
    `?orgId=1` +
    `&from=${gc.timeStamp.startDate}` +
    `&to=${gc.timeStamp.endDate}` +
    `&theme=light` +
    `&disableLazyLoad=true` +
    `&kiosk`;
 
  return (
    <div className='w-full'>
      <div className="nav-toolbar h-auto flex flex-wrap">
        <TimeRangeSelector />
        <AutoRefresh />
      </div>
      <iframe
        title='vms-overview'
        src={iframeSrc}
        width="100%"
        height="900"
        style={{ border: "1px solid #ccc", borderRadius: "8px" }}
      ></iframe>
    </div>
  );
};
 
export default ProxmoxVMs;
 
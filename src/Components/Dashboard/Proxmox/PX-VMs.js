import React from "react";
import '../css/Dashboard.css'
import { useContext } from "react";
import TimeRangeSelector from "../TimeRangeSelector";
import AutoRefresh from "../AutoRefresh";
import { GrafanaToolbarContext } from '../../../Context/GrafanaToolbarContext';
import { useTheme } from '../../../Context/ThemeContext';
import { getEnv } from "utils/getEnv";
 
let ProxmoxVMs = () => {
  let gc = useContext(GrafanaToolbarContext);
  const { theme } = useTheme();
 
  const grafanaUrl = getEnv("GRAFANA_URL");
  const dashboardUid = getEnv("PX_VM_DASHBOARD_UID");
  const dashboardName = getEnv("PX_VM_DASHBOARD_NAME");
 
  const iframeSrc = `${grafanaUrl}/d/${dashboardUid}/${dashboardName}` +
    `?orgId=1` +
    `&from=${gc.timeStamp.startDate}` +
    `&to=${gc.timeStamp.endDate}` +
    `&theme=${theme}` +
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
 
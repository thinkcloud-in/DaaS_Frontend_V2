import React,{useEffect} from "react";
import '../css/Dashboard.css'
import { useContext } from "react";
import TimeRangeSelector from "../TimeRangeSelector";
import AutoRefresh from "../AutoRefresh";
import { GrafanaToolbarContext } from '../../../Context/GrafanaToolbarContext';
import { useTheme } from '../../../Context/ThemeContext';
import { getEnv } from "utils/getEnv";
 
let ProxmoxOverview = () => {
  let gc = useContext(GrafanaToolbarContext);
  const { theme } = useTheme();

  const server = "All";
 
  const grafanaUrl = getEnv("GRAFANA_URL");
  const dashboardUid = getEnv("PX_OVERVIEW_DASHBOARD_UID");
  const dashboardName = getEnv("PX_OVERVIEW_DASHBOARD_NAME");
 
  const iframeSrc = `${grafanaUrl}/d/${dashboardUid}/${dashboardName}` +
    `?orgId=1` +
    `&refresh=10s` +
    `&var-server=${server}` +
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
      {grafanaUrl && (
        <iframe
          title='proxmox-sysops-overview'
          src={iframeSrc}
          width="100%"
          height="900"
          style={{ border: "1px solid #ccc", borderRadius: "8px" }}
        />
      )}
    </div>
  );
};
 
export default ProxmoxOverview;
 
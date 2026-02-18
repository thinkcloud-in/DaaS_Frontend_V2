import '../css/Dashboard.css'
import { useContext } from "react";
import TimeRangeSelector from "../TimeRangeSelector";
import AutoRefresh from "../AutoRefresh";
import { GrafanaToolbarContext } from '../../../Context/GrafanaToolbarContext';
import { getEnv } from "utils/getEnv";
 
let ProxmoxHost= () => {
  let gc = useContext(GrafanaToolbarContext);
 
  // Values from your URL, can be made dynamic if required
  const dsProxmox = "c802160b-16ac-4d18-a08e-5440de62cc88";
  const bucket = "proxmox-metrics";
  const server = "All";
 
  const grafanaUrl = getEnv("GRAFANA_URL");
  // const dashboardUid = "IfgdXjtnk"; // Dashboard UID
  const dashboardUid = "IfgdXjtns";
  // const dashboardName = "proxmox-ve-cluster-flux"; // Dashboard slug/name
  const dashboardName = "proxmox-host";
 
  const iframeSrc = `${grafanaUrl}/d/${dashboardUid}/${dashboardName}` +
    `?orgId=1&refresh=30s` +
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
        title='proxmox-cluster-flux-overview'
        src={iframeSrc}
        width="100%"
        height="900"
        style={{ border: "1px solid #ccc", borderRadius: "8px" }}
      ></iframe>
    </div>
  );
};
 
export default ProxmoxHost;
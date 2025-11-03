import '../css/Dashboard.css'
import { useContext } from "react";
import TimeRangeSelector from "../TimeRangeSelector";
import AutoRefresh from "../AutoRefresh";
import { GrafanaToolbarContext } from '../../../Context/GrafanaToolbarContext';
import { PoolContext } from "../../../Context/PoolContext";
 
let ProxmoxStorage = () => {
  let gc = useContext(GrafanaToolbarContext);
  let pc = useContext(PoolContext);
 
  // These values are from your URL and can be made dynamic if required
  const dsProxmox = "c802160b-16ac-4d18-a08e-5440de62cc88";
  const bucket = "proxmox-metrics";
  const server = "prox2";
 
  const grafanaUrl = process.env.REACT_APP_GRAFANA_URL;
  const dashboardUid = "IfgdXjtnk1"; // Dashboard UID for Proxmox 7 with InfluxDB2
  const dashboardName = "proxmox-2024"; // Dashboard name/slug
 
  const iframeSrc = `${grafanaUrl}/d/${dashboardUid}/${dashboardName}` +
    `?orgId=1` +
    `&var-dsProxmox=${dsProxmox}` +
    `&var-Bucket=${bucket}` +
    `&var-server=${server}` +
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
        title='proxmox-influxdb2-overview'
        src={iframeSrc}
        width="100%"
        height="900"
        style={{ border: "1px solid #ccc", borderRadius: "8px" }}
      ></iframe>
    </div>
  );
};
 
export default ProxmoxStorage;
 
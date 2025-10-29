import '../css/Dashboard.css'
import { useContext } from "react";
import TimeRangeSelector from "../TimeRangeSelector";
import AutoRefresh from "../AutoRefresh";
import { GrafanaToolbarContext } from '../../../Context/GrafanaToolbarContext';
import { PoolContext } from "../../../Context/PoolContext";
 
let ProxmoxOverview = () => {
  let gc = useContext(GrafanaToolbarContext);
  let pc = useContext(PoolContext);
 
  // Values from your URL, can be made dynamic if required
  const dsProxmox = "c802160b-16ac-4d18-a08e-5440de62cc88";
  const bucket = "proxmox-metrics";
  const server = "All";
 
  const grafanaUrl = process.env.REACT_APP_GRAFANA_URL;
  const dashboardUid = "IfgdXjtnk"; // Dashboard UID
  const dashboardName = "proxmox-ve-cluster-flux"; // Dashboard slug/name
 
  const iframeSrc = `${grafanaUrl}/d/${dashboardUid}/${dashboardName}` +
    `?orgId=1` +
    `&refresh=30s` +
    `&var-dsProxmox=${dsProxmox}` +
    `&var-Bucket=${bucket}` +
    `&var-server=${server}` +
    `&from=${gc.timeStamp.startDate}` +
    `&to=${gc.timeStamp.endDate}` +
    `&theme=light` +
    `&disableLazyLoad=true` +
    `&kiosk`;
 const iframeurl="http://172.16.0.103:3001/d/IfgdXjtnk/proxmox-ve-cluster-flux?orgId=1&refresh=10s&var-dsProxmox=c802160b-16ac-4d18-a08e-5440de62cc88&var-Bucket=proxmox-metrics&var-server=All&from=1758606543765&to=1758606843765"
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
 
export default ProxmoxOverview;
 
// import '../css/Dashboard.css'
// import { useContext } from "react";
// import TimeRangeSelector from "../TimeRangeSelector";
// import AutoRefresh from "../AutoRefresh";
// import { GrafanaToolbarContext } from '../../../Context/GrafanaToolbarContext';

 
// let ProxmoxOverview = () => {
//   let gc = useContext(GrafanaToolbarContext);
 
//   // Values from your URL, can be made dynamic if required
//   const dsProxmox = "c802160b-16ac-4d18-a08e-5440de62cc88";
//   const bucket = "proxmox-metrics";
//   const server = "All";
 
//   const grafanaUrl = process.env.REACT_APP_GRAFANA_URL;
//   // const dashboardUid = "IfgdXjtnk"; // Dashboard UID
//   const dashboardUid = "IfgdXjtns";
//   // const dashboardName = "proxmox-ve-cluster-flux"; // Dashboard slug/name
//   const dashboardName = "proxmox-host";
 
//   const iframeSrc = `${grafanaUrl}/d/${dashboardUid}/${dashboardName}` +
//     `?orgId=1` +
//     `&refresh=30s` +
//     `&var-dsProxmox=${dsProxmox}` +
//     `&var-Bucket=${bucket}` +
//     `&var-server=${server}` +
//     `&from=${gc.timeStamp.startDate}` +
//     `&to=${gc.timeStamp.endDate}` +
//     `&theme=light` +
//     `&disableLazyLoad=true` +
//     `&kiosk`;

//   return (
//     <div className='w-full'>
//       <div className="nav-toolbar h-auto flex flex-wrap">
//         <TimeRangeSelector />
//         <AutoRefresh />
//       </div>
//       <iframe
//         title='proxmox-cluster-flux-overview'
//         src={iframeSrc}
//         width="100%"
//         height="900"
//         style={{ border: "1px solid #ccc", borderRadius: "8px" }}
//       ></iframe>
//     </div>
//   );
// };
 
// export default ProxmoxOverview;
 

 

import React,{useEffect} from "react";
import '../css/Dashboard.css'
import { useContext } from "react";
import TimeRangeSelector from "../TimeRangeSelector";
import AutoRefresh from "../AutoRefresh";
import { GrafanaToolbarContext } from '../../../Context/GrafanaToolbarContext';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getEnv } from 'utils/getEnv';
 
let ProxmoxNodes = () => {
  let gc = useContext(GrafanaToolbarContext);
 
  // These values are from your URL and can be made dynamic if required
  // const dsProxmox = "c802160b-16ac-4d18-a08e-5440de62cc88";
  // const bucket = "proxmox-metrics";
  const server = "All";

  const grafanaUrl = getEnv('GRAFANA_URL');
  console.log('----------------grafanaUrl:', grafanaUrl);
  const dashboardUid = "proxmox-overview"; // Proxmox SysOps dashboard UID
  const dashboardName = "Proxmox Overview"; // Proxmox SysOps dashboard name
   useEffect(() => {
    if (!grafanaUrl) {
      toast.error(`Grafana URL is: ${grafanaUrl}`);
    } else {
      toast.success(`Grafana URL: ${grafanaUrl}`);
    }
  }, [grafanaUrl]);
 
  const iframeSrc = `${grafanaUrl}/d/${dashboardUid}/${dashboardName}` +
    `?orgId=1` +
    `&refresh=10s` +
    `&var-server=${server}` +
    `&from=${gc.timeStamp.startDate}` +
    `&to=${gc.timeStamp.endDate}` +
    `&theme=light` +
    `&disableLazyLoad=true` +
    `&kiosk`;
 
  return (
    <div className='w-full'>
        <ToastContainer
        position="top-right"
        autoClose={6000}
        // hideProgressBar
      />
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
 
export default ProxmoxNodes;
 
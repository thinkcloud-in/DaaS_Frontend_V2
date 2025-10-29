import React from "react"; 
import "../css/Dashboard.css";
import '../css/Dashboard.css';
import { useContext } from "react";
import TimeRangeSelector from "../TimeRangeSelector";
import AutoRefresh from "../AutoRefresh";
import { GrafanaToolbarContext } from '../../../Context/GrafanaToolbarContext';
 
const VamanitServerDashboard = ({ vamanitServer = "All" }) => {
  const gc = useContext(GrafanaToolbarContext);
 
  // You can make this dynamic or use an env variable as needed
  const grafanaUrl = process.env.REACT_APP_GRAFANA_URL
 
 
  const iframeSrc =
    `${grafanaUrl}/d/bcbef98f-df2c-47f2-a294-6b17f670f037/vamanit-server-management` +
    `?orgId=1` +
    `&from=${gc.timeStamp.startDate}` +
    `&to=${gc.timeStamp.endDate}` +
    `&var-VamanitServer=${vamanitServer}` +
    `&theme=light` +
    `&kiosk`;
 
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
        style={{ border: "1px solid #ccc", borderRadius: "8px" ,backgroundColor: "white"}}
      ></iframe>
    </div>
  );
};
 
export default VamanitServerDashboard;
 
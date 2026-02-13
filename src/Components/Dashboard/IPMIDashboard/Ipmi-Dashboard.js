import React, { useEffect } from "react";
import "../css/Dashboard.css";
import "../css/Dashboard.css";
import { useContext } from "react";
import TimeRangeSelector from "../TimeRangeSelector";
import AutoRefresh from "../AutoRefresh";
import { GrafanaToolbarContext } from "../../../Context/GrafanaToolbarContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VamanitServerDashboard = ({ vamanitServer = "All" }) => {
  const gc = useContext(GrafanaToolbarContext);

  // You can make this dynamic or use an env variable as needed
  const grafanaUrl = process.env.REACT_APP_GRAFANA_URL;
  const dashboardUid = "bcbef98f-df2c-47f2-a294-6b17f670f037"; // Proxmox SysOps dashboard UID
  const dashboardName = "vamanit-server-management"; // Proxmox SysOps dashboard name

  useEffect(() => {
    if (!grafanaUrl) {
      toast.error("Grafana URL is undefined ");
    } else {
      toast.success(`Grafana URL: ${grafanaUrl}`);
    }
  }, [grafanaUrl]);

  const iframeSrc =
    `${grafanaUrl}/d/${dashboardUid}/${dashboardName}` +
    `?orgId=1` +
    `&refresh=10s` +
    `&from=${gc.timeStamp.startDate}` +
    `&to=${gc.timeStamp.endDate}` +
    `&var-VamanitServer=${vamanitServer}` +
    `&theme=light` +
    `&kiosk`;

  return (
    <div className="w-full">
      <ToastContainer
        position="top-right"
        autoClose={6000}
        // hideProgressBar
      />
      <div className="nav-toolbar h-auto flex flex-wrap">
        <TimeRangeSelector />
        <AutoRefresh />
      </div>
      <iframe
        title="vamanit-server-dashboard"
        src={iframeSrc}
        width="100%"
        height="900"
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          backgroundColor: "white",
        }}
      ></iframe>
    </div>
  );
};

export default VamanitServerDashboard;

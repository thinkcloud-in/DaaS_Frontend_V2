import "./css/Dashboard.css";
import { useContext } from "react";
import TimeRangeSelector from "./TimeRangeSelector";
import AutoRefresh from "./AutoRefresh";
import { GrafanaToolbarContext } from "../../Context/GrafanaToolbarContext";
import { useTheme } from "../../Context/ThemeContext";
import { getEnv } from "utils/getEnv";

// import { useKeycloak } from '@react-keycloak/web';
let Dashboard = () => {
  let gc = useContext(GrafanaToolbarContext);
  const { theme } = useTheme();
  const GRAFANA_URL = getEnv('GRAFANA_URL2');

  return (
    <div className="w-full">
      <div className="nav-toolbar h-auto flex flex-wrap">
        <TimeRangeSelector />
        <AutoRefresh />
      </div>
      <iframe
        title="dash"
        src={`${GRAFANA_URL}/d/${process.env.REACT_APP_GRAFANA_DASHBOARD_ID}/${process.env.REACT_APP_GRAFANA_DASHBOARD_NAME}?orgId=1&from=${gc.timeStamp.startDate}&to=${gc.timeStamp.endDate}&theme=${theme}&disableLazyLoad=true&kiosk`}
      ></iframe>
    </div>
  );
};
export default Dashboard;

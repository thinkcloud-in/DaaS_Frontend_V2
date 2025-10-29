import { BrowserRouter, Route, Routes,useLocation } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute/ProtectedRoute";
import React, { Suspense, useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loading from "./images/loading.png";
import GrafanaToolbarContextProvider from "./Context/GrafanaToolbarContext";
import PoolContextProvider from "./Context/PoolContext";
import RBACProvider from "./Context/RBAC Context";
import Sidebar from "./Components/Navbar/Sidebar";
import "./App.css";
import keycloakConfig from "./Components/Login/keycloak/keycloak";
import Overview from "./Components/Dashboard/Overview";
import Hosts from "./Components/Dashboard/Hosts";
import DataStores from "./Components/Dashboard/DataStores";
import VMs from "./Components/Dashboard/VMs";
import VsphereMonitoring from "./Components/Vsphere monitoring/VsphereMonitoring";
import DomainCreationForm from "Components/Domain/DomainCreatingForm";
import EditDomain from "Components/Domain/EditDomain";
import Schedule from "Components/Reports/Schedule";
import ReportList from "Components/Reports/ReportList";
import SMTP from "Components/Smtp/SmtpConfig";
import UserManagement from "Components/UserManagement/UserManagement";
import { Navigate } from "react-router-dom";
import Footer from "./Components/Footer/Footer";
import PoolCreationForm from "./Components/PoolCreation/PoolCreationForm";
import RetentionPeriod from "Components/Namespace/RetentionPeriod";
import IpPoolsList from "Components/IP-Pools/IpPoolsList";
import IpPoolsCreate from "Components/IP-Pools/IpPoolsCreate";
import ProxmoxOverview from "Components/Dashboard/Proxmox/PX-Overview";
import ProxmoxNodes from "Components/Dashboard/Proxmox/PX-Nodes";
import ProxmoxVMs from "Components/Dashboard/Proxmox/PX-VMs";
import ProxmoxStorage from "Components/Dashboard/Proxmox/PX-Storage";
import IPMIDashboard from "Components/Dashboard/IPMIDashboard/Ipmi-Dashboard";
import Recordings from "Components/Recordings/Recordings";
import ActiveSessions from "Components/ActiveSessions/ActiveSessions";
import TaskManagerPage from "Components/AgentTaskManager/Task_manager";
//lazy imports
const Domain = React.lazy(() => import("./Components/Domain/Domain"));
const VCenter = React.lazy(() => import("./Components/VCenter/VCenter"));
const Reports = React.lazy(() => import("./Components/Reports/Reports"));
const VamanitReports = React.lazy(() =>
  import("./Components/Reports/VamanitReports")
);
const Template = React.lazy(() => import("./Components/Template/Template"));
const Task = React.lazy(() => import("./Components/Tasks/Task"));
const Pools = React.lazy(() => import("./Components/PoolCreation/Pools"));

const ManagePool = React.lazy(() =>
  import("./Components/PoolCreation/ManagePool")
);
const IpmiCreation = React.lazy(() => import("./Components/IPMI/IpmiCreation"));
const EditIpmi = React.lazy(() => import("./Components/IPMI/EditIpmi"));
const IPMI = React.lazy(() => import("./Components/IPMI/IPMI"));
const ShowIpmi = React.lazy(() => import("./Components/IPMI/ShowIpmi"));

const Clusters = React.lazy(() => import("./Components/Clusters/Clusters"));
const ClusterCreationForm = React.lazy(() =>
  import("./Components/Clusters/ClusterCreationForm")
);
const ShowClusters = React.lazy(() =>
  import("./Components/Clusters/ShowClusters")
);
const EditCluster = React.lazy(() =>
  import("./Components/Clusters/EditCluster")
);
const EditPool = React.lazy(() => import("./Components/PoolCreation/EditPool"));
const LandingPage = React.lazy(() =>
  import("./Components/LandingPage/LandingPage")
);
const SSL = React.lazy(() => import("./Components/SSL/SSL"));
const TOTP = React.lazy(() => import("./Components/TOTP/TOTP"));
const ChangePassword = React.lazy(() =>
  import("./Components/Login/ChangePassword")
);

function App() {
  const [token, setToken] = useState("");
  const [tokenParsed, setTokenParsed] = useState("");
  // const [username, setUsername] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const localStorageToken = JSON.parse(localStorage.getItem("token"));
  const [workflowId, setWorkflowId] = useState("");
  useEffect(() => {
    // Initialize Keycloak when app loads
    keycloakConfig
      .init({
        onLoad: "login-required",
        checkLoginIframe: false,
        pkceMethod: "S256",
      })
      .then((authenticated) => {
        if (authenticated) {
          // Store authentication state and tokens
          setLoggedIn(authenticated);
          setToken(keycloakConfig.token);
          setTokenParsed(keycloakConfig.tokenParsed);
          setRefreshToken(keycloakConfig.refreshToken);
          localStorage.setItem("token", JSON.stringify(keycloakConfig.token));

          // Set up automatic token refresh
          keycloakConfig.onTokenExpired = () => {
            keycloakConfig
              .updateToken(30)
              .then((refreshed) => {
                if (refreshed) {
                  setToken(keycloakConfig.token);
                  localStorage.setItem(
                    "token",
                    JSON.stringify(keycloakConfig.token)
                  );
                }
              })
              .catch(() => {
                keycloakConfig.logout();
              });
          };
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        keycloakConfig.logout();
      });

    return () => {
      keycloakConfig.onTokenExpired = undefined;
    };
  }, []);

  // Define the loading spinner function
  const LoadingSpinner = () => (
    <center>
      <img src={Loading} className="App-logo" alt="loading" />
    </center>
  );
  return (
    <div className="App">
      {/* remove true and replace it with "token" and uncomment useEffect for keycloak initialization */}
      {token ? (
        <GrafanaToolbarContextProvider>
          <PoolContextProvider token={refreshToken} tokenParsed={tokenParsed}>
            <RBACProvider tokenParsed={tokenParsed} token={refreshToken}>
              <BrowserRouter>
                <ToastContainer />
                <Sidebar tokenParsed={tokenParsed} />
                <Suspense fallback={LoadingSpinner()}>
                  <div className="app1">
                    {/* <Navbar tokenParsed={tokenParsed} /> */}
                    <Routes>
                      <Route path="/landingpage" element={<LandingPage />} />

                      {/* Dashboard Routes */}
                      <Route
                        path="/overview"
                        element={
                          <ProtectedRoute
                            component={Overview}
                            componentKey="Overview"
                          />
                        }
                      />
                      <Route
                        path="/hosts"
                        element={
                          <ProtectedRoute
                            component={Hosts}
                            componentKey="Hosts"
                          />
                        }
                      />
                      <Route
                        path="/data-stores"
                        element={
                          <ProtectedRoute
                            component={DataStores}
                            componentKey="Data Stores"
                          />
                        }
                      />
                      <Route
                        path="/vms"
                        element={
                          <ProtectedRoute component={VMs} componentKey="VMS" />
                        }
                      />

                      <Route
                        path="/px-overview"
                        element={
                          <ProtectedRoute
                            component={ProxmoxOverview}
                            componentKey="PX-Overview"
                          />
                        }
                      />
                      <Route
                        path="/px-nodes"
                        element={
                          <ProtectedRoute
                            component={ProxmoxNodes}
                            componentKey="PX-Nodes"
                          />
                        }
                      />
                      <Route
                        path="/px-storage"
                        element={
                          <ProtectedRoute
                            component={ProxmoxStorage}
                            componentKey="PX-Storage"
                          />
                        }
                      />
                      <Route
                        path="/px-vms"
                        element={
                          <ProtectedRoute
                            component={ProxmoxVMs}
                            componentKey="PX-VMs"
                          />
                        }
                      />
                      <Route
                        path="/ipmi-dashboard"
                        element={
                          <ProtectedRoute
                            component={IPMIDashboard}
                            componentKey="IpmiDashboard"
                          />
                        }
                      />
                      {/* Domain Routes */}
                      <Route
                        path="/domain"
                        element={
                          <ProtectedRoute
                            component={Domain}
                            componentKey="Domain"
                          />
                        }
                      />
                      <Route
                        path="/domain/domain-create-form"
                        element={
                          <ProtectedRoute
                            component={DomainCreationForm}
                            componentKey="Domain"
                          />
                        }
                      />
                      <Route
                        path="/domain/edit-domain/:id"
                        element={
                          <ProtectedRoute
                            component={EditDomain}
                            componentKey="Domain"
                          />
                        }
                      />

                      {/* VCenter Route */}
                      <Route
                        path="/vcenter"
                        element={
                          <ProtectedRoute
                            component={VCenter}
                            componentKey="VCenter"
                          />
                        }
                      />

                      {/* Reports Routes */}
                      <Route
                        path="/reports"
                        element={
                          <ProtectedRoute
                            tokenParsed={tokenParsed}
                            component={Reports}
                            componentKey="Horizon Reports"
                          />
                        }
                      />
                      <Route
                        path="/vamanitreports"
                        element={
                          <ProtectedRoute
                            tokenParsed={tokenParsed}
                            component={VamanitReports}
                            componentKey="Vamanit Dass Reports"
                          />
                        }
                      />
                      <Route
                        path="/template"
                        element={
                          <ProtectedRoute
                            component={Template}
                            componentKey="Template"
                            tokenParsed={tokenParsed}
                          />
                        }
                      />
                      <Route
                        path="/Schedule"
                        element={
                          <ProtectedRoute
                            component={Schedule}
                            componentKey="Schedule"
                            tokenParsed={tokenParsed}
                          />
                        }
                      />
                      <Route
                        path="/ReportList"
                        element={
                          <ProtectedRoute
                            component={ReportList}
                            componentKey="Schedule"
                          />
                        }
                      />

                      {/* Pool Routes */}
                      <Route
                        path="/pools"
                        element={
                          <ProtectedRoute
                            component={Pools}
                            componentKey="Pools"
                            token={refreshToken}
                          />
                        }
                      />
                      <Route
                        path="/ip-pools"
                        element={
                          <ProtectedRoute
                            component={IpPoolsList}
                            componentKey="IpPools"
                            token={refreshToken}
                          />
                        }
                      />
                      <Route
                        path="/ip-pools/create"
                        element={
                          <ProtectedRoute
                            component={IpPoolsCreate}
                            componentKey="IpPools"
                            token={refreshToken}
                          />
                        }
                      />
                      <Route
                        path="/pools/pool-creation-form"
                        element={
                          <ProtectedRoute
                            component={PoolCreationForm}
                            componentKey="Pools"
                            token={refreshToken}
                            tokenParsed={tokenParsed}
                            setWorkflowId={setWorkflowId}
                          />
                        }
                      />
                      <Route
                        path="/pools/manage-pool/:id"
                        element={
                          <ProtectedRoute
                            component={ManagePool}
                            componentKey="Pools"
                            token={refreshToken}
                            tokenParsed={tokenParsed}
                          />
                        }
                      />
                      <Route
                        path="/pools/edit-pool/:id"
                        element={
                          <ProtectedRoute
                            component={EditPool}
                            componentKey="Pools"
                            token={refreshToken}
                            tokenParsed={tokenParsed}
                          />
                        }
                      />
                      <Route
                        path="/pools/:poolId/vm/:vmId/task-manager"
                        element={<TaskManagerPage />}
                      />
                      <Route
                        path="/tasks"
                        element={
                          <ProtectedRoute
                            component={Task}
                            componentKey="Tasks"
                            token={refreshToken}
                            tokenParsed={tokenParsed}
                          />
                        }
                      />
                      <Route
                        path="/ipmi"
                        element={
                          <ProtectedRoute
                            component={IPMI}
                            componentKey="IPMI"
                          />
                        }
                      />
                      <Route
                        path="/ipmi/ipmi-create-form"
                        element={
                          <ProtectedRoute
                            component={IpmiCreation}
                            componentKey="IPMI"
                          />
                        }
                      />
                      <Route
                        path="/ipmi/show-ipmi"
                        element={
                          <ProtectedRoute
                            component={ShowIpmi}
                            componentKey="IPMI"
                          />
                        }
                      />
                      <Route
                        path="/ipmi/edit-ipmi/:id"
                        element={
                          <ProtectedRoute
                            component={EditIpmi}
                            componentKey="IPMI"
                          />
                        }
                      />
                      {/* Cluster Routes */}
                      <Route
                        path="/clusters"
                        element={
                          <ProtectedRoute
                            component={Clusters}
                            componentKey="Cluster"
                          />
                        }
                      />
                      <Route
                        path="/cluster/cluster-create-form"
                        element={
                          <ProtectedRoute
                            component={ClusterCreationForm}
                            componentKey="Cluster"
                          />
                        }
                      />
                      <Route
                        path="/cluster/show-clusters"
                        element={
                          <ProtectedRoute
                            component={ShowClusters}
                            componentKey="Cluster"
                          />
                        }
                      />
                      <Route
                        path="/cluster/edit-cluster/:id"
                        element={
                          <ProtectedRoute
                            component={EditCluster}
                            componentKey="Cluster"
                          />
                        }
                      />

                      {/* Settings Routes */}
                      <Route
                        path="/ssl"
                        element={
                          <ProtectedRoute component={SSL} componentKey="SSL" />
                        }
                      />
                      <Route
                        path="/recordings"
                        element={
                          <ProtectedRoute
                            component={Recordings}
                            componentKey="Recordings"
                          />
                        }
                      />
                      <Route
                        path="/active-sessions"
                        element={
                          <ProtectedRoute
                            component={ActiveSessions}
                            componentKey="ActiveSessions"
                          />
                        }
                      />
                      <Route
                        path="/totp"
                        element={
                          <ProtectedRoute
                            component={TOTP}
                            componentKey="TOTP"
                          />
                        }
                      />
                      <Route
                        path="/SmtpConfig"
                        element={
                          <ProtectedRoute
                            component={SMTP}
                            componentKey="SMTP"
                          />
                        }
                      />
                      <Route
                        path="/user_management"
                        element={
                          <ProtectedRoute
                            component={UserManagement}
                            componentKey="RBAC"
                          />
                        }
                      />

                      {/* VSphere Monitoring Route */}
                      <Route
                        path="/vsphere-monitoring"
                        element={
                          <ProtectedRoute
                            component={VsphereMonitoring}
                            componentKey="VsphereMonitoring"
                          />
                        }
                      />

                      {/* User Settings Routes */}
                      <Route
                        path="/changepassword"
                        element={<ChangePassword />}
                      />
                      {/* Namespace */}
                      <Route
                        path="/retention-period"
                        element={
                          <ProtectedRoute
                            component={RetentionPeriod}
                            componentKey="Retention Period"
                            token={refreshToken}
                            tokenParsed={tokenParsed}
                          />
                        }
                      />
                      {/* Catch-all route for unmatched paths */}
                      <Route
                        path="*"
                        element={<Navigate to="/landingpage" replace />}
                      />
                    </Routes>
                    <FooterWrapper
                      workflowId={workflowId}
                      tokenParsed={tokenParsed}
                    />
                  </div>
                </Suspense>
              </BrowserRouter>
            </RBACProvider>
          </PoolContextProvider>
        </GrafanaToolbarContextProvider>
      ) : (
        LoadingSpinner()
      )}
    </div>
  );
}

// FooterWrapper component to handle useLocation
function FooterWrapper({ workflowId, tokenParsed }) {
  const location = useLocation();

  // List of dashboard section paths (exact matches)
  const dashboardPaths = [
    "/overview",
    "/hosts",
    "/data-stores",
    "/vms",
    "/px-overview",
    "/px-nodes",
    "/px-storage",
    "/px-vms",
    "/ipmi-dashboard",
    "/vcenter",
    "/landingpage",
    "/",
  ];

  // Dynamically determine if the footer should be hidden
  const hideFooter = dashboardPaths.includes(location.pathname);

  return !hideFooter ? <Footer workflowId={workflowId} tokenParsed={tokenParsed} /> : null;
}
export default App;

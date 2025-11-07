import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './features/Auth/AuthSlice';
import rbacReducer from './features/Rbac/RbacSlice';
import userManagementReducer from './features/UserManagement/UserManagementSlice';
import templateReducer from './features/Template/TemplateSlice';
import reportsReducer from './features/Reports/ReportsSlice';
import vamanitReportsReducer from './features/VamanitReports/VamanitReportsSlice';
import domainReducer from './features/Domain/DomainSlice';
import poolsReducer from './features/Pools/PoolsSlice';
import ipPoolsReducer from './features/IP-Pools/IpPoolsSlice';
import ipmiReducer from './features/IPMI/IpmiSlice';
import smtpReducer from './features/SMTP/SmtpSlice';
import tasksReducer from './features/Tasks/TasksSlice';
import footerReducer from './features/Footer/FooterSlice';
import totpReducer from './features/TOTP/TotpSlice';
import agentTaskManagerReducer from './features/AgentTaskManager/TaskManagerSlice';
// import clustersReducer from './features/Clusters/ClustersSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  rbac: rbacReducer,
  userManagement: userManagementReducer,
  template: templateReducer,
  reports: reportsReducer,
  vamanitReports: vamanitReportsReducer,
  domain: domainReducer,
  pools: poolsReducer,
  ipPools: ipPoolsReducer,
  ipmi: ipmiReducer,
  smtp: smtpReducer,
  tasks: tasksReducer,
  footer: footerReducer,
  totp: totpReducer,
  agentTaskManager: agentTaskManagerReducer,
  // clusters: clustersReducer,
  
});

export default rootReducer;
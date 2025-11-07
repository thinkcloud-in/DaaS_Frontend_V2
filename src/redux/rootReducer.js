import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './features/Auth/AuthSlice';
import rbacReducer from './features/Rbac/RbacSlice';
import userManagementReducer from './features/UserManagement/UserManagementSlice';
import templateReducer from './features/Template/TemplateSlice';
import reportsReducer from './features/Reports/ReportsSlice';
import vamanitReportsReducer from './features/VamanitReports/VamanitReportsSlice';
import domainReducer from './features/Domain/DomainSlice';
import poolsReducer from './features/Pools/PoolsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  rbac: rbacReducer,
  userManagement: userManagementReducer,
  template: templateReducer,
  reports: reportsReducer,
  vamanitReports: vamanitReportsReducer,
  domain: domainReducer,
  pools: poolsReducer,
  
});

export default rootReducer;
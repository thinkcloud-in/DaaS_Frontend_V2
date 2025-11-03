import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './features/Auth/AuthSlice';
import rbacReducer from './features/Rbac/RbacSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  rbac: rbacReducer,
 
});

export default rootReducer;
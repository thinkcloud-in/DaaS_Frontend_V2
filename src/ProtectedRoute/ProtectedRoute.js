
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRbac } from '../Context/RBAC Context';

const ProtectedRoute = ({ component: Component, componentKey, ...rest }) => {
  const { hasAccess, loading } = useRbac();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasAccess(componentKey)) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Component {...rest} />;
};

export default ProtectedRoute;

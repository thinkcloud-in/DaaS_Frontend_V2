import { useSelector } from 'react-redux';

export const useRbac = () => {
  const { roles, components, navigation, loading, error } = useSelector(state => state.rbac);
  return {
    roles,
    components,
    navigation,
    loading,
    error,
    hasAccess: (componentName) => components.includes(componentName),
    hasRole: (roleName) => roles.includes(roleName),
  };
};
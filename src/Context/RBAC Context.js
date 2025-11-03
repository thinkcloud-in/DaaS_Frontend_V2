import React, { createContext, useState, useEffect, useMemo } from "react";
import { fetchUserPermissions } from "Services/ContextService";
export const RbacContext = createContext({
  roles: [],
  components: [],
  navigation: [],
  hasAccess: () => false,
  hasRole: () => false,
  loading: true,
  error: null,
});

// Define the base navigation structure with exact component names matching the API
const baseNavigation = [
  {
    name: "Dashboard",
    href: "/",
    componentKey: "Dashboard",
    submenus: [
      {
        name: "VCenter",
        href: "/",
        componentKey: "vCenter",
        submenus: [
          { name: "Overview", href: "/overview", componentKey: "Overview" },
          { name: "Hosts", href: "/hosts", componentKey: "Hosts" },
          {
            name: "Data Stores",
            href: "/data-stores",
            componentKey: "Data Stores",
          },
          { name: "VMS", href: "/vms", componentKey: "VMS" },
        ],
      },
      {
        name: "Proxmox",
        href: "/",
        componentKey: "Proxmox",
        submenus: [
          {
            name: "PX-Overview",
            href: "/px-overview",
            componentKey: "PX-Overview",
          },
          { name: "PX-Nodes", href: "/px-nodes", componentKey: "PX-Nodes" },
          {
            name: "PX-Storage",
            href: "/px-storage",
            componentKey: "PX-Storage",
          },
          { name: "PX-VMs", href: "/px-vms", componentKey: "PX-VMs" },
        ],
      },
      {
        name: "IPMI Dashboard",
        href: "/ipmi-dashboard",
        componentKey: "IpmiDashboard",
        submenus: [
          {
            name: "IPMI Dashboard",
            href: "/ipmi-dashboard",
            componentKey: "IpmiDashboard",
          },
        ],
      },
    ],
  },
  {
    name: "Reports",
    href: "/",
    componentKey: "Reports",
    submenus: [
      { name: "Template", href: "/template", componentKey: "Template" },
      {
        name: "Horizon Reports",
        href: "/reports",
        componentKey: "Horizon Reports",
      },
      {
        name: "Vamanit Dass Reports",
        href: "/vamanitreports",
        componentKey: "Vamanit Dass Reports",
      },
    ],
  },
  {
    name: "Recordings",
    href: "/recordings",
    componentKey: "Recordings",
  },
  {
    name: "ActiveSessions",
    href: "/active-sessions",
    componentKey: "ActiveSessions",
  },
  {
    name: "Schedule",
    href: "/Reportlist",
    componentKey: "Schedule",
  },

  {
    name: "VDI Pools",
    href: "/pools",
    componentKey: "Pools",
  },
  {
    name: "IP Pools",
    href: "/ip-pools",
    componentKey: "IpPools",
  },
  {
    name: "Tasks",
    href: "/tasks",
    componentKey: "Tasks",
  },
  {
    name: "Settings",
    href: "/",
    componentKey: "Settings",
    submenus: [
     
      {
        name: "TOTP",
        href: "/totp",
        current: false,
        beta: true,
        componentKey: "TOTP",
      },
      {
        name: "Domain",
        href: "/domain",
        current: false,
        beta: false,
        componentKey: "Domain",
      },
      {
        name: "IPMI",
        href: "/ipmi",
        current: false,
        beta: false,
        componentKey: "IPMI",
      },
      {
        name: "Cluster",
        href: "/clusters",
        current: false,
        beta: false,
        componentKey: "Cluster",
      },
     
      {
        name: "SSL",
        href: "/ssl",
        current: false,
        beta: true,
        componentKey: "SSL",
      },
      {
        name: "SMTP",
        href: "/SmtpConfig",
        current: false,
        beta: false,
        componentKey: "SMTP",
      },
      {
        name: "RBAC",
        href: "/user_management",
        current: false,
        componentKey: "RBAC",
      },
      {
        name: "Retention Period",
        href: "/retention-period",
        current: false,
        componentKey: "Retention Period",
      },
    ],
  },
];

const RbacProvider = ({ children, tokenParsed, token }) => {
  const [roles, setRoles] = useState([]);
  const [components, setComponents] = useState([]);
  const [navigation, setNavigation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const username = tokenParsed?.preferred_username;

  const filterNavigation = (navItems, allowedComponents) => {
    return navItems
      .map((item) => {
        let filteredItem = { ...item };
        if (item.submenus && item.submenus.length > 0) {
          filteredItem.submenus = filterNavigation(
            item.submenus,
            allowedComponents
          );
        }
        const isAccessible = allowedComponents.includes(item.componentKey);
        const hasAccessibleSubmenus =
          filteredItem.submenus && filteredItem.submenus.length > 0;
        if (isAccessible || hasAccessibleSubmenus) {
          return filteredItem;
        }
        return null;
      })
      .filter(Boolean);
  };

  const getRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchUserPermissions(token, username);
      const userRoles = response.data?.roles;
      const userComponents = response.data?.components;
      if (response.code === 200 && response.status === "OK") {
        setRoles(userRoles || []);
        setComponents(userComponents || []);
        const filteredNavigation = filterNavigation(
          baseNavigation,
          userComponents
        );
        setNavigation(filteredNavigation);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      setError("Failed to load permissions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      getRoles();
    }
  }, [username, token]);
  const contextValue = useMemo(
    () => ({
      roles,
      components,
      navigation,
      loading,
      error,
      hasAccess: (componentName) => components.includes(componentName),
      hasRole: (roleName) => roles.includes(roleName),
      refreshPermissions: getRoles,
    }),
    [roles, components, navigation, loading, error]
  );

  return (
    <RbacContext.Provider value={contextValue}>{children}</RbacContext.Provider>
  );
};
export const useRbac = () => {
  const context = React.useContext(RbacContext);
  if (context === undefined) {
    throw new Error("useRbac must be used within a RbacProvider");
  }
  return context;
};

export default RbacProvider;

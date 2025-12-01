
export const baseNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard", // <-- should match your route
    componentKey: "Dashboard",
    submenus: [
      {
        name: "VCenter",
        href: "/vcenter", // <-- should match your route
        componentKey: "vCenter",
        submenus: [
          { name: "Overview", href: "/vcenter/overview", componentKey: "Overview" },
          { name: "Hosts", href: "/vcenter/hosts", componentKey: "Hosts" },
          { name: "Data Stores", href: "/vcenter/data-stores", componentKey: "Data Stores" },
          { name: "VMS", href: "/vcenter/vms", componentKey: "VMS" },
        ],
      },
      {
        name: "Proxmox",
        href: "/proxmox",
        componentKey: "Proxmox",
        submenus: [
          { name: "PX-Overview", href: "/proxmox/px-overview", componentKey: "PX-Overview" },
          { name: "PX-Nodes", href: "/proxmox/px-nodes", componentKey: "PX-Nodes" },
          { name: "PX-Storage", href: "/proxmox/px-storage", componentKey: "PX-Storage" },
          { name: "PX-VMs", href: "/proxmox/px-vms", componentKey: "PX-VMs" },
        ],
      },
      {
        name: "IPMI Dashboard",
        href: "/ipmi-dashboard",
        componentKey: "IpmiDashboard",
        submenus: [],
      },
      {
        name: "HyperV",
        href: "/hyperv-monitoring",
        componentKey: "HyperV",
        submenus: [],
      },
    ],
  },
  {
    name: "Reports",
    href: "/reports",
    componentKey: "Reports",
    submenus: [
      { name: "Template", href: "/template", componentKey: "Template" },
      { name: "Horizon Reports", href: "/reports/horizon", componentKey: "Horizon Reports" },
      { name: "Vamanit Dass Reports", href: "/reports/vamanit", componentKey: "Vamanit Dass Reports" },
    ],
  },
  { name: "Recordings", href: "/recordings", componentKey: "Recordings" },
  { name: "ActiveSessions", href: "/active-sessions", componentKey: "ActiveSessions" },
  { name: "Schedule", href: "/Reportlist", componentKey: "Schedule" },
  { name: "VDI Pools", href: "/pools", componentKey: "Pools" },
  { name: "IP Pools", href: "/ip-pools", componentKey: "IpPools" },
  { name: "Tasks", href: "/tasks", componentKey: "Tasks" },
  {
    name: "Settings",
    href: "/settings",
    componentKey: "Settings",
    submenus: [
      { name: "TOTP", href: "/totp", componentKey: "TOTP" },
      { name: "Domain", href: "/domain", componentKey: "Domain" },
      { name: "IPMI", href: "/ipmi", componentKey: "IPMI" },
      { name: "Cluster", href: "/clusters", componentKey: "Cluster" },
      { name: "SSL", href: "/ssl", componentKey: "SSL" },
      { name: "SMTP", href: "/SmtpConfig", componentKey: "SMTP" },
      { name: "RBAC", href: "/user_management", componentKey: "RBAC" },
      { name: "Retention Period", href: "/retention-period", componentKey: "Retention Period" },
    ],
  },
];
export const filterNavigation = (navItems, allowedComponents) => {
  return navItems
    .map((item) => {
      let filteredItem = { ...item };
      if (item.submenus && item.submenus.length > 0) {
        filteredItem.submenus = filterNavigation(item.submenus, allowedComponents);
      }
      const isAccessible = allowedComponents.includes(item.componentKey);
      const hasAccessibleSubmenus = filteredItem.submenus && filteredItem.submenus.length > 0;
      if (isAccessible || hasAccessibleSubmenus) {
        return filteredItem;
      }
      return null;
    })
    .filter(Boolean);
};
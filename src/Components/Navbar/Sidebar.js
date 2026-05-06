import React, { useState, useEffect } from "react";
import Skeleton from "@mui/material/Skeleton";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Navbar from "./Navbar";
import {
  faChevronLeft,
  faAngleRight,
  faTachometerAlt,
  faChartBar,
  faCog,
  faCalendarAlt,
  faLayerGroup,
  faTable,
  faServer,
  faCloud,
  faListAlt,
  faUserShield,
  faLock,
  faNetworkWired,
  faDatabase,
  faEnvelopeOpenText,
  faKey,
  faFileAlt,
  faChartPie,
  faUserCog,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import Beta from "../Beta/Beta";
import Thinkcloud from "../../images/t3.jpg";
import { useRbac } from "../../redux/features/Rbac/useRbac";
import { useMediaQuery } from "@mui/material";
import "./Sidebar.css";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const getIcon = (name, level = 0, parent = "") => {
  if (level === 0) {
    return (
      {
        Dashboard: faTachometerAlt,
        Reports: faTable,
        Recordings: faVideo,
        ActiveSessions: faUserShield,
        Schedule: faCalendarAlt,
        "VDI Pools": faLayerGroup,
        "IP Pools": faNetworkWired,
        Pools: faLayerGroup,
        IpPools: faNetworkWired,
        Tasks: faListAlt,
        Settings: faCog,
      }[name] || faAngleRight
    );
  }

  if (level === 1) {
    if (parent === "Reports") {
      return (
        {
          Template: faFileAlt,
          // "Horizon Reports": faChartBar,
          "Generate Reports": faChartPie,
        }[name] || faAngleRight
      );
    }

    if (parent === "Settings") {
      return (
        {
          TOTP: faKey,
          Domain: faDatabase,
          IPMI: faServer,
          Cluster: faLayerGroup,
          SSL: faLock,
          SMTP: faEnvelopeOpenText,
          RBAC: faUserCog,
          "Retention Period": faCalendarAlt,
        }[name] || faAngleRight
      );
    }

    return (
      {
        VCenter: faServer,
        Proxmox: faCloud,
        "IPMI Dashboard": faServer,
        HyperV: faServer,
      }[name] || faAngleRight
    );
  }

  if (level === 2) {
    const icons = {
      Overview: faTachometerAlt,
      Hosts: faServer,
      "Data Stores": faDatabase,
      VMS: faCloud,
      "PX-Overview": faTachometerAlt,
      "PX-Nodes": faServer,
      "PX-Storage": faDatabase,
      "PX-VMs": faCloud,
      "IPMI Dashboard": faServer,
    };
    return icons[name] || faAngleRight;
  }

  return faAngleRight;
};

const Sidebar = ({ tokenParsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isToggled, setIsToggled] = useState(true);
  const [openSubMenus, setOpenSubMenus] = useState({});
  const [navState, setNavState] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { navigation, loading } = useRbac();

  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1200px)");

  useEffect(() => {
    if (isMobile) {
      setIsToggled(false);
    } else if (isTablet) {
      setIsToggled(false);
    } else {
      setIsToggled(true);
    }
  }, [isMobile, isTablet]);

  useEffect(() => {
    function markCurrent(items) {
      return items.map((item) => {
        let isCurrent = item.href === location.pathname;
        let submenus = item.submenus ? markCurrent(item.submenus) : [];
        if (
          submenus.some(
            (sub) =>
              sub.current ||
              (sub.submenus && sub.submenus.some((ssub) => ssub.current)),
          )
        ) {
          isCurrent = false;
        }
        return { ...item, current: isCurrent, submenus };
      });
    }
    setNavState(markCurrent(navigation));
  }, [location.pathname, navigation]);

  const handleMenuItemClick = (item, level = 0) => {
    if (item.submenus && item.submenus.length > 0) {
      setOpenSubMenus((prev) => {
        const newOpen = { ...prev };
        if (prev[level] === item.name) {
          Object.keys(newOpen).forEach((l) => {
            if (parseInt(l, 10) >= level) delete newOpen[l];
          });
        } else {
          newOpen[level] = item.name;
          Object.keys(newOpen).forEach((l) => {
            if (parseInt(l, 10) > level) delete newOpen[l];
          });
        }
        return newOpen;
      });
    } else if (item.href && item.href !== "/") {
      navigate(item.href);
      if (isMobile) setMobileOpen(false);
    }
  };

  const renderMenuItems = (items, level = 0, parent = "") => (
    <ul className={level === 0 ? "" : "pl-4"}>
      {items.map((item) => {
        const hasSubmenu = item.submenus && item.submenus.length > 0;
        const isOpen = openSubMenus[level] === item.name;
        return (
          <li key={item.name} className="relative">
            <div
              onClick={() => handleMenuItemClick(item, level)}
              className={classNames(
                item.current
                  ? "bg-[#f5f5f5] text-[#1a365d] font-bold"
                  : "hover:bg-[#f5f5f5ab] hover:text-[#1a365d]",
                "menu-item rounded-md px-3 py-2 flex items-center justify-between cursor-pointer",
                level === 0 ? "text-base font-medium" : "text-sm",
              )}
            >
              <span className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={getIcon(item.name, level, parent)}
                  className="mr-2"
                />
                <span
                  className={
                    ["VCenter", "Proxmox", "HyperV"].includes(item.name) &&
                    level === 0
                      ? "font-bold"
                      : ""
                  }
                >
                  {item.name}
                </span>
              </span>
              {hasSubmenu && (
                <ChevronRightIcon
                  className={`menu-icon h-5 w-5 transition-transform ${isOpen ? "rotate-90" : ""}`}
                />
              )}
              {item.beta && <Beta />}
            </div>
            {hasSubmenu && isOpen && (
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden max-h-96 custom-scrollbar`}
              >
                {renderMenuItems(item.submenus, level + 1, item.name)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  const renderCollapsedMenu = (
    items,
    level = 0,
    parent = "",
    parentPos = { left: "100%", top: 0 },
  ) => (
    <ul
      className="sidebar-popout"
      style={{ ...parentPos, position: level === 0 ? undefined : "absolute" }}
    >
      {items.map((item) => {
        const hasSubmenu = item.submenus && item.submenus.length > 0;
        const isOpen = openSubMenus[level] === item.name;
        return (
          <li
            key={item.name}
            className="relative"
            onMouseEnter={() => hasSubmenu && handleMenuItemClick(item, level)}
            onMouseLeave={() => {
              if (hasSubmenu) {
                setOpenSubMenus((prev) => {
                  const newOpen = { ...prev };
                  Object.keys(newOpen).forEach((l) => {
                    if (parseInt(l, 10) >= level) delete newOpen[l];
                  });
                  return newOpen;
                });
              }
            }}
          >
            <div
              onClick={() => !hasSubmenu && handleMenuItemClick(item, level)}
              className={classNames(
                item.current
                  ? "bg-[#f5f5f5] text-[#1a365d] font-bold"
                  : "hover:bg-[#f5f5f5ab] hover:text-[#1a365d]",
                "menu-item rounded-md px-3 py-2 flex items-center justify-between cursor-pointer",
                level === 0 ? "text-base font-medium" : "text-sm",
              )}
              style={{ minWidth: 150, whiteSpace: "nowrap" }}
            >
              <span className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={getIcon(item.name, level, parent)}
                  className="mr-2"
                />
                <span>{item.name}</span>
              </span>
              {hasSubmenu && <ChevronRightIcon className="menu-icon h-5 w-5" />}
              {item.beta && <Beta />}
            </div>
            {hasSubmenu && isOpen && (
              <div
                style={{
                  position: "absolute",
                  left: "100%",
                  top: 0,
                  zIndex: 100 + level,
                }}
              >
                {renderCollapsedMenu(item.submenus, level + 1, item.name)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  const toggleSlide = () => {
    if (isTablet || isMobile) return;
    setIsToggled((prev) => !prev);
  };

  const handleMobileSidebar = () => {
    setMobileOpen((prev) => !prev);
  };

  if (loading) {
    if (isMobile) {
      return (
        <div className="mobile-header w-full h-15 bg-[#1a365d] flex items-center justify-between px-4 py-3 shrink-0">
          <span className="font-bold text-lg text-white">Thinkcloud</span>
          <button onClick={handleMobileSidebar} className="text-white">
            <Bars3Icon className="h-7 w-7" />
          </button>
        </div>
      );
    }
    return (
      <div
        className={`sidebar-container h-screen flex flex-col bg-[#1a365d] text-[#afb8c4] ${isToggled ? "w-64" : "w-20"} transition-all duration-300`}
      >
        <div className="flex-1 px-4 py-8 space-y-4">
          <Skeleton variant="rectangular" height={40} className="bg-white/10" />
          <Skeleton variant="rectangular" height={40} className="bg-white/10" />
          <Skeleton variant="rectangular" height={40} className="bg-white/10" />
        </div>
      </div>
    );
  }

  // Mobile View
  if (isMobile) {
    return (
      <>
        <div className="mobile-header w-full bg-[#1a365d] flex items-center justify-between px-4 py-3 shrink-0 z-[1001] shadow-md">
          <span className="font-bold text-lg text-white">Thinkcloud</span>
          <button
            onClick={handleMobileSidebar}
            className="text-white p-1 hover:bg-white/10 rounded transition-colors"
          >
            {mobileOpen ? (
              <XMarkIcon className="h-7 w-7" />
            ) : (
              <Bars3Icon className="h-7 w-7" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-[1000] flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleMobileSidebar}
            />
            <div className="relative w-64 h-full bg-[#1a365d] text-[#afb8c4] shadow-2xl flex flex-col animate-slide-in">
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                <span className="font-bold text-lg">Menu</span>
                <button
                  onClick={handleMobileSidebar}
                  className="text-[#afb8c4]"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto sidebar_scrollbar py-4 px-2">
                {renderMenuItems(navState)}
              </div>
              <div className="p-4 border-t border-white/10">
                <Navbar tokenParsed={tokenParsed} />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop/Tablet View
  return (
    <div
      className={`sidebar-container h-screen flex flex-col bg-[#1a365d] text-[#afb8c4] ${isToggled ? "w-64" : "w-20"} transition-all duration-300 shrink-0`}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a365d] shrink-0 border-b border-white/10">
        <div className="flex items-center gap-2">
          {isToggled ? (
            <span className="font-bold text-lg">Thinkcloud</span>
          ) : (
            <div
              className="sidebar-logo cursor-pointer"
              style={{
                width: "40px",
                height: "28px",
                backgroundImage: `url(${Thinkcloud})`,
                backgroundSize: "100% 100%",
                backgroundRepeat: "no-repeat",
                borderRadius: "5px",
              }}
              alt="Thinkcloud Logo"
              onClick={toggleSlide}
            />
          )}
        </div>
        {!isTablet && isToggled && (
          <button
            onClick={toggleSlide}
            className="bg-[#1a365d] text-[#afb8c4] p-2 rounded-md hover:bg-[#153056] focus:outline-none transition-colors"
            aria-label="Toggle Sidebar"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        )}
      </div>

      {isToggled ? (
        <>
          <div className="flex-1 sidebar_scrollbar">
            <div className="py-7 px-2">
              <nav className="flex flex-col gap-2">
                {renderMenuItems(navState)}
              </nav>
            </div>
          </div>
          <div className="shrink-0 p-4 border-t border-white/10">
            <Navbar tokenParsed={tokenParsed} />
          </div>
        </>
      ) : (
        <div className="bg-[#1a365d] text-[#afb8c4] w-20 flex flex-col items-center py-4 flex-1 relative">
          <div className="flex-1 w-full flex flex-col items-center gap-4">
            {navState.map((item) => {
              const hasSubmenu = item.submenus && item.submenus.length > 0;
              return (
                <div
                  key={item.name}
                  onClick={() => handleMenuItemClick(item, 0)}
                  className={classNames(
                    item.current
                      ? "bg-[#f5f5f5] text-[#1a365d] font-small"
                      : "hover:bg-[#f5f5f5ab] hover:text-[#1a365d]",
                    "menu-item rounded-md p-2 flex flex-col items-center cursor-pointer relative",
                  )}
                  title={item.name}
                >
                  <FontAwesomeIcon icon={getIcon(item.name, 0)} size="lg" />
                  {item.beta && <Beta />}
                  {hasSubmenu && openSubMenus[0] === item.name && (
                    <div
                      style={{
                        position: "absolute",
                        left: "100%",
                        top: 0,
                        zIndex: 100,
                      }}
                    >
                      {renderCollapsedMenu(item.submenus, 1, item.name)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-auto mb-2 flex justify-center w-full p-2 border-t border-white/10">
            <Navbar tokenParsed={tokenParsed} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

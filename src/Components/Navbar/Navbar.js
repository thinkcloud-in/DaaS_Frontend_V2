import { Fragment, useState } from "react";
import { Disclosure, Dialog, Transition } from "@headlessui/react";
import "./Navbar.css";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BellIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import keycloakConfig from "../Login/keycloak/keycloak";
import { useTheme } from "../../Context/ThemeContext";

// Keycloak always includes these on every user's token -- never meaningful
// to show as "the" role, so they're filtered out when picking a display role.
const _DEFAULT_KEYCLOAK_ROLES = new Set(["offline_access", "uma_authorization"]);

function getDisplayRole(tokenParsed) {
  const roles = tokenParsed?.realm_access?.roles || [];
  const real = roles.filter(
    (r) => !_DEFAULT_KEYCLOAK_ROLES.has(r) && !r.startsWith("default-roles-"),
  );
  if (!real.length) return null;
  // Prefer "admin"-like roles if present, otherwise just show the first one.
  const admin = real.find((r) => r.toLowerCase().includes("admin"));
  return admin || real[0];
}

const navigation = [
  { name: "Dashboard", href: "/", current: false, beta: false },
  { name: "Reports", href: "/reports", current: false, beta: false },
  { name: "Template", href: "/template", current: false, beta: false },
  { name: "Pools", href: "/pools", current: false, beta: false },
  { name: "Clusters", href: "/clusters", current: false, beta: false },
];
//config submenu
const config = [
  { name: "AD ", href: "/ad", current: false, beta: false },
  { name: "VCenter", href: "/vcenter", current: false, beta: false },
];
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
 
export default function Navbar(tokenParsed) {
  const navigate = useNavigate();
  const location = useLocation();
  //Update 'current' value based on the opened page
  const updateCurrentPage = () => {
    const currentPath = location.pathname;
    navigation.forEach((item) => {
      if (item.href === currentPath) {
        item.current = true;
      } else {
        item.current = false;
      }
    });
    config.forEach((item) => {
      if (item.href === currentPath) {
        item.current = true;
      } else {
        item.current = false;
      }
    });
  };

  let nameoftheuser=tokenParsed.tokenParsed.preferred_username
  const profileicon=nameoftheuser.charAt(0)
  const displayRole = getDisplayRole(tokenParsed.tokenParsed)
  const [showIdCard, setShowIdCard] = useState(false)
  const { theme, toggleTheme } = useTheme();

  updateCurrentPage();

  return (
    <Disclosure as="nav" className=" z-100">
      {({ open }) => (
        <div className="z-100">
          <div className="w-full z-100 mb-5 mt-3">
            <div className="relative flex h-16 items-center justify-start inner-nav z-100">

              <div className="absolute inset-y-0 right-0 flex flex-col gap-3 items-center pr-4  sm:static sm:inset-auto">
             
                <button
                  type="button"
                  className="relative rounded-full p-1 text-[#afb8c4] hover:text-[#f5f5f5]"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>
                {/* Profile -> opens centered ID-card modal */}
                <button
                  type="button"
                  onClick={() => setShowIdCard(true)}
                  className="relative flex rounded-full text-sm text-[#afb8c4] hover:text-[#f5f5f5] z-100"
                >
                  <span className="absolute -inset-1.5" />
                  <div className="rounded-full text-lg bg-[#f5f5f5] text-[#1a365d]/80 uppercase w-9 h-9 flex items-center justify-center border border-gray-500 border-solid profileicon">
                    {profileicon}
                  </div>
                </button>

                <Transition appear show={showIdCard} as={Fragment}>
                  <Dialog as="div" className="relative z-[200]" onClose={() => setShowIdCard(false)}>
                    <Transition.Child
                      as={Fragment}
                      enter="ease-out duration-200"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in duration-150"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex items-center justify-center p-4">
                      <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-200"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-150"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                      >
                        <Dialog.Panel className="w-56 rounded-2xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-black/5 overflow-hidden">
                          {/* ── ID card ── */}
                          <div className="relative bg-gradient-to-b from-[#2a4a85] to-[#16305c] pt-3 pb-4 flex flex-col items-center">
                            {/* lanyard punch hole */}
                            <div className="w-8 h-2.5 rounded-full bg-black/30 mb-2.5" />

                            <p className="text-[11px] font-extrabold tracking-[0.15em] text-white/90 uppercase">
                              Thinkcloud
                            </p>
                            <div className="w-10 h-[2px] bg-white/25 rounded-full my-2" />

                            <div className="rounded-full text-xl font-bold bg-white text-[#1a365d] uppercase w-16 h-16 flex items-center justify-center border-4 border-white/30 shadow-md">
                              {profileicon}
                            </div>

                            <p className="text-sm font-semibold text-white mt-2.5 truncate max-w-[85%]" title={nameoftheuser}>
                              {nameoftheuser}
                            </p>
                            {displayRole && (
                              <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-white/15 text-white/90 border border-white/20">
                                {displayRole}
                              </span>
                            )}
                          </div>

                          {/* Light/dark theme toggle */}
                          <div className="flex items-center justify-center gap-4 py-3.5 px-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-900/80 dark:via-gray-800/90 dark:to-gray-900/80 transition-all duration-300">
                            <SunIcon
                              className={`h-5 w-5 transition-all duration-300 ${theme === "light" ? "text-amber-500 scale-110 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" : "text-gray-400 scale-90"}`}
                            />
                            <button
                              type="button"
                              role="switch"
                              aria-checked={theme === "dark"}
                              aria-label="Toggle dark mode"
                              onClick={toggleTheme}
                              className={`group relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-[#1a365d] shadow-inner ${
                                theme === "dark"
                                  ? "bg-gradient-to-r from-[#1a365d] to-indigo-600 shadow-indigo-500/20"
                                  : "bg-gradient-to-r from-gray-300 to-gray-400 shadow-gray-400/20"
                              }`}
                            >
                              {/* Glow effect behind the knob */}
                              <span
                                className={`absolute rounded-full transition-all duration-500 ${
                                  theme === "dark"
                                    ? "h-8 w-8 translate-x-[1.65rem] bg-indigo-400/20 blur-md"
                                    : "h-8 w-8 translate-x-0.5 bg-amber-400/20 blur-md"
                                }`}
                              />
                              {/* Knob */}
                              <span
                                className={`relative inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-lg ring-1 ring-black/5 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-active:scale-95 ${
                                  theme === "dark" ? "translate-x-8" : "translate-x-1"
                                }`}
                              >
                                {/* Sun icon inside knob (light mode) */}
                                <SunIcon
                                  className={`absolute h-3 w-3 text-amber-500 transition-all duration-300 ${
                                    theme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-0"
                                  }`}
                                />
                                {/* Moon icon inside knob (dark mode) */}
                                <MoonIcon
                                  className={`absolute h-3 w-3 text-indigo-600 transition-all duration-300 ${
                                    theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
                                  }`}
                                />
                              </span>
                            </button>
                            <MoonIcon
                              className={`h-5 w-5 transition-all duration-300 ${theme === "dark" ? "text-indigo-400 scale-110 drop-shadow-[0_0_6px_rgba(129,140,248,0.5)]" : "text-gray-400 scale-90"}`}
                            />
                          </div>

                          {/* barcode strip -- purely decorative ID-card flavor */}
                          {/* <div
                            className="h-3 w-full opacity-70"
                            style={{
                              backgroundImage:
                                "repeating-linear-gradient(90deg, #1a1a1a 0px, #1a1a1a 2px, transparent 2px, transparent 4px, #1a1a1a 4px, #1a1a1a 5px, transparent 5px, transparent 8px)",
                            }}
                          /> */}

                          <button
                            type="button"
                            title="Sign out"
                            onClick={() => {
                              keycloakConfig.logout();
                              localStorage.clear();
                            }}
                            className="w-full flex flex-col items-center justify-center gap-1 py-3 bg-red-500/90 hover:bg-red-600 text-white text-xs font-semibold transition-colors"
                          >
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                            Sign out
                          </button>
                        </Dialog.Panel>
                      </Transition.Child>
                    </div>
                  </Dialog>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      )}
    </Disclosure>
  );
}
 
 
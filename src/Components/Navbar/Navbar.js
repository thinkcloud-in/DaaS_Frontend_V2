
import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import "./Navbar.css";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BellIcon,
} from "@heroicons/react/24/outline";
import keycloakConfig from "../Login/keycloak/keycloak";

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
                {/* Profile dropdown */}
                <Menu as="div" className="relative mx-1 z-100">
                  <div>
                    <Menu.Button className="relative flex rounded-full text-sm text-[#afb8c4] hover:text-[#f5f5f5] z-100">
                      <span className="absolute -inset-1.5" />
                      <div className="rounded-full text-lg bg-[#f5f5f5] text-[#1a365d]/80 uppercase w-9 h-9 flex items-center justify-center border border-gray-500 border-solid profileicon">
                        {profileicon}
                      </div>
                     
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute left-full top-1/2 -translate-y-2/3 z-50 ml-2 w-48 origin-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    
                      <Menu.Item>
                        {({ active }) => (
                          <div
                           
                            className={classNames(
                              active ? "bg-white hover:bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700 bg-[#f5f5f5]"
                            )}
                            style={{ borderRadius: '1px', borderBottom: '1px solid gray' }}
                          >
                            {nameoftheuser}
                          </div>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(
                              active ? "bg-[white] hover:bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                            onClick={() => {
                              keycloakConfig.logout();
                              localStorage.clear();
                            }}
                          >
                            Sign out
                          </a>                        
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>
        </div>
      )}
    </Disclosure>
  );
}
 
 
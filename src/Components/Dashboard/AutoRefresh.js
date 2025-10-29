import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {  useContext } from "react";
import { GrafanaToolbarContext } from "../../Context/GrafanaToolbarContext";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

//Auto refresh menu
const autoRefreshMenu = [
  "off",
  "10s",
  "30s",
  "1m",
  "5m",
  "15m",
  "30m",
  "1hr",
  "2hr",
  "1day",
];
export default function AutoRefresh(props) {
  let gc = useContext(GrafanaToolbarContext);

  return (
    <Menu
      as="div"
      className="relative inline-block text-left rounded rounded-2"
    >
      <div>
        <Menu.Button className="inline-flex w-auto justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          {gc.autoOption ? gc.autoOption : "Auto refresh"}
          <ChevronDownIcon
            className="-mr-1 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ">
          {autoRefreshMenu.map((item,index) => {
            return (
              <Menu.Item>
                {({ active }) => (
                  <li
                    key={index}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      gc.setAutoOption(item);
                      localStorage.setItem("grafanaAutoRefresh", item);
                    }}
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    {item}
                  </li>
                )}
              </Menu.Item>
            );
          })}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

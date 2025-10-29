import React from "react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const CustomTabs = (props) => {
  return (
    <div className=" w-[98%] mx-auto custom-tab-menu  border-b-2 border-gray-500">
      <ul className="flex space-x-4 ">
        {props.tablist.map((item) => (
          <li
            key={item}
            onClick={() => props.setSelectedTab(item)}
            className={classNames(
              "px-3 py-2 text-lg font-medium text-gray-700 text-left transition ease-in-out duration-300", // Added transition classes
              props.selectedTab === item
                ? "text-gray-700 "
                : "hover:bg-gray-300 hover:text-indigo-700 hover:rounded-md"
            )}
          >
            {item} Settings
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CustomTabs;

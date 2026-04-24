import React from "react";
import { FaInfoCircle } from "react-icons/fa";

const SelectField = ({
  label,
  iconClass,
  name,
  value,
  onChange,
  disabled,
  options = [],
  placeholder = "Select an option",
  required = false,
  className = "flex-1 max-w-[40rem]",
  tooltip,
  tooltipClass,
}) => {
  return (
    <div className="mb-6 flex items-center">
      <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px]">
        {iconClass && (
          <span>
            <i className={`fas ${iconClass} mr-2`}></i>
          </span>
        )}
        {label} {required && <span className="text-red-500">*</span>}
        {tooltip && (
          <div className="relative flex items-center group">
            <FaInfoCircle className="text-gray-400 hover:text-gray-600 cursor-help text-xs ml-1" />
            <span
              className={`invisible group-hover:visible absolute left-full ml-1 px-2 py-0.5 bg-gray-800 text-white text-[10px] rounded shadow-sm z-50 whitespace-pre-line ${tooltipClass || "whitespace-nowrap"}`}
            >
              {tooltip}
            </span>
          </div>
        )}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${className} border border-gray-300 rounded-lg px-3 py-1 ml-2 focus:outline-none focus:ring-2 focus:ring-[#1a365d]/100 text-base bg-white ${
          disabled ? "bg-gray-100 text-gray-500" : ""
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => {
          const val = typeof opt === "object" ? opt.value : opt;
          const lbl = typeof opt === "object" ? opt.label : opt;
          return (
            <option key={val} value={val} className="capitalize px-1">
              {lbl}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default SelectField;

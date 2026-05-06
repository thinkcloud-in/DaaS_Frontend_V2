import React from "react";
import { FaInfoCircle } from "react-icons/fa";

const InputField = ({
  label,
  iconClass,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  disabled,
  error,
  required = false,
  className = "flex-1 max-w-[40rem]",
  tooltip,
  tooltipClass,
  ...rest
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
      <div className="flex flex-col flex-1">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`${className} border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#1a365d]/100 text-base bg-white ${
            error ? "border-red-400" : ""
          } ${disabled ? "bg-gray-100 text-gray-500" : ""}`}
          placeholder={placeholder}
          disabled={disabled}
          {...rest}
        />
        {error && (
          <div className="text-red-600 text-[11px] mt-1 font-medium leading-tight">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputField;

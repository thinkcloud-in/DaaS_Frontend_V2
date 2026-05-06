import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaInfoCircle } from "react-icons/fa";

const PasswordField = ({
  label,
  iconClass = "fa-lock",
  name,
  value,
  onChange,
  placeholder,
  disabled,
  error,
  required = false,
  className = "flex-1 max-w-[40rem]",
  tooltip,
}) => {
  const [showPassword, setShowPassword] = useState(false);

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
            <span className="invisible group-hover:visible absolute left-full ml-1 px-2 py-0.5 bg-gray-800 text-white text-[10px] rounded shadow-sm whitespace-nowrap z-50">
              {tooltip}
            </span>
          </div>
        )}
      </label>
      <div className={`flex flex-col flex-1 ${className}`}>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name={name}
            value={value}
            onChange={onChange}
            className={`w-full border border-gray-300 rounded-lg px-3 py-1 pr-8 focus:outline-none focus:ring-2 focus:ring-[#1a365d]/100 text-base bg-white ${
              error ? "border-red-400" : ""
            }  ${disabled ? "bg-gray-100 text-gray-500" : ""}`}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
          </button>
        </div>
        {error && (
          <div className="text-red-600 text-[11px] mt-1 font-medium leading-tight">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordField;

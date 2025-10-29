import React from "react";
import "./css/RDPsettings.css";

const RDPsettings = ({ onChange, poolDetails }) => {
  let securityMode = [
    "None",
    "Any",
    "NLA",
    "RDP encryption",
    "TLS encryption",
    "Hyper-V / VMConnect",
  ];
  return (
    <div className="p-3 w-full pool_creation  rounded-b-md">
      {/* <h2 className="text-2xl font-bold leading-8 text-indigo-700 mx-auto text-center mt-4">
        RDP Settings
      </h2> */}

      <div className=" divide-slate-500 my-6 mt-7">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">Network</h3>
        <div className="text-left table-auto ml-3">
            {/* <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Hostname
              </label>
            </div>
        <div className="td">
              <div className="mt-2  border-0">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder="Hostname"
                    name="pool_hostname"
                    value={poolDetails.pool_hostname}
                    disabled={poolDetails.pool_type === 'Automated'}
                    onChange={onChange}
                    className={`block flex-1 rounded-md py-1.5 pl-1 border-2 sm:text-sm sm:leading-6 focus:ring-0
                      ${poolDetails.pool_type?.toLowerCase() === 'automated'
                        ? 'bg-gray-100 text-black cursor-not-allowed'
                        : 'bg-white text-black'}
                      placeholder:text-gray-400 bg-transparent`}
                  />
                </div>
              </div>
            </div>
          </div> */}
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Port
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="number"
                    name="pool_port"
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-black  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-b-2 border-gray-400"
                    placeholder="Pool Port"
                    value={poolDetails.pool_port}
                    onChange={onChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="divide-slate-500 my-6 mt-7">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">Authentication</h3>
        <div className="text-left table-auto ml-3">
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Username
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex items-center justify-start gap-3">
                  <input
                    type="text"
                    name="pool_username"
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-black  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                    placeholder="Username"
                    value={poolDetails.pool_username}
                    onChange={onChange}
                  />
                  <div>(username)</div>
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Password
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex items-center justify-start gap-3">
                  <input
                    type="password"
                    name="pool_password"
                    value={poolDetails.pool_password}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-black  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                    placeholder="Password"
                    onChange={onChange}
                  />
                  <div>(password)</div>
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900  border-0">
                Security Mode
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0 ">
                <select
                  name="pool_security"
                  value={poolDetails.pool_security}
                  onChange={onChange}
                  className="block  cursor-pointer   py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset     sm:text-sm sm:leading-6"
                >
                  <option selected value="" disabled>
                    Choose mode
                  </option>
                  {securityMode.map((item) => {
                    return (
                      <option
                        key={item}
                        value={item}
                        className="capitalize px-1"
                      >
                        {item}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Domain
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    name="pool_domain"
                    value={poolDetails.pool_domain}
                    onChange={onChange}
                    className="block flex-1 bg-white bg-transparent py-1.5 pl-1 text-black  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 "
                    placeholder="Domain"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Disable authentication
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_disable_auth"
                    checked={poolDetails.pool_disable_auth}
                    onChange={onChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Ignore server certificate
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_ignore_cert"
                    onChange={onChange}
                    checked={poolDetails.pool_ignore_cert}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">
          Concurrency Limits
        </h3>
        <div className="text-left table-auto ml-3">
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Maximum number of connections
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 ">
                  <input
                    type="number"
                    name="pool_max_connections"
                    value={poolDetails.pool_max_connections}
                    onChange={onChange}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-black  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Maximum connections per user
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="number"
                    name="pool_max_connections_per_user"
                    value={poolDetails.pool_max_connections_per_user}
                    onChange={onChange}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-black  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">
          GUACAMOLE PROXY PARAMETERS (GUACD)
        </h3>
        <div className="text-left table-auto ml-3">
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Guacd Hostname
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder="Guacd Hostname"
                    onChange={onChange}
                    name="pool_guacd_hostname"
                    className="block flex-1 rounded-md bg-white bg-transparent py-1.5 pl-1 text-black  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Port
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="number"
                    placeholder="Port"
                    name="pool_guacd_port"
                    value={poolDetails.pool_guacd_port}
                    onChange={onChange}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-black  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Encryption
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <select
                    name="pool_guacd_encryption"
                    value={poolDetails.pool_guacd_encryption}
                    onChange={onChange}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-black  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  >
                    <option value="" disabled selected>
                      Select encryption type
                    </option>
                    <option value="none">None</option>
                    <option value="ssl">SSL</option>
                    <option value="tls">TLS</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">
          Remote Desktop Gateway
        </h3>
        <div className="text-left table-auto ml-3">
          {/* <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Hostname
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder="Hostname"
                    onChange={onChange}
                    name=""
                    className="block flex-1 rounded-md bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                  />
                </div>
              </div>
            </div>
          </div> */}
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Port
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="number"
                    placeholder="Port"
                    name="pool_gateway_port"
                    value={poolDetails.pool_gateway_port}
                    onChange={onChange}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Username
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder="Username"
                    name="pool_gateway_username"
                    value={poolDetails.pool_gateway_username}
                    onChange={onChange}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Password
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="password"
                    placeholder="Password"
                    name="pool_gateway_password"
                    value={poolDetails.pool_gateway_password}
                    onChange={onChange}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Domain
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder="Geteway Domain"
                    name="pool_gateway_domain"
                    value={poolDetails.pool_gateway_domain}
                    onChange={onChange}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">Basic Settings</h3>
        <div className="text-left table-auto ml-3">
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Initial program
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder="Initial program"
                    name="pool_initial_program"
                    value={poolDetails.pool_initial_program}
                    onChange={onChange}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Client Name
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder="Client Name"
                    name="pool_client_name"
                    value={poolDetails.pool_client_name}
                    onChange={onChange}
                    className="block flex-1 bg-white bg-transparent py-1.5 pl-1 text-black  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Time Zone
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <select
                    name="pool_timezone"
                    value={poolDetails.pool_timezone}
                    onChange={onChange}
                    className="block flex-1 bg-white py-1.5 pl-1 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
                  >
                    <option value="Africa/Lagos">Nigeria (UTC+01:00)</option>
                    <option value="America/Sao_Paulo">
                      Brazil (UTC-03:00)
                    </option>
                    <option value="Asia/Shanghai">China (UTC+08:00)</option>
                    <option value="Asia/Kolkata">India (UTC+05:30)</option>
                    <option value="Asia/Tokyo">Japan (UTC+09:00)</option>
                    <option value="Australia/Sydney">
                      Australia (UTC+10:00)
                    </option>
                    <option value="Europe/London">
                      United Kingdom (UTC+00:00)
                    </option>
                    <option value="Europe/Berlin">Germany (UTC+01:00)</option>
                    <option value="Europe/Moscow">Russia (UTC+03:00)</option>
                    <option value="America/New_York">
                      United States (Eastern) (UTC-05:00)
                    </option>
                    <option value="America/Los_Angeles">
                      United States (Pacific) (UTC-08:00)
                    </option>
                    <option value="America/Mexico_City">
                      Mexico (UTC-06:00)
                    </option>
                    <option value="Asia/Dubai">
                      United Arab Emirates (UTC+04:00)
                    </option>
                    <option value="Africa/Johannesburg">
                      South Africa (UTC+02:00)
                    </option>
                    <option value="Asia/Jakarta">Indonesia (UTC+07:00)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Administrator console
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_console"
                    checked={poolDetails.pool_console}
                    onChange={onChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className=" divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">Display</h3>
        <div className="text-left table-auto ml-3">
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Width
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="number"
                    placeholder=""
                    name="pool_width"
                    value={poolDetails.pool_width}
                    onChange={onChange}
                    className="block flex-1 bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Height
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="number"
                    placeholder=""
                    name="pool_height"
                    value={poolDetails.pool_height}
                    onChange={onChange}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Resolution (DPI):
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="number"
                    placeholder=""
                    name="pool_dpi"
                    value={poolDetails.pool_dpi}
                    onChange={onChange}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Color Depth
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <select
                    name="pool_color_depth"
                    onChange={onChange}
                    value={poolDetails.pool_color_depth}
                    className="block flex-1  bg-white py-1.5 pl-1 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
                  >
                    <option value="">Select Color Depth</option>
                    <option value="8">8-bit</option>
                    <option value="16">16-bit</option>
                    <option value="24">24-bit</option>
                    <option value="32">32-bit</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Resize method
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <select
                    name="pool_resize_method"
                    onChange={onChange}
                    value={poolDetails.pool_resize_method}
                    className="block flex-1  bg-white py-1.5 pl-1 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
                  >
                    <option value="">Select Resize Method</option>
                    <option value="disply_update_virtual_channel">
                      Disply Update virtual channel
                    </option>
                    <option value="reconnect">Reconnect</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Read Only
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    onChange={onChange}
                    checked={poolDetails.pool_read_only}
                    name="pool_read_only"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className=" divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">Clipboard</h3>
        <div className="text-left table-auto ml-3">
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Encoding
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <select
                    name="pool_clipboard_encoding"
                    onChange={onChange}
                    value={poolDetails.pool_clipboard_encoding}
                    className="block flex-1  bg-white py-1.5 pl-1 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6"
                  >
                    <option value="">Select Encoding</option>
                    <option value="base64">base64</option>
                    <option value="ASCII">ASCII</option>
                    <option value="ISO-8859-1">ISO-8859-1</option>
                    <option value="UTF-16">UTF-16</option>
                    <option value="UTF-32">UTF-32</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Disable copying from remote desktop
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_disable_copy"
                    onChange={onChange}
                    checked={poolDetails.pool_disable_copy}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Disable pasting from client
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_disable_paste"
                    onChange={onChange}
                    checked={poolDetails.pool_disable_paste}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className=" divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">
          Device Redirection
        </h3>
        <div className="text-left table-auto ml-3">
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Support audio in console
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_console_audio"
                    onChange={onChange}
                    checked={poolDetails.pool_console_audio}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Disable audio
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_disable_audio"
                    onChange={onChange}
                    checked={poolDetails.pool_disable_audio}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Enable audio input (microphone):
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_enable_audio_input"
                    onChange={onChange}
                    checked={poolDetails.pool_enable_audio_input}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Enable printing:
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_enable_printing"
                    onChange={onChange}
                    checked={poolDetails.pool_enable_printing}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Redirected printer name
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder="Printer Name"
                    name="pool_printer_name"
                    onChange={onChange}
                    value={poolDetails.pool_printer_name}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Enable drive
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_enable_drive"
                    onChange={onChange}
                    checked={poolDetails.pool_enable_drive}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Drive Name
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder="Drive Name"
                    name="pool_drive_name"
                    onChange={onChange}
                    value={poolDetails.pool_drive_name}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Disable file download
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="" onChange={onChange}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div> */}
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Drive Path
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder="Drive Path"
                    name="pool_drive_path"
                    onChange={onChange}
                    value={poolDetails.pool_drive_path}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">Performance</h3>
        <div className="text-left table-auto ml-3">
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Enable wallpaper
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_enable_wallpaper"
                    onChange={onChange}
                    checked={poolDetails.pool_enable_wallpaper}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Enable theming
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_enable_theming"
                    onChange={onChange}
                    checked={poolDetails.pool_enable_theming}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Enable font smoothing (ClearType)
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_enable_font_smoothing"
                    onChange={onChange}
                    checked={poolDetails.pool_enable_font_smoothing}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Enable full-window drag
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_enable_full_window_drag"
                    onChange={onChange}
                    checked={poolDetails.pool_enable_full_window_drag}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Enable desktop composition (Aero):
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_enable_desktop_composition"
                    onChange={onChange}
                    checked={poolDetails.pool_enable_desktop_composition}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Enable menu animations
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_enable_menu_animations"
                    onChange={onChange}
                    checked={poolDetails.pool_enable_menu_animations}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Disable bitmap caching
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_disable_bitmap_caching"
                    onChange={onChange}
                    checked={poolDetails.pool_disable_bitmap_caching}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Disable off-screen caching
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_disable_offscreen_caching"
                    onChange={onChange}
                    checked={poolDetails.pool_disable_offscreen_caching}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Disable glyph caching
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_disable_glyph_caching"
                    onChange={onChange}
                    checked={poolDetails.pool_disable_glyph_caching}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="divide-slate-600">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">Load Balancing</h3>
        <div className="text-left table-auto ml-3">
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Load balance info/cookie:
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder="Load Balance"
                    name="pool_load_balance_info"
                    onChange={onChange}
                    value={poolDetails.pool_load_balance_info}
                    className="block flex-1 bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">Screen Recording</h3>
        <div className="text-left table-auto ml-3">
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Recording path
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder=""
                    name="pool_recording_path"
                    onChange={onChange}
                    value={poolDetails.pool_recording_path}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Recording Name
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder=""
                    name="pool_recording_name"
                    onChange={onChange}
                    value={poolDetails.pool_recording_name}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Automatically create recording path
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_create_recording_path"
                    onChange={onChange}
                    checked={poolDetails.pool_create_recording_path}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Exclude mouse
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_recording_exclude_mouse"
                    onChange={onChange}
                    checked={poolDetails.pool_recording_exclude_mouse}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Include key events
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_recording_include_keys"
                    onChange={onChange}
                    checked={poolDetails.pool_recording_include_keys}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Exclude touch events
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_exclude_touch_events"
                    onChange={onChange}
                    checked={poolDetails.pool_exclude_touch_events}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">SFTP</h3>
        <div className="text-left table-auto ml-3">
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Enable SFTP
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_enable_sftp"
                    onChange={onChange}
                    checked={poolDetails.pool_enable_sftp}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded    "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                SFTP Port
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="number"
                    placeholder="Port"
                    name="pool_sftp_port"
                    onChange={onChange}
                    value={poolDetails.pool_sftp_port}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                SFTP Username
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder="User name"
                    name="pool_sftp_username"
                    onChange={onChange}
                    value={poolDetails.pool_sftp_username}
                    className="block flex-1 bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                SFTP Password
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="password"
                    placeholder="Password"
                    name="pool_sftp_password"
                    onChange={onChange}
                    value={poolDetails.pool_sftp_password}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                SFTP Host Key
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex   ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder="Host Key"
                    name="pool_sftp_host_key"
                    onChange={onChange}
                    value={poolDetails.pool_sftp_host_key}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                SFTP Private Key
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <textarea
                    name="pool_sftp_private_key"
                    onChange={onChange}
                    value={poolDetails.pool_sftp_private_key}
                    className="block flex-1 bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 "
                    rows="4"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                SFTP Passphrase
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="password"
                    placeholder="Passphrase"
                    name="pool_sftp_passphrase"
                    onChange={onChange}
                    value={poolDetails.pool_sftp_passphrase}
                    className="block flex-1 bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                File browser root directory
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder=""
                    name="pool_sftp_root_directory"
                    onChange={onChange}
                    value={poolDetails.pool_sftp_root_directory}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Default upload directory
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder=""
                    name="pool_sftp_directory"
                    onChange={onChange}
                    value={poolDetails.pool_sftp_directory}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                SFTP keepalive interval
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="number"
                    placeholder=""
                    name="pool_sftp_server_alive_interval"
                    onChange={onChange}
                    value={poolDetails.pool_sftp_server_alive_interval}
                    className="block flex-1 bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RDPsettings;

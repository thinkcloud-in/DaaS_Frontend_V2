import React from "react";
import "./css/RDPsettings.css";
const VNCsettings = ({onChange,poolDetails }) => {
  return (
    <div className=" p-3 pool_creation  rounded-b-md">
      {/* <h2 className="font-semibold leading-7 text-gray-900 mb-3">
        VNC Settings
      </h2> */}
      <div className="divide-slate-500 my-6 mt-7">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">
          Network
        </h3>
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
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-900'}
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
                <div className="flex items-center justify-start gap-3">
                  <input
                    type="number"
                    name="pool_port"
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                    placeholder="Port"
                    value={poolDetails.pool_port}
                    onChange={onChange}
                  />
                
                </div>
              </div>
            </div>
          </div></div></div>
      <div className="divide-slate-500 my-6 mt-7">
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
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="number"
                    name="pool_max_connections" onChange={onChange}
                    value={poolDetails.pool_max_connections}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
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
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="number"
                    name="pool_max_connections_per_user" onChange={onChange}
                    value={poolDetails.pool_max_connections_per_user}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">
          Load Balancing
        </h3>
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
                    name="pool_load_balance_info" onChange={onChange}
                    value={poolDetails.pool_load_balance_info}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
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
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="number"
                    placeholder="Port"
                    name="pool_guacd_port" onChange={onChange}
                    value={poolDetails.pool_guacd_port}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
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
                    name="pool_guacd_encryption" onChange={onChange}
                    value={poolDetails.pool_guacd_encryption}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
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
      <div className="divide-slate-500 my-6 mt-7">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">
          Authentication
        </h3>
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
                    name="pool_username" onChange={onChange}
                    value={poolDetails.pool_username}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                    placeholder="Username"
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
                    name="pool_password" onChange={onChange}
                    value={poolDetails.pool_password}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                    placeholder="Password"
                  />
                  <div>(password)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">Display</h3>
        <div className="text-left table-auto ml-3">
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
                    name="pool_read_only" onChange={onChange}
                    checked={poolDetails.pool_read_only}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Swap red/blue components
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_swap_red_blue" onChange={onChange}
                    checked={poolDetails.pool_swap_red_blue}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded   "
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Cursor
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <select
                    name="pool_cursor" onChange={onChange}
                    value={poolDetails.pool_cursor}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                  >
                    <option value="" disabled selected>
                      Select cursor type
                    </option>
                    <option value="local">Local</option>
                    <option value="remote">Remote</option>
                  </select>
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
                    name="pool_color_depth" onChange={onChange}
                    value={poolDetails.pool_color_depth}
                    className="block flex-1  bg-white py-1.5 pl-1 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
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
          {/* <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
              Force lossless compression 
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name=""
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded   "
                  />
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
      <div className="divide-slate-600 my-6 mt-7">
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
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <select
                    name="pool_clipboard_encoding" onChange={onChange}
                    value={poolDetails.pool_clipboard_encoding}
                    className="block flex-1  bg-white py-1.5 pl-1 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
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
                    name="pool_disable_copy" onChange={onChange}
                    checked={poolDetails.pool_disable_copy}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded   "
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
                    name="pool_disable_paste" onChange={onChange}
                    checked={poolDetails.pool_disable_paste}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded   "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">VNC Repeater</h3>
        <div className="text-left table-auto ml-3">
        <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
              Destination host
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder="Destination Host"
                    name="pool_dest_host" onChange={onChange}
                    value={poolDetails.pool_dest_host}
                    className="block flex-1 bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
              Destination Port
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="number"
                    placeholder="Destination Port"
                    name="pool_dest_port" onChange={onChange}
                    value={poolDetails.pool_dest_port}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                  />
                </div>
              </div>
            </div>
          </div>
          
          </div></div>
          <div className="divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">
          Screen Recording
        </h3>
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
                    name="pool_recording_path" onChange={onChange}
                    value={poolDetails.pool_recording_path}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
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
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder=""
                    name="pool_recording_name" onChange={onChange}
                    value={poolDetails.pool_recording_name}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
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
                    name="pool_create_typescript_path" onChange={onChange}
                    checked={poolDetails.pool_create_typescript_path}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded   "
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
                    name="pool_recording_include_keys" onChange={onChange}
                    checked={poolDetails.pool_recording_include_keys}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded   "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Exclude Mouse
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
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded   "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
              Exclude graphics/streams
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_exclude_graphics_streams" onChange={onChange}
                    checked={poolDetails.pool_exclude_graphics_streams}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded   "
                  />
                </div>
              </div>
            </div>
          </div>
          </div></div>
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
                    name="pool_enable_sftp" onChange={onChange}
                    checked={poolDetails.pool_enable_sftp}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded   "
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
                    name="pool_sftp_port" onChange={onChange}
                    value={poolDetails.pool_sftp_port}
                    className="block flex-1 bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
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
                    name="pool_sftp_username" onChange={onChange}
                    value={poolDetails.pool_sftp_username}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
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
                    name="pool_sftp_password" onChange={onChange}
                    value={poolDetails.pool_sftp_password}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
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
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder="Host Key"
                    name="pool_sftp_host_key" onChange={onChange}
                    value={poolDetails.pool_sftp_host_key}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
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
                    name="pool_sftp_private_key" onChange={onChange}
                    value={poolDetails.pool_sftp_private_key}
                    className="block flex-1 bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
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
                    name="pool_sftp_passphrase" onChange={onChange}
                    value={poolDetails.pool_sftp_passphrase}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
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
                <div className="flex ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder=""
                    name="pool_sftp_root_directory" onChange={onChange}
                    value={poolDetails.pool_sftp_root_directory}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
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
                    name="pool_sftp_directory" onChange={onChange}
                    value={poolDetails.pool_sftp_directory}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
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
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="number"
                    placeholder=""
                    name="pool_sftp_server_alive_interval" onChange={onChange}
                    value={poolDetails.pool_sftp_server_alive_interval}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                  />
                </div>
              </div>
            </div>
          </div>
          </div></div>
          <div className="divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">Audio</h3>
        <div className="text-left table-auto ml-3">
        <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
             Enable Audio
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_enable_audio" onChange={onChange}
                    checked={poolDetails.pool_enable_audio}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded   "
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Audio Server Name
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder="Audio server name"
                    name="pool_audio_servername" onChange={onChange}
                    value={poolDetails.pool_audio_servername}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                  />
                </div>
              </div>
            </div>
          </div>
          </div></div>
    </div>
  );
};

export default VNCsettings;

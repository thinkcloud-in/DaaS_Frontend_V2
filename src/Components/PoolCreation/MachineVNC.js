import React from "react";
import "./css/RDPsettings.css";
import "./css/Pools.css";
const MachineVNC = ({ onChange, poolDetails }) => {
  return (
    <div className=" p-3 machine_vnc">

      
      <div className="divide-y divide-slate-500 my-6 mt-7 flex flex-col rounded-lg">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">Network</h3>
        <div className="space-y-4 mb-4">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Port <span className="text-red-500 text-xl">*</span>
            </label>
            <input
              type="number"
              name="port"
              value={poolDetails.port}
              onChange={onChange}
              required
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none          sm:text-sm"
              placeholder="Pool Port"
            />
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-500 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">
          Concurrency Limits
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium leading-6 text-[#00000099]">
              Maximum number of connections
            </label>
            <input
              type="number"
              name="max_connections"
              onChange={onChange}
              value={poolDetails.max_connections}
              className="block rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900  placeholder:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
              placeholder="Max Connections"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium leading-6 text-[#00000099]">
              Maximum connections per user
            </label>
            <input
              type="number"
              name="max_connections_per_user"
              onChange={onChange}
              value={poolDetails.max_connections_per_user}
              className="block rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900  placeholder:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
              placeholder="Max Connections Per User"
            />
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">
          Load Balancing
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium leading-6 text-[#00000099]">
              Load balance info/cookie:
            </label>
            <input
              type="text"
              placeholder="Load Balance"
              name="load_balance_info"
              onChange={onChange}
              value={poolDetails.load_balance_info}
              className="block rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900  placeholder:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
            />
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left">
          GUACAMOLE PROXY PARAMETERS (GUACD)
        </h3>
        <div className="text-left table-auto">
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
                    className="block flex-1 rounded-md bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                  />
                </div>
              </div>
            </div>
          </div> */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium leading-6 text-[#00000099]">
                Port
              </label>
              <input
                type="number"
                placeholder="Port"
                name="guacd_port"
                onChange={onChange}
                value={poolDetails.guacd_port}
                className="block rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900  placeholder:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium leading-6 text-[#00000099]">
                Encryption
              </label>
              <select
                name="guacd_encryption"
                onChange={onChange}
                value={poolDetails.guacd_encryption}
                className="block rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900  placeholder:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
              >
                <option value="" disabled>
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
      <div className="divide-y divide-slate-500 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">
          Authentication
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium leading-6 text-[#00000099]">
              Username
            </label>
            <input
              type="text"
              name="username"
              onChange={onChange}
              value={poolDetails.username}
              placeholder="Username"
              className="block rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900  placeholder:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium leading-6 text-[#00000099]">
              Password
            </label>
            <input
              type="password"
              name="password"
              onChange={onChange}
              value={poolDetails.password}
              placeholder="Password"
              className="block rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900  placeholder:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
            />
          </div>
        </div>
      </div>
      <div className="divide-y divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">Display</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="read_only"
              onChange={onChange}
              checked={poolDetails.read_only}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium leading-6 text-[#00000099]">
              Read Only
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="swap_red_blue"
              onChange={onChange}
              checked={poolDetails.swap_red_blue}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium leading-6 text-[#00000099]">
              Swap red/blue components
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium leading-6 text-[#00000099]">
              Cursor
            </label>
            <select
              name="cursor"
              onChange={onChange}
              value={poolDetails.cursor}
              className="block rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900  placeholder:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
            >
              <option value="" disabled>
                Select cursor type
              </option>
              <option value="local">Local</option>
              <option value="remote">Remote</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium leading-6 text-[#00000099]">
              Color Depth
            </label>
            <select
              name="color_depth"
              onChange={onChange}
              value={poolDetails.color_depth}
              className="block rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900  placeholder:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
            >
              <option value="" disabled>
                Select Color Depth
              </option>
              <option value="8">8-bit</option>
              <option value="16">16-bit</option>
              <option value="24">24-bit</option>
              <option value="32">32-bit</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">
          Clipboard
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium leading-6 text-[#00000099]">
              Encoding
            </label>
            <select
              name="clipboard_encoding"
              onChange={onChange}
              value={poolDetails.clipboard_encoding}
              className="block rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
            >
              <option value="" disabled>
                Select Encoding
              </option>
              <option value="base64">base64</option>
              <option value="ASCII">ASCII</option>
              <option value="ISO-8859-1">ISO-8859-1</option>
              <option value="UTF-16">UTF-16</option>
              <option value="UTF-32">UTF-32</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="disable_copy"
              onChange={onChange}
              checked={poolDetails.disable_copy}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium leading-6 text-[#00000099]">
              Disable copying from remote desktop
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="disable_paste"
              onChange={onChange}
              checked={poolDetails.disable_paste}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium leading-6 text-[#00000099]">
              Disable pasting from client
            </label>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">
          VNC Repeater
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium leading-6 text-[#00000099]">
              Destination Host
            </label>
            <input
              type="text"
              name="dest_host"
              onChange={onChange}
              value={poolDetails.dest_host}
              placeholder="Destination Host"
              className="block rounded-md bg-white py-1.5 pl-3 pr-4 text-gray-900  placeholder:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium leading-6 text-[#00000099]">
              Destination Port
            </label>
            <input
              type="number"
              name="dest_port"
              onChange={onChange}
              value={poolDetails.dest_port}
              placeholder="Destination Port"
              className="block rounded-md bg-white py-1.5 pl-3 pr-4 text-gray-900  placeholder:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
            />
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">
          Screen Recording
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium leading-6 text-[#00000099]">
              Recording Path
            </label>
            <input
              type="text"
              name="recording_path"
              onChange={onChange}
              value={poolDetails.recording_path}
              placeholder="Enter recording path"
              className="block rounded-md bg-white py-1.5 pl-3 pr-4 text-gray-900  placeholder:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium leading-6 text-[#00000099]">
              Recording Name
            </label>
            <input
              type="text"
              name="recording_name"
              onChange={onChange}
              value={poolDetails.recording_name}
              placeholder="Enter recording name"
              className="block rounded-md bg-white py-1.5 pl-3 pr-4 text-gray-900  placeholder:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center text-sm font-medium leading-6 text-[#00000099]">
              <input
                type="checkbox"
                name="create_typescript_path"
                onChange={onChange}
                checked={poolDetails.create_typescript_path}
                className="h-4 w-4 border-gray-300 rounded mr-2"
              />
              Automatically create recording path
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center text-sm font-medium leading-6 text-[#00000099]">
              <input
                type="checkbox"
                name="recording_include_keys"
                onChange={onChange}
                checked={poolDetails.recording_include_keys}
                className="h-4 w-4 border-gray-300 rounded mr-2"
              />
              Include key events
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center text-sm font-medium leading-6 text-[#00000099]">
              <input
                type="checkbox"
                name="recording_exclude_mouse"
                onChange={onChange}
                checked={poolDetails.recording_exclude_mouse}
                className="h-4 w-4 border-gray-300 rounded mr-2"
              />
              Exclude Mouse
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center text-sm font-medium leading-6 text-[#00000099]">
              <input
                type="checkbox"
                name="exclude_graphics_streams"
                onChange={onChange}
                checked={poolDetails.exclude_graphics_streams}
                className="h-4 w-4 border-gray-300 rounded mr-2"
              />
              Exclude graphics/streams
            </label>
          </div>
        </div>
      </div>
      <div className="divide-y divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">SFTP</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="enable_sftp"
              onChange={onChange}
              checked={poolDetails.enable_sftp}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Enable SFTP
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              SFTP Port
            </label>
            <input
              type="number"
              placeholder="Port"
              name="sftp_port"
              onChange={onChange}
              value={poolDetails.sftp_port}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none          sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              SFTP Username
            </label>
            <input
              type="text"
              placeholder="User name"
              name="sftp_username"
              onChange={onChange}
              value={poolDetails.sftp_username}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none          sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              SFTP Password
            </label>
            <input
              type="password"
              placeholder="Password"
              name="sftp_password"
              onChange={onChange}
              value={poolDetails.sftp_password}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none          sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              SFTP Host Key
            </label>
            <input
              type="text"
              placeholder="Host Key"
              name="sftp_host_key"
              onChange={onChange}
              value={poolDetails.sftp_host_key}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none          sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              SFTP Private Key
            </label>
            <textarea
              name="sftp_private_key"
              onChange={onChange}
              value={poolDetails.sftp_private_key}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none          sm:text-sm"
              rows="4"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              SFTP Passphrase
            </label>
            <input
              type="password"
              placeholder="Passphrase"
              name="sftp_passphrase"
              onChange={onChange}
              value={poolDetails.sftp_passphrase}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none          sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              File browser root directory
            </label>
            <input
              type="text"
              placeholder=""
              name="sftp_root_directory"
              onChange={onChange}
              value={poolDetails.sftp_root_directory}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none          sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Default upload directory
            </label>
            <input
              type="text"
              placeholder=""
              name="sftp_directory"
              onChange={onChange}
              value={poolDetails.sftp_directory}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none          sm:text-sm"
            />
          </div>
          {/* <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-900">
              SFTP keepalive interval
            </label>
            <input
              type="number"
              placeholder="Interval"
              name="sftp_keepalive_interval"
              onChange={onChange}
              value={poolDetails.sftp_keepalive_interval}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none          sm:text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="sftp_failover_only"
              onChange={onChange}
              checked={poolDetails.sftp_failover_only}
              className="h-4 w-4      border-gray-300 rounded    "
            />
            <label className="text-sm font-medium text-gray-900">
              SFTP failover only
            </label>
          </div> */}
        </div>
      </div>

      <div className="divide-y divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">Audio</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="enable_audio"
              onChange={onChange}
              checked={poolDetails.enable_audio}
              className="h-4 w-4  border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Enable Audio
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Audio Server Name
            </label>
            <input
              type="text"
              placeholder="Audio server name"
              name="audio_servername"
              onChange={onChange}
              value={poolDetails.audio_servername}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none          sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineVNC;

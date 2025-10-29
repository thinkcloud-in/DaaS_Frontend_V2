import React from "react";
import "./css/RDPsettings.css";
import "./css/Pools.css"
const MachineSSH = ({ onChange, poolDetails }) => {

  return (
    <div className=" p-3 machine_ssh">

      
      <div className="divide-y divide-slate-500 my-6 mt-7 flex flex-col rounded-lg">
    <h3 className="font-semibold text-gray-900 text-left mb-4">
        Network
    </h3>
    <div className="space-y-4 mb-4">
        <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-gray-900">
                Port <span className="text-red-500 text-xl">*</span>
            </label>
            <input
                type="number"
                name="port"
                value={poolDetails.port}
                onChange={onChange}
                required
                className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none         sm:text-sm"
                placeholder="Pool Port"
            />
        </div>
    </div>
</div>

      <div className="divide-y divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">
          Concurrency Limits
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Maximum number of connections
            </label>
            <input
              type="number"
              placeholder="Maximum number of connections"
              name="max_connections"
              onChange={onChange}
              value={poolDetails.max_connections}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none         sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Maximum connections per user
            </label>
            <input
              type="number"
              placeholder="Maximum connections per user"
              name="max_connections_per_user"
              onChange={onChange}
              value={poolDetails.max_connections_per_user}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none         sm:text-sm"
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
            <label className="block text-sm font-medium text-[#00000099]">
              Load balance info/cookie:
            </label>
            <input
              type="text"
              placeholder="Load Balance"
              name="load_balance_info"
              onChange={onChange}
              value={poolDetails.load_balance_info}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none         sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">
          GUACAMOLE PROXY PARAMETERS (GUACD)
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Port
            </label>
            <input
              type="number"
              placeholder="Port"
              name="guacd_port"
              onChange={onChange}
              value={poolDetails.guacd_port}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none         sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Encryption
            </label>
            <select
              name="guacd_encryption"
              onChange={onChange}
              value={poolDetails.guacd_encryption}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none         sm:text-sm"
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

      <div className="divide-y divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">
          Authentication
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Username
            </label>
            <input
              type="text"
              name="username"
              onChange={onChange}
              value={poolDetails.username}
              placeholder="Username"
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none         sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Password
            </label>
            <input
              type="password"
              name="password"
              onChange={onChange}
              value={poolDetails.password}
              placeholder="Password"
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none         sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Private Key
            </label>
            <textarea
              name="private_key"
              onChange={onChange}
              value={poolDetails.private_key}
              rows="4"
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none         sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Passphrase
            </label>
            <input
              type="password"
              name="passphrase"
              onChange={onChange}
              value={poolDetails.passphrase}
              placeholder="Passphrase"
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none         sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">Display</h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Color Scheme
            </label>
            <select
              name="color_scheme"
              onChange={onChange}
              value={poolDetails.color_scheme}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none         sm:text-sm"
            >
              <option value="">Select color scheme</option>
              <option value="Black on White">Black on White</option>
              <option value="Gray on Black">Gray on Black</option>
              <option value="Green on Black">Green on Black</option>
              <option value="White on Black">White on Black</option>
              <option value="Custom">Custom ...</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Font Name
            </label>
            <input
              type="text"
              name="font_name"
              onChange={onChange}
              value={poolDetails.font_name}
              placeholder="Font Name"
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none         sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Maximum scrollback size
            </label>
            <input
              type="number"
              name="scrollback"
              onChange={onChange}
              value={poolDetails.scrollback}
              placeholder="Scrollback Size"
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none         sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Font Size
            </label>
            <select
              name="font_size"
              onChange={onChange}
              value={poolDetails.font_size}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none         sm:text-sm"
            >
              <option value="">Select font size</option>
              {[8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36].map(
                (size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="read_only"
              onChange={onChange}
              checked={poolDetails.read_only}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Read Only
            </label>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">
          Clipboard
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="disable_copy"
              onChange={onChange}
              checked={poolDetails.disable_copy}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="block text-sm font-medium text-[#00000099]">
              Disable copying from terminal
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
            <label className="block text-sm font-medium text-[#00000099]">
              Disable pasting from client
            </label>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">
          Terminal Behavior
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium leading-6 text-[#00000099]">
              Backspace key sends
            </label>
            <select
              name="backspace"
              onChange={onChange}
              value={poolDetails.backspace}
              className="block rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
            >
              <option value=""></option>
              <option value="Delete(ctrl+?)">Delete(ctrl+?)</option>
              <option value="Backspace(ctrl+H)">Backspace(ctrl+H)</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium leading-6 text-[#00000099]">
              Terminal Type
            </label>
            <select
              name="terminal_type"
              onChange={onChange}
              value={poolDetails.terminal_type}
              className="block rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
            >
              <option value="">Select Terminal Type</option>
              <option value="ansi">ansi</option>
              <option value="linux">linux</option>
              <option value="vt100">vt100</option>
              <option value="vt220">vt220</option>
              <option value="xterm">xterm</option>
              <option value="xterm-256color">xterm-256color</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">
          Typescript (Text Session Recording)
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium leading-6 text-[#00000099]">
              Typescript path
            </label>
            <input
              type="text"
              placeholder="Typescript Path"
              name="typescript_path"
              onChange={onChange}
              value={poolDetails.typescript_path}
              className="block rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900  placeholder:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium leading-6 text-[#00000099]">
              Typescript Name
            </label>
            <input
              type="text"
              placeholder="Typescript Name"
              name="typescript_name"
              onChange={onChange}
              value={poolDetails.typescript_name}
              className="block rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900  placeholder:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
            />
          </div>
          <div className="flex flex-center gap-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="create_typescript_path"
                onChange={onChange}
                checked={poolDetails.create_typescript_path}
                className="h-4 w-4 border-gray-300 rounded"
              />
              <label className="block text-sm font-medium leading-6 text-[#00000099]">
                Automatically create typescript path
              </label>
            </div>
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
              Recording path
            </label>
            <input
              type="text"
              placeholder="Recording Path"
              name="recording_path"
              onChange={onChange}
              value={poolDetails.recording_path}
              className="block rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900  placeholder:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium leading-6 text-[#00000099]">
              Recording Name
            </label>
            <input
              type="text"
              placeholder="Recording Name"
              name="recording_name"
              onChange={onChange}
              value={poolDetails.recording_name}
              className="block rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900  placeholder:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="create_recording_path"
                onChange={onChange}
                checked={poolDetails.create_recording_path}
                className="h-4 w-4 border-gray-300 rounded"
              />
              <label className="block text-sm font-medium leading-6 text-[#00000099]">
                Automatically create recording path
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="recording_exclude_mouse"
                onChange={onChange}
                checked={poolDetails.recording_exclude_mouse}
                className="h-4 w-4 border-gray-300 rounded"
              />
              <label className="block text-sm font-medium leading-6 text-[#00000099]">
                Exclude mouse
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="recording_include_keys"
                onChange={onChange}
                checked={poolDetails.recording_include_keys}
                className="h-4 w-4 border-gray-300 rounded"
              />
              <label className="block text-sm font-medium leading-6 text-[#00000099]">
                Include key events
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="exclude_touch_events"
                onChange={onChange}
                checked={poolDetails.exclude_touch_events}
                className="h-4 w-4 border-gray-300 rounded"
              />
              <label className="block text-sm font-medium leading-6 text-[#00000099]">
                Exclude touch events
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-600 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">SFTP</h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="enable_sftp"
                onChange={onChange}
                checked={poolDetails.enable_sftp}
                className="h-4 w-4 border-gray-300 rounded"
              />
              <label className="block text-sm font-medium leading-6 text-[#00000099]">
                Enable SFTP
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium leading-6 text-[#00000099]">
              File browser root directory
            </label>
            <input
              type="text"
              placeholder="SFTP Root Directory"
              name="sftp_root_directory"
              onChange={onChange}
              value={poolDetails.sftp_root_directory}
              className="block rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900  placeholder:text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineSSH;

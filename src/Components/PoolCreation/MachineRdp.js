import React from "react";
import "./css/RDPsettings.css";
import "./css/Pools.css";
const MachineRdp = ({ onChange, poolDetails }) => {
  let securityMode = [
    "None",
    "Any",
    "NLA",
    "RDP encryption",
    "TLS encryption",
    "Hyper-V / VMConnect",
  ];
  return (
    <div className="p-3 w-full machine_rdp">

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
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
              placeholder="Pool Port"
              required
            />
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-500 my-6 mt-7 flex flex-col  rounded-lg ">
  <h3 className="font-semibold text-[#1a365d] text-left mb-4">
          Authentication
        </h3>
        <div className="space-y-4 mb-4">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={poolDetails.username}
              onChange={onChange}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
              placeholder="Username"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={poolDetails.password}
              onChange={onChange}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
              placeholder="Password"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Security Mode
            </label>
            <select
              name="security"
              value={poolDetails.security}
              onChange={onChange}
              className="block w-full cursor-pointer rounded-md border-2 border-gray-300 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300        sm:text-sm"
            >
              <option value="" disabled>
                Choose mode
              </option>
              {securityMode.map((item) => (
                <option key={item} value={item} className="capitalize">
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Domain
            </label>
            <input
              type="text"
              name="domain"
              value={poolDetails.domain}
              onChange={onChange}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
              placeholder="Domain"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="disable_auth"
              onChange={onChange}
              checked={poolDetails.disable_auth}
              className="h-4 w-4  border-gray-300 rounded "
            />
            <label className="text-sm font-medium text-[#00000099]">
            Disable authentication
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="ignore_cert"
              onChange={onChange}
              checked={poolDetails.ignore_cert}
              className="h-4 w-4  border-gray-300 rounded "
            />
            <label className="text-sm font-medium text-[#00000099]">
            Ignore server certificate
            </label>
          </div>
            
        </div>
      </div>

      <div className=" divide-y divide-slate-600 my-6 mt-7">
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
              name="max_connections"
              value={poolDetails.max_connections}
              onChange={onChange}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Maximum connections per user
            </label>
            <input
              type="number"
              name="max_connections_per_user"
              value={poolDetails.max_connections_per_user}
              onChange={onChange}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className=" divide-y divide-slate-600  my-6 mt-7">
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
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
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
              className="block w-full cursor-pointer rounded-md border-2 border-gray-300 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300        sm:text-sm"
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
          Remote Desktop Gateway
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Port
            </label>
            <input
              type="number"
              placeholder="Port"
              name="gateway_port"
              onChange={onChange}
              value={poolDetails.gateway_port}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Username
            </label>
            <input
              type="text"
              placeholder="Username"
              name="gateway_username"
              onChange={onChange}
              value={poolDetails.gateway_username}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Password
            </label>
            <input
              type="password"
              placeholder="Password"
              name="gateway_password"
              onChange={onChange}
              value={poolDetails.gateway_password}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Domain
            </label>
            <input
              type="text"
              placeholder="Gateway Domain"
              name="gateway_domain"
              onChange={onChange}
              value={poolDetails.gateway_domain}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>
        </div>
      </div>
      <div className="divide-y divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">
          Basic Settings
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Initial program
            </label>
            <input
              type="text"
              placeholder="Initial program"
              name="initial_program"
              onChange={onChange}
              value={poolDetails.initial_program}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Client Name
            </label>
            <input
              type="text"
              placeholder="Client Name"
              name="client_name"
              onChange={onChange}
              value={poolDetails.client_name}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Time Zone
            </label>
            <select
              name="timezone"
              onChange={onChange}
              value={poolDetails.timezone}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            >
              <option value="Africa/Lagos">Nigeria (UTC+01:00)</option>
              <option value="America/Sao_Paulo">Brazil (UTC-03:00)</option>
              <option value="Asia/Shanghai">China (UTC+08:00)</option>
              <option value="Asia/Kolkata">India (UTC+05:30)</option>
              <option value="Asia/Tokyo">Japan (UTC+09:00)</option>
              <option value="Australia/Sydney">Australia (UTC+10:00)</option>
              <option value="Europe/London">United Kingdom (UTC+00:00)</option>
              <option value="Europe/Berlin">Germany (UTC+01:00)</option>
              <option value="Europe/Moscow">Russia (UTC+03:00)</option>
              <option value="America/New_York">
                United States (Eastern) (UTC-05:00)
              </option>
              <option value="America/Los_Angeles">
                United States (Pacific) (UTC-08:00)
              </option>
              <option value="America/Mexico_City">Mexico (UTC-06:00)</option>
              <option value="Asia/Dubai">
                United Arab Emirates (UTC+04:00)
              </option>
              <option value="Africa/Johannesburg">
                South Africa (UTC+02:00)
              </option>
              <option value="Asia/Jakarta">Indonesia (UTC+07:00)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="console"
              onChange={onChange}
              checked={poolDetails.console}
              className="h-4 w-4      border-gray-300 rounded  "
            />
            <label className="text-sm font-medium text-[#00000099]">
              Administrator console
            </label>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">Display</h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Width
            </label>
            <input
              type="number"
              placeholder="Width"
              name="width"
              onChange={onChange}
              value={poolDetails.width}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Height
            </label>
            <input
              type="number"
              placeholder="Height"
              name="height"
              onChange={onChange}
              value={poolDetails.height}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Resolution (DPI)
            </label>
            <input
              type="number"
              placeholder="Resolution (DPI)"
              name="dpi"
              onChange={onChange}
              value={poolDetails.dpi}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Color Depth
            </label>
            <select
              name="color_depth"
              onChange={onChange}
              value={poolDetails.color_depth}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            >
              <option value="">Select Color Depth</option>
              <option value="8">8-bit</option>
              <option value="16">16-bit</option>
              <option value="24">24-bit</option>
              <option value="32">32-bit</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Resize Method
            </label>
            <select
              name="resize_method"
              onChange={onChange}
              value={poolDetails.resize_method}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            >
              <option value="">Select Resize Method</option>
              <option value="display_update_virtual_channel">
                Display Update Virtual Channel
              </option>
              <option value="reconnect">Reconnect</option>
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
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Encoding
            </label>
            <select
              name="clipboard_encoding"
              onChange={onChange}
              value={poolDetails.clipboard_encoding}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            >
              <option value="">Select Encoding</option>
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
            <label className="text-sm font-medium text-[#00000099]">
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
            <label className="text-sm font-medium text-[#00000099]">
              Disable pasting from client
            </label>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">
          Device Redirection
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="console_audio"
              onChange={onChange}
              checked={poolDetails.console_audio}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Support audio in console
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="disable_audio"
              onChange={onChange}
              checked={poolDetails.disable_audio}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Disable audio
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="enable_audio_input"
              onChange={onChange}
              checked={poolDetails.enable_audio_input}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Enable audio input (microphone)
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="enable_printing"
              onChange={onChange}
              checked={poolDetails.enable_printing}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Enable printing
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#00000099]">
              Redirected printer name
            </label>
            <input
              type="text"
              placeholder="Printer Name"
              name="printer_name"
              onChange={onChange}
              value={poolDetails.printer_name}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="enable_drive"
              onChange={onChange}
              checked={poolDetails.enable_drive}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Enable drive
            </label>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#00000099]">
              Drive Name
            </label>
            <input
              type="text"
              placeholder="Drive Name"
              name="drive_name"
              onChange={onChange}
              value={poolDetails.drive_name}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#00000099]">
              Drive Path
            </label>
            <input
              type="text"
              placeholder="Drive Path"
              name="drive_path"
              onChange={onChange}
              value={poolDetails.drive_path}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>
        </div>
      </div>
      <div className="divide-y divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">
          Performance
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="enable_wallpaper"
              onChange={onChange}
              checked={poolDetails.enable_wallpaper}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Enable wallpaper
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="enable_theming"
              onChange={onChange}
              checked={poolDetails.enable_theming}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Enable theming
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="enable_font_smoothing"
              onChange={onChange}
              checked={poolDetails.enable_font_smoothing}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Enable font smoothing (ClearType)
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="enable_full_window_drag"
              onChange={onChange}
              checked={poolDetails.enable_full_window_drag}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Enable full-window drag
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="enable_desktop_composition"
              onChange={onChange}
              checked={poolDetails.enable_desktop_composition}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Enable desktop composition (Aero)
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="enable_menu_animations"
              onChange={onChange}
              checked={poolDetails.enable_menu_animations}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Enable menu animations
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="disable_bitmap_caching"
              onChange={onChange}
              checked={poolDetails.disable_bitmap_caching}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Disable bitmap caching
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="disable_offscreen_caching"
              onChange={onChange}
              checked={poolDetails.disable_offscreen_caching}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Disable off-screen caching
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="disable_glyph_caching"
              onChange={onChange}
              checked={poolDetails.disable_glyph_caching}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Disable glyph caching
            </label>
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
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold text-[#1a365d] text-left mb-4">
          Screen Recording
        </h3>
        <div className="space-y-4">
          {/* Recording Path */}
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Recording path
            </label>
            <input
              type="text"
              placeholder=""
              name="recording_path"
              onChange={onChange}
              value={poolDetails.recording_path}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>

          {/* Recording Name */}
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Recording Name
            </label>
            <input
              type="text"
              placeholder=""
              name="recording_name"
              onChange={onChange}
              value={poolDetails.recording_name}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>

          {/* Automatically Create Recording Path */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="create_recording_path"
              onChange={onChange}
              checked={poolDetails.create_recording_path}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Automatically create recording path
            </label>
          </div>

          {/* Exclude Mouse */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="recording_exclude_mouse"
              onChange={onChange}
              checked={poolDetails.recording_exclude_mouse}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Exclude mouse
            </label>
          </div>

          {/* Include Key Events */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="recording_include_keys"
              onChange={onChange}
              checked={poolDetails.recording_include_keys}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Include key events
            </label>
          </div>

          {/* Exclude Touch Events */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="exclude_touch_events"
              onChange={onChange}
              checked={poolDetails.exclude_touch_events}
              className="h-4 w-4 border-gray-300 rounded"
            />
            <label className="text-sm font-medium text-[#00000099]">
              Exclude touch events
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
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
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
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
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
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
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
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
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
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
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
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              File Browser Root Directory
            </label>
            <input
              type="text"
              placeholder="Root Directory"
              name="sftp_root_directory"
              onChange={onChange}
              value={poolDetails.sftp_root_directory}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">
              Default Upload Directory
            </label>
            <input
              type="text"
              placeholder="Upload Directory"
              name="sftp_directory"
              onChange={onChange}
              value={poolDetails.sftp_directory}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-[#00000099]">   
              SFTP Keepalive Interval
            </label>
            <input
              type="number"
              placeholder="Keepalive Interval"
              name="sftp_server_alive_interval"
              onChange={onChange}
              value={poolDetails.sftp_server_alive_interval}
              className="block w-full rounded-md bg-white py-2 px-3 text-gray-900  placeholder:text-gray-900 border-2 border-gray-300 shadow-sm focus:outline-none        sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineRdp;

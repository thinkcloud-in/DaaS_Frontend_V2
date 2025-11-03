import React from "react";
import "./css/RDPsettings.css";
const SSHsettings = ({onChange,poolDetails}) => {
  return (
    <div className=" p-3 pool_creation rounded-b-md">
      {/* <h2 className="font-semibold leading-7 text-gray-900 mb-3">
        SSH Settings
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
                    name="pool_max_connections"  onChange={onChange}
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
                    name="pool_max_connections_per_user"  onChange={onChange}
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
                <div className="flex ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder="Load Balance"
                    name="pool_load_balance_info"  onChange={onChange}
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
                    name="pool_guacd_port"  onChange={onChange}
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
                    name="pool_guacd_encryption"  onChange={onChange}
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
                    name="pool_username"  onChange={onChange}
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
                    name="pool_password"  onChange={onChange}
                    value={poolDetails.pool_password}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                    placeholder="Password"
                  />
                  <div>(password)</div>
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Private Key
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <textarea
                    name="pool_private_key"  onChange={onChange}
                    value={poolDetails.pool_private_key}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                    rows="4"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Passphrase
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="password"
                    placeholder="Passphrase"
                    name="pool_passphrase" onChange={onChange}
                    value={poolDetails.pool_passphrase}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                  />
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
                Color Scheme
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <select
                    name="pool_color_scheme"  onChange={onChange}
                    value={poolDetails.pool_color_scheme}
                    className="block flex-1 bg-white py-1.5 pl-1 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                  >
                    <option value=""></option>
                    <option value="Black on White">Black on White</option>
                    <option value="Gray on Black">Gray on Black</option>
                    <option value="Green on Black">Green on Black</option>
                    <option value="White on Black">White on Black</option>
                    <option value="">Custom ...</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Font Name
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder=""
                    name="pool_font_name" onChange={onChange}
                    value={poolDetails.pool_font_name}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Maximum scrollback size
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="number"
                    placeholder=""
                    name="pool_scrollback" onChange={onChange}
                    value={poolDetails.pool_scrollback}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Font Size
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <select
                  name="pool_font_size" onChange={onChange}
                  value={poolDetails.pool_font_size}
                  className="block flex-1  bg-white py-1.5 pl-1 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                >
                  <option value=""></option>
                  <option value="8">8</option>
                  <option value="10">10</option>
                  <option value="12">12</option>
                  <option value="14">14</option>
                  <option value="16">16</option>
                  <option value="18">18</option>
                  <option value="20">20</option>
                  <option value="22">22</option>
                  <option value="24">24</option>
                  <option value="26">26</option>
                  <option value="28">28</option>
                  <option value="30">30</option>
                  <option value="32">32</option>
                  <option value="34">34</option>
                  <option value="36">36</option>
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
                    name="pool_read_only"  onChange={onChange}
                    checked={poolDetails.pool_read_only}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="divide-slate-600 my-6 mt-7">
        <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">Clipboard</h3>
        <div className="text-left table-auto ml-3">
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Disable copying from terminal
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_disable_copy"  onChange={onChange}
                    checked={poolDetails.pool_disable_copy}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded "
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
                    name="pool_disable_paste"  onChange={onChange}
                    checked={poolDetails.pool_disable_paste}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded  "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="divide-slate-600 my-6 mt-7">
    <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">
          Terminal Behavior
        </h3>
        <div className="text-left table-auto ml-3">
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Backspace key sends
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <select
                  name="pool_backspace"  onChange={onChange}
                  value={poolDetails.pool_backspace}
                  className="block flex-1 bg-white bg-transparent py-1.5 pl-1 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                >
                  <option value=""></option>
                  <option value="Delete(ctrl+?)">Delete(ctrl+?)</option>
                  <option value="Backspace(ctrl+H)">Backspace(ctrl+H)</option>
                </select>
                </div>
              </div>
            </div>
          </div>

          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Terminal Type
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                <select
                  name="pool_terminal_type"  onChange={onChange}
                  value={poolDetails.pool_terminal_type}
                  className="block flex-1 bg-white bg-transparent py-1.5 pl-1 text-gray-900 focus:ring-0 sm:text-sm sm:leading-6 border-2"
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
          </div>
        </div>
      </div>
      <div className="divide-slate-600 my-6 mt-7">
    <h3 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border border-[#F0F8FFCC] p-1">
          Typescript (Text Session Recording)
        </h3>
        <div className="text-left table-auto ml-3">
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Typescript path
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder="Typescript Path"
                    name="pool_typescript_path"  onChange={onChange}
                    value={poolDetails.pool_typescript_path}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                Typescript Name
              </label>
            </div>
            <div className="td">
              <div className="mt-2  border-0">
                <div className="flex  ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                  <input
                    type="text"
                    placeholder="Typescript Name"
                    name="pool_typescript_name" onChange={onChange}
                    value={poolDetails.pool_typescript_name}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="th">
              <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                Automatically create typescript path
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pool_create_typescript_path"  onChange={onChange}
                    checked={poolDetails.pool_create_typescript_path}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded  "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
                    placeholder="Recording Path"
                    name="pool_recording_path"  onChange={onChange}
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
                    placeholder="Recording Name"
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
                    name="pool_create_recording_path" onChange={onChange}
                    checked={poolDetails.pool_create_recording_path}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded  "
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
                    name="pool_recording_exclude_mouse" onChange={onChange}
                    checked={poolDetails.pool_recording_exclude_mouse}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded  "
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
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded  "
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
                    name="pool_exclude_touch_events" onChange={onChange}
                    checked={poolDetails.pool_exclude_touch_events}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded  "
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="divide-slate-600 mt-7">
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
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded  "
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
                    name="pool_sftp_root_directory" onChange={onChange}
                    value={poolDetails.pool_sftp_root_directory}
                    className="block flex-1  bg-white bg-transparent py-1.5 pl-1 text-gray-900  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
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

export default SSHsettings;

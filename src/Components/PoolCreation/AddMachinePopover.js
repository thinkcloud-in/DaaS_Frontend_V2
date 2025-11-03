import { Fragment, useRef, useState, useContext, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { createMachineService } from "../../Services/PoolService";
import { Slide, toast } from "react-toastify";
import { PoolContext } from "../../Context/PoolContext";
import MachineRdp from "./MachineRdp";
import MachineSSH from "./MachineSSH";
import MachineVNC from "./MachineVNC";
import { Loader2 } from "lucide-react";
export default function AddMachinePopover(props) {
  //pool context
  const pc = useContext(PoolContext);

  const token = pc.token;
  const tokenParsed = pc.tokenParsed


  let userEmail = tokenParsed.preferred_username

  // Destructering props
  let setVmAvailable = props.setVmAvailable;
  let vmAvailable = props.vmAvailable;
  // Security mode dropdown menu options
  let securityMode = [
    "None",
    "Any",
    "NLA",
    "RDP encryption",
    "TLS encryption",
    "Hyper-V / VMConnect",
  ];
  // state for machine details
  // const [addMachine, setAddMachine] = useState({
  //   name: "",
  //   ip: "",
  //   port: null,
  //   protocol: "",
  //   pool_id: props.poolId,
  //   users_assigned: [],
  // });
  const [addMachine, setAddMachine] = useState({
    name: "",
    hostname: "",
    port: null,
    protocol: "",
    pool_id: props.poolId || "", // Ensure a default value if props.poolId is undefined
    users_assigned: [],
    guacd_port: null,
    guacd_encryption: "",
    guacd_hostname: "",
    weight: null,
    failover_only: false,
    type: "",
    entitled: null,
    machines: [],
    os_type: "",
    username: "",
    password: "",
    security: "",
    domain: "",
    disable_auth: false,
    ignore_cert: false,
    max_connections: null,
    max_connections_per_user: null,
    gateway_port: null,
    gateway_username: "",
    gateway_password: "",
    gateway_domain: "",
    initial_program: "",
    client_name: "",
    timezone: "",
    console: false,
    width: null,
    height: null,
    dpi: null,
    color_depth: "",
    resize_method: "",
    read_only: false,
    clipboard_encoding: "",
    disable_copy: false,
    disable_paste: false,
    console_audio: false,
    custom_disable_audio: false,
    enable_audio_input: false,
    enable_printing: false,
    printer_name: "",
    enable_drive: false,
    drive_name: "",
    drive_path: "",
    cursor: "",
    enable_wallpaper: false,
    enable_theming: false,
    enable_font_smoothing: false,
    enable_full_window_drag: false,
    enable_desktop_composition: false,
    enable_menu_animations: false,
    disable_bitmap_caching: false,
    disable_offscreen_caching: false,
    disable_glyph_caching: false,
    load_balance_info: "",
    recording_path: "",
    recording_name: "",
    create_recording_path: false,
    recording_exclude_mouse: false,
    recording_include_keys: false,
    exclude_touch_events: false,
    enable_sftp: false,
    sftp_port: null,
    sftp_username: "",
    font_name: "",
    sftp_password: "",
    sftp_host_key: "",
    sftp_private_key: "",
    sftp_passphrase: "",
    sftp_root_directory: "",
    sftp_directory: "",
    sftp_server_alive_interval: null,
    private_key: "",
    passphrase: "",
    color_scheme: "",
    custom_font_name: "",
    scrollback: 0,
    font_size: null,
    backspace: "",
    terminal_type: "",
    typescript_path: "",
    typescript_name: "",
    create_typescript_path: false,
    swap_red_blue: false,
    destination_host: "",
    destination_port: null,
    exclude_mouse: false,
    exclude_graphics_streams: false,
    enable_audio: false,
    audio_servername: "",
    args: [],
    identifier: "",
    is_custom_machine: false,
  });
  const [rename, setRename] = useState("");
  useEffect(() => {
    if (props.selectedPoolDetails) {
      setAddMachine((prevState) => ({
        ...prevState,
        hostname: props.selectedPoolDetails.pool_hostname || "",
        port: props.selectedPoolDetails.pool_port || null,
        protocol: props.selectedPoolDetails.pool_protocol || "",
        pool_id: props.poolId || "",
        users_assigned: props.selectedPoolDetails.pool_users_assigned || [],
        guacd_port: props.selectedPoolDetails.pool_guacd_port || null,
        guacd_encryption: props.selectedPoolDetails.pool_guacd_encryption || "",
        guacd_hostname: props.selectedPoolDetails.pool_guacd_hostname || "",
        weight: props.selectedPoolDetails.pool_weight || null,
        failover_only: props.selectedPoolDetails.pool_failover_only || false,
        type: props.selectedPoolDetails.pool_type || "",
        os_type: props.selectedPoolDetails.pool_os_type || "",
        entitled: props.selectedPoolDetails.pool_entitled || null,
        machines: props.selectedPoolDetails.pool_machines || [],
        username: props.selectedPoolDetails.pool_username || "",
        password: props.selectedPoolDetails.pool_password || "",
        security: props.selectedPoolDetails.pool_security || "",
        domain: props.selectedPoolDetails.pool_domain || "",
        disable_auth: props.selectedPoolDetails.pool_disable_auth || false,
        ignore_cert: props.selectedPoolDetails.pool_ignore_cert || false,
        max_connections: props.selectedPoolDetails.pool_max_connections || null,
        max_connections_per_user:
          props.selectedPoolDetails.pool_max_connections_per_user || null,
        gateway_port: props.selectedPoolDetails.pool_gateway_port || null,
        gateway_username: props.selectedPoolDetails.pool_gateway_username || "",
        gateway_password: props.selectedPoolDetails.pool_gateway_password || "",
        gateway_domain: props.selectedPoolDetails.pool_gateway_domain || "",
        initial_program: props.selectedPoolDetails.pool_initial_program || "",
        client_name: props.selectedPoolDetails.pool_client_name || "",
        timezone: props.selectedPoolDetails.pool_timezone || "",
        console: props.selectedPoolDetails.pool_console || false,
        width: props.selectedPoolDetails.pool_width || null,
        height: props.selectedPoolDetails.pool_height || null,
        dpi: props.selectedPoolDetails.pool_dpi || null,
        color_depth: props.selectedPoolDetails.pool_color_depth || "",
        resize_method: props.selectedPoolDetails.pool_resize_method || "",
        read_only: props.selectedPoolDetails.pool_read_only || false,
        clipboard_encoding:
          props.selectedPoolDetails.pool_clipboard_encoding || "",
        disable_copy: props.selectedPoolDetails.pool_disable_copy || false,
        disable_paste: props.selectedPoolDetails.pool_disable_paste || false,
        console_audio: props.selectedPoolDetails.pool_console_audio || false,
        custom_disable_audio:
          props.selectedPoolDetails.pool_custom_disable_audio || false,
        enable_audio_input:
          props.selectedPoolDetails.pool_enable_audio_input || false,
        enable_printing:
          props.selectedPoolDetails.pool_enable_printing || false,
        printer_name: props.selectedPoolDetails.pool_printer_name || "",
        enable_drive: props.selectedPoolDetails.pool_enable_drive || false,
        drive_name: props.selectedPoolDetails.pool_drive_name || "",
        drive_path: props.selectedPoolDetails.pool_drive_path || "",
        cursor: props.selectedPoolDetails.pool_cursor || "",
        enable_wallpaper:
          props.selectedPoolDetails.pool_enable_wallpaper || false,
        enable_theming: props.selectedPoolDetails.pool_enable_theming || false,
        enable_font_smoothing:
          props.selectedPoolDetails.pool_enable_font_smoothing || false,
        enable_full_window_drag:
          props.selectedPoolDetails.pool_enable_full_window_drag || false,
        enable_desktop_composition:
          props.selectedPoolDetails.pool_enable_desktop_composition || false,
        enable_menu_animations:
          props.selectedPoolDetails.pool_enable_menu_animations || false,
        disable_bitmap_caching:
          props.selectedPoolDetails.pool_disable_bitmap_caching || false,
        disable_offscreen_caching:
          props.selectedPoolDetails.pool_disable_offscreen_caching || false,
        disable_glyph_caching:
          props.selectedPoolDetails.pool_disable_glyph_caching || false,
        load_balance_info:
          props.selectedPoolDetails.pool_load_balance_info || "",
        recording_path: props.selectedPoolDetails.pool_recording_path || "",
        recording_name: props.selectedPoolDetails.pool_recording_name || "",
        create_recording_path:
          props.selectedPoolDetails.pool_create_recording_path || false,
        recording_exclude_mouse:
          props.selectedPoolDetails.pool_recording_exclude_mouse || false,
        recording_include_keys:
          props.selectedPoolDetails.pool_recording_include_keys || false,
        exclude_touch_events:
          props.selectedPoolDetails.pool_exclude_touch_events || false,
        enable_sftp: props.selectedPoolDetails.pool_enable_sftp || false,
        sftp_port: props.selectedPoolDetails.pool_sftp_port || null,
        sftp_username: props.selectedPoolDetails.pool_sftp_username || "",
        font_name: props.selectedPoolDetails.pool_font_name || "",
        sftp_password: props.selectedPoolDetails.pool_sftp_password || "",
        sftp_host_key: props.selectedPoolDetails.pool_sftp_host_key || "",
        sftp_private_key: props.selectedPoolDetails.pool_sftp_private_key || "",
        sftp_passphrase: props.selectedPoolDetails.pool_sftp_passphrase || "",
        sftp_root_directory:
          props.selectedPoolDetails.pool_sftp_root_directory || "",
        sftp_directory: props.selectedPoolDetails.pool_sftp_directory || "",
        sftp_server_alive_interval:
          props.selectedPoolDetails.pool_sftp_server_alive_interval || null,
        private_key: props.selectedPoolDetails.pool_private_key || "",
        passphrase: props.selectedPoolDetails.pool_passphrase || "",
        color_scheme: props.selectedPoolDetails.pool_color_scheme || "",
        custom_font_name: props.selectedPoolDetails.pool_custom_font_name || "",
        scrollback: props.selectedPoolDetails.pool_scrollback || 0,
        font_size: props.selectedPoolDetails.pool_font_size || null,
        backspace: props.selectedPoolDetails.pool_backspace || "",
        terminal_type: props.selectedPoolDetails.pool_terminal_type || "",
        typescript_path: props.selectedPoolDetails.pool_typescript_path || "",
        typescript_name: props.selectedPoolDetails.pool_typescript_name || "",
        create_typescript_path:
          props.selectedPoolDetails.pool_create_typescript_path || false,
        swap_red_blue: props.selectedPoolDetails.pool_swap_red_blue || false,
        destination_host: props.selectedPoolDetails.pool_destination_host || "",
        destination_port:
          props.selectedPoolDetails.pool_destination_port || null,
        exclude_mouse: props.selectedPoolDetails.pool_exclude_mouse || false,
        exclude_graphics_streams:
          props.selectedPoolDetails.pool_exclude_graphics_streams || false,
        enable_audio: props.selectedPoolDetails.pool_enable_audio || false,
        audio_servername: props.selectedPoolDetails.pool_audio_servername || "",
        args: props.selectedPoolDetails.pool_args || [],
      }));
    }
  }, [props.selectedPoolDetails, props.poolId, props.onSuccess]);

  // State for custom settigns checkbox
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // // function to handle checkbox change
  const handleCheckboxChange = () => {
    setIsChecked((prevState) => !prevState); // Use a function to toggle the state
  };
  const cancelButtonRef = useRef(null);

  // Function to handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    if (type === "checkbox") {
      newValue = checked;
    } else if (
      [
        "guacd_port",
        "max_connections",
        "max_connections_per_user",
        "gateway_port",
        "width",
        "height",
        "dpi",
        "sftp_port",
        "sftp_server_alive_interval",
        "scrollback",
        "font_size",
        "destination_port",
        "port",
      ].includes(name)
    ) {
      newValue = value ? parseInt(value, 10) : null;
    }

    setAddMachine((prevState) => ({
      ...prevState,
      [name]: newValue,
    }));
  };

  const handleConfirm = async () => {
    setIsLoading(true);
   
    
    if (
      !addMachine.name ||
      !addMachine.hostname ||
      !addMachine.port ||
      !addMachine.protocol
    ) {
      toast.error("Please fill all the details", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
      setIsLoading(false);
      return;
    } 
      
    const requestData = {
      ...addMachine,   
      email: userEmail  
    };
    try {
      const response = await createMachineService(token, requestData);

      const { msg, machine, pools } = response.data?.data;
      if (response.data?.code === 200) {
        setVmAvailable((prevMachines) => [...prevMachines, machine]);
        pc.setAvailablePools(pools);
        toast.success(msg, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Slide,
        });
        setAddMachine({
          name: "",
          hostname: "",
          port: null,
          protocol: "",
          pool_id: props.poolId || "", 
          users_assigned: [],
          guacd_port: null,
          guacd_encryption: "",
          guacd_hostname: "",
          weight: null,
          failover_only: false,
          type: "",
          entitled: null,
          machines: [],
          os_type: "",
          username: "",
          password: "",
          security: "",
          domain: "",
          disable_auth: false,
          ignore_cert: false,
          max_connections: null,
          max_connections_per_user: null,
          gateway_port: null,
          gateway_username: "",
          gateway_password: "",
          gateway_domain: "",
          initial_program: "",
          client_name: "",
          timezone: "",
          console: false,
          width: null,
          height: null,
          dpi: null,
          color_depth: "",
          resize_method: "",
          read_only: false,
          clipboard_encoding: "",
          disable_copy: false,
          disable_paste: false,
          console_audio: false,
          custom_disable_audio: false,
          enable_audio_input: false,
          enable_printing: false,
          printer_name: "",
          enable_drive: false,
          drive_name: "",
          drive_path: "",
          cursor: "",
          enable_wallpaper: false,
          enable_theming: false,
          enable_font_smoothing: false,
          enable_full_window_drag: false,
          enable_desktop_composition: false,
          enable_menu_animations: false,
          disable_bitmap_caching: false,
          disable_offscreen_caching: false,
          disable_glyph_caching: false,
          load_balance_info: "",
          recording_path: "",
          recording_name: "",
          create_recording_path: false,
          recording_exclude_mouse: false,
          recording_include_keys: false,
          exclude_touch_events: false,
          enable_sftp: false,
          sftp_port: null,
          sftp_username: "",
          font_name: "",
          sftp_password: "",
          sftp_host_key: "",
          sftp_private_key: "",
          sftp_passphrase: "",
          sftp_root_directory: "",
          sftp_directory: "",
          sftp_server_alive_interval: null,
          private_key: "",
          passphrase: "",
          color_scheme: "",
          custom_font_name: "",
          scrollback: 0,
          font_size: null,
          backspace: "",
          terminal_type: "",
          typescript_path: "",
          typescript_name: "",
          create_typescript_path: false,
          swap_red_blue: false,
          destination_host: "",
          destination_port: null,
          exclude_mouse: false,
          exclude_graphics_streams: false,
          enable_audio: false,
          audio_servername: "",
          args: [],
          identifier: "",
          is_custom_machine: false,
        });
        props.setOpen(false);
      } else {
        setRename(msg);
        toast.error(msg, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Slide,
        });
      }
    } catch (error) {
      toast.error("Failed to create machine", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
    } finally {
      setIsLoading(false);
      setRename("")
    }
  };
  return (
    <Transition.Root show={props.open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        initialFocus={cancelButtonRef}
        onClose={props.setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg w-auto divide-y divide-gray-200">
                <div className="p-6">
                  <table className="w-full">
                    <tbody>
                      <tr className="flex items-start">
                        <td className="pl-4 w-1/3">
                          <label
                            htmlFor="name"
                            className="text-sm font-semibold text-gray-900"
                          >
                            Name <span className="text-red-500 text-xl">*</span>
                          </label>
                        </td>
                        <td className="pr-4 w-2/3">
                          <div className="mt-1">
                            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
                              <input
                                type="text"
                                id="name"
                                name="name"
                                value={addMachine.name}
                                onChange={handleChange}
                                placeholder="Name"
                                required
                                className="block flex-1 rounded-md bg-white py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm border border-gray-300 focus:border-indigo-500"
                              />
                            </div>
                            <div className="text-red-500">{rename}</div>
                          </div>
                        </td>
                      </tr>

                      <tr className="flex items-start">
                        <td className="pl-4 w-1/3">
                          <label
                            htmlFor="ip"
                            className="text-sm font-semibold text-gray-900"
                          >
                            Hostname/IP{" "}
                            <span className="text-red-500 text-xl">*</span>
                          </label>
                        </td>
                        <td className="pr-4 w-2/3">
                          <div className="mt-1">
                            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
                              <input
                                type="text"
                                id="ip"
                                name="hostname"
                                value={addMachine.hostname}
                                onChange={handleChange}
                                placeholder="Hostname / IP"
                                required
                                className="block flex-1 rounded-md bg-white py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm border border-gray-300 focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr className="flex items-start">
                        <td className="pl-4 w-1/3">
                          <label
                            htmlFor="protocol"
                            className="text-sm font-semibold text-gray-900"
                          >
                            Protocol
                          </label>
                        </td>
                        <td className="pr-4 w-2/3">
                          <div className="mt-1">
                            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
                              <input
                                id="protocol"
                                name="protocol"
                                onChange={handleChange}
                                value={addMachine.protocol}
                                placeholder="Protocol"
                                disabled
                                className="block flex-1 rounded-md bg-blue-100 py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm border border-gray-300 focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        </td>
                        </tr>
                        {addMachine.type=="Manual" && <tr className="flex items-start">
                           <td className="pl-4 w-1/3">
                          <label
                            htmlFor="protocol"
                            className="text-sm font-semibold text-gray-900"
                          >
                            OS Type
                          </label>
                        </td>
                          <td className="pr-4 w-2/3">
                            <div className="mt-1">
                              <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
                              
                              <select
                                id="os_type"
                                name="os_type"
                                onChange={handleChange}
                                value={addMachine.os_type}
                                
                                className="block w-full rounded-md  py-1.5 pl-3 pr-10 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm border border-gray-300 "
                              >
                                <option value="" >
                                  Select OS Type
                                </option>
                                <option value="Windows">Windows</option>
                                <option value="Linux">Linux</option>
                             
                              </select>
                            </div>
                          </div>
                        </td>
                        </tr>}
                      

                      <tr className="flex items-center justify-between mt-3 gap-4">
                        <td className="pl-4 w-1/3 flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            name="is_custom_machine"
                            checked={addMachine.is_custom_machine}
                            onChange={handleChange}
                          />
                          <label
                            htmlFor="custom-settings"
                            className="text-sm font-semibold text-gray-900"
                          >
                            Custom Settings
                          </label>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {addMachine.protocol === "RDP" &&
                    addMachine.is_custom_machine && (
                      <MachineRdp
                        securityMode={securityMode}
                        poolDetails={addMachine}
                        onChange={handleChange}
                      />
                    )}
                  {addMachine.protocol === "SSH" &&
                    addMachine.is_custom_machine && (
                      <MachineSSH
                        poolDetails={addMachine}
                        onChange={handleChange}
                      />
                    )}
                  {addMachine.protocol === "VNC" &&
                    addMachine.is_custom_machine && (
                      <MachineVNC
                        poolDetails={addMachine}
                        onChange={handleChange}
                      />
                    )}
                </div>
                <div className="bg-gray-100 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    onClick={handleConfirm}
                    type="submit"
                    disabled={isLoading}
                    className={`rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm flex items-center gap-2
                    ${
                      isLoading
                        ? "bg-[#1a365d] cursor-not-allowed"
                        : "bg-[#1a365d]/80 hover:bg-[#1a365d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a365d]"
                    }
                  `}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>{isLoading ? "Submitting..." : "Confirm"}</span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-white hover:bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-300 hover:ring-gray-400 sm:mt-0 sm:w-auto"
                    onClick={() => props.setOpen(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

import { Fragment, useRef, useState,useEffect,useContext } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { getPoolByIdService, updateMachineService } from "../../Services/PoolService";
import { PoolContext } from "../../Context/PoolContext";
import { Slide, toast } from "react-toastify";
import MachineRdp from "./MachineRdp";
import MachineSSH from "./MachineSSH";
import MachineVNC from "./MachineVNC";
import { Loader2, User } from "lucide-react";
export default function EditMahchinePopover(props) {

    const cancelButtonRef = useRef(null);
    const [editMachine, setEditMachine] = useState({ ...props.machineDetails });
    const [editpool, setEditPool] = useState({});
    const [isChecked, setIsChecked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const pc = useContext(PoolContext);
    const poolId = props.poolId;
    const tokenParsed = pc.tokenParsed;
    let userEmail = tokenParsed.preferred_username;
    const token = pc.token;
    let securityMode = [
        "None",
        "Any",
        "NLA",
        "RDP encryption",
        "TLS encryption",
        "Hyper-V / VMConnect",
      ];
      useEffect(() => {
        getPoolByIdService(token, poolId)
          .then((res) => {
            setEditPool(res.data.data.pool);
          })
          .catch((err) => {
            toast.error("Failed to fetch pool details", {
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
          });
      }, []);

    useEffect(() => {
      setEditMachine({ ...props.machineDetails });
    }, [props.machineDetails]);
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
      
  
      setEditMachine((prevState) => ({
        ...prevState,
        [name]: newValue,
      }));
      
    };
    const preparePayload = () => {
      if (!editMachine.is_custom_machine) {
        return {
          ...editMachine,
          ...{
            port:editpool.pool_port || null,
            protocol: editpool.pool_protocol || "",
            users_assigned:editpool.pool_users_assigned || [],
            guacd_port: editpool.pool_guacd_port || null,
            guacd_encryption:editpool.pool_guacd_encryption || "",      
            weight: editpool.pool_weight || null,
            failover_only:editpool.pool_failover_only || false,
            type: editpool.pool_type || "",
            entitled: editpool.pool_entitled || null,
            machines: editpool.pool_machines || [],
            os_type: editpool.pool_os_type || "",
            username: editpool.pool_username || "",
            password: editpool.pool_password || "",
            security:editpool.pool_security || "",
            domain: editpool.pool_domain || "",
            disable_auth: editpool.pool_disable_auth || false,
            ignore_cert:editpool.pool_ignore_cert || false,
            max_connections: editpool.pool_max_connections || null,
            max_connections_per_user:
              editpool.pool_max_connections_per_user || null,
            gateway_port: editpool.pool_gateway_port || null,
            gateway_username:editpool.pool_gateway_username || "",
            gateway_password:editpool.pool_gateway_password || "",
            gateway_domain:editpool.pool_gateway_domain || "",
            initial_program:editpool.pool_initial_program || "",
            client_name:editpool.pool_client_name || "",
            timezone:editpool.pool_timezone || "",
            console:editpool.pool_console || false,
            width:editpool.pool_width || null,
            height:editpool.pool_height || null,
            dpi:editpool.pool_dpi || null,
            color_depth:editpool.pool_color_depth || "",
            resize_method:editpool.pool_resize_method || "",
            read_only:editpool.pool_read_only || false,
            clipboard_encoding:
             editpool.pool_clipboard_encoding || "",
            disable_copy:editpool.pool_disable_copy || false,
            disable_paste:editpool.pool_disable_paste || false,
            console_audio:editpool.pool_console_audio || false,
            custom_disable_audio:
             editpool.pool_custom_disable_audio || false,
            enable_audio_input:
             editpool.pool_enable_audio_input || false,
            enable_printing:
             editpool.pool_enable_printing || false,
            printer_name:editpool.pool_printer_name || "",
            enable_drive:editpool.pool_enable_drive || false,
            drive_name:editpool.pool_drive_name || "",
            drive_path:editpool.pool_drive_path || "",
            cursor:editpool.pool_cursor || "",
            enable_wallpaper:
             editpool.pool_enable_wallpaper || false,
            enable_theming:editpool.pool_enable_theming || false,
            enable_font_smoothing:
             editpool.pool_enable_font_smoothing || false,
            enable_full_window_drag:
             editpool.pool_enable_full_window_drag || false,
            enable_desktop_composition:
             editpool.pool_enable_desktop_composition || false,
            enable_menu_animations:
             editpool.pool_enable_menu_animations || false,
            disable_bitmap_caching:
             editpool.pool_disable_bitmap_caching || false,
            disable_offscreen_caching:
             editpool.pool_disable_offscreen_caching || false,
            disable_glyph_caching:
             editpool.pool_disable_glyph_caching || false,
            load_balance_info:
             editpool.pool_load_balance_info || "",
            recording_path:editpool.pool_recording_path || "",
            recording_name:editpool.pool_recording_name || "",
            create_recording_path:
             editpool.pool_create_recording_path || false,
            recording_exclude_mouse:
             editpool.pool_recording_exclude_mouse || false,
            recording_include_keys:
             editpool.pool_recording_include_keys || false,
            exclude_touch_events:
             editpool.pool_exclude_touch_events || false,
            enable_sftp:editpool.pool_enable_sftp || false,
            sftp_port:editpool.pool_sftp_port || null,
            sftp_username:editpool.pool_sftp_username || "",
            font_name:editpool.pool_font_name || "",
            sftp_password:editpool.pool_sftp_password || "",
            sftp_host_key:editpool.pool_sftp_host_key || "",
            sftp_private_key:editpool.pool_sftp_private_key || "",
            sftp_passphrase:editpool.pool_sftp_passphrase || "",
            sftp_root_directory:
             editpool.pool_sftp_root_directory || "",
            sftp_directory:editpool.pool_sftp_directory || "",
            sftp_server_alive_interval:
             editpool.pool_sftp_server_alive_interval || null,
            private_key:editpool.pool_private_key || "",
            passphrase:editpool.pool_passphrase || "",
            color_scheme:editpool.pool_color_scheme || "",
            custom_font_name:editpool.pool_custom_font_name || "",
            scrollback:editpool.pool_scrollback || 0,
            font_size:editpool.pool_font_size || null,
            backspace:editpool.pool_backspace || "",
            terminal_type:editpool.pool_terminal_type || "",
            typescript_path:editpool.pool_typescript_path || "",
            typescript_name:editpool.pool_typescript_name || "",
            create_typescript_path:
             editpool.pool_create_typescript_path || false,
            swap_red_blue:editpool.pool_swap_red_blue || false,
            destination_host:editpool.pool_destination_host || "",
            destination_port:
             editpool.pool_destination_port || null,
            exclude_mouse:editpool.pool_exclude_mouse || false,
            exclude_graphics_streams:
             editpool.pool_exclude_graphics_streams || false,
            enable_audio:editpool.pool_enable_audio || false,
            audio_servername:editpool.pool_audio_servername || "",
            args:editpool.pool_args || [],
           
          }
        };
      }
      return editMachine;
    };
  
    const handleConfirm = () => {
      setIsLoading(true)
  
      const payload = preparePayload();
      

      const requestData = {
        ...payload,
        email: userEmail
      }

      updateMachineService(token, editMachine.identifier, requestData)
        .then((res) => {
          toast.success(res.data.msg, {
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
          props.setVmAvailable(res.data?.data.machines);
          props.setOpen(false);
        })
        .catch((err) => {
          toast.error("Failed to update machine", {
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
        })
        .finally(() => {
          setIsLoading(false);
        });
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg w-auto divide-y divide-slate-400">
                <div className="p-6">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="pl-4">
                          <label
                            htmlFor="name"
                            className="mb-2 text-sm font-medium leading-6 text-gray-900"
                          >
                            Name
                          </label>
                        </td>
                        <td className="pr-4">
                          <div className="mt-2 border-0">
                            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                              <input
                                type="text"
                                id="name"
                                name="name"
                                value={editMachine.name}
                                onChange={handleChange}
                                placeholder="Name"
                                
                                className="block flex-1 rounded-md  bg-white  border-slate-300 py-1.5 pl-1 text-gray-700 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="pl-4">
                          <label
                            htmlFor="ip"
                            className="mb-2 text-sm font-medium leading-6 text-gray-900"
                          >
                            Hostname/IP
                          </label>
                        </td>
                        <td className="pr-4">
                          <div className="mt-2 border-0">
                            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                              <input
                                type="text"
                                id="ip"
                                name="hostname"
                                value={editMachine.hostname}
                                onChange={handleChange}
                                placeholder="Hostname / IP"
                                className="block flex-1 rounded-md bg-white bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 border-2"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="pl-4">
                          <label
                            htmlFor="protocol"
                            className="mb-2 text-sm font-medium leading-6 text-gray-900"
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
                                value={editMachine.protocol}
                                placeholder="Protocol"
                                className="block flex-1 rounded-md bg-blue-100 py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm border border-gray-300 focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="pl-4 col-span-2">
                          <input
                            type="checkbox"
                            className="mr-2"
                            name="is_custom_machine"
                            checked={editMachine.is_custom_machine} 
                            onChange={handleChange}
                          />

                          <label
                            htmlFor="custom settings"
                            className="mb-2 text-sm font-medium leading-6 text-gray-900"
                          >
                            Custom Settings
                          </label>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {editMachine.protocol == "RDP" &&  editMachine.is_custom_machine && (
                    <MachineRdp securityMode={securityMode}  poolDetails={editMachine}
                    onChange={handleChange}/>
                  )}
                  {editMachine.protocol == "SSH" &&  editMachine.is_custom_machine &&<MachineSSH  poolDetails={editMachine}
                      onChange={handleChange}/>}
                  {editMachine.protocol == "VNC" &&  editMachine.is_custom_machine &&<MachineVNC  poolDetails={editMachine}
                      onChange={handleChange}/>}
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
                    className="inline-flex w-full justify-center rounded-md bg-white hover:bg-slate-200 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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

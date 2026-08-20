import { useRef, useState } from "react";
import Popup from "../Popup/Popup";
import "./VCenter.css";
import { Slide, toast } from "react-toastify";

export default function VCenter() {
  //state for all input fields
  let [vcenter, setVcenter] = useState({
    ip: "",
    username: "",
    password: "",
    tls: false,
  });
  //state for popup
  const [open, setOpen] = useState(false);
  const checkboxRef = useRef(null);
  
  //function for confirmation in popup menu
  let sendData = () => {
    reset();
    setOpen(false);
  };
  
  //onChange event handler for all the input fields
  let handleOnChange = (e) => {
    setVcenter({ ...vcenter, [e.target.name]: e.target.value });
  };
  
  //opens confirmation popup and check for any empty fields
  let handleOnClick = () => {
    if (vcenter.ip && vcenter.username && vcenter.password) {
      setOpen(true);
    } else {
      //toast is generated if any input fields are empty
      toast.error("Please enter all details", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
    }
  };
  
  //onChange event hanndler for toggle button
  let handleChange = (e) => {
    setVcenter({ ...vcenter, tls: e.target.checked });
  };
  
  //function to reset all the input fields
  let reset = () => {
    setVcenter({ ip: "", username: "", password: "", tls: false });
    if (checkboxRef.current) {
      checkboxRef.current.checked = false; // Uncheck the checkbox
    }
  };

  return (
    <div className="p-2 md:p-4 h-full flex flex-col overflow-hidden">
      <div className="w-full md:w-[98%] h-[85vh] md:h-[90vh] flex-1 mx-auto bg-white dark:bg-gray-800 rounded-lg p-4 md:p-8 shadow-md flex flex-col overflow-auto custom-scrollbar mt-4">
        {/*Logic for popup*/}
        <Popup
          open={open}
          setOpen={setOpen}
          sendData={sendData}
          heading="Please confirm"
          text="Are you sure you want to submit?"
          color="yellow"
        />

        <div className="vcenter w-full max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 border-b pb-2">
            VCenter Credentials Form
          </h2>
          
          <div className="space-y-4">
            <div className="tr">
              <div className="th">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  IP address / FQDN
                </label>
              </div>
              <div className="td">
                <input
                  type="text"
                  name="ip"
                  value={vcenter.ip}
                  onChange={handleOnChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] outline-none transition-all shadow-sm"
                  placeholder="e.g. 192.168.1.10"
                />
              </div>
            </div>

            <div className="tr">
              <div className="th">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </label>
              </div>
              <div className="td">
                <input
                  type="text"
                  name="username"
                  value={vcenter.username}
                  onChange={handleOnChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] outline-none transition-all shadow-sm"
                  placeholder="e.g. administrator@vsphere.local"
                />
              </div>
            </div>

            <div className="tr">
              <div className="th">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
              </div>
              <div className="td">
                <input
                  type="password"
                  name="password"
                  value={vcenter.password}
                  onChange={handleOnChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 py-2 px-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d] outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="tr">
              <div className="th">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  TLS
                </label>
              </div>
              <div className="td">
                <label className="switch">
                  <input
                    type="checkbox"
                    name="tls"
                    onChange={handleChange}
                    ref={checkboxRef}
                    checked={vcenter.tls}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center justify-end gap-4 border-t pt-6">
            <button
              type="reset"
              className="px-6 py-2.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold shadow-sm hover:bg-gray-200 transition-colors"
              onClick={reset}
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 rounded-md bg-[#1a365d]/90 text-white font-semibold shadow-md hover:bg-[#1a365d] transition-all active:scale-95"
              onClick={handleOnClick}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

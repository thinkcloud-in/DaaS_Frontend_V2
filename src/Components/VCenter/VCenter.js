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
    <div className="space-y-5 m-2 w-full">
      {/*Logic for popup*/}
      <Popup
        open={open}
        setOpen={setOpen}
        sendData={sendData}
        heading="Please confirm"
        text="Are you sure you want to submit?"
        color="yellow"
      />
      {/*VCenter Credentials Form*/}

      <div className="border-2 border-gray-900/10 mx-10 p-3 shadow-md">
        <h2 className="font-semibold leading-7 text-gray-900">
          VCenter Credentials Form
        </h2>
        <div className="text-left table-auto">
          <div className="tr">
            <div className="td">
              <label
                htmlFor="username"
                className="block text-sm font-medium leading-6 text-gray-900 border-0"
              >
                IP address / FQDN
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset   sm:max-w-md">
                  <input
                    type="text"
                    name="ip"
                    value={vcenter.ip}
                    onChange={handleOnChange}
                    className="block flex-1 bg-white rounded-md border-2 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="td">
              <label
                htmlFor="username"
                className="block text-sm font-medium leading-6 text-gray-900 border-0"
              >
                Username
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset   sm:max-w-md">
                  <input
                    type="text"
                    name="username"
                    value={vcenter.username}
                    onChange={handleOnChange}
                    className="block flex-1 bg-white rounded-md border-2 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="td">
              <label
                htmlFor="username"
                className="block text-sm font-medium leading-6 text-gray-900 border-0"
              >
                Password
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset   sm:max-w-md">
                  <input
                    type="password"
                    name="password"
                    value={vcenter.password}
                    onChange={handleOnChange}
                    className="block flex-1 bg-white rounded-md border-2 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tr">
            <div className="td">
              <label
                htmlFor="username"
                className="block text-sm font-medium leading-6 text-gray-900 border-0"
              >
                TLS
              </label>
            </div>
            <div className="td">
              <div className="mt-2 border-0">
                <label className="switch">
                  <input
                    type="checkbox"
                    name="tls"
                    onChange={handleChange}
                    ref={checkboxRef}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Buttons */}
      <div className="ml-10 pl-5 buttons">
        <button
          type="reset"
          className="rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          onClick={reset}
        >
          Reset
        </button>
        <button
          type="submit"
          className="rounded-md bg-[#1a365d]/80 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1a365d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a365d]/80"
          onClick={handleOnClick}
        >
          Save
        </button>
      </div>
    </div>
  );
}

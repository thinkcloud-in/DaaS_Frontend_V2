import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createIpmiServerThunk } from "../../redux/features/IPMI/IpmiThunks";
import {
  selectCreateLoading,
  selectIpmiError,
} from "../../redux/features/IPMI/IpmiSelectors";
import { clearError } from "../../redux/features/IPMI/IpmiSlice";
import {
  selectAuthToken,
  selectAuthTokenParsed,
} from "../../redux/features/Auth/AuthSelectors";
import { InputField, PasswordField } from "../Common";

const IpmiCreationForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector(selectAuthToken);
  const tokenParsed = useSelector(selectAuthTokenParsed);
  const userEmail = tokenParsed?.preferred_username;

  // Redux selectors
  const loading = useSelector(selectCreateLoading);
  const error = useSelector(selectIpmiError);

  const [form, setForm] = useState({
    ipmi_server_ip: "",
    name: "",
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.ipmi_server_ip)
      newErrors.ipmi_server_ip = "IPMI Server IP is required";
    if (!form.username) newErrors.username = "Username is required";
    if (!form.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const payload = { ...form, email: userEmail };
        const result = await dispatch(
          createIpmiServerThunk({ token, payload }),
        ).unwrap();
        navigate("/ipmi");
      } catch (error) {}
    }
  };

  const Goback = () => {
    navigate(-1);
  };

  return (
    <div className=" w-[98%] h-[90vh] mt-4 m-auto bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md flex flex-col overflow-hidden ">
      <div className="flex items-center mb-6 mt-10">
        <button
          onClick={Goback}
          className="mr-3 bg-[#1a365d]/80 text-white w-8 h-8 rounded-md hover:bg-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d]/100 focus:ring-opacity-10 flex items-center justify-center"
          title="Back"
          style={{
            height: 36,
            width: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      <div
        className={`w-full mx-auto pt-12 px-2 h-[90vh] ${loading ? "opacity-50 pointer-events-none select-none" : ""}`}
      >
        <h3 className="text-lg font-medium text-[#00000099] dark:text-gray-100 mb-8  pb-4 pl-6 bg-transparent">
          Create New IPMI Device
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl h-full p-8">
          <form onSubmit={handleSubmit} className="pr-2">
            <InputField
              label="IPMI Server IP"
              iconClass="fa-server"
              name="ipmi_server_ip"
              value={form.ipmi_server_ip}
              onChange={handleChange}
              placeholder="Enter IPMI server IP"
              required={true}
              disabled={loading}
              error={errors.ipmi_server_ip}
            />

            <InputField
              label="Name"
              iconClass="fa-microchip"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter device Name"
              required={true}
              disabled={loading}
              error={errors.name}
            />

            <InputField
              label="Username"
              iconClass="fa-user"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter username"
              required={true}
              disabled={loading}
              error={errors.username}
            />

            <PasswordField
              label="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              required={true}
              disabled={loading}
              error={errors.password}
            />
            <div className="flex justify-start mt-10">
              <button
                type="submit"
                className="w-[100px] bg-[#1a365d]/80  hover:bg-[#1a365d] text-[#f5f5f5] px-3 py-2 rounded-lg font-semibold text-base"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IpmiCreationForm;

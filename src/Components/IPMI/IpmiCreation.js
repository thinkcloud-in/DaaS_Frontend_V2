import React, { useState, useContext } from "react";

import { useNavigate } from "react-router-dom";
import axiosInstance from "Services/AxiosInstane";
import { getEnv } from "utils/getEnv";
import { toast } from "react-toastify";
import { PoolContext } from "../../Context/PoolContext";
import { createIpmiServer } from "Services/IPMI_Service"; 
const IpmiCreationForm = () => {
  const [form, setForm] = useState({
    ipmi_server_ip: "",
    name: "",
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  let navigate = useNavigate();
  const backendUrl = getEnv('BACKEND_URL');
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleTogglePassword = () => setShowPassword((prev) => !prev);
  const pc = useContext(PoolContext);
  const token = pc.token;
  const userEmail = pc.tokenParsed.preferred_username;
 // Eye icon SVGs for show/hide
const EyeIcon = ({ visible, onClick }) => (
  <span onClick={onClick} style={{ cursor: 'pointer', marginLeft: 8 }}>
    {visible ? (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.362-2.522A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.197M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 6L6 6" /></svg>
    )}
  </span>
);
  const validate = () => {
    const newErrors = {};
    if (!form.ipmi_server_ip)
      newErrors.ipmi_server_ip = "IPMI Server IP is required";
 
    if (!form.username) newErrors.username = "Username is required";
    if (!form.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
 
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setApiError("");
  //   if (validate()) {
  //     setLoading(true);
  //     let payload = { ...form, email: userEmail};
  //     try {
  //       const res=await axiosInstance.post(`${backendUrl}/v1/ipmi/add_ipmi_server`, payload, {
  //         headers: { Authorization: `Bearer ${token}`, },
  //       });
  //       if (res.data && res.data.code==400)
  //       {
  //         toast.info(res.data.msg);
  //         setLoading(false);
  //         return;
  //       }
  //       toast.success("IPMI server created successfully!");
  //       navigate("/ipmi");
  //     } catch (err) {
  //       const errorMsg = err.response?.data?.msg ;
  //       setApiError(errorMsg);
  //       toast.error(errorMsg);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (validate()) {
      setLoading(true);
      const payload = { ...form, email: userEmail };
      try {
        const result = await createIpmiServer(token, payload);
        if (result.success) {
          navigate("/ipmi");
        } else {
          setApiError(result.message);
        }
      } catch (error) {
        setApiError(error.message);
      } finally {
        setLoading(false);
      }
    }
  };
 
  const Goback = () => {
    navigate(-1);
  };
 
  return (
    <div className=" w-[98%] h-[90vh] mt-4 m-auto bg-white rounded-lg p-4 shadow-md flex flex-col overflow-hidden ">
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
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </button>
      </div>
         
      <div className="w-full mx-auto pt-12 px-2  h-[90vh]">
        <h3 className="text-lg font-medium text-[#00000099] mb-8  pb-4 pl-6 bg-transparent">
            Create New IPMI Device
          </h3>
        <div className="bg-white rounded-xl h-full p-8">
       
          <form onSubmit={handleSubmit} className="pr-2">
            <div className="mb-6 flex items-center">
              <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px]">
                <span>
                  <i className="fas fa-server mr-2"></i>
                </span>
                IPMI Server IP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ipmi_server_ip"
                value={form.ipmi_server_ip}
                onChange={handleChange}
                className={`w-[40%] border border-gray-300 rounded-lg px-3 py-1 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-base bg-white ${
                  errors.ipmi_server_ip && "border-red-400"
                }`}
                placeholder="Enter IPMI server IP"
                disabled={loading}
              />
            </div>
            <div className="mb-6 flex items-center">
              <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px]">
                <span>
                  <i className="fas fa-microchip mr-2"></i>
                </span>
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className={`w-[40%] border border-gray-300 rounded-lg px-3 py-1 ml-2 focus:outline-none focus:ring-2 focus:ring-[#1a365d]/100 text-base bg-white ${
                  errors.name && "border-red-400"
                }`}
                placeholder="Enter device Name"
                disabled={loading}
              />
            </div>
            <div className="mb-6 flex items-center">
              <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px]">
                <span>
                  <i className="fas fa-user mr-2"></i>
                </span>
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className={`w-[40%] border border-gray-300 rounded-lg px-3 py-1 ml-2 focus:outline-none focus:ring-2 focus:ring-[#1a365d]/100 text-base bg-white ${
                  errors.username && "border-red-400"
                }`}
                placeholder="Enter username"
                disabled={loading}
              />
            </div>
            <div className="mb-6 flex items-center">
              <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px]">
                <span>
                  <i className="fas fa-lock mr-2"></i>
                </span>
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative w-[40%] ml-2">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-1 pr-8 focus:outline-none focus:ring-2 focus:ring-[#1a365d]/100 text-base bg-white ${
                    errors.password && "border-red-400"
                  }`}
                  placeholder="Enter password"
                  disabled={loading}
                />
                <span className="absolute right-2  -translate-y-1/2 mt-1.5 text-gray-500">
                  <EyeIcon visible={showPassword} onClick={handleTogglePassword} />
                </span>
              </div>
            </div>
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
 
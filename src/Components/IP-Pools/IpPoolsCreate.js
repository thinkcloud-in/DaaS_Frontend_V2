import React, { useState,useContext } from 'react';
import './IpPoolsCreate.css';
import { useNavigate } from "react-router-dom";
import { createIpPool } from "Services/IP_PoolService";
import { toast } from "react-toastify";
import { PoolContext } from "../../Context/PoolContext";

const IpPoolsCreate = () => {
  const [form, setForm] = useState({
    poolName: '',
    startIp: '',
    endIp: '',
    subnet: '',
    gateway: '',
    dns: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  let navigate = useNavigate();
  const pc = useContext(PoolContext);
  const token = pc.token;
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.poolName) newErrors.poolName = 'Pool Name is required';
    if (!form.startIp) newErrors.startIp = 'Starting IP is required';
    if (!form.endIp) newErrors.endIp = 'End IP is required';
    if (!form.subnet) newErrors.subnet = 'Subnet is required';
    if (!form.gateway) newErrors.gateway = 'Gateway is required';
    if (!form.dns) newErrors.dns = 'DNS is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const parseDns = (dnsString) => {
    return dnsString.split(',').map(v => v.trim()).filter(v => v);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (validate()) {
      setLoading(true);
      try {
        const payload = {
          Pool_name: form.poolName,
          Starting_ip: form.startIp,
          Ending_ip: form.endIp,
          Subnet: form.subnet,
          Gateway: form.gateway,
          DNS: parseDns(form.dns),
        };

        const response = await createIpPool(token, payload);
        toast.success(response?.msg || 'IP Pool created successfully!');
        navigate("/ip-pools");
      } catch (err) {
        const errorMsg = err.response?.data?.msg;
        setApiError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  const Goback = () => {
    navigate(-1);
  };
  const inputClass = (error) =>
    `w-full input-ip-pools px-3 py-2 ${error ? 'border-red-400' : ''}`;

  return (
    <div className="pool_creation w-[98%] h-[90vh] m-auto min-h-[75vh] mt-4 bg-white rounded-lg p-4 shadow-md flex flex-col overflow-hidden">
      <div className="flex justify-start mt-5">
        <div
          onClick={Goback}
          className="ml-4 bg-[#1a365d]/80 text-white px-2 py-2 rounded hover:bg-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d]/100 focus:ring-opacity-10 cursor-pointer"
          style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Back"
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto rounded-md bg-white custom-scrollbar ">
         <div className=" space-y-5 m-2 w-full mx-auto p-3 rounded-md  bg-white">
            <h2 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border-2 border-[#F0F8FFCC] p-3">
              Create New IP-Pool
            </h2>
          </div>
        <form onSubmit={handleSubmit} className="p-8 text-left pr-2">
          <div className="grid grid-cols-12 gap-4 items-center mb-4 ">
            <label className="text-sm font-medium leading-6 text-gray-900">
              Pool Name <span className="text-red-500">*</span>
            </label>
            <div className="col-span-6">
              <input
                type="text"
                name="poolName"
                value={form.poolName}
                onChange={handleChange}
                className={inputClass(errors.poolName)}
                placeholder=""
                disabled={loading}
              />
              {errors.poolName && <div className="text-red-600 text-sm mt-1">{errors.poolName}</div>}
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 items-center mb-4">
            <label className="text-sm font-medium leading-6 text-gray-900">
              Starting IP <span className="text-red-500">*</span>
            </label>
            <div className="col-span-6">
              <input
                type="text"
                name="startIp"
                value={form.startIp}
                onChange={handleChange}
                className={inputClass(errors.startIp)}
                placeholder=""
                disabled={loading}
              />
              {errors.startIp && <div className="text-red-600 text-sm mt-1">{errors.startIp}</div>}
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 items-center mb-4">
            <label className="text-sm font-medium leading-6 text-gray-900">
              End IP <span className="text-red-500">*</span>
            </label>
            <div className="col-span-6">
              <input
                type="text"
                name="endIp"
                value={form.endIp}
                onChange={handleChange}
                className={inputClass(errors.endIp)}
                placeholder=""
                disabled={loading}
              />
              {errors.endIp && <div className="text-red-600 text-sm mt-1">{errors.endIp}</div>}
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 items-center mb-4">
            <label className="text-sm font-medium leading-6 text-gray-900">
              Subnet <span className="text-red-500">*</span>
            </label>
            <div className="col-span-6">
              <input
                type="text"
                name="subnet"
                value={form.subnet}
                onChange={handleChange}
                className={inputClass(errors.subnet)}
                placeholder=""
                disabled={loading}
              />
              {errors.subnet && <div className="text-red-600 text-sm mt-1">{errors.subnet}</div>}
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 items-center mb-4">
            <label className="text-sm font-medium leading-6 text-gray-900">
              Gateway <span className="text-red-500">*</span>
            </label>
            <div className="col-span-6">
              <input
                type="text"
                name="gateway"
                value={form.gateway}
                onChange={handleChange}
                className={inputClass(errors.gateway)}
                placeholder=""
                disabled={loading}
              />
              {errors.gateway && <div className="text-red-600 text-sm mt-1">{errors.gateway}</div>}
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 items-center mb-8">
            <label className="text-sm font-medium leading-6 text-gray-900">
              DNS <span className="text-red-500">*</span>
            </label>
            <div className="col-span-6">
              <input
                type="text"
                name="dns"
                value={form.dns}
                onChange={handleChange}
                className={inputClass(errors.dns)}
                placeholder="e.g. 8.8.8.8, 8.8.4.4"
                disabled={loading}
              />
              {errors.dns && <div className="text-red-600 text-sm mt-1">{errors.dns}</div>}
            </div>
          </div>
          <button
            type="submit"
            className="bg-[#1a365d]/80 hover:bg-[#1a365d] text-[#f5f5f5] hover:text-white px-4 py-2 rounded-md font-semibold text-sm transition-all ml-2"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default IpPoolsCreate;
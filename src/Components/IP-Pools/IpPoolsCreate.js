import React, { useState, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './IpPoolsCreate.css';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PoolContext } from "../../Context/PoolContext";
import { createIpPoolThunk } from '../../redux/features/IP-Pools/IpPoolsThunks';
import { selectCreateLoading, selectIpPoolsError } from '../../redux/features/IP-Pools/IpPoolsSelectors';
import { clearError } from '../../redux/features/IP-Pools/IpPoolsSlice'; 
import { selectAuthToken, selectAuthTokenParsed } from '../../redux/features/Auth/AuthSelectors';
import { InputField } from '../Common';

const IpPoolsCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector(selectAuthToken);
  const tokenParsed = useSelector(selectAuthTokenParsed);
  const userName = tokenParsed?.preferred_username;

  // Redux selectors
  const loading = useSelector(selectCreateLoading);
  const error = useSelector(selectIpPoolsError);

  const [form, setForm] = useState({
    poolName: '',
    startIp: '',
    endIp: '',
    subnet: '',
    gateway: '',
    dns: '',
  });
  const [errors, setErrors] = useState({});

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
    if (validate()) {
      try {
        const payload = {
          Pool_name: form.poolName,
          Starting_ip: form.startIp,
          Ending_ip: form.endIp,
          Subnet: form.subnet,
          Gateway: form.gateway,
          DNS: parseDns(form.dns),
        };

        const result = await dispatch(createIpPoolThunk({ token, payload })).unwrap();
        toast.success(result?.msg || 'IP Pool created successfully!');
        navigate("/ip-pools");
      } catch (error) {
        // Error is handled by useEffect above
      }
    }
  };

  const Goback = () => {
    navigate(-1);
  };

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
      <div className={`flex-1 overflow-y-auto rounded-md bg-white custom-scrollbar ${loading ? "opacity-50 pointer-events-none select-none" : ""}`}>
         <div className=" space-y-5 m-2 w-full mx-auto p-3 rounded-md  bg-white">
            <h2 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border-2 border-[#F0F8FFCC] p-3">
              Create New IP-Pool
            </h2>
          </div>
        <form onSubmit={handleSubmit} className="p-8 text-left pr-2 w-full max-w-4xl mx-auto">
          <InputField
            label="Pool Name"
            name="poolName"
            iconClass="fa-diagram-project"
            value={form.poolName}
            onChange={handleChange}
            required={true}
            disabled={loading}
            error={errors.poolName}
            placeholder="Enter Pool Name"
          />
          <InputField
            label="Starting IP"
            name="startIp"
            iconClass="fa-network-wired"
            value={form.startIp}
            onChange={handleChange}
            required={true}
            disabled={loading}
            error={errors.startIp}
            placeholder="Starting IP"
          />
          <InputField
            label="End IP"
            name="endIp"
            iconClass="fa-network-wired"
            value={form.endIp}
            onChange={handleChange}
            required={true}
            disabled={loading}
            error={errors.endIp}
            placeholder="End IP"
          />
          <InputField
            label="Subnet"
            name="subnet"
            iconClass="fa-sitemap"
            value={form.subnet}
            onChange={handleChange}
            required={true}
            disabled={loading}
            error={errors.subnet}
            placeholder="Subnet"
          />
          <InputField
            label="Gateway"
            name="gateway"
            iconClass="fa-route"
            value={form.gateway}
            onChange={handleChange}
            required={true}
            disabled={loading}
            error={errors.gateway}
            placeholder="Gateway"
          />
          <InputField
            label="DNS"
            name="dns"
            iconClass="fa-globe"
            value={form.dns}
            onChange={handleChange}
            required={true}
            disabled={loading}
            error={errors.dns}
            placeholder="e.g. 8.8.8.8, 8.8.4.4"
          />
          <div className="flex justify-start mt-6">
            <button
              type="submit"
              className="bg-[#1a365d]/80 hover:bg-[#1a365d] text-[#f5f5f5] hover:text-white px-4 py-2 rounded-md font-semibold text-sm transition-all ml-2"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IpPoolsCreate;
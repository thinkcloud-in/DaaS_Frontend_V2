import React, { useEffect, useState, useContext } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from "react-router-dom";
import { PoolContext } from "../../Context/PoolContext"; 
import { toast } from "react-toastify";
import { 
  fetchIpmiServerByIdThunk, 
  updateIpmiServerThunk 
} from '../../redux/features/IPMI/IpmiThunks';
import { 
  selectSelectedIpmi, 
  selectFetchByIdLoading, 
  selectUpdateLoading, 
  selectIpmiError 
} from '../../redux/features/IPMI/IpmiSelectors';
import { clearError, clearSelectedIpmi } from '../../redux/features/IPMI/IpmiSlice';

const SkeletonInput = () => (
  <div className="w-[40%] h-[36px] bg-gray-200 animate-pulse rounded-lg ml-2"></div>
); 

const EditIpmi = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const pc = useContext(PoolContext);
  const token = pc.token;
  const userEmail = pc.tokenParsed.preferred_username;

  // Redux selectors
  const selectedIpmi = useSelector(selectSelectedIpmi);
  const fetchLoading = useSelector(selectFetchByIdLoading);
  const updateLoading = useSelector(selectUpdateLoading);
  const error = useSelector(selectIpmiError);

  const [form, setForm] = useState({
    ipmi_server_ip: "",
    name: "",
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (token && id) {
      dispatch(fetchIpmiServerByIdThunk({ token, id }));
    }
    
    return () => {
      dispatch(clearSelectedIpmi());
    };
  }, [dispatch, token, id]);

  useEffect(() => {
    if (selectedIpmi) {
      setForm({
        ipmi_server_ip: selectedIpmi.ipmi_server_ip ?? "",
        name: selectedIpmi.name ?? "",
        username: selectedIpmi.username ?? "",
        password: "", // Don't show the real password
      });
    }
  }, [selectedIpmi]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
      if (!selectedIpmi) {
        navigate("/ipmi");
      }
    }
  }, [error, dispatch, selectedIpmi, navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
 
  const validate = () => {
    const newErrors = {};
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        const payload = {
          ipmi_server_ip: form.ipmi_server_ip,
          name: form.name,
          username: form.username,
          email: userEmail,
          ...(form.password ? { password: form.password } : {}),
        };
        
        await dispatch(updateIpmiServerThunk({ token, id, payload })).unwrap();
        toast.success("IPMI Server updated successfully!");
        navigate("/ipmi");
      } catch (error) {
        toast.error(error || 'Failed to update IPMI server');
      }
    }
  };

  const Goback = () => {
    navigate(-1);
  };
 
  return (
    <div className="w-[98%] h-[90vh] m-auto mt-4 bg-white rounded-lg p-4 shadow-md flex flex-col overflow-hidden">
      <div className="flex items-center mb-6 mt-10">
        <button
          onClick={Goback}
          className="mr-3 bg-[#1a365d]/80 text-[#f5f5f5] w-8 h-8 rounded-md hover:bg-[#1a365d] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#1a365d]/100 focus:ring-opacity-10 flex items-center justify-center"
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
      <div className="w-full mx-auto pt-12 px-2 h-[90vh]">
        <h3 className="text-lg font-medium text-[#2d3146] mb-8 pb-4 pl-6 bg-transparent">
          Edit IPMI Device
        </h3>
        <div className="bg-white rounded-xl h-full p-8">
          {fetchLoading ? (
            <form className="pr-2">
              <div className="mb-6 flex items-center">
                <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px]">
                  <span>
                    <i className="fas fa-server mr-2"></i>
                  </span>
                  IPMI Server IP <span className="text-red-500">*</span>
                </label>
                <SkeletonInput />
              </div>
              <div className="mb-6 flex items-center">
                <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px]">
                  <span>
                    <i className="fas fa-signature mr-2"></i>
                  </span>
                  Processor Name
                </label>
                <SkeletonInput />
              </div>
              <div className="mb-6 flex items-center">
                <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px]">
                  <span>
                    <i className="fas fa-user mr-2"></i>
                  </span>
                  Username <span className="text-red-500">*</span>
                </label>
                <SkeletonInput />
              </div>
              <div className="mb-6 flex items-center">
                <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px]">
                  <span>
                    <i className="fas fa-lock mr-2"></i>
                  </span>
                  Password
                </label>
                <SkeletonInput />
              </div>
              <div className="flex justify-start mt-10">
                <div className="w-[100px] h-[40px] bg-gray-200 animate-pulse rounded-lg"></div>
              </div>
            </form>
          ) : (
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
                  readOnly
                  className={`w-[40%] border border-gray-300 rounded-lg px-3 py-1 ml-2 bg-gray-100 text-gray-700 focus:outline-none text-base ${
                    errors.ipmi_server_ip && "border-red-400"
                  }`}
                  placeholder="Enter IPMI server IP"
                />
              </div>
              <div className="mb-6 flex items-center">
                <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px]">
                  <span>
                    <i className="fas fa-signature mr-2"></i>
                  </span>
                  Processor Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-[40%] border border-gray-300 rounded-lg px-3 py-1 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-base bg-white"
                  placeholder="Enter  Name"
                  disabled={updateLoading}
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
                  className={`w-[40%] border border-gray-300 rounded-lg px-3 py-1 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-base bg-white ${
                    errors.username && "border-red-400"
                  }`}
                  placeholder="Enter username"
                  disabled={updateLoading}
                />
              </div>
              <div className="mb-6 flex items-center">
                <label className="flex items-center gap-2 font-medium text-[#22223b] min-w-[180px]">
                  <span>
                    <i className="fas fa-lock mr-2"></i>
                  </span>
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-[40%] border border-gray-300 rounded-lg px-3 py-1 ml-2 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-base bg-white ${
                    errors.password && "border-red-400"
                  }`}
                  placeholder="Enter new password"
                  disabled={updateLoading}
                  autoComplete="new-password"
                />
              </div>
              <div className="flex justify-start mt-10">
                <button
                  type="submit"
                  className="w-[100px] bg-[#1a365d]/80 hover:bg-[#1a365d] text-[#f5f5f5] hover:text-white px-3 py-2 rounded-lg font-semibold text-base"
                  disabled={updateLoading}
                >
                  {updateLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default EditIpmi;
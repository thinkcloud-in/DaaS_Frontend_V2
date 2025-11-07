import React, { useEffect } from "react";
import "./TOTP.css";
import { Slide, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTotpStatusThunk,
  updateTotpBrowserStatusThunk,
  updateTotpGuacStatusThunk,
} from "../../redux/features/TOTP/TotpThunks";
import {
  selectTotpAdminEnabled,
  selectTotpClientEnabled,
  selectTotpLoading,
  selectTotpError,
} from "../../redux/features/TOTP/TotpSelectors";

const TOTP = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);

  const enableAdminOTP = useSelector(selectTotpAdminEnabled);
  const enableClientOTP = useSelector(selectTotpClientEnabled);
  const loading = useSelector(selectTotpLoading);
  const error = useSelector(selectTotpError);

  useEffect(() => {
    if (token) {
      dispatch(fetchTotpStatusThunk(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    if (name === "admin") {
      dispatch(updateTotpBrowserStatusThunk({ token, enabled: checked }))
        .unwrap()
        .catch(() => toast.error("Failed to update Admin TOTP status"));
    }
    if (name === "client") {
      dispatch(updateTotpGuacStatusThunk({ token, enabled: checked }))
        .unwrap()
        .catch(() => toast.error("Failed to update Client TOTP status"));
    }
  };

  const Goback = () => {
    navigate("/");
  };

  return (
    <div className="w-[98%] m-auto h-[90vh] min-h-[75vh] mt-4 rounded-md bg-white">
      <div className="flex justify-start ml-0 sm:ml-4">
        <div
          onClick={Goback}
          className="ml-4 mt-5 bg-[#1a365d]/80 text-white px-2 py-2 rounded-md hover:bg-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:ring-opacity-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </div>
      </div>
      <div className="p-4 sm:p-6 md:p-8 rounded-lg flex flex-col items-start m-4 sm:m-6 md:m-10 bg-white w-full sm:w-4/5 md:w-3/5">
        <h1 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4 text-gray-600">
          OTP Verification
        </h1>
        <div className="flex items-center mb-2 sm:mb-4">
          <label htmlFor="totp" className="mr-2 text-sm font-medium text-gray-900">
            Enable TOTP for Admin
          </label>
          <div className="relative">
            <div className="mt-1 sm:mt-2 border-0">
              <label className="switch">
                <input
                  type="checkbox"
                  onChange={handleChange}
                  name="admin"
                  checked={enableAdminOTP}
                  disabled={loading}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex items-center mb-2 sm:mb-4">
          <label htmlFor="totp" className="mr-2 text-sm font-medium text-[#1a365d]">
            Enable TOTP for Client
          </label>
          <div className="relative">
            <div className="mt-1 sm:mt-2 border-0">
              <label className="switch">
                <input
                  type="checkbox"
                  onChange={handleChange}
                  name="client"
                  checked={enableClientOTP}
                  disabled={loading}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TOTP;
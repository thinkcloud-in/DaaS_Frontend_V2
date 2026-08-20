import React, { useEffect, useState, useCallback } from "react";
import "./TOTP.css";
import { Slide, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Pagination } from "../Common";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTotpStatusThunk,
  updateTotpBrowserStatusThunk,
  updateTotpGuacStatusThunk,
  fetchUsersForTotpResetThunk,
  resetGuacTotpThunk,
} from "../../redux/features/TOTP/TotpThunks";
import {
  selectTotpAdminEnabled,
  selectTotpClientEnabled,
  selectTotpLoading,
  selectTotpError,
  selectTotpUsers,
  selectTotpUsersLoading,
  selectTotpResetLoading,
} from "../../redux/features/TOTP/TotpSelectors";
import { selectAuthToken, selectAuthTokenParsed } from '../../redux/features/Auth/AuthSelectors';

const TOTP = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = useSelector(selectAuthToken);
  const tokenParsed = useSelector(selectAuthTokenParsed);
  const userName = tokenParsed?.preferred_username;

  const enableAdminOTP = useSelector(selectTotpAdminEnabled);
  const enableClientOTP = useSelector(selectTotpClientEnabled);
  const loading = useSelector(selectTotpLoading);
  const error = useSelector(selectTotpError);

  const users = useSelector(selectTotpUsers);
  const usersLoading = useSelector(selectTotpUsersLoading);
  const resetLoading = useSelector(selectTotpResetLoading);

  const safeUsers = Array.isArray(users) ? users : [];

  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [confirmResetUser, setConfirmResetUser] = useState(null);

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

  // Fetch users on mount and when page/search changes
  const fetchUsers = useCallback(() => {
    if (token) {
      dispatch(fetchUsersForTotpResetThunk({
        token,
        search: activeSearchTerm,
        first: currentPage * itemsPerPage,
        limit: itemsPerPage,
      }));
    }
  }, [dispatch, token, activeSearchTerm, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const handleResetTotp = (user) => {
    setConfirmResetUser(user);
  };

  const confirmReset = () => {
    if (confirmResetUser) {
      dispatch(resetGuacTotpThunk({ token, userId: confirmResetUser.userid }))
        .unwrap()
        .then(() => {
          setConfirmResetUser(null);
        })
        .catch(() => {
          setConfirmResetUser(null);
        });
    }
  };

  const cancelReset = () => {
    setConfirmResetUser(null);
  };

  const handleSearchClick = () => {
    setActiveSearchTerm(searchTerm);
    setCurrentPage(0);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchClick();
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() === "") {
      setActiveSearchTerm("");
      setCurrentPage(0);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setActiveSearchTerm("");
    setCurrentPage(0);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (safeUsers.length === itemsPerPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageSizeChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(0);
  };

  const Goback = () => {
    navigate("/");
  };

  return (
    <div className="w-full md:w-[98%] h-auto md:h-[90vh] min-h-[75vh] mt-4 m-auto p-2 md:p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col overflow-auto md:overflow-hidden">
      <div className="bg-white dark:bg-gray-800 flex-1 p-4 overflow-y-auto rounded-md custom-scrollbar flex flex-col">
        
        {/* Top switches section */}
        <div className="flex justify-start items-center w-full mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-600 dark:text-gray-400">
            OTP Verification
          </h1>
        </div>

        <div className="p-4 sm:p-6 mb-6 rounded-lg flex flex-col items-start bg-gray-50 dark:bg-gray-900/60 border border-gray-100 w-full md:w-3/5">
          <div className="flex items-center mb-4">
            <label htmlFor="admin-totp" className="mr-4 text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[170px]">
              Enable TOTP for Admin
            </label>
            <div className="relative">
              <div className="border-0">
                <label className="switch">
                  <input
                    id="admin-totp"
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
          <div className="flex items-center">
            <label htmlFor="client-totp" className="mr-4 text-sm font-medium text-[#1a365d] dark:text-blue-300 min-w-[170px]">
              Enable TOTP for Client
            </label>
            <div className="relative">
              <div className="border-0">
                <label className="switch">
                  <input
                    id="client-totp"
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

        {/* User List for TOTP Reset */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden w-full flex-1 flex flex-col mt-2">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Reset User TOTP</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  className="text-xs border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-7 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#1a365d] w-48"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    title="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                onClick={handleSearchClick}
                className="px-4 py-2 rounded-md bg-[#1a365d] text-white hover:bg-[#153056] text-xs font-semibold shadow-sm transition-all"
              >
                Search
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#1a365d] text-white text-xs font-semibold uppercase tracking-wider select-none">
                  <th className="py-3 px-4">S.No</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300">
                {usersLoading ? (
                  <tr>
                    <td colSpan="4" className="py-10 text-center text-gray-400">
                      Loading users...
                    </td>
                  </tr>
                ) : safeUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-10 text-center text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  safeUsers.map((user, index) => (
                    <tr key={user.userid || index} className="hover:bg-blue-50/40 dark:hover:bg-gray-700/60 transition-colors">
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{currentPage * itemsPerPage + index + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-[#1a365d]/10 dark:bg-blue-300/10 text-[#1a365d] dark:text-blue-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {(user.username || "U").charAt(0).toUpperCase()}
                          </div>
                          <span>{user.username || "N/A"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{user.email || "N/A"}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleResetTotp(user)}
                          disabled={!enableClientOTP || resetLoading === user.userid}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {resetLoading === user.userid ? (
                            "Resetting..."
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Reset TOTP
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {safeUsers.length > 0 && (
            <Pagination
              currentPage={currentPage + 1}
              onPageChange={(p) => (p < currentPage + 1 ? handlePrevPage() : handleNextPage())}
              hasPrev={currentPage > 0}
              hasNext={safeUsers.length === itemsPerPage}
              pageSize={itemsPerPage}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[10, 20, 50, 100, 200]}
            />
          )}
        </div>

      </div>

      {/* Confirmation Modal */}
      {confirmResetUser && (
        <div className="totp-modal-overlay" onClick={cancelReset}>
          <div className="totp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="totp-modal-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="totp-modal-title">Confirm TOTP Reset</h3>
            <p className="totp-modal-text">
              Are you sure you want to reset TOTP for user <strong>"{confirmResetUser.username}"</strong>? 
              This action will require the user to reconfigure their authenticator app.
            </p>
            <div className="totp-modal-actions">
              <button className="totp-modal-cancel" onClick={cancelReset}>
                Cancel
              </button>
              <button
                className="totp-modal-confirm"
                onClick={confirmReset}
                disabled={resetLoading === confirmResetUser.userid}
              >
                {resetLoading === confirmResetUser.userid ? (
                  <>
                    <div className="totp-btn-spinner"></div>
                    Resetting...
                  </>
                ) : (
                  "Yes, Reset TOTP"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TOTP;
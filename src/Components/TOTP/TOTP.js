import React, { useEffect, useState, useCallback } from "react";
import "./TOTP.css";
import { Slide, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
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
    <div className="w-full md:w-[98%] h-auto md:h-[90vh] min-h-[75vh] mt-4 m-auto p-2 md:p-3 bg-white rounded-lg shadow-lg flex flex-col overflow-auto md:overflow-hidden">
      <div className="bg-white flex-1 p-4 overflow-y-auto rounded-md custom-scrollbar flex flex-col">
        
        {/* Back Button & Top switches section */}
        <div className="flex justify-start items-center w-full mb-4">
          <div
            onClick={Goback}
            className="cursor-pointer bg-[#1a365d]/80 text-white px-2 py-2 rounded-md hover:bg-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d] focus:ring-opacity-10 mr-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-600">
            OTP Verification
          </h1>
        </div>

        <div className="p-4 sm:p-6 mb-6 rounded-lg flex flex-col items-start bg-gray-50 border border-gray-100 w-full md:w-3/5">
          <div className="flex items-center mb-4">
            <label htmlFor="admin-totp" className="mr-4 text-sm font-medium text-gray-900 min-w-[170px]">
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
            <label htmlFor="client-totp" className="mr-4 text-sm font-medium text-[#1a365d] min-w-[170px]">
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
        <div className="totp-users-section flex-1 flex flex-col">
          <div className="totp-users-header">
            <h2 className="totp-users-title">Reset User TOTP</h2>
            <div className="totp-search-container">
              <div className="totp-search-wrapper">
                <input
                  type="text"
                  className="totp-search-input"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                />
                {searchTerm && (
                  <button
                    className="totp-search-clear"
                    onClick={handleClearSearch}
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                className="totp-search-btn"
                onClick={handleSearchClick}
              >
                Search
              </button>
            </div>
          </div>

          <div className="totp-table-container flex-1 overflow-y-auto">
            <table className="totp-users-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr>
                    <td colSpan="4" className="totp-table-loading">
                      <div className="totp-spinner"></div>
                      <span>Loading users...</span>
                    </td>
                  </tr>
                ) : safeUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="totp-table-empty">
                      <svg xmlns="http://www.w3.org/2000/svg" className="totp-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>No users found</span>
                    </td>
                  </tr>
                ) : (
                  safeUsers.map((user, index) => (
                    <tr key={user.userid || index}>
                      <td>{currentPage * itemsPerPage + index + 1}</td>
                      <td>
                        <div className="totp-user-info">
                          <div className="totp-user-avatar">
                            {(user.username || "U").charAt(0).toUpperCase()}
                          </div>
                          <span>{user.username || "N/A"}</span>
                        </div>
                      </td>
                      <td>{user.email || "N/A"}</td>
                      <td>
                        <button
                          className="totp-reset-btn"
                          onClick={() => handleResetTotp(user)}
                          disabled={!enableClientOTP || resetLoading === user.userid}
                        >
                          {resetLoading === user.userid ? (
                            <>
                              <div className="totp-btn-spinner"></div>
                              Resetting...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="totp-reset-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className="totp-pagination">
            <div className="totp-pagination-info">
              {safeUsers.length > 0 && (
                <div className="flex items-center gap-3">
                  <span>
                    Showing {currentPage * itemsPerPage + 1} - {currentPage * itemsPerPage + safeUsers.length}
                  </span>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={handlePageSizeChange}
                      className="totp-limit-select"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="totp-pagination-controls">
              <button
                className="totp-page-btn"
                onClick={handlePrevPage}
                disabled={currentPage === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <span className="totp-page-number">Page {currentPage + 1}</span>
              <button
                className="totp-page-btn"
                onClick={handleNextPage}
                disabled={safeUsers.length < itemsPerPage}
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
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

import React from "react";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import { Search } from "lucide-react";

// Simple skeleton loader for popup
function SkeletonLoader() {
  return (
    <div className="bg-white p-6 rounded shadow-lg w-1/2 animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
      <div className="h-10 w-full bg-gray-200 rounded mb-4" />
      <div className="space-y-2 mb-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-6 w-full bg-gray-200 rounded" />
        ))}
      </div>
      <div className="h-10 w-24 bg-gray-200 rounded mx-auto" />
    </div>
  );
}

function EntitleUser(props) {
  return (
    props.showPopup && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        {props.usersLoading ? (
          <SkeletonLoader />
        ) : (
          <div className="bg-white rounded shadow-lg w-1/2 h-[600px] flex flex-col">
            {/* Header - fixed height */}
            <div className="flex-shrink-0 p-6 pb-4 border-b">
              <h2 className="text-2xl font-semibold">Select User</h2>
            </div>
            
            {/* Search and pagination controls - fixed height */}
            <div className="flex-shrink-0 px-6 py-4 border-b">
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={props.searchTerm}
                      onChange={props.handleSearch}
                      onKeyDown={props.handleSearchKeyDown}
                      className="w-full p-2 pr-12 border rounded focus:ring-2 focus:ring-[#1a365d]/100 focus:border-[#1a365d]/100 outline-none"
                    />
                    <button
                      type="button"
                      onClick={props.handleSearchUsers}
                      disabled={props.usersLoading}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-gray-600 hover:text-[#1a365d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Search"
                    >
                      <Search size={20} />
                    </button>
                  </div>
                </div>
                
                {/* Pagination controls */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Per page</label>
                    <select
                      value={props.userSearchPageSize}
                      onChange={(e) => props.handleUserPageSizeChange(e.target.value)}
                      className="w-24 p-2 border rounded focus:ring-2 focus:ring-[#1a365d]/100 bg-white"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => props.handleUserPageChange(props.userSearchPage - 1)}
                      disabled={props.userSearchPage === 1 || props.usersLoading}
                      className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm">Page {props.userSearchPage}</span>
                    <button
                      type="button"
                      onClick={() => props.handleUserPageChange(props.userSearchPage + 1)}
                      disabled={props.filteredData.length < props.userSearchPageSize || props.usersLoading}
                      className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* User list - flexible height with scroll */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
              {props.filteredData.length === 0 ? (
                <div className="text-center text-gray-600 flex items-center justify-center h-full">
                  No users found
                </div>
              ) : (
                <ul className="space-y-0">
                  {props.filteredData.map((user) => (
                    <span
                      className="flex w-full justify-between items-center border-b p-3 hover:bg-gray-50 transition-colors"
                      key={user.username}
                    >
                      <li className="cursor-default text-base text-gray-700">
                        {user.username}
                      </li>
                      <UserPlusIcon
                        className="h-6 w-6 text-gray-400 cursor-pointer hover:text-[#1a365d] transition-colors"
                        onClick={() => props.entitleUser(user.username)}
                      />
                    </span>
                  ))}
                </ul>
              )}
            </div>

            {/* Close button - fixed at bottom */}
            <div className="flex-shrink-0 p-6 pt-4 border-t">
              <button
                onClick={() => props.setShowPopup(false)}
                className="w-full p-2 bg-[#1a365d]/80 hover:bg-[#1a365d] text-white rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    )
  );
}

export default EntitleUser;

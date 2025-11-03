import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./UserManagement.css";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  CircularProgress,
  FormControl,
  InputLabel,
} from "@mui/material";
import { PoolContext } from "../../Context/PoolContext"; 
import {
  fetchUsers as fetchUsersService,
  fetchRoles as fetchRolesService,
  fetchRoleComponents as fetchRoleComponentsService,
  addRole as addRoleService,
  deleteRole as deleteRoleService,
  submitRoleComponents as submitRoleComponentsService,
  getUserPermission as getUserPermissionService,
  assignUserRole as assignUserRoleService,
  removeRoleFromUserService
} from '../../Services/UserManagementService';
import {
  RolesSkeleton,
  UsersSkeleton,
  UserRolesSkeleton,
  ComponentsSkeleton,
} from "./UserManagementSkeleton";

const componentCategories = {
  Dashboard: {
    vCenter: ["Overview", "Hosts", "Data Stores", "VMS"],
    Proxmox: ["PX-Overview", "PX-Nodes", "PX-Storage", "PX-VMs"],
    IPMI: ["IpmiDashboard"],
  },
  Reports: ["Template", "Horizon Reports", "Vamanit Dass Reports"],
  Schedule: ["Schedule"],
  Pools: ["Pools"],
  IpPools: ["IpPools"],
  Tasks: ["Tasks"],
  Settings: [
    "TOTP",
    "Domain",
    "IPMI",
    "Cluster",
    "SSL",
    "SMTP",
    "RBAC",
    "Retention Period",
  ],
};
const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("roles");
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [role, setRole] = useState("");
  const [components, setComponents] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [fetchroles, setFetchroles] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    addRole: false,
    deleteRole: null,
    submit: false,
    assignRole: false,
    removeRole: null,
  });
  const [isComponentsLoading, setIsComponentsLoading] = useState(false);
  const [userRolesLoading, setUserRolesLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const flattenAllComponents = () => {
    return Object.values(componentCategories).flatMap((cat) => {
      if (Array.isArray(cat)) return cat;
      if (typeof cat === "object" && cat !== null) {
        return Object.values(cat).flat();
      }
      return [];
    });
  };

  const pc = useContext(PoolContext);
  const token = pc.token;

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usernames = await fetchUsersService(token);
      setUsers(usernames);
      setFilteredUsers(usernames);
    } catch (error) {
      showError("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const roles = await fetchRolesService(token);
      setFetchroles(roles);
    } catch (error) {
      showError("Failed to fetch roles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      GetuserPermission(selectedUser);
    } else {
      setUserPermissions(null);
      setRole("");
      setComponents([]);
    }
  }, [selectedUser]);

  const showError = (message) => toast.error(message);
  const showSuccess = (message) => toast.success(message);

  const handleSearch = (term) => {
    setSearchTerm(term);
    const results = term
      ? users.filter((user) => user.toLowerCase().includes(term.toLowerCase()))
      : users;
    setFilteredUsers(results);
  };

  const handleUserClick = async (username) => {
    setSelectedUser((prevSelected) => {
      const newSelected = prevSelected === username ? null : username;
      if (newSelected) {
        GetuserPermission(newSelected);
      } else {
        setUserRoles([]);
      }
      return newSelected;
    });
  };

  const fetchRoleComponents = async (selectedRole) => {
    setIsComponentsLoading(true);
    try {
      const components = await fetchRoleComponentsService(token, selectedRole);
      setComponents(components);
    } catch (error) {
      setComponents([]);
    } finally {
      setIsComponentsLoading(false);
    }
  };
  const handleRoleSelect = (selectedRole) => {
    if (role === selectedRole) {
      setRole("");
      setComponents([]);
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      return;
    }
    setRole(selectedRole);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    fetchRoleComponents(selectedRole);
  };
  const handleCategorySelect = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
    setSelectedSubCategory(null);
  };

  const handleSubCategorySelect = (subcat) => {
    setSelectedSubCategory(subcat === selectedSubCategory ? null : subcat);
  };
  const handleComponentChange = (component) => {
    setComponents((prev) => {
      if (prev.includes(component)) {
        return prev.filter((c) => c !== component);
      }
      if (role) {
        return [...prev, component];
      }
      return prev;
    });
  };

  const handleAddRole = async () => {
    if (!role.trim()) {
      showError("Please enter a role name");
      return;
    }
    setLoadingStates((prev) => ({ ...prev, addRole: true }));
    try {
      const response = await addRoleService(token, role);
      if (response.status === 200) {
        showSuccess(response.data.msg);
        fetchRoles();
        setRole("");
      } else if (
        response.status === 400 ||
        response.data.msg === "Role already exists"
      ) {
        showError("Role already exists");
      }
    } catch (error) {
      showError("Failed to add role");
    } finally {
      setLoadingStates((prev) => ({ ...prev, addRole: false }));
    }
  };

  const handleDelete = async (roleToDelete) => {
    setLoadingStates((prev) => ({ ...prev, deleteRole: roleToDelete }));
    try {
      const response = await deleteRoleService(token, roleToDelete);
      if (response.status === 200) {
        showSuccess("Role deleted successfully!");
        setFetchroles(fetchroles.filter((r) => r !== roleToDelete));
      }
    } catch (error) {
      showError("Failed to delete role");
    } finally {
      setLoadingStates((prev) => ({ ...prev, deleteRole: null }));
    }
  };

  const handleSubmit = async () => {
    if (!role) {
      showError("Please select a role");
      return;
    }
    setLoadingStates((prev) => ({ ...prev, submit: true }));
    try {
      const response = await submitRoleComponentsService(token, role, components);
      if (response.status === 200) {
        showSuccess("Role and components saved successfully");
        await fetchRoles();
        setComponents([]);
        setRole("");
        setSelectedCategory(null);
        setSelectedSubCategory(null);
      } else {
        throw new Error(
          response.data?.detail || "Failed to save role and components"
        );
      }
    } catch (error) {
      showError(error.message || "Failed to save role and components");
    } finally {
      setLoadingStates((prev) => ({ ...prev, submit: false }));
    }
  };

  const GetuserPermission = async (username) => {
    setUserRolesLoading(true);
    try {
      const response = await getUserPermissionService(token, username);
      if (response.data.code === 200) {
        setUserRoles(response.data?.data?.roles || []);
      }
    } catch (error) {
      showError("Failed to fetch user roles");
    } finally {
      setUserRolesLoading(false);
    }
  };

  const handleRoleAssignment = async () => {
    if (!selectedRole) {
      showError("Please select a role");
      return;
    }
    if (!selectedUser) {
      showError("Please select a user");
      return;
    }
    setIsLoading(true);
    try {
      const response = await assignUserRoleService(token, selectedUser, selectedRole, []);
      if (response.data.code === 200) {
        await GetuserPermission(selectedUser);
        showSuccess(response.data.msg || "Role assigned successfully");
        setShowRoleDialog(false);
        setSelectedRole("");
        setUserRoles((prev) => [...prev, selectedRole]);
        
      } else {
        showError(response.data?.msg || "Failed to assign role");
      }
    } catch (error) {
      showError(error.msg || "Failed to assign role");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignRole = () => {
    if (!selectedUser) {
      showError("Please select a user first");
      return;
    }
    setShowRoleDialog(true);
  };

  const removeRoleFromUser = async (username, roleToRemove) => {
    setLoadingStates((prev) => ({ ...prev, removeRole: roleToRemove }));
    try {
      const response = await removeRoleFromUserService(token, username, roleToRemove, []);
      if (response.status === 200) {
        showSuccess("Role removed successfully");
        await GetuserPermission(username);
      } else {
        showError(response.data?.msg || "Failed to remove role");
      }
    } catch (error) {
      showError(error.msg || "Failed to remove role");
    } finally {
      setLoadingStates((prev) => ({ ...prev, removeRole: null }));
    }
  };
  const renderComponentsPanel = () => {
    if (!selectedCategory) {
      const allComponents = flattenAllComponents();
      return allComponents.map((component, idx) => (
        <div
          key={idx}
          className="flex items-center gap-5 hover:bg-gray-50 p-2 transition-colors duration-150 border-b last:border-none"
        >
          <input
            type="checkbox"
            id={`component-${idx}`}
            checked={components.includes(component)}
            onChange={() => handleComponentChange(component)}
            className="rounded border-gray-300 text-[#1a365d] focus:ring-[#1a365d]/100 mt-1"
            disabled={!role}
          />
          <label htmlFor={`component-${idx}`} className="select-none mt-1">
            {component}
          </label>
        </div>
      ));
    }
    if (
      typeof componentCategories[selectedCategory] === "object" &&
      !Array.isArray(componentCategories[selectedCategory])
    ) {
      if (!selectedSubCategory) {
        return (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(componentCategories[selectedCategory]).map(
              (subcat) => (
                <button
                  key={subcat}
                  onClick={() => handleSubCategorySelect(subcat)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    selectedSubCategory === subcat
                      ? "bg-[#1a365d]/80 text-[#f5f5f5]"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {subcat}
                </button>
              )
            )}
          </div>
        );
      }
      const subComponents =
        componentCategories[selectedCategory][selectedSubCategory] || [];
      return subComponents.length > 0 ? (
        subComponents.map((component, idx) => (
          <div
            key={idx}
            className="flex items-center gap-5 hover:bg-gray-50 p-2 transition-colors duration-150 border-b last:border-none"
          >
            <input
              type="checkbox"
              id={`component-${selectedSubCategory}-${idx}`}
              checked={components.includes(component)}
              onChange={() => handleComponentChange(component)}
              className="rounded border-gray-300 text-[#1a365d] focus:ring-[#1a365d]/100 mt-1"
              disabled={!role}
            />
            <label
              htmlFor={`component-${selectedSubCategory}-${idx}`}
              className="select-none mt-1"
            >
              {component}
            </label>
          </div>
        ))
      ) : (
        <div className="text-gray-500 p-2">
          No components for this subcategory.
        </div>
      );
    }
    if (Array.isArray(componentCategories[selectedCategory])) {
      return componentCategories[selectedCategory].map((component, idx) => (
        <div
          key={idx}
          className="flex items-center gap-5 hover:bg-gray-50 p-2 transition-colors duration-150 border-b last:border-none"
        >
          <input
            type="checkbox"
            id={`component-${selectedCategory}-${idx}`}
            checked={components.includes(component)}
            onChange={() => handleComponentChange(component)}
            className="rounded border-gray-300 text-[#1a365d] focus:ring-[#1a365d]/100 mt-1"
            disabled={!role}
          />
          <label
            htmlFor={`component-${selectedCategory}-${idx}`}
            className="select-none mt-1"
          >
            {component}
          </label>
        </div>
      ));
    }
    return null;
  };

  return (
    <div className="w-[98%] h-[90vh]  min-h-[75vh] mt-4 m-auto p-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
      <div className="bg-white flex-1 p-4  overflow-y-auto rounded-md custom-scrollbar">
        <div className="flex justify-between items-center mb-6 w-full ">
          <div className="relative border-b mb-6 w-full">
            <div className="flex gap-6">
              <button
                className={`pb-3 px-6 font-semibold text-sm relative transition-all duration-300 ${
                  activeTab === "roles"
                    ? "text-[#1a365d] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-[#1a365d] after:rounded after:transition-transform after:duration-500"
                    : "text-gray-600 hover:text-[#1a365d]"
                }`}
                onClick={() => setActiveTab("roles")}
              >
                Role Management
              </button>
              <button
                className={`pb-3 px-6 font-semibold text-sm relative transition-all duration-300 ${
                  activeTab === "users"
                    ? "text-[#1a365d] after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-1 after:bg-[#1a365d] after:rounded after:transition-transform after:duration-500"
                    : "text-gray-600 hover:text-[#1a365d]"
                }`}
                onClick={() => setActiveTab("users")}
              >
                User Roles
              </button>
            </div>
          </div>
        </div>
        {activeTab === "roles" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 w-3/4">
              <input
                type="text"
                placeholder="Enter role..."
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-[#1a365d]/100 focus:border-[#1a365d]/100 outline-none transition-all duration-200"
                disabled={loadingStates.addRole}
              />
              <button
                onClick={handleAddRole}
                disabled={loadingStates.addRole}
                className="px-4 py-2 bg-[#1a365d]/80 hover:bg-[#1a365d] text-[#f5f5f5] hover:text-white rounded-md transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingStates.addRole ? (
                  <span className="flex items-center gap-2">
                    <CircularProgress size={16} color="inherit" />
                    Creating...
                  </span>
                ) : (
                  "Create Role"
                )}
              </button>
            </div>
            <div className="flex ">
              <div className="flex flex-col gap-4 flex-1">
                <div className="overflow-hidden border rounded-md p-4 shadow-inner bg-white w-4/6">
                  <div className="mb-2">
                    <label className="block font-medium text-gray-700">
                      Roles
                    </label>
                    <div className="line mt-1"></div>
                  </div>
                  <div className="h-[48vh] overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                      <RolesSkeleton />
                    ) : (
                      fetchroles.map((roleItem, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 transition-colors duration-150 border-b last:border-none"
                        >
                          <div key={index} className="flex items-center gap-4">
                            <input
                              type="radio"
                              id={`role-${index}`}
                              name="roleSelection"
                              onChange={() => handleRoleSelect(roleItem)}
                              checked={role === roleItem}
                              className="text-[#1a365d] focus:ring-[#1a365d]/100"
                            />
                            <label
                              htmlFor={`role-${index}`}
                              className="cursor-pointer"
                            >
                              {roleItem}
                            </label>
                          </div>

                          <button
                            onClick={() => handleDelete(roleItem)}
                            disabled={loadingStates.deleteRole === roleItem}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loadingStates.deleteRole === roleItem ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <i className="fa-solid fa-trash"></i>
                            )}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="border rounded-md p-4 space-y-2 shadow-inner bg-white w-5/6">
                  <div className="mb-2">
                    <label className="block font-medium text-gray-700">
                      Components
                    </label>
                    <div className="line mt-1"></div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.keys(componentCategories).map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategorySelect(category)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          selectedCategory === category
                            ? "bg-[#1a365d]/80 text-[#f5f5f5]"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  <div className="h-[44vh] overflow-y-auto custom-scrollbar border-b last:border-none">
                    {isComponentsLoading ? (
                      <ComponentsSkeleton />
                    ) : (
                      renderComponentsPanel()
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className=" flex justify-between">
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => {
                    setRole("");
                    setComponents([]);
                    setSelectedCategory(null);
                    setSelectedSubCategory(null);
                  }}
                  className="text-[#f5f5f5] bg-[#1a365d]/80 hover:bg-[#1a365d] hover:text-white px-2 py-2 rounded"
                >
                  Clear Selection
                </button>
              </div>
              <div className="flex justify-between mt-4 mr-[7rem]">
                <button
                  onClick={handleSubmit}
                  disabled={loadingStates.submit || !role}
                  className="w-full px-6 py-2 bg-[#1a365d]/80 hover:bg-[#1a365d] text-[#f5f5f5] hover:text-white rounded-md transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingStates.submit ? (
                    <span className="flex items-center justify-center gap-2">
                      <CircularProgress size={16} color="inherit" />
                      Saving...
                    </span>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === "users" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="text-left">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full p-2 pr-10 mb-4 border rounded-md focus:ring-2 focus:ring-[#1a365d]/100 focus:border-[#1a365d]/100 outline-none transition-all duration-200"
                />
                <div className="absolute right-3 top-1/3 -translate-y-1/2 text-gray-400 text-xl">
                  <Search size={18} />
                </div>
              </div>
              <div className="h-[60vh] overflow-y-auto border rounded-md shadow-inner bg-white custom-scrollbar">
                {isLoading ? (
                  <UsersSkeleton />
                ) : (
                  filteredUsers.map((user, index) => (
                    <div
                      key={index}
                      className={`p-3 cursor-pointer border-b-2 border-gray-200 transition-all duration-150
                        hover:bg-[#1a365db3] hover:text-[#f5f5f5] hover:border-b-0 hover:border-l-4 hover:border-[#1a365d]
                        ${
                          selectedUser === user
                            ? "bg-[#1a365dcc] text-[#f5f5f5]"
                            : "bg-white text-[#00000099]"
                        }
                      `}
                      onClick={() => handleUserClick(user)}
                    >
                      {user}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <div className="mb-4">
                <div className="flex justify-end h-10">
                  {selectedUser ? (
                    <button
                      onClick={handleAssignRole}
                      disabled={loadingStates.assignRole}
                      className="px-4 py-2 bg-[#1a365d]/80 hover:bg-[#1a365d] text-[#f5f5f5] hover:text-white rounded-md transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingStates.assignRole ? (
                        <span className="flex items-center gap-2">
                          <CircularProgress size={16} color="inherit" />
                          Assigning...
                        </span>
                      ) : (
                        "Assign Role"
                      )}
                    </button>
                  ) : (
                    <span className="px-4 py-2  rounded-md text-center w-full h-full flex items-center justify-center"></span>
                  )}
                </div>
              </div>
              <div className="h-[60vh] overflow-y-auto border rounded-md shadow-inner bg-white p-4 custom-scrollbar">
                {selectedUser ? (
                  <>
                    {userRolesLoading ? (
                      <UserRolesSkeleton />
                    ) : userRoles.length > 0 ? (
                      userRoles.map((userRole, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 rounded-md flex justify-between items-center mb-2"
                        >
                          <li className="text-gray-500">{userRole}</li>
                          <button
                            onClick={() =>
                              removeRoleFromUser(selectedUser, userRole)
                            }
                            disabled={loadingStates.removeRole === userRole}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loadingStates.removeRole === userRole ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <i className="fa-solid fa-trash"></i>
                            )}
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center mt-4">
                        No roles found
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-center mt-4">
                    Select a user to view and manage roles
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        <Dialog
          open={showRoleDialog}
          onClose={() => setShowRoleDialog(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle sx={{ color: "#1a365d]", fontSize: "18px" }}>
            Add Role for {selectedUser}
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel htmlFor="role-select" sx={{ color: "#1a365d" }}>
                Select Role
              </InputLabel>
              <Select
                id="role-select"
                value={selectedRole}
                label="Select Role"
                onChange={(e) => setSelectedRole(e.target.value)}
                disabled={isLoading}
                sx={{
                  backgroundColor: "#f5f5f5",
                  color: "#1a365d",
                  borderRadius: "0.375rem",

                  "& .MuiSelect-icon": { color: "#f5f5f5" },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: "#f5f5f5",
                      color: "#1a365d",
                    },
                  },
                }}
              >
                <MenuItem value="selectrole"></MenuItem>
                {fetchroles.map((role, index) => (
                  <MenuItem
                    key={index}
                    value={role}
                    sx={{
                      backgroundColor: "#f5f5f5",
                      color: "#1a365d",
                      "&.Mui-selected": {
                        backgroundColor: "#f5f5f5",
                        color: "#1a365dcc",
                      },
                      "&:hover": {
                        backgroundColor: "#1a365dcc",
                        color: "#f5f5f5",
                      },
                    }}
                  >
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setShowRoleDialog(false);
                setSelectedRole("");
              }}
              disabled={isLoading}
              sx={{
                backgroundColor: "#1a365dcc",
                color: "#f5f5f5",
                "&:hover": { backgroundColor: "#1a365d", color: "#fff" },
                borderRadius: "0.375rem",
                p: 1,
                boxShadow: 1,
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleRoleAssignment}
              disabled={isLoading}
              startIcon={
                isLoading && (
                  <CircularProgress sx={{ color: "#f5f5f5" }} size={20} />
                )
              }
              sx={{
                backgroundColor: "#1a365dcc",
                color: isLoading ? "#fff" : "#f5f5f5",
                "&:hover": { backgroundColor: "#1a365d", color: "#fff" },
                borderRadius: "0.375rem",
                p: 1,
                boxShadow: 1,
                opacity: isLoading ? 0.5 : 1,
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "Adding..." : "Add Role"}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default UserManagement;

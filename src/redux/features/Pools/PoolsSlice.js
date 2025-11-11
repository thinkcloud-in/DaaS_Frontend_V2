import { createSlice } from "@reduxjs/toolkit";
import {
  fetchPools,
  createPool,
  updatePool,
  deletePool,
  createMachine,
  fetchPoolMachines,
  fetchAssignedUsers,
  fetchMachineDetails,
  listGuacamoleUsers,
  addUserToMachine,
  deleteAssignedUser,
  deleteVM,
  rebootVM,
  shutdownVM,
  startVM,
  stopVM,
  rebuildVM,
  fetchIpPoolNames,
  fetchClusterNodes,
  fetchTemplates,
  fetchVmwareDCs,
  fetchVmwareFolders,
  fetchPoolById,
  updateMachine,
  fetchSwitches,
} from "./PoolsThunks";
import { initialPoolDetails } from "./poolDefaults";

const initialState = {
  availablePools: [],
  isPoolAvailable: false,
  poolsLoading: false,
  poolSaveLoading: false,
  poolDeleteLoading: false,
  error: null,
  // ManagePool related state
  vmAvailable: [],
  machinesLoading: false,
  users: [],
  assignedUsers: [],
  usersLoading: false,
  selectedVm: null,
  selectedVmDetails: null,
  vmDetailsMap: {},
  deletingMachine: null,
  deletingUser: null,
  powerActionLoading: null,
  lastPowerActionResult: null,
  // Pool creation form state
  poolCreationDetails: initialPoolDetails,
  creationNodes: [],
  creationTemplates: [],
  creationIpPoolNames: [],
  creationVmwareDCs: [],
  creationVmwareFolders: [],
  poolCreationError: null,
  currentPoolDetails: {},
  creationSwitches: [],
};

const poolsSlice = createSlice({
  name: "pools",
  initialState,
  reducers: {
    // lightweight local actions if needed
    setAvailablePools(state, action) {
      state.availablePools = action.payload;
      state.isPoolAvailable = Array.isArray(action.payload) && action.payload.length > 0;
    },
    setPoolCreationDetails(state, action) {
      // merge partial updates
      state.poolCreationDetails = { ...(state.poolCreationDetails || {}), ...(action.payload || {}) };
    },
    resetPoolCreation(state) {
      state.poolCreationDetails = initialPoolDetails;
      state.creationNodes = [];
      state.creationTemplates = [];
      state.creationIpPoolNames = [];
      state.creationVmwareDCs = [];
      state.creationVmwareFolders = [];
      state.poolCreationError = null;
    },
    setVmAvailable(state, action) {
      state.vmAvailable = action.payload || [];
    },
    setAssignedUsers(state, action) {
      state.assignedUsers = action.payload || [];
    },
    setUsers(state, action) {
      state.users = action.payload || [];
      state.assignedUsers = state.assignedUsers || [];
    },
    setSelectedVm(state, action) {
      state.selectedVm = action.payload || null;
    },
    setSelectedVmDetails(state, action) {
      state.selectedVmDetails = action.payload || null;
    },
    setVmDetailsMap(state, action) {
      state.vmDetailsMap = action.payload || {};
    },
    setMachinesLoading(state, action) {
      state.machinesLoading = !!action.payload;
    },
    setUsersLoading(state, action) {
      state.usersLoading = !!action.payload;
    },
    setDeletingMachine(state, action) {
      state.deletingMachine = action.payload || null;
    },
    setDeletingUser(state, action) {
      state.deletingUser = action.payload || null;
    },
    setPowerActionLoading(state, action) {
      state.powerActionLoading = action.payload || null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPools
      .addCase(fetchPools.pending, (state) => {
        state.poolsLoading = true;
        state.error = null;
      })
      .addCase(fetchPools.fulfilled, (state, action) => {
        state.poolsLoading = false;
        state.availablePools = action.payload || [];
        state.isPoolAvailable = Array.isArray(action.payload) && action.payload.length > 0;
      })
      .addCase(fetchPools.rejected, (state, action) => {
        state.poolsLoading = false;
        state.error = action.payload || action.error?.message;
        state.availablePools = [];
        state.isPoolAvailable = false;
      })
    // fetchPoolById
    builder
      .addCase(fetchPoolById.pending, (state) => {
        // nothing
      })
      .addCase(fetchPoolById.fulfilled, (state, action) => {
        state.currentPoolDetails = action.payload || {};
      })
      .addCase(fetchPoolById.rejected, (state) => {
        state.currentPoolDetails = {};
      });

    // updateMachine
    builder
      .addCase(updateMachine.pending, (state) => {
        state.poolSaveLoading = true;
        state.error = null;
      })
      .addCase(updateMachine.fulfilled, (state, action) => {
        state.poolSaveLoading = false;
        const payload = action.payload || {};
        if (payload.machines) state.vmAvailable = payload.machines;
        if (payload.pools) {
          state.availablePools = payload.pools;
          state.isPoolAvailable = Array.isArray(payload.pools) && payload.pools.length > 0;
        }
      })
      .addCase(updateMachine.rejected, (state, action) => {
        state.poolSaveLoading = false;
        state.error = action.payload || action.error?.message;
      })

      // createPool
      .addCase(createPool.pending, (state) => {
        state.poolSaveLoading = true;
        state.error = null;
      })
      .addCase(createPool.fulfilled, (state, action) => {
        state.poolSaveLoading = false;
        const payload = action.payload || {};
        // backend may return pools list
        if (payload.pools) {
          state.availablePools = payload.pools;
          state.isPoolAvailable = Array.isArray(payload.pools) && payload.pools.length > 0;
        } else if (payload.pool) {
          state.availablePools = [...state.availablePools, payload.pool];
          state.isPoolAvailable = state.availablePools.length > 0;
        }
      })
      .addCase(createPool.rejected, (state, action) => {
        state.poolSaveLoading = false;
        state.error = action.payload || action.error?.message;
      })

      // updatePool
      .addCase(updatePool.pending, (state) => {
        state.poolSaveLoading = true;
        state.error = null;
      })
      .addCase(updatePool.fulfilled, (state, action) => {
        state.poolSaveLoading = false;
        const payload = action.payload || {};
        if (payload.pool && payload.pool.id) {
          state.availablePools = state.availablePools.map((p) =>
            p.id === payload.pool.id ? payload.pool : p
          );
        }
        if (payload.pools) {
          state.availablePools = payload.pools;
          state.isPoolAvailable = Array.isArray(payload.pools) && payload.pools.length > 0;
        }
      })
      .addCase(updatePool.rejected, (state, action) => {
        state.poolSaveLoading = false;
        state.error = action.payload || action.error?.message;
      })

      // deletePool
      .addCase(deletePool.pending, (state) => {
        state.poolDeleteLoading = true;
        state.error = null;
      })
      .addCase(deletePool.fulfilled, (state, action) => {
        state.poolDeleteLoading = false;
        const payload = action.payload || {};
        if (payload.pools) {
          state.availablePools = payload.pools;
          state.isPoolAvailable = Array.isArray(payload.pools) && payload.pools.length > 0;
        }
      })
      .addCase(deletePool.rejected, (state, action) => {
        state.poolDeleteLoading = false;
        state.error = action.payload || action.error?.message;
      });
      // createMachine (add machine to pool and possibly update pools list)
      builder
        .addCase(createMachine.pending, (state) => {
          state.poolSaveLoading = true;
          state.error = null;
        })
        .addCase(createMachine.fulfilled, (state, action) => {
          state.poolSaveLoading = false;
          const payload = action.payload || {};
          if (payload.pools) {
            state.availablePools = payload.pools;
            state.isPoolAvailable = Array.isArray(payload.pools) && payload.pools.length > 0;
          }
        })
        .addCase(createMachine.rejected, (state, action) => {
          state.poolSaveLoading = false;
          state.error = action.payload || action.error?.message;
        });
    // fetchPoolMachines
    builder
      .addCase(fetchPoolMachines.pending, (state) => {
        state.machinesLoading = true;
      })
      .addCase(fetchPoolMachines.fulfilled, (state, action) => {
        state.machinesLoading = false;
        const payload = action.payload || {};
        state.vmAvailable = payload.machines || [];
      })
      .addCase(fetchPoolMachines.rejected, (state) => {
        state.machinesLoading = false;
        state.vmAvailable = [];
      })

      // fetchAssignedUsers
      .addCase(fetchAssignedUsers.pending, (state) => {
        state.usersLoading = true;
      })
      .addCase(fetchAssignedUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.assignedUsers = action.payload?.assignedUsers || [];
      })
      .addCase(fetchAssignedUsers.rejected, (state) => {
        state.usersLoading = false;
        state.assignedUsers = [];
      })

      // fetchMachineDetails
      .addCase(fetchMachineDetails.pending, (state) => {
        state.poolSaveLoading = false;
      })
      .addCase(fetchMachineDetails.fulfilled, (state, action) => {
        const { vm_id, details } = action.payload || {};
        if (vm_id) state.vmDetailsMap[vm_id] = details;
        state.selectedVmDetails = details || null;
      })
      .addCase(fetchMachineDetails.rejected, (state) => {
        state.selectedVmDetails = null;
      })

      // listGuacamoleUsers
      .addCase(listGuacamoleUsers.fulfilled, (state, action) => {
        state.users = action.payload || [];
        state.assignedUsers = state.assignedUsers || [];
        state.usersLoading = false;
      })
      .addCase(listGuacamoleUsers.rejected, (state) => {
        state.users = [];
        state.usersLoading = false;
      })

      // addUserToMachine
      .addCase(addUserToMachine.pending, (state) => {
        state.usersLoading = true;
      })
      .addCase(addUserToMachine.fulfilled, (state, action) => {
        state.usersLoading = false;
        const payload = action.payload || {};
        if (payload.users_assigned) state.assignedUsers = payload.users_assigned;
        if (payload.pools) {
          state.availablePools = payload.pools;
          state.isPoolAvailable = Array.isArray(payload.pools) && payload.pools.length > 0;
        }
      })
      .addCase(addUserToMachine.rejected, (state) => {
        state.usersLoading = false;
      })

      // deleteAssignedUser
      .addCase(deleteAssignedUser.pending, (state) => {
        state.usersLoading = true;
      })
      .addCase(deleteAssignedUser.fulfilled, (state, action) => {
        state.usersLoading = false;
        const payload = action.payload || {};
        if (payload.users_assigned) state.assignedUsers = payload.users_assigned;
        if (payload.pools) {
          state.availablePools = payload.pools;
          state.isPoolAvailable = Array.isArray(payload.pools) && payload.pools.length > 0;
        }
      })
      .addCase(deleteAssignedUser.rejected, (state) => {
        state.usersLoading = false;
      })

      // deleteVM
      .addCase(deleteVM.pending, (state) => {
        // handled by deletingMachine action when invoked
      })
      .addCase(deleteVM.fulfilled, (state, action) => {
        const payload = action.payload || {};
        if (payload.machines) state.vmAvailable = payload.machines;
        if (payload.pools) {
          state.availablePools = payload.pools;
          state.isPoolAvailable = Array.isArray(payload.pools) && payload.pools.length > 0;
        }
        state.deletingMachine = null;
      })
      .addCase(deleteVM.rejected, (state) => {
        state.deletingMachine = null;
      });
      // power actions: reboot/start/stop/shutdown/rebuild
    builder
      .addCase(rebootVM.pending, (state) => {
        state.powerActionLoading = "reboot";
        state.lastPowerActionResult = null;
      })
      .addCase(rebootVM.fulfilled, (state, action) => {
        state.powerActionLoading = null;
        state.lastPowerActionResult = action.payload || {};
        const payload = action.payload || {};
        if (payload.machines) state.vmAvailable = payload.machines;
        if (payload.pools) {
          state.availablePools = payload.pools;
          state.isPoolAvailable = Array.isArray(payload.pools) && payload.pools.length > 0;
        }
      })
      .addCase(rebootVM.rejected, (state, action) => {
        state.powerActionLoading = null;
        state.lastPowerActionResult = action.payload || action.error?.message;
      })

      .addCase(shutdownVM.pending, (state) => {
        state.powerActionLoading = "shutdown";
        state.lastPowerActionResult = null;
      })
      .addCase(shutdownVM.fulfilled, (state, action) => {
        state.powerActionLoading = null;
        state.lastPowerActionResult = action.payload || {};
        const payload = action.payload || {};
        if (payload.machines) state.vmAvailable = payload.machines;
        if (payload.pools) {
          state.availablePools = payload.pools;
          state.isPoolAvailable = Array.isArray(payload.pools) && payload.pools.length > 0;
        }
      })
      .addCase(shutdownVM.rejected, (state, action) => {
        state.powerActionLoading = null;
        state.lastPowerActionResult = action.payload || action.error?.message;
      })

      .addCase(startVM.pending, (state) => {
        state.powerActionLoading = "start";
        state.lastPowerActionResult = null;
      })
      .addCase(startVM.fulfilled, (state, action) => {
        state.powerActionLoading = null;
        state.lastPowerActionResult = action.payload || {};
        const payload = action.payload || {};
        if (payload.machines) state.vmAvailable = payload.machines;
        if (payload.pools) {
          state.availablePools = payload.pools;
          state.isPoolAvailable = Array.isArray(payload.pools) && payload.pools.length > 0;
        }
      })
      .addCase(startVM.rejected, (state, action) => {
        state.powerActionLoading = null;
        state.lastPowerActionResult = action.payload || action.error?.message;
      })

      .addCase(stopVM.pending, (state) => {
        state.powerActionLoading = "stop";
        state.lastPowerActionResult = null;
      })
      .addCase(stopVM.fulfilled, (state, action) => {
        state.powerActionLoading = null;
        state.lastPowerActionResult = action.payload || {};
        const payload = action.payload || {};
        if (payload.machines) state.vmAvailable = payload.machines;
        if (payload.pools) {
          state.availablePools = payload.pools;
          state.isPoolAvailable = Array.isArray(payload.pools) && payload.pools.length > 0;
        }
      })
      .addCase(stopVM.rejected, (state, action) => {
        state.powerActionLoading = null;
        state.lastPowerActionResult = action.payload || action.error?.message;
      })

      .addCase(rebuildVM.pending, (state) => {
        // keep key specific string set by callers if needed; set generic
        state.powerActionLoading = state.powerActionLoading || "rebuild";
        state.lastPowerActionResult = null;
      })
      .addCase(rebuildVM.fulfilled, (state, action) => {
        state.powerActionLoading = null;
        state.lastPowerActionResult = action.payload || {};
        const payload = action.payload || {};
        if (payload.machines) state.vmAvailable = payload.machines;
        if (payload.pools) {
          state.availablePools = payload.pools;
          state.isPoolAvailable = Array.isArray(payload.pools) && payload.pools.length > 0;
        }
      })
      .addCase(rebuildVM.rejected, (state, action) => {
        state.powerActionLoading = null;
        state.lastPowerActionResult = action.payload || action.error?.message;
      });
    // ip pool names
    builder
      .addCase(fetchIpPoolNames.pending, (state) => {
        // nothing
      })
      .addCase(fetchIpPoolNames.fulfilled, (state, action) => {
        state.creationIpPoolNames = action.payload || [];
      })
      .addCase(fetchIpPoolNames.rejected, (state) => {
        state.creationIpPoolNames = [];
      })

      // cluster nodes
      .addCase(fetchClusterNodes.pending, (state) => {
        // nothing
      })
      .addCase(fetchClusterNodes.fulfilled, (state, action) => {
        state.creationNodes = action.payload || [];
      })
      .addCase(fetchClusterNodes.rejected, (state) => {
        state.creationNodes = [];
      })

      // templates
      .addCase(fetchTemplates.pending, (state) => {
        // nothing
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.creationTemplates = action.payload || [];
      })
      .addCase(fetchTemplates.rejected, (state) => {
        state.creationTemplates = [];
      })

      // vmware dcs
      .addCase(fetchVmwareDCs.fulfilled, (state, action) => {
        state.creationVmwareDCs = action.payload || [];
      })
      .addCase(fetchVmwareDCs.rejected, (state) => {
        state.creationVmwareDCs = [];
      })

      // vmware folders
      .addCase(fetchVmwareFolders.fulfilled, (state, action) => {
        state.creationVmwareFolders = action.payload || [];
      })
      .addCase(fetchVmwareFolders.rejected, (state) => {
        state.creationVmwareFolders = [];
      })
  
      .addCase(fetchSwitches.pending, (state) => {
        state.poolsLoading = true;
      })
      .addCase(fetchSwitches.fulfilled, (state, action) => {
        state.poolsLoading = false;
        state.creationSwitches = action.payload || [];
      })
      .addCase(fetchSwitches.rejected, (state) => {
        state.poolsLoading = false;
        state.creationSwitches = [];
      });
  },
});

export const {
  setAvailablePools,
  setPoolCreationDetails,
  resetPoolCreation,
  setVmAvailable,
  setAssignedUsers,
  setUsers,
  setSelectedVm,
  setSelectedVmDetails,
  setVmDetailsMap,
  setMachinesLoading,
  setUsersLoading,
  setDeletingMachine,
  setDeletingUser,
  setPowerActionLoading,
} = poolsSlice.actions;
export default poolsSlice.reducer;


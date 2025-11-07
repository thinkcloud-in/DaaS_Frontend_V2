import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchPools as fetchPoolsService } from "Services/ContextService";
import {
  createPool as createPoolService,
  updatePoolService,
  deletePoolService,
} from "Services/PoolService";
import { createMachineService } from "Services/PoolService";
import {
  fetchPoolMachinesService,
  fetchAssignedUsersService,
  fetchMachineDetailsService,
  addUserToMachineService,
  deleteAssignedUserService,
  deleteVMService,
  listGuacamoleUsersService,
} from "Services/PoolService";
import { rebootVMService, shutdownVMService, startVMService, stopVMService, rebuildVMService } from "Services/PoolService";
import { getIpPoolNames, getClusterNodes, getTemplates, getVmwareDCs, getVmwareFolders } from "Services/PoolService";
import { getPoolByIdService, updateMachineService } from "Services/PoolService";

export const fetchPoolById = createAsyncThunk(
  "pools/fetchPoolById",
  async ({ token, poolId }, { rejectWithValue }) => {
    try {
      const res = await getPoolByIdService(token, poolId);
      const payload = res.data?.data?.pool || res.data?.data || res.data || {};
      return payload;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to fetch pool by id");
    }
  }
);

export const updateMachine = createAsyncThunk(
  "pools/updateMachine",
  async ({ token, machineIdentifier, requestData }, { rejectWithValue }) => {
    try {
      const res = await updateMachineService(token, machineIdentifier, requestData);
      const payload = res.data?.data || res.data || {};
      return payload;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to update machine");
    }
  }
);

export const fetchPools = createAsyncThunk(
  "pools/fetchPools",
  async (token, { rejectWithValue }) => {
    try {
      const data = await fetchPoolsService(token);
      // fetchPoolsService returns an array (or [])
      return data;
    } catch (err) {
      return rejectWithValue(err?.message || "Failed to fetch pools");
    }
  }
);

export const createPool = createAsyncThunk(
  "pools/createPool",
  async ({ token, requestData }, { rejectWithValue }) => {
    try {
      const res = await createPoolService(token, requestData);
      // backend returns data with pool and pools
      const payload = res.data?.data || res.data;
      return payload;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to create pool");
    }
  }
);

export const updatePool = createAsyncThunk(
  "pools/updatePool",
  async ({ token, poolId, requestData }, { rejectWithValue }) => {
    try {
      const res = await updatePoolService(token, poolId, requestData);
      const payload = res.data?.data || res.data;
      return payload;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to update pool");
    }
  }
);

export const deletePool = createAsyncThunk(
  "pools/deletePool",
  async ({ token, poolId, userEmail }, { rejectWithValue }) => {
    try {
      const res = await deletePoolService(token, poolId, userEmail);
      const payload = res.data?.data || res.data;
      return payload;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to delete pool");
    }
  }
);

export const createMachine = createAsyncThunk(
  "pools/createMachine",
  async ({ token, requestData }, { rejectWithValue }) => {
    try {
      const res = await createMachineService(token, requestData);
      const payload = res.data?.data || res.data;
      // payload expected to include { machine, pools }
      return payload;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to create machine");
    }
  }
);

export const fetchPoolMachines = createAsyncThunk(
  "pools/fetchPoolMachines",
  async ({ token, poolId }, { rejectWithValue }) => {
    try {
      const data = await fetchPoolMachinesService(token, poolId);
      // return machines array
      return { poolId, machines: Array.isArray(data) ? data : [] };
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to fetch pool machines");
    }
  }
);

export const fetchAssignedUsers = createAsyncThunk(
  "pools/fetchAssignedUsers",
  async ({ token, machineId }, { rejectWithValue }) => {
    try {
      const data = await fetchAssignedUsersService(token, machineId);
      return { machineId, assignedUsers: Array.isArray(data) ? data : [] };
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to fetch assigned users");
    }
  }
);

export const fetchMachineDetails = createAsyncThunk(
  "pools/fetchMachineDetails",
  async ({ token, vm_id }, { rejectWithValue }) => {
    try {
      const data = await fetchMachineDetailsService(token, vm_id);
      return { vm_id, details: data || null };
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to fetch machine details");
    }
  }
);

export const listGuacamoleUsers = createAsyncThunk(
  "pools/listGuacamoleUsers",
  async (token, { rejectWithValue }) => {
    try {
      const res = await listGuacamoleUsersService(token);
      const data = res.data?.data || [];
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to list users");
    }
  }
);

export const addUserToMachine = createAsyncThunk(
  "pools/addUserToMachine",
  async ({ token, machineIdentifier, user }, { rejectWithValue }) => {
    try {
      const res = await addUserToMachineService(token, machineIdentifier, user);
      const payload = res.data?.data || res.data;
      return payload;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to add user to machine");
    }
  }
);

export const deleteAssignedUser = createAsyncThunk(
  "pools/deleteAssignedUser",
  async ({ token, machineIdentifier, user }, { rejectWithValue }) => {
    try {
      const res = await deleteAssignedUserService(token, machineIdentifier, user);
      const payload = res.data?.data || res.data;
      return payload;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to delete assigned user");
    }
  }
);

export const deleteVM = createAsyncThunk(
  "pools/deleteVM",
  async ({ token, machineIdentifier, userEmail }, { rejectWithValue }) => {
    try {
      const res = await deleteVMService(token, machineIdentifier, userEmail);
      const payload = res.data?.data || res.data;
      return payload;
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to delete VM");
    }
  }
);

export const rebootVM = createAsyncThunk(
  "pools/rebootVM",
  async ({ token, userEmail, vm_id, poolId }, { rejectWithValue }) => {
    try {
      const res = await rebootVMService(token, userEmail, vm_id, poolId);
      // service may return data directly
      return res?.data || res || {};
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to reboot VM");
    }
  }
);

export const shutdownVM = createAsyncThunk(
  "pools/shutdownVM",
  async ({ token, userEmail, vm_id, poolId }, { rejectWithValue }) => {
    try {
      const res = await shutdownVMService(token, userEmail, vm_id, poolId);
      return res?.data || res || {};
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to shutdown VM");
    }
  }
);

export const startVM = createAsyncThunk(
  "pools/startVM",
  async ({ token, userEmail, vm_id, poolId }, { rejectWithValue }) => {
    try {
      const res = await startVMService(token, userEmail, vm_id, poolId);
      return res?.data || res || {};
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to start VM");
    }
  }
);

export const stopVM = createAsyncThunk(
  "pools/stopVM",
  async ({ token, userEmail, vm_id, poolId }, { rejectWithValue }) => {
    try {
      const res = await stopVMService(token, userEmail, vm_id, poolId);
      return res?.data || res || {};
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to stop VM");
    }
  }
);

export const rebuildVM = createAsyncThunk(
  "pools/rebuildVM",
  async ({ token, userEmail, vm_id, poolId }, { rejectWithValue }) => {
    try {
      const res = await rebuildVMService(token, userEmail, vm_id, poolId);
      return res?.data || res || {};
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to rebuild VM");
    }
  }
);

export const fetchIpPoolNames = createAsyncThunk(
  "pools/fetchIpPoolNames",
  async (token, { rejectWithValue }) => {
    try {
      const data = await getIpPoolNames(token);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to fetch ip pools");
    }
  }
);

export const fetchClusterNodes = createAsyncThunk(
  "pools/fetchClusterNodes",
  async ({ token, clusterId }, { rejectWithValue }) => {
    try {
      const data = await getClusterNodes(token, clusterId);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to fetch cluster nodes");
    }
  }
);

export const fetchTemplates = createAsyncThunk(
  "pools/fetchTemplates",
  async ({ token, clusterId }, { rejectWithValue }) => {
    try {
      const data = await getTemplates(token, clusterId);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to fetch templates");
    }
  }
);

export const fetchVmwareDCs = createAsyncThunk(
  "pools/fetchVmwareDCs",
  async ({ token, clusterId }, { rejectWithValue }) => {
    try {
      const data = await getVmwareDCs(token, clusterId);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to fetch vmware dcs");
    }
  }
);

export const fetchVmwareFolders = createAsyncThunk(
  "pools/fetchVmwareFolders",
  async ({ token, clusterId }, { rejectWithValue }) => {
    try {
      const data = await getVmwareFolders(token, clusterId);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return rejectWithValue(err?.response?.data || err?.message || "Failed to fetch vmware folders");
    }
  }
);

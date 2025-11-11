import axiosInstance from "./AxiosInstance";
import { getEnv } from "utils/getEnv";
const backendUrl = getEnv('BACKEND_URL');
export const createMachineService = async (token, requestData) => {
	return axiosInstance.post(`${backendUrl}/v1/create_machine`, requestData, {
		headers: { Authorization: `Bearer ${token}` },
	});
};

export const updateMachineService = async (token, machineIdentifier, requestData) => {
	return axiosInstance.put(`${backendUrl}/v1/update_machine/${machineIdentifier}`, requestData, {
		headers: { Authorization: `Bearer ${token}` },
	});
};

export const getPoolByIdService = async (token, poolId) => {
	return axiosInstance.get(`${backendUrl}/v1/pool/${poolId}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
};

export const updatePoolService = async (token, poolId, requestData) => {
	return axiosInstance.put(`${backendUrl}/v1/update_pool/${poolId}`, requestData, {
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});
};

export const fetchAssignedUsersService = async (token, machineId) => {
	const response = await axiosInstance.get(`${backendUrl}/v1/machine/users/${machineId}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return response.data?.data || [];
};

export const fetchMachineDetailsService = async (token, vm_id) => {
	const response = await axiosInstance.get(`${backendUrl}/v1/proxmox/proxmox_vm_info/${vm_id}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return response.data?.data;
};
export const deleteAssignedUserService = async (token, machineIdentifier, user) => {
	return axiosInstance.delete(
		`${backendUrl}/v1/delete_user_from_machine/${machineIdentifier}/${user}`,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
};

export const addUserToMachineService = async (token, machineIdentifier, usr) => {
	return axiosInstance.post(
		`${backendUrl}/v1/add_user_to_machine/${machineIdentifier}/${usr}`,
		{},
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
};

export const deletePoolService = async (token, poolId, userEmail) => {
	return axiosInstance.request({
		method: "DELETE",
		url: `${backendUrl}/v1/delete_pool/${poolId}`,
		data: { email: userEmail },
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});
};

export const deleteVMService = async (token, mach, userEmail) => {
	return axiosInstance.request({
		method: "DELETE",
		url: `${backendUrl}/v1/delete_machine/${mach}`,
		data: { email: userEmail },
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});
};


export const listGuacamoleUsersService = async (token) => {
	return axiosInstance.get(`${backendUrl}/v1/guacamole/list_users`, {
		headers: { Authorization: `Bearer ${token}` },
	});
};

export const rebootVMService = async (token, userEmail, vmid, poolId) => {
	return axiosInstance.post(
		`${backendUrl}/v1/proxmox/reboot_vm`,
		{ email: userEmail },
		{
			headers: { Authorization: `Bearer ${token}` },
			params: { vmid, pool_id: poolId },
		}
	);
};

export const shutdownVMService = async (token, userEmail, vmid, poolId) => {
	return axiosInstance.post(
		`${backendUrl}/v1/proxmox/shutdown_vm`,
		{ email: userEmail },
		{
			headers: { Authorization: `Bearer ${token}` },
			params: { vmid, pool_id: poolId },
		}
	);
};

export const startVMService = async (token, userEmail, vmid, poolId) => {
	return axiosInstance.post(
		`${backendUrl}/v1/proxmox/start_vm`,
		{ email: userEmail },
		{
			headers: { Authorization: `Bearer ${token}` },
			params: { vmid, pool_id: poolId },
		}
	);
};

export const stopVMService = async (token, userEmail, vmid, poolId) => {
	return axiosInstance.post(
		`${backendUrl}/v1/proxmox/stop_vm`,
		{ email: userEmail },
		{
			headers: { Authorization: `Bearer ${token}` },
			params: { vmid, pool_id: poolId },
		}
	);
};

export const rebuildVMService = async (token, userEmail, vmid, poolId) => {
	const response = await axiosInstance.post(
		`${backendUrl}/v1/proxmox/vm_rebuild`,
		{ email: userEmail },
		{
			headers: { Authorization: `Bearer ${token}` },
			params: { vmid, pool_id: poolId },
		}
	);
	return response.data;
};

export const fetchPoolMachinesService = async (token, poolId) => {
	const response = await axiosInstance.get(
		`${backendUrl}/v1/pool/machines/${poolId}`,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
	return response.data?.data;
};
export const updatePoolStatus = async (pool_ids, status) => {
	const response = await fetch("/api/pools/update-status", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ pool_ids, status }),
	});
	if (!response.ok) throw new Error("Failed to update status");
	return response.json();
};
export const getIpPoolNames = async (token) => {
	const response = await axiosInstance.get(`${backendUrl}/v1/ips/ip_pool_names`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return response.data?.data;
};

export const getClusterNodes = async (token, cluster_id) => {
	const response = await axiosInstance.get(`${backendUrl}/v1/proxmox/get-cluster-nodes`, {
		params: { cluster_id },
		headers: { Authorization: `Bearer ${token}` },
	});
	return response.data?.data;
};

export const getTemplates = async (token, cluster_id) => {
	const response = await axiosInstance.get(`${backendUrl}/v1/proxmox/get_templates`, {
		params: { cluster_id },
		headers: { Authorization: `Bearer ${token}` },
	});
	return response.data?.data;
};

export const getVmwareDCs = async (token, cluster_id) => {
	const response = await axiosInstance.get(`${backendUrl}/v1/vmware/get-dcs`, {
		params: { cluster_id },
		headers: { Authorization: `Bearer ${token}` },
	});
	return response.data;
};

export const getVmwareFolders = async (token, cluster_id) => {
	const response = await axiosInstance.get(`${backendUrl}/v1/vmware/get-folders`, {
		params: { cluster_id },
		headers: { Authorization: `Bearer ${token}` },
	});
	return response.data;
};

export const createPool = async (token, requestData) => {
	const response = await axiosInstance.post(`${backendUrl}/v1/create_pool`, requestData, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return response;
};

export const getSwitches = async (token, clusterId) => {
	const response = await axiosInstance.get(`${backendUrl}/v1/hyper_v/get_switches`, {
		headers: { Authorization: `Bearer ${token}` },
		params: { cluster_id: clusterId }
	});
	
	const data = response.data?.data;
	
	// Handle both single object and array responses
	if (!data) {
		return [];
	}
	
	// If it's already an array, return it
	if (Array.isArray(data)) {
		return data;
	}
	
	// If it's a single object, wrap it in an array
	return [data];
};

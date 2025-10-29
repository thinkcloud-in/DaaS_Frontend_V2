import axiosInstance from "./AxiosInstane"
import { getEnv } from "utils/getEnv";
const backendUrl = getEnv('BACKEND_URL');
export const fetchUsers = async (token) => {
	try {
		const response = await axiosInstance.get(
			`${backendUrl}/v1/guacamole/list_users`,
			{ headers: { Authorization: `Bearer ${token}` } }
		);
		if (response.data?.data) {
			return response.data.data.map((user) => user.username);
		}
		return [];
	} catch (error) {
		throw new Error('Failed to fetch users');
	}
};

export const fetchRoles = async (token) => {
	try {
		const response = await axiosInstance.get(
			`${backendUrl}/v1/guacamole/get_client_roles`,
			{ headers: { Authorization: `Bearer ${token}` } }
		);
		if (response.data?.data) {
			return response.data.data;
		}
		return [];
	} catch (error) {
		throw new Error('Failed to fetch roles');
	}
};

export const fetchRoleComponents = async (token, selectedRole) => {
	try {
		const response = await axiosInstance.get(
			`${backendUrl}/v1/guacamole/get_role_components/${selectedRole}`,
			{ headers: { Authorization: `Bearer ${token}` } }
		);
		if (response.data?.data?.components) {
			return response.data.data.components;
		}
		return [];
	} catch (error) {
		throw new Error('Failed to fetch role components');
	}
};

export const addRole = async (token, role) => {
	const response = await axiosInstance.post(
		`${backendUrl}/v1/guacamole/post_role/${role}`,
		{},
		{ headers: { Authorization: `Bearer ${token}` } }
	);
	return response;
};

export const deleteRole = async (token, roleToDelete) => {
	const response = await axiosInstance.delete(
		`${backendUrl}/v1/guacamole/delete_role/${roleToDelete}`,
		{ headers: { Authorization: `Bearer ${token}` } }
	);
	return response;
};

export const submitRoleComponents = async (token, role, components) => {
	const response = await axiosInstance.post(
		`${backendUrl}/v1/guacamole/submit_role_components`,
		{ role, components },
		{
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		},
	);
	return response;
};

export const getUserPermission = async (token, username) => {
	const response = await axiosInstance.get(
		`${backendUrl}/v1/guacamole/get_user_permissions/${username}`,
		{ headers: { Authorization: `Bearer ${token}` } }
	);
	return response;
};

export const assignUserRole = async (token, username, role, components = []) => {
	const response = await axiosInstance.post(
		`${backendUrl}/v1/guacamole/assign_user_role`,
		{ username: [username], role, components },
		{
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
		},
	);
	return response;
};

export const removeRoleFromUserService = async (token, username, roleToRemove, components = []) => {
	const response = await axiosInstance.delete(
		`${backendUrl}/v1/guacamole/remove_role_from_user`,
		{
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			data: { username: [username], role: roleToRemove, components },
		},
	);
	return response;
};

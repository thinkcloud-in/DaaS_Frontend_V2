import axiosInstance from './AxiosInstane';
import { getEnv } from 'utils/getEnv';
const backendUrl = getEnv('BACKEND_URL');

export const syncChangedUsers = async (token, domain_id) => {
	const response = await axiosInstance.get(
		`${backendUrl}/v1/sync_changed_users/${domain_id}`,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
	return response;
};

export const unlinkUsers = async (token, domain_id) => {
	const response = await axiosInstance.get(
		`${backendUrl}/v1/unlink_users/${domain_id}`,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
	return response;
};

export const removeImportedUsers = async (token, domain_id) => {
	const response = await axiosInstance.get(
		`${backendUrl}/v1/remove_imported_users/${domain_id}`,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
	return response;
};

export const updateDomain = async (token, domainID, editAD) => {
	const response = await axiosInstance.put(
		`${backendUrl}/v1/update_ldap_config/${domainID}`,
		editAD,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
	return response;
};

export const createDomain = async (token, ad) => {
	const response = await axiosInstance.post(
		`${backendUrl}/v1/ad_ldap_connection`,
		ad,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
	return response;
};

export const getDomainDetails = async (token, domain_id) => {
	const response = await axiosInstance.get(
		`${backendUrl}/v1/get_ldap_by_id/${domain_id}`,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
	return response.data?.data;
};

export const deleteDomain = async (token, domain_id) => {
	const response = await axiosInstance.delete(
		`${backendUrl}/v1/delete_ldap_configuration/${domain_id}`,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
	return response;
};

export const syncUsers = async (token, domain_id) => {
	const response = await axiosInstance.get(
		`${backendUrl}/v1/sync_users/${domain_id}`,
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
	return response;
};

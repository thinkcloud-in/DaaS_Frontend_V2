import axiosInstance from './AxiosInstane';
import { getEnv } from 'utils/getEnv';
const backendUrl = getEnv('BACKEND_URL');


export const testLdapConnectionService = async (backendUrl, token, editAD) => {
	return axiosInstance.post(
		`${backendUrl}/v1/test_ldap_connection`,
		{
			authType: editAD.authType,
			bindCredential: editAD.bindCredential,
			bindDn: editAD.bindDn,
			connectionTimeout: editAD.connectionTimeout,
			connectionUrl: editAD.connectionUrl,
			startTls: editAD.startTls,
			useTruststoreSpi: editAD.useTruststoreSpi,
		},
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
};

// Test LDAP authentication
export const testLdapAuthenticationService = async (backendUrl, token, editAD) => {
	return axiosInstance.post(
		`${backendUrl}/v1/test_ldap_authentication`,
		{ ...editAD },
		{
			headers: { Authorization: `Bearer ${token}` },
		}
	);
};


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

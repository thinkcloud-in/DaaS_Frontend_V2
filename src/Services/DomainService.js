import axiosInstance from "./AxiosInstance";
import { getEnv } from "utils/getEnv";
const backendUrl = getEnv("BACKEND_URL");

export const testLdapConnectionService = async (token, editAD) => {
  // use module-level backendUrl (from getEnv)
  return axiosInstance.post(
    `${backendUrl}/v1/domain/test_ldap_connection`,
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
    },
  );
};

export const testLdapAuthenticationService = async (token, editAD) => {
  return axiosInstance.post(
    `${backendUrl}/v1/domain/test_ldap_authentication`,
    { ...editAD },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
};

export const syncChangedUsers = async (token, domain_id) => {
  const response = await axiosInstance.get(
    `${backendUrl}/v1/domain/sync_changed_users/${domain_id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response;
};

export const unlinkUsers = async (token, domain_id) => {
  const response = await axiosInstance.get(
    `${backendUrl}/v1/domain/unlink_users/${domain_id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response;
};

export const removeImportedUsers = async (token, domain_id) => {
  const response = await axiosInstance.get(
    `${backendUrl}/v1/domain/remove_imported_users/${domain_id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response;
};

export const updateDomain = async (token, domainID, editAD) => {
  const response = await axiosInstance.put(
    `${backendUrl}/v1/domain/update_ldap_config/${domainID}`,
    editAD,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response;
};

export const createDomain = async (token, ad) => {
  const response = await axiosInstance.post(
    `${backendUrl}/v1/domain/ad_ldap_connection`,
    ad,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response;
};

export const getDomainDetails = async (token, domain_id) => {
  const response = await axiosInstance.get(
    `${backendUrl}/v1/domain/get_ldap_by_id/${domain_id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response.data?.data;
};

export const deleteDomain = async (token, domain_id) => {
  const response = await axiosInstance.delete(
    `${backendUrl}/v1/domain/delete_ldap_configuration/${domain_id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response;
};

export const syncUsers = async (token, domain_id) => {
  const response = await axiosInstance.get(
    `${backendUrl}/v1/domain/sync_users/${domain_id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return response;
};


import React, { useState, useEffect, Fragment } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Slide, toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import "./EditDomain.css";
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDomains,
  fetchDomainDetails,
  deleteDomain as deleteDomainThunk,
  syncUsers as syncUsersThunk,
  syncChangedUsers as syncChangedUsersThunk,
  unlinkUsers as unlinkUsersThunk,
  removeImportedUsers as removeImportedUsersThunk,
  updateDomain as updateDomainThunk,
  testLdapConnection,
  testLdapAuthentication,
} from '../../redux/features/Domain/DomainThunks';
import { selectAuthToken } from '../../redux/features/Auth/AuthSelectors';
import { selectDomainDetails, selectDomainLoading } from '../../redux/features/Domain/DomainSelectors';
function EditDomainSkeleton() {
  return (
    <div className="animate-pulse space-y-5 mt-4 w-[98%] m-auto mb-5 h-[90vh] rounded-md bg-white edit_domain flex flex-col justify-between">
      <div className="flex justify-between items-center mx-5 p-3 pb-0 mt-3">
        <div className="h-10 w-10 bg-gray-200 rounded-md" />
        <div className="flex items-center gap-10">
          <div className="h-6 w-24 bg-gray-200 rounded" />
          <div className="h-10 w-32 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="bg-gray-100 mx-10 p-3 pb-0 rounded">
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-6 w-2/3 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
      <div className="bg-gray-100 mx-10 p-3 pb-0 rounded">
        <div className="h-8 w-1/3 bg-gray-200 rounded mb-4" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 w-2/3 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
      <div className="h-10 w-32 bg-gray-200 rounded mt-8 ml-10" />
    </div>
  );
}

const EditDomain = () => {
  const dispatch = useDispatch();
  const token = useSelector(selectAuthToken);
  const navigate = useNavigate();
  const { id: domainID } = useParams();

  const domainDetails = useSelector(selectDomainDetails);
  const globalLoading = useSelector(selectDomainLoading);

  const [editAD, setEditAD] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState({ testConnection: false, testAuth: false, submit: false });
  const [showPassword, setShowPassword] = useState(false);
  const [syncSettingsEnable, setSyncSettingsEnable] = useState({ fullSyncEnabled: false, changedSyncEnabled: false });

  function stringToBoolean(str) {
    return str === true || str === "true";
  }

  const togglePassword = () => setShowPassword((s) => !s);

  // fetch domain details when token & id available
  useEffect(() => {
    if (!token || !domainID) return;
    setIsLoading(true);
    dispatch(fetchDomainDetails({ token, domain_id: domainID }))
      .unwrap()
      .then((data) => {
        if (!data) return;
        // backend may send the domain object directly
        const src = data?.data || data;
        // map values and normalize booleans
        setEditAD({
          name: src?.name || "",
          vendor: src?.vendor || "ad",
          connectionUrl: src?.connectionUrl || "",
          startTls: stringToBoolean(src?.startTls),
          useTruststoreSpi: src?.useTruststoreSpi || "always",
          connectionPooling: stringToBoolean(src?.connectionPooling),
          connectionTimeout: src?.connectionTimeout || "",
          authType: src?.authType || "simple",
          bindDn: src?.bindDn || "",
          bindCredential: "",
          editMode: src?.editMode || "read_only",
          usersDn: src?.usersDn || "",
          usernameLDAPAttribute: src?.usernameLDAPAttribute || "",
          rdnLDAPAttribute: src?.rdnLDAPAttribute || "",
          uuidLDAPAttribute: src?.uuidLDAPAttribute || "",
          userObjectClasses: src?.userObjectClasses || "",
          searchScope: src?.searchScope || "",
          readTimeout: src?.readTimeout || "",
          pagination: stringToBoolean(src?.pagination),
          referral: src?.referral || "",
          importEnabled: stringToBoolean(src?.importEnabled),
          syncRegistrations: stringToBoolean(src?.syncRegistrations),
          batchSizeForSync: src?.batchSizeForSync || "",
          fullSyncPeriod: src?.fullSyncPeriod || "-1",
          changedSyncPeriod: src?.changedSyncPeriod || "-1",
          allowKerberosAuthentication: stringToBoolean(src?.allowKerberosAuthentication),
          useKerberosForPasswordAuthentication: stringToBoolean(src?.useKerberosForPasswordAuthentication),
          cachePolicy: src?.cachePolicy || "DEFAULT",
          usePasswordModifyExtendedOp: stringToBoolean(src?.usePasswordModifyExtendedOp),
          validatePasswordPolicy: stringToBoolean(src?.validatePasswordPolicy),
          trustEmail: stringToBoolean(src?.trustEmail),
          customUserSearchFilter: src?.customUserSearchFilter || "",
          debug: stringToBoolean(src?.debug),
          enabled: stringToBoolean(src?.enabled),
          kerberosRealm: src?.kerberosRealm || "",
          keyTab: src?.keyTab || "",
          serverPrincipal: src?.serverPrincipal || "",
          krbPrincipalAttribute: src?.krbPrincipalAttribute || "",
        });
        // Normalize full/changed sync enabled flags — backend may return number -1 or string "-1"
        const fullEnabled = src?.fullSyncPeriod != null && String(src.fullSyncPeriod) !== "-1";
        const changedEnabled = src?.changedSyncPeriod != null && String(src.changedSyncPeriod) !== "-1";
        setSyncSettingsEnable({ fullSyncEnabled: fullEnabled, changedSyncEnabled: changedEnabled });
      })
      .catch(() => {
        toast.error("Failed to fetch domain data", { position: "top-right", autoClose: 3000, transition: Slide });
      })
      .finally(() => setIsLoading(false));
  }, [token, domainID, dispatch]);

  const Goback = () => {
    navigate("/domain");
  };

  const handleDelete = async (id) => {
    if (!token) return;
    try {
      const res = await dispatch(deleteDomainThunk({ token, domain_id: id })).unwrap();
      // show message (try several common shapes)
      const msg = res?.msg || res?.data?.msg || 'Domain deleted';
      toast.success(msg, { position: 'top-right', autoClose: 3000, transition: Slide });
      dispatch(fetchDomains({ token }));
      navigate('/domain');
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.msg || err?.data?.msg || err?.message || 'Deletion failed';
      toast.error(msg, { position: 'top-right', autoClose: 3000, transition: Slide });
    }
  };

  const handleOnClick = async (exp, id) => {
    if (!token) return;
    try {
      switch (exp) {
        case 'sync': {
          const res = await dispatch(syncUsersThunk({ token, domain_id: id })).unwrap();
          const code = res?.code ?? res?.data?.code;
          const status = res?.data?.data?.status ?? res?.data?.status ?? res?.payload?.status ?? res?.status ?? null;
          const detailedStatus = status || res?.msg || res?.data?.msg || 'Sync completed';
          if (code === 200) toast.success(detailedStatus, { position: 'top-right', autoClose: 3000, transition: Slide });
          else toast.error(detailedStatus, { position: 'top-right', autoClose: 3000, transition: Slide });
          break;
        }
        case 'syncChanged': {
          const res = await dispatch(syncChangedUsersThunk({ token, domain_id: id })).unwrap();
          const code = res?.code ?? res?.data?.code;
          const status = res?.data?.data?.status ?? res?.data?.status ?? res?.payload?.status ?? res?.status ?? null;
          const detailedStatus = status || res?.msg || res?.data?.msg || 'Sync completed';
          if (code === 200) toast.success(detailedStatus, { position: 'top-right', autoClose: 3000, transition: Slide });
          else toast.error(detailedStatus, { position: 'top-right', autoClose: 3000, transition: Slide });
          break;
        }
        case 'unlink': {
          const res = await dispatch(unlinkUsersThunk({ token, domain_id: id })).unwrap();
          const msg = res?.msg || res?.data?.msg || 'Unlink completed';
          toast.info(msg, { position: 'top-right', autoClose: 3000, transition: Slide });
          break;
        }
        case 'remove': {
          const res = await dispatch(removeImportedUsersThunk({ token, domain_id: id })).unwrap();
          const msg = res?.msg || res?.data?.msg || 'Remove completed';
          toast.info(msg, { position: 'top-right', autoClose: 3000, transition: Slide });
          break;
        }
        case 'delete':
          await handleDelete(id);
          break;
        default:
      }
    } catch (err) {
      toast.error('Operation failed', { position: 'top-right', autoClose: 3000, transition: Slide });
    }
  };

  const sendData = async () => {
    if (!token || !domainID || !editAD) return;
    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      const res = await dispatch(updateDomainThunk({ token, domain_id: domainID, ad: editAD })).unwrap();
      const code = res?.code ?? res?.data?.code;
      const msg = res?.msg || res?.data?.msg || 'Domain update completed';
      if (code === 200) {
        toast.success(msg, { position: 'top-right', autoClose: 3000, transition: Slide });
        dispatch(fetchDomains({ token }));
        navigate('/domain');
      } else {
        toast.error(msg, { position: 'top-right', autoClose: 3000, transition: Slide });
      }
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.msg || err?.data?.msg || err?.message || 'Failed to update domain';
      toast.error(msg, { position: 'top-right', autoClose: 3000, transition: Slide });
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const handleOnChange = (e) => {
    setEditAD({ ...editAD, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    if (e.target.name === 'fullSyncEnabled' || e.target.name === 'changedSyncEnabled') {
      const name = e.target.name;
      const checked = e.target.checked;
      setSyncSettingsEnable({ ...syncSettingsEnable, [name]: checked });
      // keep the editAD period fields consistent: when disabling, set period to "-1"
      if (!checked) {
        const periodField = name === 'fullSyncEnabled' ? 'fullSyncPeriod' : 'changedSyncPeriod';
        setEditAD((prev) => (prev ? { ...prev, [periodField]: "-1" } : prev));
      }
    } else {
      setEditAD({ ...editAD, [e.target.name]: e.target.checked });
    }
  };

  const handleOnSubmit = (e) => {
    // Basic required fields check
    const basicRequired = (
      editAD?.name &&
      editAD?.vendor &&
      editAD?.connectionUrl &&
      editAD?.authType &&
      editAD?.bindDn &&
      editAD?.editMode &&
      editAD?.usersDn &&
      editAD?.usernameLDAPAttribute &&
      editAD?.rdnLDAPAttribute &&
      editAD?.uuidLDAPAttribute &&
      editAD?.userObjectClasses &&
      editAD?.bindCredential
    );

    if (!basicRequired) {
      toast.error('Please enter all required details', { position: 'top-right', autoClose: 3000, transition: Slide });
      return;
    }
    sendData();
  };

  const handleTestConnection = async () => {
    if (!token || !editAD) return;
    setLoading((prev) => ({ ...prev, testConnection: true }));
    try {
      const res = await dispatch(testLdapConnection({ token, ad: editAD })).unwrap();
      const msg = res?.msg || res?.data?.msg;
      if (msg) toast.success(msg, { position: 'top-right', autoClose: 5000, transition: Slide });
      else toast.error('Test ldap connection error occurred', { position: 'top-right', autoClose: 5000, transition: Slide });
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.msg || err?.data?.msg || err?.message || 'Test ldap connection error occurred';
      toast.error(msg, { position: 'top-right', autoClose: 5000, transition: Slide });
    } finally {
      setLoading((prev) => ({ ...prev, testConnection: false }));
    }
  };

  const handleTestAuthentication = async () => {
    if (!token || !editAD) return;
    setLoading((prev) => ({ ...prev, testAuth: true }));
    try {
      const res = await dispatch(testLdapAuthentication({ token, ad: editAD })).unwrap();
      const msg = res?.msg || res?.data?.msg;
      if (msg) toast.success(msg, { position: 'top-right', autoClose: 5000, transition: Slide });
      else toast.error('Test ldap authentication error occurred', { position: 'top-right', autoClose: 5000, transition: Slide });
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.msg || err?.data?.msg || err?.message || 'Test ldap authentication error occurred';
      toast.error(msg, { position: 'top-right', autoClose: 5000, transition: Slide });
    } finally {
      setLoading((prev) => ({ ...prev, testAuth: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5 m-2 w-[95%] m-auto mb-5 min-h-[90vh] rounded-md bg-white edit_domain">
        <EditDomainSkeleton />
      </div>
    );
  }

  return (
    <div className="domain_creation_wrapper domain_create flex flex-col h-[90vh] w-[98%] m-auto bg-white mt-4 rounded-md overflow-hidden shadow-md">
      <div className="flex justify-between items-center mx-5 p-3 pb-0 mt-3">
        <div
          onClick={Goback}
          className="ml-4 bg-[#1a365d]/80 text-white px-2 py-2 rounded-md hover:bg-[#1a365d] focus:outline-none focus:ring-2 focus:ring-[#1a365d]/50 focus:ring-opacity-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
        </div>
        <div className="flex items-center justify-center gap-10">
          <div className="flex justify-center items-center gap-2">
            <label className="block text-lg font-medium leading-6 text-gray-900 border-0">
              Enabled
            </label>
            <div className="">
              <div className="mt-2 border-0">
                <label className="switch">
                  <input
                    type="checkbox"
                    onChange={handleChange}
                    name="enabled"
                    checked={editAD.enabled}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
          <div className="">
            <Menu as="div" className="inherit">
              <Menu.Button className="text-sm rounder-lg w-40 bg-white p-1 border-2 border-gray-900/10 hover:border-b-2 hover:border-b-blue-600 active:border-b-2 active:border-b-blue-600 focus:outline-none focus:boder-b-2 focus:border-b-blue-400 focus:boder-offset-2 focus:border-offset-gray-800">
                <div className="flex justify-center items-center gap-10 text-lg border-2 border-[#1a365d] p-1 rounded-lg ">
                  Action
                  <ChevronDownIcon className="w-5 h-5" />
                </div>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 w-40 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 ">
                  <Menu.Item>
                    {({ active }) => (
                      <div
                        onClick={() => handleOnClick("syncChanged", domainID)}
                        className="block py-2 text-md text-left text-gray-700 hover:bg-gray-100 cursor-pointer px-2"
                      >
                        Sync changed users
                      </div>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <div
                        onClick={() => handleOnClick("sync", domainID)}
                        className="block py-2 text-md text-gray-700 text-left hover:bg-gray-100 cursor-pointer px-2"
                      >
                        Sync all users
                      </div>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <div
                        onClick={() => handleOnClick("unlink", domainID)}
                        className="block py-2 text-md text-gray-700 text-left hover:bg-gray-100 cursor-pointer px-2"
                      >
                        Unlink users
                      </div>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <div
                        onClick={() => handleOnClick("remove", domainID)}
                        className="block py-2 text-md text-gray-700 text-left hover:bg-gray-100 cursor-pointer px-2"
                      >
                        Remove imported
                      </div>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <div
                        onClick={() => handleOnClick("delete", domainID)}
                        className="block py-2 text-sm text-gray-700 text-left hover:bg-gray-100 cursor-pointer px-2"
                      >
                        Delete
                      </div>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
      {isLoading ? (
        <EditDomainSkeleton />
      ) : (
        <>
          {editAD && (
            <div className="space-y-5  w-full  bg-white custom-scrollbar">
              <div className="bg-white mx-10 p-3 pb-0">
                <h2 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border-2 border-[#F0F8FFCC] p-1 text-left">
                  General options
                </h2>

                <div className="text-left table-auto p-3">
                  <div className=" domain-tr">
                    <div className=" domain-td flex gap-1">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        UI display name
                      </label>
                      <span className="text-lg text-red-700">*</span>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-gray-300">
                          <input
                            type="text"
                            name="name"
                            value={editAD.name}
                            onChange={handleOnChange}
                            className="block flex-1 bg-transparent bg-white rounded-md border-2 py-1.5 pl-1 text-black placeholder:text-gray-400 focus:ring-0 sm:leading-6"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className=" domain-tr">
                    <div className=" domain-td flex gap-1">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Vendor
                      </label>
                      <span className="text-lg text-red-700">*</span>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <select
                          name="vendor"
                          value={editAD.vendor}
                          onChange={handleOnChange}
                          className="block cursor-pointer rounded-md border-2 py-1.5 text-black  shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-gray-300 sm:text-sm sm:leading-6 "
                        >
                          <option value="ad">Active Directory</option>
                          <option value="rhds">Red Hat Directory Server</option>
                          <option value="tivoli">Tivoli</option>
                          <option value="edirectory">Novell eDirectory</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white mx-10 p-3 pb-0">
                <h2 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border-2 border-[#F0F8FFCC] p-1 text-left">
                  Connection and authentication settings
                </h2>

                <div className="text-left table-auto p-3">
                  <div className=" domain-tr">
                    <div className=" domain-td flex gap-1">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Connection URL
                      </label>
                      <span className="text-lg text-red-700">*</span>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-gray-300">
                          <input
                            type="text"
                            name="connectionUrl"
                            value={editAD.connectionUrl}
                            onChange={handleOnChange}
                            className="block flex-1 bg-transparent bg-white rounded-md border-2 py-1.5 pl-1 text-black  placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 ">
                        Enable StartTLS
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <label className="switch">
                          <input
                            type="checkbox"
                            onChange={handleChange}
                            name="startTls"
                            checked={editAD.startTls}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Use Truststore SPI
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <select
                          name="useTruststoreSpi"
                          value={editAD.useTruststoreSpi}
                          onChange={handleOnChange}
                          className="block  cursor-pointer rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                          <option value="always">Always</option>
                          <option value="never">Never</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Connection pooling
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <label className="switch">
                          <input
                            type="checkbox"
                            onChange={handleChange}
                            name="connectionPooling"
                            checked={editAD.connectionPooling}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Connection timeout
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <div className="flex bg-white rounded-md border-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                          <input
                            type="number"
                            name="connectionTimeout"
                            onChange={handleOnChange}
                            value={editAD.connectionTimeout}
                            className="block flex-1 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-md bg-[#1a365d]/80 px-3 py-2 text-sm font-semibold text-[#f5f5f5] shadow-sm hover:bg-[#1a365d] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a365d] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    onClick={handleTestConnection}
                    disabled={loading.testConnection}
                  >
                    {loading.testConnection ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#1a365d] text-[#1a365d] border-t-transparent rounded-full animate-spin"></div>
                        Testing...
                      </>
                    ) : (
                      "Test Connection"
                    )}
                  </button>
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Bind Type
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <select
                          name="authType"
                          value={editAD.authType}
                          onChange={handleOnChange}
                          className="block  cursor-pointer rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                          <option value="simple">Simple</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td flex gap-1">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Bind DN
                      </label>
                      <span className="text-lg text-red-700">*</span>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <div className="flex bg-white rounded-md border-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                          <input
                            type="text"
                            name="bindDn"
                            onChange={handleOnChange}
                            value={editAD.bindDn}
                            className="block flex-1 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td flex gap-1">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Bind Credentials
                      </label>
                      <span className="text-lg text-red-700">*</span>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <div className="flex bg-white rounded-md border-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600  relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="bindCredential"
                            onChange={handleOnChange}
                            value={editAD.bindCredential}
                            className="block flex-1 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            id="passwordInput"
                          />
                          <span
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                            onClick={togglePassword}
                          >
                            {showPassword ? (
                              <EyeIcon className="h-4 w-4" />
                            ) : (
                              <EyeSlashIcon className="h-4 w-4" />
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rounded-md bg-[#1a365d]/80 px-3 py-2 text-sm font-semibold text-[#f5f5f5] shadow-sm hover:bg-[#1a365d] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a365d] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    onClick={handleTestAuthentication}
                    disabled={loading.testAuth}
                  >
                    {loading.testAuth ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#1a365d] text-[#1a365d] border-t-transparent rounded-full animate-spin"></div>
                        Testing...
                      </>
                    ) : (
                      "Test Authentication"
                    )}
                  </button>
                </div>
              </div>
              <div className="bg-white p-3 mx-10 ">
                <h2 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border-2 border-[#F0F8FFCC] p-1 text-left">
                  LDAP searching and updating
                </h2>

                <div className="text-left table-auto p-3">
                  <div className=" domain-tr">
                    <div className=" domain-td flex gap-1">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Edit mode
                      </label>
                      <span className="text-lg text-red-700">*</span>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <select
                          name="editMode"
                          onChange={handleOnChange}
                          value={editAD.editMode}
                          className="block  cursor-pointer rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                          <option selected value={""} disabled>
                            --
                          </option>
                          <option value="read_only">Read_only</option>
                          <option value="writable">Writable</option>
                          <option value="unsynced">Unsynced</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td flex gap-1">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Users DN
                      </label>
                      <span className="text-lg text-red-700">*</span>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                          <input
                            type="text"
                            name="usersDn"
                            onChange={handleOnChange}
                            value={editAD.usersDn}
                            className="block flex-1 bg-white rounded-md border-2 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td flex gap-1">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Username LDAP Attribute
                      </label>
                      <span className="text-lg text-red-700">*</span>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                          <input
                            type="text"
                            name="usernameLDAPAttribute"
                            onChange={handleOnChange}
                            value={editAD.usernameLDAPAttribute}
                            className="block flex-1 bg-white rounded-md border-2 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td flex gap-1">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        RDN LDAP Attribute
                      </label>
                      <span className="text-lg text-red-700">*</span>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                          <input
                            type="text"
                            name="rdnLDAPAttribute"
                            onChange={handleOnChange}
                            value={editAD.rdnLDAPAttribute}
                            className="block flex-1 bg-white rounded-md border-2 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td flex gap-1">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        UUID LDAP attribute
                      </label>
                      <span className="text-lg text-red-700">*</span>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 ">
                          <input
                            type="text"
                            name="uuidLDAPAttribute"
                            onChange={handleOnChange}
                            value={editAD.uuidLDAPAttribute}
                            className="block flex-1 bg-white rounded-md border-2 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td flex gap-1">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                        User object classes
                      </label>
                      <span className="text-lg text-red-700">*</span>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <div className="flex bg-white rounded-md border-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 ">
                          <input
                            type="text"
                            name="userObjectClasses"
                            onChange={handleOnChange}
                            value={editAD.userObjectClasses}
                            className="block flex-1 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0 ">
                        User LDAP filter
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <div className="flex bg-white rounded-md border-2 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                          <input
                            type="text"
                            name="customUserSearchFilter"
                            onChange={handleOnChange}
                            value={editAD.customUserSearchFilter}
                            className="block flex-1 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Search scope
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <select
                          name="searchScope"
                          value={editAD.searchScope}
                          onChange={handleOnChange}
                          className="block flex-1 bg-white rounded-md border-2 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        >
                          <option value="One Level">One Level</option>
                          <option value="Sub tree">Sub tree</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Read timeout
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                          <input
                            type="text"
                            name="readTimeout"
                            value={editAD.readTimeout}
                            onChange={handleOnChange}
                            className="block flex-1 bg-white rounded-md border-2 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Pagination
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <label className="switch">
                          <input
                            type="checkbox"
                            onChange={handleChange}
                            name="pagination"
                            checked={editAD.pagination}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Referral
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <select
                          name="referral"
                          value={editAD.referral}
                          onChange={handleOnChange}
                          className="block  cursor-pointer rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                          <option value="ignore">ignore</option>
                          <option value="follow">follow</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white mx-10 p-3 pb-0 ">
                <h2 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border-2 border-[#F0F8FFCC] p-1 text-left">
                  Synchronization settings
                </h2>

                <div className="text-left table-auto p-3">
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Import users
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <label className="switch">
                          <input  
                            type="checkbox"
                            onChange={handleChange}
                            name="importEnabled"
                            checked={editAD.importEnabled}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Sync Registrations
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <label className="switch">
                          <input
                            type="checkbox"
                            onChange={handleChange}
                            name="syncRegistrations"
                            checked={editAD.syncRegistrations}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Batch size
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                          <input
                            type="text"
                            name="batchSizeForSync"
                            value={editAD.batchSizeForSync}
                            onChange={handleOnChange}
                            className="block flex-1 bg-transparent bg-white rounded-md border-2 py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Periodic full sync
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <label className="switch">
                          <input
                            type="checkbox"
                            onChange={handleChange}
                            name="fullSyncEnabled"
                            checked={syncSettingsEnable.fullSyncEnabled}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  {syncSettingsEnable.fullSyncEnabled && (
                    <div className=" domain-tr">
                      <div className=" domain-td">
                        <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                          Full sync period
                        </label>
                      </div>
                      <div className=" domain-td">
                        <div className="mt-2 border-0">
                          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                            <input
                              type="text"
                              name="fullSyncPeriod"
                              value={editAD.fullSyncPeriod}
                              onChange={handleOnChange}
                              className="block flex-1 bg-transparent bg-white rounded-md border-2 py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Periodic changed users sync
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <label className="switch">
                          <input
                            type="checkbox"
                            onChange={handleChange}
                            name="changedSyncEnabled"
                            checked={syncSettingsEnable.changedSyncEnabled}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  {syncSettingsEnable.changedSyncEnabled && (
                    <div className=" domain-tr">
                      <div className=" domain-td">
                        <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                          Changed users sync period
                        </label>
                      </div>
                      <div className=" domain-td">
                        <div className="mt-2 border-0">
                          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                            <input
                              type="text"
                              name="changedSyncPeriod"
                              value={editAD.changedSyncPeriod}
                              onChange={handleOnChange}
                              className="block flex-1 bg-transparent bg-white rounded-md border-2 py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white mx-10 p-3 pb-0">
                <h2 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border-2 border-[#F0F8FFCC] p-1 text-left">
                  Kerberos integration
                </h2>
                <div className="text-left table-auto p-3">
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Allow Kerberos authentication
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <label className="switch">
                          <input
                            type="checkbox"
                            onChange={handleChange}
                            name="allowKerberosAuthentication"
                            checked={editAD.allowKerberosAuthentication}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  {editAD.allowKerberosAuthentication && (
                    <>
                      <div className=" domain-tr">
                        <div className=" domain-td flex gap-1">
                          <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                            Kerberos realm
                          </label>
                          <span className="text-lg text-red-700">*</span>
                        </div>
                        <div className=" domain-td">
                          <div className="mt-2 border-0">
                            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                              <input
                                type="text"
                                name="kerberosRealm"
                                value={editAD.kerberosRealm}
                                onChange={handleOnChange}
                                className="block flex-1 bg-transparent bg-white rounded-md border-2 py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className=" domain-tr">
                        <div className=" domain-t flex gap-1">
                          <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                            Server principal
                          </label>
                          <span className="text-lg text-red-700">*</span>
                        </div>
                        <div className=" domain-td">
                          <div className="mt-2 border-0">
                            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                              <input
                                type="text"
                                name="serverPrincipal"
                                value={editAD.serverPrincipal}
                                onChange={handleOnChange}
                                className="block flex-1 bg-transparent bg-white rounded-md border-2 py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className=" domain-tr">
                        <div className=" domain-td flex gap-1">
                          <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                            Key tab
                          </label>
                          <span className="text-lg text-red-700">*</span>
                        </div>
                        <div className=" domain-td">
                          <div className="mt-2 border-0">
                            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                              <input
                                type="text"
                                name="keyTab"
                                value={editAD.keyTab}
                                onChange={handleOnChange}
                                className="block flex-1 bg-transparent bg-white rounded-md border-2 py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className=" domain-tr">
                        <div className=" domain-td flex gap-1">
                          <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                            Kerberos principal attribute
                          </label>
                          <span className="text-lg text-red-700">*</span>
                        </div>
                        <div className=" domain-td">
                          <div className="mt-2 border-0">
                            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600">
                              <input
                                type="text"
                                name="krbPrincipalAttribute"
                                value={editAD.krbPrincipalAttribute}
                                onChange={handleOnChange}
                                className="block flex-1 bg-transparent bg-white rounded-md border-2 py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className=" domain-tr">
                        <div className=" domain-td">
                          <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                            Debug
                          </label>
                        </div>
                        <div className=" domain-td">
                          <div className="mt-2 border-0">
                            <label className="switch">
                              <input
                                type="checkbox"
                                onChange={handleChange}
                                name="debug"
                                checked={editAD.debug}
                              />
                              <span className="slider round"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Use Kerberos for password authentication
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <label className="switch">
                          <input
                            type="checkbox"
                            onChange={handleChange}
                            name="useKerberosForPasswordAuthentication"
                            checked={
                              editAD.useKerberosForPasswordAuthentication
                            }
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white mx-10 p-3 pb-0 ">
                <h2 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border-2 border-[#F0F8FFCC] p-1 text-left">
                  Cache settings
                </h2>

                <div className="text-left table-auto p-3">
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Cache policy
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <select
                          name="cachePolicy"
                          value={editAD.cachePolicy}
                          onChange={handleOnChange}
                          className="block  cursor-pointer rounded-md border-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        >
                          {[
                            "DEFAULT",
                            "EVICT_DAILY",
                            "EVICT_WEEKLY",
                            "MAX_LIFESPAN",
                            "NO_CACHE",
                          ].map((item) => (
                            <option value={item}>{item}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white mx-10 p-3 pb-0">
                <h2 className="font-semibold leading-7 text-[#00000099] bg-[#F0F8FFCC] border-2 border-[#F0F8FFCC] p-1 text-left">
                  Advanced settings
                </h2>

                <div className="text-left table-auto p-3">
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Enable the LDAPv3 password modify extended operation
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <label className="switch">
                          <input
                            type="checkbox"
                            onChange={handleChange}
                            name="usePasswordModifyExtendedOp"
                            checked={editAD.usePasswordModifyExtendedOp}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Validate password policy
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <label className="switch">
                          <input
                            type="checkbox"
                            onChange={handleChange}
                            name="validatePasswordPolicy"
                            checked={editAD.validatePasswordPolicy}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className=" domain-tr">
                    <div className=" domain-td">
                      <label className="block text-sm font-medium leading-6 text-gray-900 border-0">
                        Trust Email
                      </label>
                    </div>
                    <div className=" domain-td">
                      <div className="mt-2 border-0">
                        <label className="switch">
                          <input
                            type="checkbox"
                            onChange={handleChange}
                            name="trustEmail"
                            checked={editAD.trustEmail}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-5 flex items-center justify-start mx-10">
                <button
                  onClick={handleOnSubmit}
                  type="submit"
                  disabled={loading.submit}
                  className={`rounded-md mb-4 px-3 py-2 text-sm font-semibold text-[#f5f5f5] shadow-sm flex items-center gap-2 bg-[#1a365d]/80 hover:bg-[#1a365d] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1a365d] ${loading.submit ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {loading.submit && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <span>{loading.submit ? "Updating..." : "Update"}</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EditDomain;

import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchDomains as fetchDomainsService } from '../../../Services/ContextService';
import {
	getDomainDetails,
	deleteDomain as deleteDomainService,
	syncUsers as syncUsersService,
	// new services for additional domain operations
	syncChangedUsers as syncChangedUsersService,
	unlinkUsers as unlinkUsersService,
	removeImportedUsers as removeImportedUsersService,
	createDomain as createDomainService,
	testLdapConnectionService,
	testLdapAuthenticationService,
	updateDomain as updateDomainService,
} from '../../../Services/DomainService';

export const fetchDomains = createAsyncThunk(
	'domain/fetchDomains',
	async ({ token }, { rejectWithValue }) => {
		try {
			const data = await fetchDomainsService(token);
			return data || [];
		} catch (err) {
			return rejectWithValue('Failed to fetch domains');
		}
	}
);

export const fetchDomainDetails = createAsyncThunk(
	'domain/fetchDomainDetails',
	async ({ token, domain_id }, { rejectWithValue }) => {
		try {
			const data = await getDomainDetails(token, domain_id);
			return data || null;
		} catch (err) {
			return rejectWithValue('Failed to fetch domain details');
		}
	}
);

export const deleteDomain = createAsyncThunk(
	'domain/deleteDomain',
	async ({ token, domain_id }, { rejectWithValue }) => {
		try {
			const res = await deleteDomainService(token, domain_id);
			// backend returns { code, msg, data: [...] } - return the updated domains list when available
			return res?.data?.data || [];
		} catch (err) {
			return rejectWithValue('Failed to delete domain');
		}
	}
);

export const syncUsers = createAsyncThunk(
	'domain/syncUsers',
	async ({ token, domain_id }, { rejectWithValue }) => {
		try {
			const res = await syncUsersService(token, domain_id);
			return res?.data || null;
		} catch (err) {
			return rejectWithValue('Failed to sync users');
		}
	}
);

export const createDomain = createAsyncThunk(
	'domain/createDomain',
	async ({ token, ad }, { rejectWithValue }) => {
		try {
			const res = await createDomainService(token, ad);
			// return the whole response data so caller can access code/msg/data
			return res?.data || null;
		} catch (err) {
			return rejectWithValue('Failed to create domain');
		}
	}
);

export const updateDomain = createAsyncThunk(
	'domain/updateDomain',
	async ({ token, domain_id, ad }, { rejectWithValue }) => {
		try {
			const res = await updateDomainService(token, domain_id, ad);
			return res?.data || null;
		} catch (err) {
			return rejectWithValue('Failed to update domain');
		}
	}
);

export const syncChangedUsers = createAsyncThunk(
	'domain/syncChangedUsers',
	async ({ token, domain_id }, { rejectWithValue }) => {
		try {
			const res = await syncChangedUsersService(token, domain_id);
			return res?.data || null;
		} catch (err) {
			return rejectWithValue('Failed to sync changed users');
		}
	}
);

export const unlinkUsers = createAsyncThunk(
	'domain/unlinkUsers',
	async ({ token, domain_id }, { rejectWithValue }) => {
		try {
			const res = await unlinkUsersService(token, domain_id);
			return res?.data || null;
		} catch (err) {
			return rejectWithValue('Failed to unlink users');
		}
	}
);

export const removeImportedUsers = createAsyncThunk(
	'domain/removeImportedUsers',
	async ({ token, domain_id }, { rejectWithValue }) => {
		try {
			const res = await removeImportedUsersService(token, domain_id);
			return res?.data || null;
		} catch (err) {
			return rejectWithValue('Failed to remove imported users');
		}
	}
);

export const testLdapConnection = createAsyncThunk(
	'domain/testLdapConnection',
	async ({ token, ad }, { rejectWithValue }) => {
		try {
			const res = await testLdapConnectionService(token, ad);
			return res?.data || null;
		} catch (err) {
			// prefer backend-provided body when available
			const payload = err?.response?.data || err?.message || 'Failed to test LDAP connection';
			return rejectWithValue(payload);
		}
	}
);

export const testLdapAuthentication = createAsyncThunk(
	'domain/testLdapAuthentication',
	async ({ token, ad }, { rejectWithValue }) => {
		try {
			const res = await testLdapAuthenticationService(token, ad);
			return res?.data || null;
		} catch (err) {
			const payload = err?.response?.data || err?.message || 'Failed to test LDAP authentication';
			return rejectWithValue(payload);
		}
	}
);


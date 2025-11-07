import { createSlice } from '@reduxjs/toolkit';
import {
	fetchDomains,
	fetchDomainDetails,
	deleteDomain,
	syncUsers,
	createDomain,
	testLdapConnection,
	testLdapAuthentication,
	updateDomain,
	syncChangedUsers,
	unlinkUsers,
	removeImportedUsers,
} from './DomainThunks';

const initialState = {
	domains: [],
	domainDetails: null,
	loader: false,
	error: null,
	lastSyncResult: null,
	lastCreateResult: null,
	lastTestConnectionResult: null,
	lastTestAuthResult: null,
};

const domainSlice = createSlice({
	name: 'domain',
	initialState,
	reducers: {
		clearDomainState(state) {
			state.domains = [];
			state.domainDetails = null;
			state.loader = false;
			state.error = null;
			state.lastSyncResult = null;
		},
		clearDomainDetails(state) {
			state.domainDetails = null;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchDomains.pending, (state) => {
				state.loader = true;
				state.error = null;
			})
			.addCase(fetchDomains.fulfilled, (state, action) => {
				state.loader = false;
				state.domains = action.payload || [];
			})
			.addCase(fetchDomains.rejected, (state, action) => {
				state.loader = false;
				state.domains = [];
				state.error = action.payload || action.error?.message || 'Failed to fetch domains';
			})

			.addCase(fetchDomainDetails.pending, (state) => {
				state.loader = true;
				state.error = null;
				state.domainDetails = null;
			})
			.addCase(fetchDomainDetails.fulfilled, (state, action) => {
				state.loader = false;
				state.domainDetails = action.payload || null;
			})
			.addCase(fetchDomainDetails.rejected, (state, action) => {
				state.loader = false;
				state.domainDetails = null;
				state.error = action.payload || action.error?.message || 'Failed to fetch domain details';
			})

			.addCase(deleteDomain.pending, (state) => {
				state.loader = true;
				state.error = null;
			})
			.addCase(deleteDomain.fulfilled, (state, action) => {
				state.loader = false;
				state.domains = action.payload || [];
			})
			.addCase(deleteDomain.rejected, (state, action) => {
				state.loader = false;
				state.error = action.payload || action.error?.message || 'Failed to delete domain';
			})

			.addCase(syncUsers.pending, (state) => {
				state.loader = true;
				state.error = null;
				state.lastSyncResult = null;
			})
			.addCase(syncUsers.fulfilled, (state, action) => {
				state.loader = false;
				state.lastSyncResult = action.payload || null;
			})
			.addCase(syncUsers.rejected, (state, action) => {
				state.loader = false;
				state.lastSyncResult = null;
				state.error = action.payload || action.error?.message || 'Failed to sync users';
			});

		builder
			.addCase(updateDomain.pending, (state) => {
				state.loader = true;
				state.error = null;
			})
			.addCase(updateDomain.fulfilled, (state, action) => {
				state.loader = false;
				// update domains list if backend returned updated list
				if (action.payload?.data?.ldaps) state.domains = action.payload.data.ldaps;
				// optionally update domainDetails
				if (action.payload?.data?.domain) state.domainDetails = action.payload.data.domain;
			})
			.addCase(updateDomain.rejected, (state, action) => {
				state.loader = false;
				state.error = action.payload || action.error?.message || 'Failed to update domain';
			})
			.addCase(createDomain.pending, (state) => {
				state.loader = true;
				state.error = null;
			})
			.addCase(createDomain.fulfilled, (state, action) => {
				state.loader = false;
				state.lastCreateResult = action.payload || null;
				// if backend returned updated domains list under data.ldaps, try to update domains
				if (action.payload?.data?.ldaps) state.domains = action.payload.data.ldaps;
			})
			.addCase(createDomain.rejected, (state, action) => {
				state.loader = false;
				state.lastCreateResult = null;
				state.error = action.payload || action.error?.message || 'Failed to create domain';
			})

			.addCase(testLdapConnection.pending, (state) => {
				state.loader = true;
				state.error = null;
			})
			.addCase(testLdapConnection.fulfilled, (state, action) => {
				state.loader = false;
				state.lastTestConnectionResult = action.payload || null;
			})
			.addCase(testLdapConnection.rejected, (state, action) => {
				state.loader = false;
				state.lastTestConnectionResult = null;
				state.error = action.payload || action.error?.message || 'Failed to test connection';
			})

			.addCase(testLdapAuthentication.pending, (state) => {
				state.loader = true;
				state.error = null;
			})
			.addCase(testLdapAuthentication.fulfilled, (state, action) => {
				state.loader = false;
				state.lastTestAuthResult = action.payload || null;
			})
			.addCase(testLdapAuthentication.rejected, (state, action) => {
				state.loader = false;
				state.lastTestAuthResult = null;
				state.error = action.payload || action.error?.message || 'Failed to test authentication';
			});

			// handlers for other domain operations
			builder
				.addCase(syncChangedUsers.pending, (state) => {
					state.loader = true;
					state.error = null;
					state.lastSyncResult = null;
				})
				.addCase(syncChangedUsers.fulfilled, (state, action) => {
					state.loader = false;
					state.lastSyncResult = action.payload || null;
				})
				.addCase(syncChangedUsers.rejected, (state, action) => {
					state.loader = false;
					state.lastSyncResult = null;
					state.error = action.payload || action.error?.message || 'Failed to sync changed users';
				})
				.addCase(unlinkUsers.pending, (state) => {
					state.loader = true;
					state.error = null;
				})
				.addCase(unlinkUsers.fulfilled, (state, action) => {
					state.loader = false;
					// store last operation result
					state.lastSyncResult = action.payload || null;
				})
				.addCase(unlinkUsers.rejected, (state, action) => {
					state.loader = false;
					state.error = action.payload || action.error?.message || 'Failed to unlink users';
				})
				.addCase(removeImportedUsers.pending, (state) => {
					state.loader = true;
					state.error = null;
				})
				.addCase(removeImportedUsers.fulfilled, (state, action) => {
					state.loader = false;
					state.lastSyncResult = action.payload || null;
				})
				.addCase(removeImportedUsers.rejected, (state, action) => {
					state.loader = false;
					state.error = action.payload || action.error?.message || 'Failed to remove imported users';
				});
	},
});

export const { clearDomainState, clearDomainDetails } = domainSlice.actions;
export default domainSlice.reducer;


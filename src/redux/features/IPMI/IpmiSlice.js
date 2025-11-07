import { createSlice } from '@reduxjs/toolkit';
import { 
  fetchIpmiListThunk, 
  createIpmiServerThunk, 
  deleteIpmiServerThunk,
  updateIpmiServerThunk,
  fetchIpmiServerByIdThunk
} from './IpmiThunks';

const initialState = {
  ipmiList: [],
  selectedIpmi: null,
  loading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  deleteLoading: {},
  fetchByIdLoading: false,
};

const ipmiSlice = createSlice({
  name: 'ipmi',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedIpmi: (state) => {
      state.selectedIpmi = null;
    },
    setDeleteLoading: (state, action) => {
      const { ipmiId, isLoading } = action.payload;
      if (isLoading) {
        state.deleteLoading[ipmiId] = true;
      } else {
        delete state.deleteLoading[ipmiId];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch IPMI List
      .addCase(fetchIpmiListThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIpmiListThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.ipmiList = action.payload;
      })
      .addCase(fetchIpmiListThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create IPMI Server
      .addCase(createIpmiServerThunk.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createIpmiServerThunk.fulfilled, (state, action) => {
        state.createLoading = false;
        // Add the new IPMI server to the list if needed
        if (action.payload.data) {
          state.ipmiList.push(action.payload.data);
        }
      })
      .addCase(createIpmiServerThunk.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })
      // Update IPMI Server
      .addCase(updateIpmiServerThunk.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateIpmiServerThunk.fulfilled, (state, action) => {
        state.updateLoading = false;
        // Update the IPMI server in the list
        const updatedIpmi = action.payload.data;
        if (updatedIpmi) {
          const index = state.ipmiList.findIndex(ipmi => ipmi.id === updatedIpmi.id);
          if (index !== -1) {
            state.ipmiList[index] = updatedIpmi;
          }
        }
      })
      .addCase(updateIpmiServerThunk.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })
      // Delete IPMI Server
      .addCase(deleteIpmiServerThunk.pending, (state, action) => {
        const ipmiId = action.meta.arg.ipmiId;
        state.deleteLoading[ipmiId] = true;
        state.error = null;
      })
      .addCase(deleteIpmiServerThunk.fulfilled, (state, action) => {
        const ipmiId = action.meta.arg.ipmiId;
        delete state.deleteLoading[ipmiId];
        // Remove the IPMI server from the list
        state.ipmiList = state.ipmiList.filter(ipmi => ipmi.id !== ipmiId);
      })
      .addCase(deleteIpmiServerThunk.rejected, (state, action) => {
        const ipmiId = action.meta.arg.ipmiId;
        delete state.deleteLoading[ipmiId];
        state.error = action.payload;
      })
      // Fetch IPMI Server By ID
      .addCase(fetchIpmiServerByIdThunk.pending, (state) => {
        state.fetchByIdLoading = true;
        state.error = null;
      })
      .addCase(fetchIpmiServerByIdThunk.fulfilled, (state, action) => {
        state.fetchByIdLoading = false;
        state.selectedIpmi = action.payload;
      })
      .addCase(fetchIpmiServerByIdThunk.rejected, (state, action) => {
        state.fetchByIdLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedIpmi, setDeleteLoading } = ipmiSlice.actions;
export default ipmiSlice.reducer;
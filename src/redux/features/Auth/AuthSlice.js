import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  tokenParsed: null,
  refreshToken: null,
  loggedIn: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action) {
      state.token = action.payload.token;
      state.tokenParsed = action.payload.tokenParsed;
      state.refreshToken = action.payload.refreshToken;
      state.loggedIn = action.payload.loggedIn;
    },
    clearAuth(state) {
      state.token = null;
      state.tokenParsed = null;
      state.refreshToken = null;
      state.loggedIn = false;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
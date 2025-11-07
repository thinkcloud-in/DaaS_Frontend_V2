// Selectors for the auth slice
export const selectAuth = (state) => state.auth || {};
export const selectAuthToken = (state) => state.auth?.token || null;
export const selectAuthTokenParsed = (state) => state.auth?.tokenParsed || null;
export const selectAuthRefreshToken = (state) => state.auth?.refreshToken || null;
export const selectIsLoggedIn = (state) => !!state.auth?.loggedIn;

// Convenience selector returning commonly used pieces
export const selectAuthSummary = (state) => ({
  token: selectAuthToken(state),
  tokenParsed: selectAuthTokenParsed(state),
  refreshToken: selectAuthRefreshToken(state),
  loggedIn: selectIsLoggedIn(state),
});

export default selectAuth;

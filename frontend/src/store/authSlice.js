import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  user: null,
  roles: [],
  tenantId: null,
  isAuthenticated: false,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, user, roles, tenantId } = action.payload;
      state.token = token;
      state.user = user;
      state.roles = roles;
      state.tenantId = tenantId;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.roles = [];
      state.tenantId = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

import { createSlice } from '@reduxjs/toolkit';

const storedToken = localStorage.getItem('token');

let storedUser = null;
try {
  const raw = localStorage.getItem('user');
  storedUser = raw ? JSON.parse(raw) : null;
} catch {
  localStorage.removeItem('user');
}

const initialState = {
  token: storedToken || null,
  user: storedUser || null,
  isAuthenticated: !!storedToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      if (action.payload.user) {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    },

    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

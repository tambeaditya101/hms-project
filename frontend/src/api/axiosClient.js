import axios from "axios";
import { store } from "../store";
import { logout } from "../store/authSlice";

const api = axios.create({
  baseURL: "http://localhost:4000/api",
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    const tenantId = state.auth.tenantId;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (tenantId) {
      config.headers["x-tenant-id"] = tenantId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto logout on 401 (invalid/expired token)
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;

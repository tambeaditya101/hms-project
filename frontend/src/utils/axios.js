import axios from "axios";
import { store } from "../store/index.js";

const api = axios.create({
  baseURL: "http://localhost:4000/api",
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  const user = store.getState().auth.user;

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  } else {
    delete config.headers["Authorization"]; // 🔥 IMPORTANT
  }

  if (user?.tenantId) {
    config.headers["x-tenant-id"] = user.tenantId;
  } else {
    delete config.headers["x-tenant-id"]; // 🔥 IMPORTANT
  }

  return config;
});

export default api;

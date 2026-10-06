import axios from "axios";
import { getToken } from "./session";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  // No default Content-Type: axios sets JSON for plain objects on its own
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // For FormData, let the browser set "multipart/form-data; boundary=..."
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
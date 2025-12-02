import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// optional: global response interceptor
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // handle 401 refresh flow or global errors here
    return Promise.reject(err);
  }
);

export default api;

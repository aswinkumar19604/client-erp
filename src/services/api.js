import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://server-erp-3.onrender.com/api"
});

// Automatically attach JWT token to all API requests if it exists in storage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;
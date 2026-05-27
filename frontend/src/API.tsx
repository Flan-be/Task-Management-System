import axios from "axios";

console.log("API URL:", import.meta.env.VITE_API_URL);

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/";

const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
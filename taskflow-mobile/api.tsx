import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API = axios.create({
  baseURL: "https://task-management-system-hvnb.onrender.com/api/"
",
});

API.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
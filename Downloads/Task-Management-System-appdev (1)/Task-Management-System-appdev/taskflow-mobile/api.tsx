import axios from "axios";
import * as SecureStore from "expo-secure-store";

const IS_DEV = __DEV__;

const API = axios.create({
  baseURL: IS_DEV
    ? "http://10.0.2.2:8000/api/"
    : "https://task-management-system-hvnb.onrender.com/api/",
});

API.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
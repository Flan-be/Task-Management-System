import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API = axios.create({
  baseURL: "http://10.0.2.2:8000/api/", 
});

API.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access_token");  
  if (token) config.headers.Authorization = `JWT ${token}`;     
  return config;
});

export default API;
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const login = async (data: {
  email: string;
  password: string;
}) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const getMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

// ⭐ Fix updateProfile - Add debug logs and proper error handling
export const updateProfile = async (data: {
  name?: string;
  email?: string;
  password?: string;
}) => {
  console.log("📤 Sending update profile request:", data); // Debug log
  
  try {
    const res = await api.put("/auth/profile", data);
    console.log("✅ Update profile response:", res.data); // Debug log
    return res.data;
  } catch (error: any) {
    console.error("❌ Update profile error:", error.response?.data || error); // Debug log
    throw error;
  }
};

export default api;
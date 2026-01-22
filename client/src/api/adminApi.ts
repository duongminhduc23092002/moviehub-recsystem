import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const adminApi = axios.create({
  baseURL: `${API_URL}/admin`,
});

// ⭐ Thêm token vào header và debug logs
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 Admin API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params);
    return config;
  },
  (error) => {
    console.error("❌ Admin API Request Error:", error);
    return Promise.reject(error);
  }
);

// ⭐ Response interceptor for debugging
adminApi.interceptors.response.use(
  (response) => {
    console.log(`✅ Admin API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error(`❌ Admin API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============ Movies API ============
export const getAdminMovies = async (params?: { page?: number; limit?: number; search?: string }) => {
  const res = await adminApi.get("/movies", { params });
  return res.data;
};

export const getAdminMovie = async (id: number) => {
  const res = await adminApi.get(`/movies/${id}`);
  return res.data;
};

export const createMovie = async (data: any) => {
  const res = await adminApi.post("/movies", data);
  return res.data;
};

export const updateMovie = async (id: number, data: any) => {
  const res = await adminApi.put(`/movies/${id}`, data);
  return res.data;
};

export const deleteMovie = async (id: number) => {
  const res = await adminApi.delete(`/movies/${id}`);
  return res.data;
};

// ============ Genres API ============
export const getAdminGenres = async (params?: { page?: number; limit?: number; search?: string }) => {
  const res = await adminApi.get("/genres", { params });
  return res.data;
};

export const getAdminGenre = async (id: number) => {
  const res = await adminApi.get(`/genres/${id}`);
  return res.data;
};

export const createGenre = async (name: string) => {
  const res = await adminApi.post("/genres", { name });
  return res.data;
};

export const updateGenre = async (id: number, name: string) => {
  const res = await adminApi.put(`/genres/${id}`, { name });
  return res.data;
};

export const deleteGenre = async (id: number) => {
  const res = await adminApi.delete(`/genres/${id}`);
  return res.data;
};

// ============ Casts API ============
export const getAdminCasts = async (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
  const res = await adminApi.get("/casts", { params });
  return res.data;
};

export const getAdminCast = async (id: number) => {
  const res = await adminApi.get(`/casts/${id}`);
  return res.data;
};

export const createCast = async (data: any) => {
  const res = await adminApi.post("/casts", data);
  return res.data;
};

export const updateCast = async (id: number, data: any) => {
  const res = await adminApi.put(`/casts/${id}`, data);
  return res.data;
};

export const deleteCast = async (id: number) => {
  const res = await adminApi.delete(`/casts/${id}`);
  return res.data;
};

// ============ Users API ============
export const getAdminUsers = async (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
  const res = await adminApi.get("/users", { params });
  return res.data;
};

export const getAdminUser = async (id: number) => {
  const res = await adminApi.get(`/users/${id}`);
  return res.data;
};

export const createUser = async (data: any) => {
  const res = await adminApi.post("/users", data);
  return res.data;
};

export const updateUser = async (id: number, data: any) => {
  const res = await adminApi.put(`/users/${id}`, data);
  return res.data;
};

export const updateUserRole = async (id: number, role: string) => {
  const res = await adminApi.patch(`/users/${id}/role`, { role });
  return res.data;
};

export const deleteUser = async (id: number) => {
  const res = await adminApi.delete(`/users/${id}`);
  return res.data;
};

export default adminApi;
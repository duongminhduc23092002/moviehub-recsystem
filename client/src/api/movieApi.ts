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
    console.log("🔑 Token attached to request:", token.substring(0, 20) + "..."); // Debug log
  } else {
    console.warn("⚠️ No token found in localStorage");
  }
  
  return config;
});

// Log errors for debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ========== MOVIES API ==========

export const getMovies = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
  sort?: string; // ⭐ Add this
}) => {
  console.log("🔍 getMovies called with params:", params); // Debug log
  const res = await api.get("/movies", { params });
  return res.data;
};

export const getMovieById = async (id: number) => {
  const res = await api.get(`/movies/${id}`);
  return res.data;
};

export const getTopRatedMovies = async (limit: number = 10) => {
  const res = await api.get("/movies/top-rated", { params: { limit } });
  return res.data;
};

export const rateMovie = async (
  movieId: number,
  data: { score: number; comment?: string }
) => {
  const res = await api.post(`/movies/${movieId}/rate`, data);
  return res.data;
};

export const getMovieRatings = async (movieId: number) => {
  const res = await api.get(`/movies/${movieId}/ratings`);
  return res.data;
};

// ========== GENRES API ========== 
// ⭐ Changed to use public endpoint

export const getGenres = async () => {
  const res = await api.get("/movies/genres"); // Changed from /admin/genres
  return res.data;
};

// ========== WATCHLIST API ==========

export const getWatchlist = async () => {
  const res = await api.get("/watchlist");
  return res.data;
};

export const addToWatchlist = async (movieId: number) => {
  const res = await api.post(`/watchlist/${movieId}`);
  return res.data;
};

export const removeFromWatchlist = async (movieId: number) => {
  const res = await api.delete(`/watchlist/${movieId}`);
  return res.data;
};

export const checkInWatchlist = async (movieId: number) => {
  const res = await api.get(`/watchlist/${movieId}/check`);
  return res.data;
};
// ========== RECOMMENDATION API ==========

export const getRecommendedMovies = async () => {
  const res = await api.get("/recommendations");
  return res.data;
};
export default api;
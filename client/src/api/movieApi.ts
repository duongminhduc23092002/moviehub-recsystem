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
    console.log("✅ Token attached to request"); // Debug
  } else {
    console.error("❌ No token found!");
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
  genre?: string; // ⭐ ADD genre param
  sort?: string;
}) => {
  console.log("📡 API call to /movies with params:", params);
  const res = await api.get("/movies", { params });
  console.log("📬 API response:", res.data);
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

// ========== RATINGS API ==========

export const rateMovie = async (movieId: number, rating: number, comment?: string) => {
  const res = await api.post(`/movies/${movieId}/rate`, { rating, comment });
  return res.data;
};

export const getMovieRatings = async (movieId: number) => {
  const res = await api.get(`/movies/${movieId}/ratings`);
  return res.data;
};

export const getMyRating = async (movieId: number) => {
  const res = await api.get(`/movies/${movieId}/my-rating`);
  return res.data;
};

export const deleteMyRating = async (movieId: number) => {
  const res = await api.delete(`/movies/${movieId}/rate`);
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

// ⭐ NEW: Get rated movies
export const getRatedMovies = async () => {
  const res = await api.get("/watchlist/rated");
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
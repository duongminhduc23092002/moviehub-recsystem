import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../api/movieApi";
import { useAuth } from "./AuthContext";

interface WatchlistContextType {
  watchlist: number[]; // Array of movie IDs
  isInWatchlist: (movieId: number) => boolean;
  toggleWatchlist: (movieId: number) => Promise<void>;
  loading: boolean;
  refreshWatchlist: () => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWatchlist = async () => {
    if (!isAuthenticated) {
      setWatchlist([]);
      return;
    }

    try {
      setLoading(true);
      const response = await getWatchlist();
      
      // ⭐ Parse response correctly
      console.log("Watchlist API Response:", response); // Debug log
      
      // Handle both formats: { success: true, data: [...] } or direct array
      const movies = response.data || response;
      
      if (Array.isArray(movies)) {
        setWatchlist(movies.map((item: any) => item.id));
      } else {
        console.error("Invalid watchlist data format:", movies);
        setWatchlist([]);
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [isAuthenticated]);

  const isInWatchlist = (movieId: number) => {
    return watchlist.includes(movieId);
  };

  const toggleWatchlist = async (movieId: number) => {
    if (!isAuthenticated) {
      throw new Error("Please login to add to watchlist");
    }

    try {
      if (isInWatchlist(movieId)) {
        await removeFromWatchlist(movieId);
        setWatchlist((prev) => prev.filter((id) => id !== movieId));
      } else {
        await addToWatchlist(movieId);
        setWatchlist((prev) => [...prev, movieId]);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update watchlist");
    }
  };

  const refreshWatchlist = async () => {
    await fetchWatchlist();
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        isInWatchlist,
        toggleWatchlist,
        loading,
        refreshWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error("useWatchlist must be used within WatchlistProvider");
  }
  return context;
}
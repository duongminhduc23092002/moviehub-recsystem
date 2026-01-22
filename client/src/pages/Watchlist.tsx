import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getWatchlist } from "../api/movieApi";
import MovieCard from "../components/MovieCard";
import { useWatchlist } from "../context/WatchlistContext";

export default function Watchlist() {
  const { refreshWatchlist } = useWatchlist();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const response = await getWatchlist();
      
      // ⭐ Parse response correctly
      console.log("Watchlist page API Response:", response);
      
      // Handle both formats
      const data = response.data || response;
      
      if (Array.isArray(data)) {
        setMovies(data);
      } else {
        console.error("Invalid watchlist format:", data);
        setMovies([]);
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  return (
    <div className="min-h-screen bg-netflix-black pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-10 h-10 text-netflix-red" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <h1 className="text-4xl md:text-5xl font-black text-white">
              Danh sách yêu thích
            </h1>
          </div>
          <p className="text-lg text-netflix-light">
            {movies.length > 0 
              ? `Bạn có ${movies.length} phim trong danh sách yêu thích`
              : "Chưa có phim nào trong danh sách yêu thích"
            }
          </p>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-netflix-gray rounded-lg animate-pulse" />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-24 h-24 mx-auto text-netflix-gray mb-6" fill="none" 
                 stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-2xl font-bold text-white mb-2">
              Danh sách trống
            </h3>
            <p className="text-netflix-light mb-8">
              Bạn chưa thêm phim nào vào danh sách yêu thích
            </p>
            <Link to="/movies" className="btn-primary inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Khám phá phim
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {movies.map((movie, index) => (
              <div
                key={movie.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MovieCard
                  id={movie.id}
                  title={movie.title}
                  poster={movie.poster}
                  year={movie.year}
                  rating={movie.avgRating}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
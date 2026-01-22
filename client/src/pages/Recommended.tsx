import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRecommendedMovies } from "../api/movieApi";
import MovieCard from "../components/MovieCard";

interface Movie {
  id: number;
  title: string;
  description: string;
  poster: string;
  year: number;
  duration: number;
  avgRating: number;
  genres: { id: number; name: string }[];
  casts: { id: number; name: string; role: string }[];
}

export default function Recommended() {
  const { isAuthenticated } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecommendedMovies();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchRecommendedMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔄 Fetching recommendations...");
      const response = await getRecommendedMovies();
      console.log("✅ Recommendations loaded:", response);
      setMovies(response.data || []);
    } catch (err: any) {
      console.error("❌ Error fetching recommendations:", err);
      setError(err.response?.data?.message || "Không thể tải đề xuất phim");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-netflix-black pt-20 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-netflix-gray/50 to-transparent pb-12">
        {/* ...existing decorative background... */}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          {/* ...existing breadcrumb... */}

          {/* Header */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 
                          rounded-2xl flex items-center justify-center shadow-2xl 
                          shadow-purple-500/50 animate-pulse">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
              </svg>
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2">
                Đề xuất cho bạn
              </h1>
              <p className="text-lg text-netflix-light">
                {isAuthenticated 
                  ? "Phim được gợi ý dựa trên sở thích của bạn"
                  : "Đăng nhập để nhận đề xuất cá nhân hóa"
                }
              </p>
            </div>
          </div>

          {/* Info Cards - Only show when authenticated */}
          {isAuthenticated && !loading && !error && movies.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* ...existing info cards... */}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isAuthenticated ? (
          // Not Authenticated State
          <div className="text-center py-20 glass-card rounded-2xl">
            {/* ...existing not authenticated UI... */}
          </div>
        ) : loading ? (
          // Loading State
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-netflix-gray rounded-xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          // Error State
          <div className="text-center py-20 glass-card rounded-2xl">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-500 to-red-700 
                          rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Không thể tải đề xuất
            </h2>
            <p className="text-lg text-netflix-light mb-8">
              {error}
            </p>
            <button onClick={fetchRecommendedMovies} className="btn-primary">
              Thử lại
            </button>
          </div>
        ) : movies.length === 0 ? (
          // Empty State
          <div className="text-center py-20 glass-card rounded-2xl">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 
                          rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Chưa có đủ dữ liệu
            </h2>
            <p className="text-lg text-netflix-light mb-8">
              Hãy xem và đánh giá thêm phim để nhận được đề xuất cá nhân hóa
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/movies" className="btn-primary">
                Khám phá phim
              </Link>
              <Link to="/top" className="btn-secondary">
                Phim xếp hạng cao
              </Link>
            </div>
          </div>
        ) : (
          // Movies Grid
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {movies.map((movie, index) => (
              <div
                key={movie.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
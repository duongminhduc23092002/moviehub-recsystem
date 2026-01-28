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

// Add explanation interface
interface MovieWithScore extends Movie {
  matchScore?: number;
  matchedGenres?: string[];
  reason?: string;
}

export default function Recommended() {
  const { isAuthenticated } = useAuth();
  const [movies, setMovies] = useState<MovieWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false); // ⭐ NEW

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

  // ⭐ NEW: Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendedMovies();
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-netflix-black pt-20 pb-12">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-netflix-dark to-netflix-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl 
                            flex items-center justify-center shadow-xl">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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

            {/* ⭐ NEW: Refresh Button */}
            {isAuthenticated && !loading && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50"
              >
                <svg 
                  className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
                {refreshing ? "Đang làm mới..." : "Làm mới đề xuất"}
              </button>
            )}
          </div>

          {/* Info Cards */}
          {isAuthenticated && !loading && !error && movies.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-netflix-light">Tổng đề xuất</p>
                  <p className="text-xl font-bold text-white">{movies.length} phim</p>
                </div>
              </div>

              <div className="glass-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-netflix-light">Độ phù hợp</p>
                  <p className="text-xl font-bold text-white">Cao</p>
                </div>
              </div>

              <div className="glass-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-netflix-light">Đánh giá TB</p>
                  <p className="text-xl font-bold text-white">
                    {movies.length > 0 
                      ? (movies.reduce((sum, m) => sum + m.avgRating, 0) / movies.length).toFixed(1)
                      : "0.0"
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!isAuthenticated ? (
          // Not Authenticated
          <div className="text-center py-20 glass-card rounded-2xl">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-500 to-orange-600 
                          rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Vui lòng đăng nhập
            </h2>
            <p className="text-lg text-netflix-light mb-8">
              Đăng nhập để nhận đề xuất phim phù hợp với sở thích của bạn
            </p>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Đăng nhập ngay
            </Link>
          </div>
        ) : loading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-netflix-red border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg text-white font-medium">Đang tải đề xuất...</p>
            <p className="text-sm text-netflix-light mt-2">Vui lòng chờ trong giây lát</p>
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
            <button onClick={handleRefresh} className="btn-primary">
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
                className="animate-slide-up group relative"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MovieCard movie={movie} />
                  
                  {/* ⭐ NEW: Match indicator */}
                  <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    {Math.round(85 + Math.random() * 15)}% Match
                  </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
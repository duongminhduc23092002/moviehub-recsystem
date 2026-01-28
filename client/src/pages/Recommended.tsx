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

interface GroupedMovies {
  [genre: string]: Movie[];
}

export default function Recommended() {
  const { isAuthenticated } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [groupedMovies, setGroupedMovies] = useState<GroupedMovies>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getRecommendedMovies();
      
      if (response.success && response.data) {
        setMovies(response.data);
        groupMoviesByGenre(response.data);
      } else {
        setMovies([]);
        setGroupedMovies({});
      }
    } catch (err: any) {
      console.error("Error fetching recommendations:", err);
      setError(err.response?.data?.message || "Không thể tải đề xuất");
      setMovies([]);
      setGroupedMovies({});
    } finally {
      setLoading(false);
    }
  };

  // ⭐ NEW: Group movies by genre
  const groupMoviesByGenre = (moviesList: Movie[]) => {
    const grouped: GroupedMovies = {};

    moviesList.forEach((movie) => {
      movie.genres.forEach((genre) => {
        if (!grouped[genre.name]) {
          grouped[genre.name] = [];
        }
        // Avoid duplicates
        if (!grouped[genre.name].find(m => m.id === movie.id)) {
          grouped[genre.name].push(movie);
        }
      });
    });

    // Sort genres by number of movies (descending)
    const sortedGrouped = Object.keys(grouped)
      .sort((a, b) => grouped[b].length - grouped[a].length)
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {} as GroupedMovies);

    setGroupedMovies(sortedGrouped);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendations();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
          <p className="text-netflix-light">Đang tạo đề xuất cho bạn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black pt-20 pb-12">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-netflix-dark to-netflix-black py-16 mb-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" 
               style={{
                 backgroundImage: `radial-gradient(circle at 20% 50%, #E50914 0%, transparent 50%),
                                  radial-gradient(circle at 80% 50%, #E50914 0%, transparent 50%)`,
                 backgroundSize: '100px 100px',
                 animation: 'pulse 4s ease-in-out infinite'
               }} 
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 
                            rounded-2xl flex items-center justify-center flex-shrink-0">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
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

            {/* Refresh Button */}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="glass-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
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
                  <p className="text-sm text-netflix-light">Thể loại</p>
                  <p className="text-xl font-bold text-white">{Object.keys(groupedMovies).length} thể loại</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <Link to="/login" className="btn-primary">
              Đăng nhập ngay
            </Link>
          </div>
        ) : error ? (
          // Error State
          <div className="text-center py-20 glass-card rounded-2xl">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          // ⭐ NEW: Movies Grouped by Genre
          <div className="space-y-12">
            {Object.entries(groupedMovies).map(([genre, genreMovies]) => (
              <section key={genre}>
                {/* Genre Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-netflix-red/20 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-netflix-red" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{genre}</h2>
                    <span className="px-3 py-1 bg-netflix-dark rounded-full text-sm text-netflix-light">
                      {genreMovies.length} phim
                    </span>
                  </div>
                </div>

                {/* Movies Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {genreMovies.map((movie, index) => (
                    <div
                      key={movie.id}
                      className="animate-slide-up group relative"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <MovieCard movie={movie} />
                        
                      {/* Match indicator */}
                      <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        {Math.round(85 + Math.random() * 15)}% Match
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
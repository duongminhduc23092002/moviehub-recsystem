import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getWatchlist, getRatedMovies } from "../api/movieApi";
import MovieCard from "../components/MovieCard";

interface Movie {
  id: number;
  title: string;
  poster: string;
  year: number;
  avgRating: number;
  genres: { id: number; name: string }[];
}

interface RatedMovie extends Movie {
  userRating?: {
    id: number;
    score: number;
    comment: string | null;
    created_at: string;
  };
}

type TabType = 'liked' | 'rated';

export default function Watchlist() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('liked');
  
  const [likedMovies, setLikedMovies] = useState<Movie[]>([]);
  const [ratedMovies, setRatedMovies] = useState<RatedMovie[]>([]);
  
  const [loadingLiked, setLoadingLiked] = useState(true);
  const [loadingRated, setLoadingRated] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLikedMovies();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'rated' && ratedMovies.length === 0) {
      fetchRatedMovies();
    }
  }, [activeTab]);

  const fetchLikedMovies = async () => {
    try {
      setLoadingLiked(true);
      
      console.log("🔄 Fetching watchlist...");
      const response = await getWatchlist();
      
      console.log("📦 Watchlist response:", response);
      
      // Handle both formats
      const moviesData = response.data || response;
      
      if (Array.isArray(moviesData)) {
        console.log(`✅ Loaded ${moviesData.length} liked movies`);
        setLikedMovies(moviesData);
      } else {
        console.error("❌ Invalid response format:", response);
        setLikedMovies([]);
      }
    } catch (error: any) {
      console.error("❌ Error loading watchlist:", error);
      console.error("   Response:", error.response?.data);
      setLikedMovies([]);
    } finally {
      setLoadingLiked(false);
    }
  };

  const fetchRatedMovies = async () => {
    try {
      setLoadingRated(true);
      const response = await getRatedMovies();
      setRatedMovies(response.data || []);
    } catch (error) {
      console.error("Error loading rated movies:", error);
    } finally {
      setLoadingRated(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Vui lòng đăng nhập</h1>
          <p className="text-netflix-light mb-8">
            Bạn cần đăng nhập để xem danh sách yêu thích
          </p>
          <Link to="/login" className="btn-primary">Đăng nhập</Link>
        </div>
      </div>
    );
  }

  const movies = activeTab === 'liked' ? likedMovies : ratedMovies;
  const loading = activeTab === 'liked' ? loadingLiked : loadingRated;

  return (
    <div className="min-h-screen bg-netflix-black pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Bộ sưu tập của tôi</h1>
          <p className="text-lg text-netflix-light">
            {activeTab === 'liked' 
              ? likedMovies.length > 0 
                ? `Bạn có ${likedMovies.length} phim trong danh sách yêu thích`
                : "Chưa có phim nào trong danh sách yêu thích"
              : ratedMovies.length > 0
                ? `Bạn đã đánh giá ${ratedMovies.length} phim`
                : "Chưa đánh giá phim nào"
            }
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('liked')}
            className={`pb-4 px-6 font-semibold text-lg transition-all relative
              ${activeTab === 'liked' 
                ? 'text-white' 
                : 'text-netflix-light hover:text-white'
              }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill={activeTab === 'liked' ? 'currentColor' : 'none'} 
                   stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Yêu thích
              {likedMovies.length > 0 && (
                <span className="px-2 py-0.5 bg-netflix-red text-white text-xs rounded-full">
                  {likedMovies.length}
                </span>
              )}
            </div>
            {activeTab === 'liked' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-netflix-red rounded-t-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('rated')}
            className={`pb-4 px-6 font-semibold text-lg transition-all relative
              ${activeTab === 'rated' 
                ? 'text-white' 
                : 'text-netflix-light hover:text-white'
              }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill={activeTab === 'rated' ? 'currentColor' : 'none'}
                   stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Đã đánh giá
              {ratedMovies.length > 0 && (
                <span className="px-2 py-0.5 bg-yellow-500 text-black text-xs rounded-full">
                  {ratedMovies.length}
                </span>
              )}
            </div>
            {activeTab === 'rated' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500 rounded-t-full" />
            )}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          // Loading State
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-netflix-gray rounded-lg animate-pulse" />
            ))}
          </div>
        ) : movies.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <svg className="w-24 h-24 mx-auto text-netflix-gray mb-6" fill="none" 
                 stroke="currentColor" viewBox="0 0 24 24">
              {activeTab === 'liked' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              )}
            </svg>
            <h3 className="text-2xl font-bold text-white mb-2">
              {activeTab === 'liked' ? 'Danh sách trống' : 'Chưa có đánh giá'}
            </h3>
            <p className="text-netflix-light mb-8">
              {activeTab === 'liked' 
                ? 'Bạn chưa thêm phim nào vào danh sách yêu thích'
                : 'Bạn chưa đánh giá phim nào'
              }
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
          // Movies Grid
          <>
            {activeTab === 'rated' ? (
              // Rated Movies with Rating Info
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(ratedMovies as RatedMovie[]).map((movie, index) => (
                  <Link
                    key={movie.id}
                    to={`/movies/${movie.id}`}
                    className="glass-card p-4 hover:scale-105 transition-transform duration-300 
                             animate-slide-up group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex gap-4">
                      {/* Poster */}
                      <div className="w-32 h-48 flex-shrink-0 rounded-lg overflow-hidden bg-netflix-gray">
                        {movie.poster ? (
                          <img 
                            src={movie.poster} 
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-netflix-light" fill="none" 
                                 stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 
                                     group-hover:text-netflix-red transition-colors">
                          {movie.title}
                        </h3>

                        <div className="flex items-center gap-2 mb-2 text-sm text-netflix-light">
                          <span>{movie.year}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>{movie.avgRating.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* User's Rating */}
                        {movie.userRating && (
                          <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-yellow-400">Đánh giá của bạn:</span>
                              <div className="flex items-center gap-1">
                                {[...Array(10)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-3 h-3 ${
                                      i < movie.userRating!.score ? 'text-yellow-400' : 'text-netflix-gray'
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <span className="text-xs text-white ml-1">{movie.userRating.score}/10</span>
                              </div>
                            </div>
                            {movie.userRating.comment && (
                              <p className="text-sm text-netflix-light line-clamp-2 italic">
                                "{movie.userRating.comment}"
                              </p>
                            )}
                          </div>
                        )}

                        {/* Genres */}
                        <div className="flex flex-wrap gap-1">
                          {movie.genres.slice(0, 3).map((genre) => (
                            <span
                              key={genre.id}
                              className="px-2 py-1 bg-netflix-red/20 text-netflix-red text-xs 
                                       rounded-full border border-netflix-red/30"
                            >
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              // Liked Movies Grid (Original)
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {likedMovies.map((movie, index) => (
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
          </>
        )}
      </div>
    </div>
  );
}
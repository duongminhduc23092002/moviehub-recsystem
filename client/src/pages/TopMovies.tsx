import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTopRatedMovies } from "../api/movieApi";

interface Movie {
  id: number;
  title: string;
  description: string;
  poster: string;
  year: number;
  duration: number;
  avgRating: number;
  finalScore: number;
  ratingsCount: number;
  genres: { id: number; name: string }[];
  casts: { id: number; name: string; role: string }[];
}

export default function TopMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    fetchTopMovies();
  }, []);

  const fetchTopMovies = async () => {
    try {
      setLoading(true);
      const response = await getTopRatedMovies(10);
      setMovies(response.data || []);
    } catch (error) {
      console.error("Error loading top movies:", error);
    } finally {
      setLoading(false);
    }
  };

  // Medal colors for top 3
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return "from-yellow-400 to-yellow-600"; // Gold
      case 2: return "from-gray-300 to-gray-500"; // Silver
      case 3: return "from-orange-400 to-orange-600"; // Bronze
      default: return "from-netflix-gray to-netflix-dark";
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return "👑";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };


  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-netflix-dark to-netflix-black pt-24 pb-16">
        {/* ...existing code... */}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ...existing code... */}

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 
                              rounded-2xl flex items-center justify-center shadow-2xl 
                              shadow-yellow-500/50 animate-pulse">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
                  </svg>
                </div>

                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2">
                    Top 10 Phim Xuất Sắc
                  </h1>
                  <p className="text-lg text-netflix-light">
                    Xếp hạng dựa trên điểm tổng hợp (Final Score)
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap gap-6 mt-6">
                <div className="flex items-center gap-3 px-4 py-3 bg-netflix-dark/50 rounded-xl 
                              border border-yellow-500/30 backdrop-blur-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg 
                                flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-netflix-light">Điểm tối thiểu</div>
                    <div className="text-xl font-bold text-white">
                      {movies.length > 0 ? `${movies[movies.length - 1].finalScore}+` : '0.0'} ⭐
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 bg-netflix-dark/50 rounded-xl 
                              border border-blue-500/30 backdrop-blur-sm">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg 
                                flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-netflix-light">Tổng số phim</div>
                    <div className="text-xl font-bold text-white">{movies.length} phim</div>
                  </div>
                </div>
              </div>
            </div>

            {/* View Mode Toggle */}
            {/* ...existing code... */}
          </div>
        </div>
      </div>

      {/* Movies Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          // Loading State
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-48 bg-netflix-gray rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : movies.length === 0 ? (
          // Empty State
          <div className="text-center py-20 glass-card rounded-2xl">
            <div className="w-24 h-24 mx-auto mb-6 bg-netflix-gray rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-netflix-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Chưa có phim nào đủ điều kiện</h3>
            <p className="text-netflix-light mb-8">
              Chưa có phim nào có điểm final_score
            </p>
            <Link to="/movies" className="btn-primary inline-flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Khám phá phim
            </Link>
          </div>
        ) : viewMode === 'list' ? (
          // List View
          <div className="space-y-6">
            {movies.map((movie, index) => (
              <div
                key={movie.id}
                className="group relative overflow-hidden rounded-2xl bg-netflix-dark border border-white/10
                         hover:border-netflix-red/50 transition-all duration-500
                         hover:shadow-2xl hover:shadow-netflix-red/20 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row gap-6 p-6">
                  {/* Rank Badge */}
                  <div className="absolute top-0 left-0 z-10">
                    <div className={`relative w-20 h-20 bg-gradient-to-br ${getMedalColor(index + 1)} 
                                  rounded-br-3xl flex items-center justify-center shadow-2xl`}>
                      <div className="text-center">
                        <div className="text-3xl font-black text-white">
                          #{index + 1}
                        </div>
                        {getMedalIcon(index + 1) && (
                          <div className="text-2xl absolute -top-2 -right-2">
                            {getMedalIcon(index + 1)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Poster */}
                  <Link 
                    to={`/movies/${movie.id}`}
                    className="relative flex-shrink-0 w-full md:w-48 h-72 rounded-xl overflow-hidden 
                             border-2 border-transparent group-hover:border-netflix-red 
                             transition-all duration-500 md:ml-10"
                  >
                    {movie.poster ? (
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-netflix-gray flex items-center justify-center">
                        <svg className="w-16 h-16 text-netflix-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" />
                        </svg>
                      </div>
                    )}

                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                                  transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center
                                    transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/movies/${movie.id}`}>
                      <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 
                                   group-hover:text-netflix-red transition-colors duration-300">
                        {movie.title}
                      </h3>
                    </Link>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      {/* Final Score - Primary */}
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 
                                    rounded-xl border-2 border-yellow-500/40">
                        <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <div className="flex flex-col">
                          <span className="text-xs text-yellow-400 font-medium">Final Score</span>
                          <span className="text-white font-black text-xl">{movie.finalScore}</span>
                        </div>
                      </div>

                      {/* Average Rating */}
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 rounded-full 
                                    border border-yellow-500/30">
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-white font-bold text-lg">{movie.avgRating.toFixed(1)}</span>
                        <span className="text-yellow-400 text-sm">/ 5.0</span>
                      </div>

                      {/* Ratings Count */}
                      <div className="flex items-center gap-1.5 text-netflix-light">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                        <span className="text-sm">{movie.ratingsCount} đánh giá</span>
                      </div>

                      {/* Year */}
                      {movie.year && (
                        <div className="flex items-center gap-1.5 text-netflix-light">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm">{movie.year}</span>
                        </div>
                      )}

                      {/* Duration */}
                      {movie.duration && (
                        <div className="flex items-center gap-1.5 text-netflix-light">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm">{movie.duration} phút</span>
                        </div>
                      )}
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {movie.genres.slice(0, 4).map((genre) => (
                        <span
                          key={genre.id}
                          className="px-3 py-1 bg-netflix-red/20 text-netflix-red text-xs font-medium 
                                   rounded-full border border-netflix-red/30 hover:bg-netflix-red/30 
                                   transition-colors cursor-pointer"
                        >
                          {genre.name}
                        </span>
                      ))}
                      {movie.genres.length > 4 && (
                        <span className="px-3 py-1 bg-white/10 text-netflix-light text-xs rounded-full">
                          +{movie.genres.length - 4}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-netflix-light leading-relaxed line-clamp-2 mb-4">
                      {movie.description || "Chưa có mô tả"}
                    </p>

                    {/* Casts */}
                    {movie.casts.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-netflix-light flex-shrink-0" fill="none" 
                             stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-netflix-light line-clamp-1">
                          {movie.casts.slice(0, 3).map(c => c.name).join(", ")}
                          {movie.casts.length > 3 && ` +${movie.casts.length - 3}`}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 mt-4">
                      <Link
                        to={`/movies/${movie.id}`}
                        className="btn-primary flex items-center gap-2 text-sm"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Xem chi tiết
                      </Link>

                      <button className="btn-secondary flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Yêu thích
                      </button>

                      <button className="btn-secondary flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        Chia sẻ
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 border-2 border-netflix-red rounded-2xl opacity-0 
                              group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            ))}
          </div>
        ) : (
          // Grid View - tương tự list view nhưng layout grid
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie, index) => (
              <Link
                key={movie.id}
                to={`/movies/${movie.id}`}
                className="group relative animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Rank Badge */}
                <div className="absolute -top-3 -left-3 z-10">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getMedalColor(index + 1)} 
                                rounded-full flex items-center justify-center shadow-xl 
                                border-2 border-netflix-black`}>
                    <span className="text-white font-black text-lg">#{index + 1}</span>
                  </div>
                  {getMedalIcon(index + 1) && (
                    <span className="absolute -top-1 -right-1 text-xl">
                      {getMedalIcon(index + 1)}
                    </span>
                  )}
                </div>

                {/* Card */}
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-netflix-gray
                              border-2 border-transparent group-hover:border-netflix-red
                              transition-all duration-500 shadow-card group-hover:shadow-card-hover
                              transform group-hover:scale-105">
                  {/* Poster */}
                  {movie.poster ? (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-netflix-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" />
                      </svg>
                    </div>
                  )}

                  {/* Final Score Badge - TOP RIGHT */}
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-500/90 to-orange-500/90 
                                  backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-lg border border-yellow-400/30">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-white text-sm font-bold">{movie.finalScore}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm 
                                  px-2 py-0.5 rounded-lg">
                      <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-white text-xs font-bold">{movie.avgRating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/80 to-transparent
                                opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-bold text-base mb-2 line-clamp-2">
                        {movie.title}
                      </h3>
                      <p className="text-netflix-light text-xs mb-3">
                        {movie.year} • {movie.duration}p
                      </p>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-white text-netflix-black py-2 px-3 rounded-lg 
                                         text-sm font-semibold hover:bg-white/90 transition-colors
                                         flex items-center justify-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          Xem
                        </button>
                        <button className="p-2 bg-netflix-gray/80 text-white rounded-lg hover:bg-white/20 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer CTA */}
        {movies.length > 0 && (
          <div className="mt-16 text-center">
            <div className="inline-flex flex-col items-center gap-4 p-8 bg-netflix-dark/50 rounded-2xl 
                          border border-white/10 backdrop-blur-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-netflix-red to-red-700 rounded-full 
                            flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Khám phá thêm nhiều phim hay
                </h3>
                <p className="text-netflix-light mb-4">
                  Hàng ngàn bộ phim đang chờ bạn khám phá
                </p>
              </div>
              <Link to="/movies" className="btn-primary inline-flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 19l-7-7 7-7" />
                </svg>
                Xem tất cả phim
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}
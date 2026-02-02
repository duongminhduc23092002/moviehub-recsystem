import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getMovieById, getMovieRatings, getMyRating, rateMovie, deleteMyRating } from "../api/movieApi";
import { getSimilarMovies } from "../api/movieApi";
import { useAuth } from "../context/AuthContext";
import { useWatchlist } from "../context/WatchlistContext"; // ⭐ ADD THIS LINE
import RatingModal from "../components/RatingModal";
import TrailerModal from "../components/TrailerModal";
import MovieCard from "../components/MovieCard";

interface Movie {
  id: number;
  title: string;
  description: string;
  poster: string;
  year: number;
  duration: number;
  avgRating: number;
  ratingsCount: number;
  trailer_url?: string;
  genres: { id: number; name: string }[];
  casts: { id: number; name: string; role: string; avatar?: string }[];
}

interface Rating {
  id: string;
  userId: number;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isInWatchlist, toggleWatchlist } = useWatchlist(); // ⭐ Now works
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  
  // Rating states
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [myRating, setMyRating] = useState<{ rating: number; comment: string | null } | null>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // Similar movies
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Fetch movie data
  const fetchMovie = async () => {
    try {
      const movieId = Number(id);
      if (!id || isNaN(movieId) || movieId <= 0) {
        console.error("Invalid movie ID:", id);
        navigate("/movies");
        return;
      }

      setLoading(true);
      const response = await getMovieById(movieId);
      const movieData = response.data || response;

      if (!movieData || !movieData.id) {
        console.error("Invalid movie data:", movieData);
        navigate("/movies");
        return;
      }
      
      setMovie(movieData);
    } catch (error: any) {
      console.error("Error fetching movie:", error);
      if (error.response?.status === 404) {
        navigate("/movies");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMovie();
      fetchRatings();
      fetchSimilarMovies();  // ⭐ THÊM: Gọi fetch similar movies
      if (isAuthenticated) {
        fetchMyRating();
      }
    }
  }, [id, isAuthenticated]);

  const fetchRatings = async () => {
    try {
      const response = await getMovieRatings(Number(id!));
      setRatings(response.data || []);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  // ⭐ THÊM: Function fetch similar movies
  const fetchSimilarMovies = async () => {
    if (!id) return;
    
    try {
      setLoadingSimilar(true);
      const response = await getSimilarMovies(Number(id), 12);
      setSimilarMovies(response.data || []);
      console.log(`✅ Loaded ${response.data?.length || 0} similar movies`);
    } catch (error) {
      console.error("Error loading similar movies:", error);
      setSimilarMovies([]);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const fetchMyRating = async () => {
    try {
      const response = await getMyRating(Number(id!));
      setMyRating(response.data);
    } catch (error) {
      console.error("Error fetching my rating:", error);
    }
  };

  const handleRateSubmit = async (rating: number, comment: string) => {
    try {
      const movieId = Number(id!);
      
      // Validate movieId
      if (!movieId || isNaN(movieId)) {
        alert("ID phim không hợp lệ");
        return;
      }
      
      console.log("📤 Rating movie:", movieId, "with rating:", rating); // Debug
      
      await rateMovie(movieId, rating, comment);
      await fetchRatings();
      await fetchMyRating();
    } catch (error: any) {
      console.error("❌ Error in handleRateSubmit:", error);
      alert(error.response?.data?.message || "Không thể gửi đánh giá");
      throw error;
    }
  };

  const handleRateDelete = async () => {
    try {
      await deleteMyRating(Number(id!));
      await fetchRatings();
      setMyRating(null);
    } catch (error: any) {
      alert(error.response?.data?.message || "Không thể xóa đánh giá");
      throw error;
    }
  };

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      return;
    }

    if (!movie?.id) return;

    setIsAddingToWatchlist(true);
    try {
      await toggleWatchlist(movie.id);
    } catch (error: any) {
      alert(error.message || "Không thể cập nhật danh sách yêu thích");
    } finally {
      setIsAddingToWatchlist(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
          <p className="text-netflix-light">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Không tìm thấy phim</h1>
          <Link to="/movies" className="btn-primary">Quay lại</Link>
        </div>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(movie.id);
  const avgRating = movie.avgRating || 0;
  const ratingsCount = movie.ratingsCount || 0;

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Section */}
      <div className="relative h-[70vh] min-h-[600px]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${movie.poster || "/images/movie-placeholder.jpg"})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-netflix-black/80 to-transparent" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-2xl">
            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres?.map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 bg-netflix-red/20 text-netflix-red text-sm rounded-full 
                           border border-netflix-red/30"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              {movie.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-netflix-light mb-6">
              {/* Rating Display */}
              <div className="flex items-center gap-1">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-white font-bold text-lg">
                  {avgRating > 0 ? avgRating.toFixed(1) : "N/A"}
                </span>
                <span className="text-sm text-netflix-light">/10</span>
                <span className="text-sm">
                  ({ratingsCount} {ratingsCount === 1 ? "đánh giá" : "đánh giá"})
                </span>
              </div>

              {/* Year & Duration */}
              <span>{movie.year || "N/A"}</span>
              {movie.duration && <span>{movie.duration} phút</span>}
            </div>

            {/* Description */}
            <p className="text-lg text-netflix-light mb-8 max-w-2xl leading-relaxed">
              {movie.description}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4 flex-wrap">
              {/* Trailer Button */}
              {movie.trailer_url && (
                <button 
                  onClick={() => setShowTrailerModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Xem Trailer
                </button>
              )}
              
              {/* Watchlist Button */}
              <button 
                onClick={handleToggleWatchlist}
                disabled={isAddingToWatchlist}
                className={`btn-secondary flex items-center gap-2 transition-all duration-300
                  ${inWatchlist 
                    ? "bg-netflix-red/20 border-netflix-red text-netflix-red hover:bg-netflix-red/30 hover:border-netflix-red" 
                    : "hover:bg-white/30"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isAddingToWatchlist ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : inWatchlist ? (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span>Đã thêm vào yêu thích</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>Yêu thích</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      {movie.casts && movie.casts.length > 0 && (
        <section className="py-16 bg-netflix-dark/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-8">Diễn viên & Đạo diễn</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {movie.casts.map((cast) => (
                <div key={cast.id} className="text-center group">
                  <div className="aspect-square rounded-full overflow-hidden bg-netflix-gray mb-3 
                                transform transition-transform duration-300 group-hover:scale-105">
                    {cast.avatar ? (
                      <img 
                        src={cast.avatar} 
                        alt={cast.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-netflix-light" fill="none" 
                             stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-netflix-red 
                               transition-colors">
                    {cast.name}
                  </h3>
                  <p className="text-netflix-light text-xs">
                    {cast.role === "director" ? "Đạo diễn" : "Diễn viên"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Similar Movies Section */}
      <section className="py-16 bg-netflix-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-8">Phim tương tự</h2>
          
          {loadingSimilar ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-netflix-gray rounded-xl animate-pulse" />
              ))}
            </div>
          ) : similarMovies.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {similarMovies.map((movie, index) => (
                <div
                  key={movie.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass-card rounded-xl">
              <svg className="w-16 h-16 mx-auto text-netflix-light mb-4" fill="none" 
                   stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" />
              </svg>
              <p className="text-netflix-light">Không tìm thấy phim tương tự</p>
            </div>
          )}
        </div>
      </section>

      {/* Trailer Modal */}
      {showTrailerModal && movie.trailer_url && (
        <TrailerModal 
          trailerUrl={movie.trailer_url}
          movieTitle={movie.title}
          isOpen={showTrailerModal}
          onClose={() => setShowTrailerModal(false)}
        />
      )}

      {/* Ratings Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">
            Đánh giá ({ratings.length})
          </h2>
          {isAuthenticated && (
            <button
              onClick={() => setIsRatingModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {myRating ? "Sửa đánh giá" : "Viết đánh giá"}
            </button>
          )}
        </div>

        {/* My Rating */}
        {myRating && (
          <div className="glass-card p-6 mb-6 border-2 border-yellow-500/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 
                            flex items-center justify-center text-white font-bold">
                Bạn
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    {[...Array(10)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < myRating.rating ? "text-yellow-400" : "text-netflix-gray"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-white font-bold ml-2">{myRating.rating}/10</span>
                  </div>
                  <span className="text-yellow-400 text-sm font-semibold">Đánh giá của bạn</span>
                </div>
                {myRating.comment && (
                  <p className="text-netflix-light">{myRating.comment}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* All Ratings */}
        {ratings.length > 0 ? (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating.id} className="glass-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 
                                flex items-center justify-center text-white font-bold">
                    {rating.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white font-semibold">{rating.userName}</span>
                      <div className="flex gap-1">
                        {[...Array(10)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating.rating ? "text-yellow-400" : "text-netflix-gray"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-white font-bold ml-2">{rating.rating}/10</span>
                      </div>
                    </div>
                    {rating.comment && (
                      <p className="text-netflix-light">{rating.comment}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card rounded-xl">
            <svg className="w-16 h-16 mx-auto text-netflix-gray mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h3 className="text-xl font-bold text-white mb-2">Chưa có đánh giá</h3>
            <p className="text-netflix-light mb-6">
              Hãy là người đầu tiên đánh giá bộ phim này
            </p>
            {isAuthenticated && (
              <button
                onClick={() => setIsRatingModalOpen(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Viết đánh giá
              </button>
            )}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        movieTitle={movie.title}
        currentRating={myRating?.rating}
        currentComment={myRating?.comment || undefined}
        onSubmit={handleRateSubmit}
        onDelete={myRating ? handleRateDelete : undefined}
      />
    </div>
  );
}
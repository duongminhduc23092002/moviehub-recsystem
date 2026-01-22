import { useState } from "react";
import { Link } from "react-router-dom";

interface Props {
  movie?: {
    id: number;
    title: string;
    poster: string;
    year: number;
    avgRating: number | null;
  };
  // OR support individual props (backward compatible)
  id?: number;
  title?: string;
  poster?: string;
  year?: number;
  rating?: number | null;
}

export default function MovieCard({ movie, id, title, poster, year, rating }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // ⭐ Handle both formats: movie object or individual props
  const movieId = movie?.id || id;
  const movieTitle = movie?.title || title || "Untitled";
  const moviePoster = movie?.poster || poster || "/images/movie-placeholder.jpg";
  const movieYear = movie?.year || year;
  const movieRating = movie?.avgRating || rating;

  // ⭐ Validate ID
  if (!movieId || isNaN(movieId)) {
    console.error("Invalid movie ID:", { movie, id, movieId });
    return null;
  }

  return (
    <Link
      to={`/movies/${movieId}`}
      className="group relative block overflow-hidden rounded-lg 
               transform transition-all duration-500 ease-out
               hover:scale-105 hover:z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Container */}
      <div className="relative aspect-[2/3] bg-netflix-gray overflow-hidden rounded-lg
                    shadow-card group-hover:shadow-card-hover transition-shadow duration-500">
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-netflix-gray animate-pulse" />
        )}

        {/* Poster Image */}
        <img
          src={moviePoster}
          alt={movieTitle}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            console.error("Image load error:", moviePoster);
            e.currentTarget.src = "/images/movie-placeholder.jpg";
          }}
          className={`w-full h-full object-cover transition-all duration-700
                    group-hover:scale-110 group-hover:brightness-50
                    ${imageLoaded ? "opacity-100" : "opacity-0"}`}
        />

        {/* Rating Badge */}
        {movieRating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 
                        bg-netflix-black/80 backdrop-blur-sm px-2 py-1 rounded-md
                        transform transition-transform duration-300
                        group-hover:scale-110">
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white text-sm font-semibold">
              {movieRating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/60 to-transparent
                       transition-opacity duration-500
                       ${isHovered ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Title */}
            <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
              {movieTitle}
            </h3>

            {/* Year */}
            {movieYear && (
              <p className="text-netflix-light text-sm mb-3">
                {movieYear}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 transform transition-all duration-300 delay-100
                          translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
              <button className="flex-1 flex items-center justify-center gap-2 
                               bg-white text-netflix-black py-2 rounded-md
                               font-semibold text-sm hover:bg-white/90 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Xem ngay
              </button>
              <button className="p-2 bg-netflix-gray/80 text-white rounded-md 
                               hover:bg-white/20 transition-colors">
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
  );
}
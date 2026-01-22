import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMovies } from "../api/movieApi";
import MovieCard from "../components/MovieCard";

export default function Home() {
  const [featuredMovies, setFeaturedMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // ⭐ Parse response correctly
        const response = await getMovies({ limit: 6 });
        console.log("Home page API Response:", response); // Debug log
        
        // Handle API response format: { success: true, data: [...], meta: {...} }
        const movies = response.data || [];
        
        if (Array.isArray(movies)) {
          setFeaturedMovies(movies.slice(0, 6));
        } else {
          console.error("Invalid movies format:", movies);
          setFeaturedMovies([]);
        }
      } catch (err) {
        console.error("Error loading movies:", err);
        setFeaturedMovies([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("/images/home-bg.jpg")` }}
        >
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-netflix-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-netflix-black/50" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-2xl animate-fade-in">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-netflix-red/20 border border-netflix-red/30 
                          text-netflix-red px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-netflix-red rounded-full animate-pulse" />
              Đang thịnh hành
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Khám phá thế giới
              <span className="block text-netflix-red">điện ảnh</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-netflix-light mb-8 leading-relaxed">
              Hàng ngàn bộ phim hấp dẫn đang chờ bạn. Từ những bom tấn Hollywood 
              đến những kiệt tác điện ảnh châu Á.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link to="/movies" className="btn-primary flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Khám phá ngay
              </Link>
              <button className="btn-secondary flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tìm hiểu thêm
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
              <div>
                <div className="text-3xl font-bold text-white">10K+</div>
                <div className="text-sm text-netflix-light">Bộ phim</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">50M+</div>
                <div className="text-sm text-netflix-light">Lượt xem</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">4.9</div>
                <div className="text-sm text-netflix-light">Đánh giá</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Featured Movies Section */}
      <section className="relative z-10 -mt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Phim nổi bật
              </h2>
              <p className="text-netflix-light mt-1">
                Những bộ phim được yêu thích nhất
              </p>
            </div>
            <Link
              to="/movies"
              className="flex items-center gap-2 text-netflix-light hover:text-white 
                       transition-colors group"
            >
              Xem tất cả
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-netflix-gray rounded-lg animate-pulse" />
              ))}
            </div>
          ) : featuredMovies.length === 0 ? (
            <div className="text-center py-20 glass-card">
              <svg className="w-24 h-24 mx-auto text-netflix-gray mb-6" fill="none" 
                   stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" />
              </svg>
              <h3 className="text-2xl font-bold text-white mb-2">Chưa có phim nào</h3>
              <p className="text-netflix-light mb-6">
                Hệ thống đang được cập nhật. Vui lòng quay lại sau!
              </p>
              <Link to="/movies" className="btn-primary">
                Khám phá phim
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
              {featuredMovies.map((movie, index) => (
                <div
                  key={movie.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
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
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-b from-netflix-black to-netflix-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            Khám phá theo thể loại
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery", "Romance", "Science Fiction", "Thriller", "TV Movie", "War", "Western"].map(
              (genre, index) => (
                <Link
                  key={genre}
                  to={`/movies?genre=${genre}`}
                  className="group relative overflow-hidden rounded-lg aspect-video
                           bg-gradient-to-br from-netflix-gray to-netflix-dark
                           hover:from-netflix-red/20 hover:to-netflix-dark
                           border border-white/5 hover:border-netflix-red/30
                           transition-all duration-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-semibold text-white 
                                   group-hover:scale-110 transition-transform duration-300">
                      {genre}
                    </span>
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
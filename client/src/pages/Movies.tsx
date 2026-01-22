import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getMovies, getGenres } from "../api/movieApi";
import MovieCard from "../components/MovieCard";

interface Movie {
  id: number;
  title: string;
  poster: string;
  year: number;
  avgRating: number;
  genres: { id: number; name: string }[];
}

interface Genre {
  id: number;
  name: string;
}

type SortOption = 'latest' | 'rating' | 'title' | 'year';
type ViewMode = 'grid' | 'list';

export default function Movies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  const searchQuery = searchParams.get("search") || "";
  const selectedGenre = searchParams.get("genre") || "all";

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [currentPage, searchQuery, selectedGenre, sortBy]);

  const fetchGenres = async () => {
    try {
      const response = await getGenres();
      setGenres(response.data || []);
    } catch (error) {
      console.error("Error loading genres:", error);
    }
  };

  const fetchMovies = async () => {
  try {
    setLoading(true);

    const params: any = {
      page: currentPage,
      limit: viewMode === 'grid' ? 24 : 12,
      sort: sortBy, // ⭐ Make sure this is sent
    };

    if (searchQuery) {
      params.search = searchQuery;
    }

    if (selectedGenre !== "all") {
      params.genre = selectedGenre;
    }

    console.log("📤 Fetching movies with params:", params); // ⭐ Debug log

    const response = await getMovies(params);
    
    console.log("✅ Movies API Response:", response); // ⭐ Debug log
    
    setMovies(response.data || []);
    setTotalPages(response.meta?.totalPages || 1);
    setTotal(response.meta?.total || 0);
  } catch (error) {
    console.error("Error loading movies:", error);
    setMovies([]);
  } finally {
    setLoading(false);
  }
};

  const handleGenreChange = (genre: string) => {
    const newParams: any = { genre };
    if (searchQuery) {
      newParams.search = searchQuery;
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchParams({});
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'latest': return 'Mới nhất';
      case 'rating': return 'Đánh giá cao';
      case 'title': return 'Tên A-Z';
      case 'year': return 'Năm phát hành';
      default: return 'Mới nhất';
    }
  };

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-b from-netflix-dark to-netflix-black pt-24 pb-12">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
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
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-netflix-light mb-6">
            <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-white">Khám phá phim</span>
          </div>

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                {/* Movie Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-netflix-red to-red-700 
                              rounded-2xl flex items-center justify-center shadow-2xl 
                              shadow-netflix-red/50">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                </div>

                <div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2">
                    Khám phá phim
                  </h1>
                  <p className="text-lg text-netflix-light">
                    {total > 0 ? `${total} bộ phim đang chờ bạn` : "Đang tải..."}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-netflix-dark/50 rounded-lg border border-white/10">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-white text-sm font-medium">
                    {genres.length} thể loại
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-netflix-dark/50 rounded-lg border border-white/10">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" />
                  </svg>
                  <span className="text-white text-sm font-medium">
                    Trang {currentPage}/{totalPages}
                  </span>
                </div>
              </div>
            </div>

            {/* View Mode & Sort */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* View Mode Toggle */}
              <div className="flex gap-2 bg-netflix-dark/50 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-300 flex items-center gap-2
                    ${viewMode === 'grid' 
                      ? 'bg-netflix-red text-white shadow-lg' 
                      : 'text-netflix-light hover:text-white'
                    }`}
                  title="Chế độ lưới"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  <span className="hidden sm:inline">Lưới</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md font-medium transition-all duration-300 flex items-center gap-2
                    ${viewMode === 'list' 
                      ? 'bg-netflix-red text-white shadow-lg' 
                      : 'text-netflix-light hover:text-white'
                    }`}
                  title="Chế độ danh sách"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span className="hidden sm:inline">Danh sách</span>
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="appearance-none bg-netflix-dark/50 border border-white/10 text-white 
                           px-4 py-2 pr-10 rounded-lg font-medium cursor-pointer
                           hover:bg-netflix-dark transition-colors focus:outline-none focus:border-netflix-red"
                >
                  <option value="latest">Mới nhất</option>
                  <option value="rating">Đánh giá cao</option>
                  <option value="title">Tên A-Z</option>
                  <option value="year">Năm phát hành</option>
                </select>
                <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-netflix-light pointer-events-none"
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Genre Filter Pills */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-netflix-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Thể loại
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleGenreChange("all")}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                transform hover:scale-105
                ${selectedGenre === "all"
                  ? "bg-gradient-to-r from-netflix-red to-red-700 text-white shadow-lg shadow-netflix-red/50"
                  : "bg-netflix-dark text-netflix-light hover:bg-white/10 border border-white/10"
                }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Tất cả
              </span>
            </button>
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreChange(genre.name)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300
                  transform hover:scale-105
                  ${selectedGenre === genre.name
                    ? "bg-gradient-to-r from-netflix-red to-red-700 text-white shadow-lg shadow-netflix-red/50"
                    : "bg-netflix-dark text-netflix-light hover:bg-white/10 border border-white/10"
                  }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search Info Banner */}
        {searchQuery && (
          <div className="mb-8 flex items-center gap-4 p-6 bg-gradient-to-r from-netflix-red/20 to-transparent 
                        rounded-xl border border-netflix-red/30 animate-slide-up">
            <div className="w-12 h-12 bg-netflix-red/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-netflix-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold mb-1">
                Kết quả tìm kiếm: "{searchQuery}"
              </p>
              <p className="text-netflix-light text-sm">
                {total > 0 ? `Tìm thấy ${total} kết quả` : "Không tìm thấy kết quả nào"}
              </p>
            </div>
            <button
              onClick={handleClearSearch}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Xóa tìm kiếm
            </button>
          </div>
        )}

        {/* Movies Content */}
        {loading ? (
          // Loading State
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6"
            : "space-y-6"
          }>
            {[...Array(viewMode === 'grid' ? 24 : 12)].map((_, i) => (
              <div key={i} className={viewMode === 'grid'
                ? "aspect-[2/3] bg-netflix-gray rounded-xl animate-pulse"
                : "h-48 bg-netflix-gray rounded-xl animate-pulse"
              } />
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
            <h3 className="text-3xl font-bold text-white mb-3">
              {searchQuery 
                ? `Không tìm thấy phim với từ khóa "${searchQuery}"` 
                : selectedGenre !== "all"
                ? `Không có phim nào trong thể loại "${selectedGenre}"`
                : "Không có phim nào"
              }
            </h3>
            <p className="text-netflix-light text-lg mb-8">
              {searchQuery 
                ? "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc"
                : "Không tìm thấy phim nào phù hợp với bộ lọc của bạn"
              }
            </p>
            <div className="flex gap-4 justify-center">
              {searchQuery && (
                <button onClick={handleClearSearch} className="btn-primary flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Xóa tìm kiếm
                </button>
              )}
              {selectedGenre !== "all" && (
                <button onClick={() => handleGenreChange("all")} className="btn-secondary">
                  Xem tất cả phim
                </button>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 mb-12">
              {movies.map((movie, index) => (
                <div
                  key={movie.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-6">
                {/* Page Info */}
                <div className="text-center">
                  <p className="text-netflix-light text-sm">
                    Đang xem <span className="text-white font-semibold">{((currentPage - 1) * 24) + 1}</span> - <span className="text-white font-semibold">{Math.min(currentPage * 24, total)}</span> trong tổng số <span className="text-white font-semibold">{total}</span> phim
                  </p>
                </div>

                <div className="flex justify-center items-center gap-2 flex-wrap">
                  {/* First Page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed w-10 h-10 p-0 flex items-center justify-center"
                    title="Trang đầu"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Trang trước"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-all duration-300
                              ${page === currentPage
                                ? "bg-gradient-to-r from-netflix-red to-red-700 text-white shadow-lg shadow-netflix-red/50 scale-110"
                                : "bg-netflix-dark text-netflix-light hover:bg-white/10 hover:scale-105"
                              }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 3 || page === currentPage + 3) {
                        return (
                          <span 
                            key={page} 
                            className="flex items-center text-netflix-light px-2"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Trang sau"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed w-10 h-10 p-0 flex items-center justify-center"
                    title="Trang cuối"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Quick Jump */}
                {totalPages > 10 && (
                  <div className="flex items-center gap-3">
                    <label htmlFor="page-jump" className="text-netflix-light text-sm">
                      Chuyển đến:
                    </label>
                    <input
                      id="page-jump"
                      type="number"
                      min={1}
                      max={totalPages}
                      value={currentPage}
                      onChange={(e) => {
                        const page = parseInt(e.target.value);
                        if (page >= 1 && page <= totalPages) {
                          handlePageChange(page);
                        }
                      }}
                      className="w-20 px-3 py-2 bg-netflix-dark text-white rounded-lg 
                               border border-white/20 focus:border-netflix-red 
                               focus:outline-none text-center font-medium"
                    />
                    <span className="text-netflix-light text-sm">/ {totalPages}</span>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          // List View
          <>
            <div className="space-y-6 mb-12">
              {movies.map((movie, index) => (
                <Link
                  key={movie.id}
                  to={`/movies/${movie.id}`}
                  className="group flex flex-col sm:flex-row gap-6 p-6 bg-netflix-dark rounded-2xl 
                           border border-white/10 hover:border-netflix-red/50 
                           transition-all duration-500 hover:shadow-2xl hover:shadow-netflix-red/20
                           animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Poster */}
                  <div className="relative w-full sm:w-40 h-60 sm:h-56 flex-shrink-0 rounded-xl overflow-hidden
                               border-2 border-transparent group-hover:border-netflix-red transition-all duration-500">
                    <img
                      src={movie.poster || "/images/movie-placeholder.jpg"}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                                  transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center
                                    transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>

                    {/* Rating Badge */}
                    {movie.avgRating && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/80 backdrop-blur-sm 
                                    px-2 py-1 rounded-lg">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-white text-sm font-bold">{movie.avgRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-netflix-red 
                                   transition-colors line-clamp-2">
                        {movie.title}
                      </h3>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        {movie.year && (
                          <span className="flex items-center gap-1.5 text-netflix-light text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {movie.year}
                          </span>
                        )}
                        {movie.avgRating && (
                          <span className="flex items-center gap-1.5 text-yellow-400 text-sm font-semibold">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {movie.avgRating.toFixed(1)} / 5.0
                          </span>
                        )}
                      </div>

                      {/* Genres */}
                      <div className="flex flex-wrap gap-2">
                        {movie.genres.slice(0, 4).map((genre) => (
                          <span
                            key={genre.id}
                            className="px-3 py-1 bg-netflix-red/20 text-netflix-red text-xs font-medium 
                                     rounded-full border border-netflix-red/30"
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
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-4">
                      <button className="flex-1 flex items-center justify-center gap-2 bg-white text-netflix-black 
                                       py-2.5 px-4 rounded-lg font-semibold text-sm hover:bg-white/90 transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Chi tiết
                      </button>
                      <button className="p-2.5 bg-netflix-gray/80 text-white rounded-lg 
                                       hover:bg-white/20 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination for List View */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-6">
                <div className="text-center">
                  <p className="text-netflix-light text-sm">
                    Trang <span className="text-white font-semibold">{currentPage}</span> / <span className="text-white font-semibold">{totalPages}</span>
                  </p>
                </div>

                <div className="flex justify-center items-center gap-3">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Trang trước
                  </button>

                  <span className="px-6 py-2 bg-netflix-dark rounded-lg border border-white/10 text-white font-medium">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Trang sau
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
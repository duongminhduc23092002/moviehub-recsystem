import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getMovies, getGenres } from "../api/movieApi";

interface Movie {
  id: number;
  title: string;
  poster: string;
  year: number;
  avgRating: number;
  ratingsCount: number;
  genres: { id: number; name: string }[];
}

interface Genre {
  id: number;
  name: string;
}

type SortOption = 'latest' | 'rating' | 'title' | 'year';

export default function Movies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAllGenres, setShowAllGenres] = useState(false); // ⭐ NEW: Toggle để show tất cả genres
  
  const selectedGenre = searchParams.get("genre") || "all";
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [currentPage, selectedGenre, searchQuery, sortBy]);

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
      console.log("🔄 Fetching movies with params:", {
        page: currentPage,
        limit: 24,
        genre: selectedGenre !== "all" ? selectedGenre : undefined, // ✅ Correct
        search: searchQuery || undefined,
        sort: sortBy,
      });

      const response = await getMovies({
        page: currentPage,
        limit: 24,
        genre: selectedGenre !== "all" ? selectedGenre : undefined, // ✅ Sends genre name
        search: searchQuery || undefined,
        sort: sortBy,
      });
      
      console.log("✅ API response:", response);
      console.log("   Movies count:", response.data?.length);
      console.log("   Total:", response.meta?.total);
      
      setMovies(response.data || []);
      setTotal(response.meta?.total || 0);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (error) {
      console.error("❌ Error loading movies:", error);
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

  // ⭐ Lấy genres để hiển thị (6 đầu hoặc tất cả)
  const displayedGenres = showAllGenres ? genres : genres.slice(0, 6);

  return (
    <div className="min-h-screen bg-netflix-black pt-20 pb-12">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-b from-netflix-dark to-netflix-black py-16">
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
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-netflix-light mb-6">
            <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">Khám phá phim</span>
          </div>

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
                Khám phá phim
              </h1>
              <p className="text-lg text-netflix-light max-w-2xl">
                {total > 0 ? `${total} bộ phim đang chờ bạn` : "Đang tải..."}
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-netflix-dark/50 p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 flex items-center gap-2
                  ${viewMode === 'grid' 
                    ? 'bg-netflix-red text-white shadow-lg' 
                    : 'text-netflix-light hover:text-white'
                  }`}
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
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span className="hidden sm:inline">Danh sách</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between p-4 
                        bg-netflix-dark/30 backdrop-blur-lg rounded-xl border border-white/10">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <span className="text-sm text-netflix-light whitespace-nowrap">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="bg-netflix-dark border border-white/20 text-white px-4 py-2 rounded-lg 
                         font-medium cursor-pointer hover:bg-netflix-dark/80 transition-colors 
                         focus:outline-none focus:border-netflix-red w-full lg:w-auto"
              >
                <option value="latest">Mới nhất</option>
                <option value="rating">Đánh giá cao</option>
                <option value="title">Tên A-Z</option>
                <option value="year">Năm phát hành</option>
              </select>
            </div>

            {/* Genre Pills */}
            <div className="w-full lg:flex-1">
              <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
                <button
                  onClick={() => handleGenreChange("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                    ${selectedGenre === "all"
                      ? "bg-netflix-red text-white shadow-lg"
                      : "bg-netflix-dark/50 text-netflix-light hover:bg-white/10"
                    }`}
                >
                  Tất cả
                </button>
                
                {displayedGenres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => handleGenreChange(genre.name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                      ${selectedGenre === genre.name
                        ? "bg-netflix-red text-white shadow-lg"
                        : "bg-netflix-dark/50 text-netflix-light hover:bg-white/10"
                      }`}
                  >
                    {genre.name}
                  </button>
                ))}

                {/* ⭐ Toggle button để show/hide thêm genres */}
                {genres.length > 6 && (
                  <button
                    onClick={() => setShowAllGenres(!showAllGenres)}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                             bg-white/10 text-white hover:bg-white/20 border border-white/20
                             flex items-center gap-2"
                  >
                    {showAllGenres ? (
                      <>
                        <span>Thu gọn</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>Xem thêm ({genres.length - 6})</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-8 p-4 bg-netflix-dark/50 border border-white/10 rounded-xl flex items-center justify-between">
            <div>
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
              Xóa
            </button>
          </div>
        )}

        {/* Selected Genre Badge */}
        {selectedGenre !== "all" && (
          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-netflix-red/20 border border-netflix-red/50 
                          rounded-lg text-netflix-red">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="font-semibold">Thể loại: {selectedGenre}</span>
            </div>
            <button
              onClick={() => handleGenreChange("all")}
              className="text-netflix-light hover:text-white transition-colors text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Xóa bộ lọc
            </button>
          </div>
        )}

        {loading ? (
          // Loading State
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-netflix-gray rounded-xl animate-pulse" />
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
                <button onClick={handleClearSearch} className="btn-primary">
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
          // Grid View - Modern Cards
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-12">
              {movies.map((movie, index) => (
                <Link
                  key={movie.id}
                  to={`/movies/${movie.id}`}
                  className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-netflix-gray
                           transform transition-all duration-500 hover:scale-110 hover:z-10
                           animate-slide-up shadow-2xl hover:shadow-netflix-red/50"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* Poster Image */}
                  <div className="relative w-full h-full">
                    {movie.poster ? (
                      <img 
                        src={movie.poster} 
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-700 
                                 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-netflix-light" fill="none" 
                             stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" />
                        </svg>
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Rating Badge */}
                  {movie.avgRating > 0 && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 
                                  bg-black/90 backdrop-blur-sm px-3 py-1.5 rounded-full
                                  transform transition-all duration-300 group-hover:scale-110">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-white text-sm font-bold">{movie.avgRating.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 
                                transform translate-y-full group-hover:translate-y-0 
                                transition-transform duration-500">
                    <h3 className="text-white font-bold text-sm mb-2 line-clamp-2 
                                 drop-shadow-lg">
                      {movie.title}
                    </h3>
                    
                    <div className="flex items-center justify-between text-xs text-netflix-light mb-3">
                      <span>{movie.year}</span>
                      <span>•</span>
                      <span>{movie.ratingsCount} reviews</span>
                    </div>

                    {/* Genres */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {movie.genres.slice(0, 2).map((genre) => (
                        <span
                          key={genre.id}
                          className="px-2 py-0.5 bg-netflix-red/80 text-white text-xs rounded-full 
                                   backdrop-blur-sm"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <button className="flex-1 bg-white text-netflix-black py-2 rounded-lg 
                                       font-semibold text-xs hover:bg-white/90 transition-colors
                                       flex items-center justify-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Xem
                      </button>
                      <button className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg 
                                       hover:bg-white/30 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-6">
                <div className="text-center text-netflix-light text-sm">
                  <p>
                    Đang xem <span className="text-white font-semibold">{((currentPage - 1) * 24) + 1}</span> - <span className="text-white font-semibold">{Math.min(currentPage * 24, total)}</span> trong tổng số <span className="text-white font-semibold">{total}</span> phim
                  </p>
                </div>

                <div className="flex justify-center items-center gap-2 flex-wrap">
                  {/* First Page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed 
                             w-10 h-10 p-0 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed 
                             w-10 h-10 p-0 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300
                          ${currentPage === pageNum
                            ? "bg-netflix-red text-white shadow-lg scale-110"
                            : "bg-netflix-dark text-netflix-light hover:bg-white/10 hover:text-white"
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Page */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed 
                             w-10 h-10 p-0 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed 
                             w-10 h-10 p-0 flex items-center justify-center"
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
          // List View - Keep existing implementation
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
                  <div className="w-full sm:w-48 h-72 sm:h-64 flex-shrink-0 rounded-xl overflow-hidden 
                                bg-netflix-gray relative group">
                    {movie.poster ? (
                      <img 
                        src={movie.poster} 
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-700 
                                 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-netflix-light" fill="none" 
                             stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" />
                        </svg>
                      </div>
                    )}

                    {/* Rating Badge */}
                    {movie.avgRating > 0 && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 
                                    bg-black/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-white text-sm font-bold">{movie.avgRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-3 group-hover:text-netflix-red 
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
                        
                        {movie.avgRating > 0 && (
                          <span className="flex items-center gap-1.5 text-sm">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-yellow-400 font-semibold">{movie.avgRating.toFixed(1)}</span>
                            <span className="text-netflix-light">/ 10</span>
                          </span>
                        )}

                        <span className="flex items-center gap-1.5 text-netflix-light text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                          </svg>
                          {movie.ratingsCount} đánh giá
                        </span>
                      </div>

                      {/* Genres */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {movie.genres.map((genre) => (
                          <span
                            key={genre.id}
                            className="px-3 py-1.5 bg-netflix-red/20 text-netflix-red text-sm font-medium 
                                     rounded-full border border-netflix-red/30 hover:bg-netflix-red/30 
                                     transition-colors"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button className="flex-1 min-w-[200px] bg-white text-netflix-black py-3 px-6 
                                       rounded-xl font-bold hover:bg-white/90 transition-colors
                                       flex items-center justify-center gap-2 shadow-lg">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Xem chi tiết
                      </button>
                      <button className="p-3 bg-netflix-gray/80 text-white rounded-xl 
                                       hover:bg-white/20 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      <button className="p-3 bg-netflix-gray/80 text-white rounded-xl 
                                       hover:bg-white/20 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination for List View */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <div className="inline-flex gap-2 bg-netflix-dark/50 p-2 rounded-xl border border-white/10">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50"
                  >
                    ← Trước
                  </button>
                  <span className="px-4 py-2 text-white font-medium">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Sau →
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
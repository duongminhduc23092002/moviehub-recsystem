import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import DataTable from "../../components/admin/DataTable";
import Pagination from "../../components/admin/Pagination";
import Modal from "../../components/admin/Modal";
import { getAdminMovies, createMovie, updateMovie, deleteMovie, getAdminGenres, getAdminCasts } from "../../api/adminApi";

interface Movie {
  id: number;
  title: string;
  description?: string;
  poster?: string;
  year?: number;
  duration?: number;
  avgRating?: number;
  genres: { id: number; name: string }[];
  casts: { id: number; name: string; role: string }[];
}

interface Genre {
  id: number;
  name: string;
}

interface Cast {
  id: number;
  name: string;
  role: string;
}

export default function AdminMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    year: "",
    duration: "",
    poster: "",
    trailer_url: "",
    genreIds: [] as number[],
    castIds: [] as { personId: number; role: string }[],
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [allCasts, setAllCasts] = useState<Cast[]>([]);

  const [deleteModal, setDeleteModal] = useState<Movie | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMovies = async () => {
    console.log("🔄 Fetching movies for admin..."); // Debug log
    setLoading(true);
    try {
      const res = await getAdminMovies({ page, limit: 10, search });
      
      console.log("📬 Admin movies response:", res); // Debug log
      
      // Handle both response formats
      const moviesData = res.data || res;
      
      if (Array.isArray(moviesData)) {
        setMovies(moviesData);
        setTotalPages(res.meta?.totalPages || 1);
        console.log(`✅ Loaded ${moviesData.length} movies`); // Debug log
      } else {
        console.error("❌ Invalid movies data format:", res);
        setMovies([]);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error("❌ Error fetching movies:", error);
      console.error("Error details:", error.response?.data || error.message);
      setMovies([]);
      setTotalPages(1);
      
      // Show error to user
      alert(`Lỗi tải danh sách phim: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    console.log("🔄 Fetching genres and casts..."); // Debug log
    try {
      const [genresRes, castsRes] = await Promise.all([
        getAdminGenres({ limit: 100 }),
        getAdminCasts({ limit: 100 }),
      ]);
      
      console.log("📬 Genres response:", genresRes); // Debug log
      console.log("📬 Casts response:", castsRes); // Debug log
      
      setAllGenres(genresRes.data || []);
      setAllCasts(castsRes.data || []);
      
      console.log(`✅ Loaded ${genresRes.data?.length || 0} genres and ${castsRes.data?.length || 0} casts`);
    } catch (error: any) {
      console.error("❌ Error fetching options:", error);
      console.error("Error details:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [page, search]);

  useEffect(() => {
    fetchOptions();
  }, []);

  const openCreateModal = () => {
    setEditingMovie(null);
    setFormData({
      title: "",
      description: "",
      year: "",
      duration: "",
      poster: "",
      trailer_url: "",
      genreIds: [],
      castIds: [],
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (movie: Movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description || "",
      year: movie.year?.toString() || "",
      duration: movie.duration?.toString() || "",
      poster: movie.poster || "",
      trailer_url: "",
      genreIds: movie.genres?.map((g) => g.id) || [],
      castIds: movie.casts?.map((c) => ({ personId: c.id, role: c.role || "" })) || [],
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError("Vui lòng nhập tên phim");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        year: formData.year ? Number(formData.year) : undefined,
        duration: formData.duration ? Number(formData.duration) : undefined,
        poster: formData.poster || undefined,
        trailer_url: formData.trailer_url || undefined,
        genreIds: formData.genreIds,
        castIds: formData.castIds,
      };

      if (editingMovie) {
        await updateMovie(editingMovie.id, payload);
      } else {
        await createMovie(payload);
      }
      setIsModalOpen(false);
      fetchMovies();
    } catch (error: any) {
      setFormError(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await deleteMovie(deleteModal.id);
      setDeleteModal(null);
      fetchMovies();
    } catch (error: any) {
      alert(error.response?.data?.message || "Không thể xóa phim");
    } finally {
      setDeleting(false);
    }
  };

  const toggleGenre = (genreId: number) => {
    setFormData((prev) => ({
      ...prev,
      genreIds: prev.genreIds.includes(genreId)
        ? prev.genreIds.filter((id) => id !== genreId)
        : [...prev.genreIds, genreId],
    }));
  };

  const toggleCast = (personId: number) => {
    setFormData((prev) => ({
      ...prev,
      castIds: prev.castIds.some((c) => c.personId === personId)
        ? prev.castIds.filter((c) => c.personId !== personId)
        : [...prev.castIds, { personId, role: "" }],
    }));
  };

  const columns = [
    {
      key: "poster",
      label: "Poster",
      render: (value: string, row: Movie) => (
        <div className="w-16 h-24 rounded-lg bg-netflix-gray overflow-hidden flex-shrink-0">
          {value ? (
            <img src={value} alt={row.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-netflix-light">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" />
              </svg>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "title",
      label: "Tiêu đề",
      render: (value: string, row: Movie) => (
        <div>
          <p className="font-medium text-white">{value}</p>
          <p className="text-xs text-netflix-light mt-1">
            {row.year || "N/A"} • {row.duration ? `${row.duration} phút` : "N/A"}
          </p>
        </div>
      ),
    },
    {
      key: "genres",
      label: "Thể loại",
      render: (value: { name: string }[]) => (
        <div className="flex flex-wrap gap-1">
          {value?.slice(0, 2).map((g, i) => (
            <span key={i} className="px-2 py-0.5 bg-netflix-gray rounded text-xs text-white">
              {g.name}
            </span>
          ))}
          {value?.length > 2 && (
            <span className="text-netflix-light text-xs">+{value.length - 2}</span>
          )}
        </div>
      ),
    },
    {
      key: "avgRating",
      label: "Đánh giá",
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-white">{value?.toFixed(1) || "0.0"}</span>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Quản lý Phim" subtitle="Thêm, sửa, xóa các phim trong hệ thống">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm kiếm phim..."
            className="input-field pl-10 w-full sm:w-80"
          />
          <svg
            className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-netflix-light"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm phim mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-netflix-dark rounded-xl border border-white/10 overflow-hidden">
        <DataTable
          columns={columns}
          data={movies}
          loading={loading}
          onEdit={openEditModal}
          onDelete={(movie) => setDeleteModal(movie)}
          emptyMessage="Chưa có phim nào"
        />
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMovie ? "Sửa phim" : "Thêm phim mới"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-2">
          {formError && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {formError}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-netflix-light mb-2">
                Tên phim *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field w-full"
                placeholder="Nhập tên phim"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-netflix-light mb-2">Năm phát hành</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="input-field w-full"
                placeholder="2024"
                min="1900"
                max="2100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-netflix-light mb-2">
                Thời lượng (phút)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="input-field w-full"
                placeholder="120"
                min="1"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-netflix-light mb-2">URL Poster</label>
              <input
                type="text"
                value={formData.poster}
                onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                className="input-field w-full"
                placeholder="https://example.com/poster.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-netflix-light mb-2">URL Trailer</label>
              <input
                type="text"
                value={formData.trailer_url}
                onChange={(e) => setFormData({ ...formData, trailer_url: e.target.value })}
                className="input-field w-full"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-netflix-light mb-2">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field w-full h-24 resize-none"
                placeholder="Nhập mô tả phim..."
              />
            </div>
          </div>

          {/* Genres */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-netflix-light mb-3">Thể loại</label>
            <div className="flex flex-wrap gap-2">
              {allGenres.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => toggleGenre(genre.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                    ${formData.genreIds.includes(genre.id)
                      ? "bg-netflix-red text-white"
                      : "bg-netflix-gray text-netflix-light hover:bg-white/20"
                    }`}
                >
                  {genre.name}
                </button>
              ))}
              {allGenres.length === 0 && (
                <p className="text-netflix-light text-sm">Chưa có thể loại nào</p>
              )}
            </div>
          </div>

          {/* Casts */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-netflix-light mb-3">
              Diễn viên / Đạo diễn
            </label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {allCasts.map((cast) => (
                <button
                  key={cast.id}
                  type="button"
                  onClick={() => toggleCast(cast.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1
                    ${formData.castIds.some((c) => c.personId === cast.id)
                      ? "bg-blue-500 text-white"
                      : "bg-netflix-gray text-netflix-light hover:bg-white/20"
                    }`}
                >
                  {cast.name}
                  <span className="text-xs opacity-70">
                    ({cast.role === "director" ? "ĐD" : "DV"})
                  </span>
                </button>
              ))}
              {allCasts.length === 0 && (
                <p className="text-netflix-light text-sm">Chưa có diễn viên nào</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Hủy
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Đang lưu..." : editingMovie ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Xác nhận xóa"
        size="sm"
      >
        <p className="text-netflix-light mb-6">
          Bạn có chắc chắn muốn xóa phim{" "}
          <strong className="text-white">"{deleteModal?.title}"</strong>? Hành động này không thể
          hoàn tác.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteModal(null)} className="btn-secondary">
            Hủy
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-md"
          >
            {deleting ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
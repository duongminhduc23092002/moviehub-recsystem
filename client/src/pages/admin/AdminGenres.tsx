import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import DataTable from "../../components/admin/DataTable";
import Pagination from "../../components/admin/Pagination";
import Modal from "../../components/admin/Modal";
import { getAdminGenres, createGenre, updateGenre, deleteGenre } from "../../api/adminApi";

interface Genre {
  id: number;
  name: string;
  moviesCount: number;
}

export default function AdminGenres() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteModal, setDeleteModal] = useState<Genre | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchGenres = async () => {
    setLoading(true);
    try {
      const res = await getAdminGenres({ page, limit: 10, search });
      setGenres(res.data);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching genres:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, [page, search]);

  const openCreateModal = () => {
    setEditingGenre(null);
    setFormData({ name: "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (genre: Genre) => {
    setEditingGenre(genre);
    setFormData({ name: genre.name });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Vui lòng nhập tên thể loại");
      return;
    }

    setSaving(true);
    try {
      if (editingGenre) {
        await updateGenre(editingGenre.id, formData.name);
      } else {
        await createGenre(formData.name);
      }
      setIsModalOpen(false);
      fetchGenres();
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
      await deleteGenre(deleteModal.id);
      setDeleteModal(null);
      fetchGenres();
    } catch (error: any) {
      alert(error.response?.data?.message || "Không thể xóa thể loại");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Tên thể loại" },
    { 
      key: "moviesCount", 
      label: "Số phim",
      render: (value: number) => (
        <span className="px-2 py-1 bg-netflix-gray rounded-full text-xs">
          {value} phim
        </span>
      )
    },
  ];

  return (
    <AdminLayout title="Quản lý Thể loại" subtitle="Thêm, sửa, xóa các thể loại phim">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm kiếm thể loại..."
            className="input-field pl-10 w-full sm:w-80"
          />
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-netflix-light" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm thể loại
        </button>
      </div>

      {/* Table */}
      <div className="bg-netflix-dark rounded-xl border border-white/10 overflow-hidden">
        <DataTable
          columns={columns}
          data={genres}
          loading={loading}
          onEdit={openEditModal}
          onDelete={(genre) => setDeleteModal(genre)}
          emptyMessage="Chưa có thể loại nào"
        />
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGenre ? "Sửa thể loại" : "Thêm thể loại mới"}
        size="sm"
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {formError}
            </div>
          )}
          <div className="mb-6">
            <label className="block text-sm font-medium text-netflix-light mb-2">
              Tên thể loại
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ name: e.target.value })}
              className="input-field w-full"
              placeholder="Nhập tên thể loại"
              autoFocus
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Hủy
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Đang lưu..." : editingGenre ? "Cập nhật" : "Thêm mới"}
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
          Bạn có chắc chắn muốn xóa thể loại <strong className="text-white">"{deleteModal?.name}"</strong>?
          Hành động này không thể hoàn tác.
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
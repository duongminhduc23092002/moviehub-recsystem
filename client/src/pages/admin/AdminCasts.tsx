import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import DataTable from "../../components/admin/DataTable";
import Pagination from "../../components/admin/Pagination";
import Modal from "../../components/admin/Modal";
import { getAdminCasts, createCast, updateCast, deleteCast } from "../../api/adminApi";

interface Cast {
  id: number;
  name: string;
  role: "actor" | "director";
  avatar?: string;
  birthday?: string;
  biography?: string;
  moviesCount: number;
}

export default function AdminCasts() {
  const [casts, setCasts] = useState<Cast[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCast, setEditingCast] = useState<Cast | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "actor" as "actor" | "director",
    avatar: "",
    birthday: "",
    biography: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteModal, setDeleteModal] = useState<Cast | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCasts = async () => {
    setLoading(true);
    try {
      const res = await getAdminCasts({ page, limit: 10, search, role: roleFilter });
      setCasts(res.data);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching casts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCasts();
  }, [page, search, roleFilter]);

  const openCreateModal = () => {
    setEditingCast(null);
    setFormData({ name: "", role: "actor", avatar: "", birthday: "", biography: "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (cast: Cast) => {
    setEditingCast(cast);
    setFormData({
      name: cast.name,
      role: cast.role,
      avatar: cast.avatar || "",
      birthday: cast.birthday ? cast.birthday.split("T")[0] : "",
      biography: cast.biography || "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Vui lòng nhập tên");
      return;
    }

    setSaving(true);
    try {
      if (editingCast) {
        await updateCast(editingCast.id, formData);
      } else {
        await createCast(formData);
      }
      setIsModalOpen(false);
      fetchCasts();
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
      await deleteCast(deleteModal.id);
      setDeleteModal(null);
      fetchCasts();
    } catch (error: any) {
      alert(error.response?.data?.message || "Không thể xóa");
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: "avatar",
      label: "Ảnh",
      render: (value: string, row: Cast) => (
        <div className="w-12 h-12 rounded-lg bg-netflix-gray overflow-hidden">
          {value ? (
            <img src={value} alt={row.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-netflix-light text-lg font-bold">
              {row.name.charAt(0)}
            </div>
          )}
        </div>
      ),
    },
    { key: "name", label: "Tên" },
    {
      key: "role",
      label: "Vai trò",
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium
          ${value === "director" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}>
          {value === "director" ? "Đạo diễn" : "Diễn viên"}
        </span>
      ),
    },
    {
      key: "birthday",
      label: "Ngày sinh",
      render: (value: string) => value ? new Date(value).toLocaleDateString("vi-VN") : "-",
    },
    {
      key: "moviesCount",
      label: "Số phim",
      render: (value: number) => (
        <span className="px-2 py-1 bg-netflix-gray rounded-full text-xs">{value} phim</span>
      ),
    },
  ];

  return (
    <AdminLayout title="Quản lý Diễn viên / Đạo diễn" subtitle="Thêm, sửa, xóa thông tin diễn viên và đạo diễn">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm kiếm..."
              className="input-field pl-10 w-full sm:w-64"
            />
            <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-netflix-light"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="input-field"
          >
            <option value="">Tất cả vai trò</option>
            <option value="actor">Diễn viên</option>
            <option value="director">Đạo diễn</option>
          </select>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-netflix-dark rounded-xl border border-white/10 overflow-hidden">
        <DataTable
          columns={columns}
          data={casts}
          loading={loading}
          onEdit={openEditModal}
          onDelete={(cast) => setDeleteModal(cast)}
        />
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCast ? "Sửa thông tin" : "Thêm mới"}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          {formError && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {formError}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-netflix-light mb-2">Họ tên *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field w-full"
                placeholder="Nhập họ tên"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-netflix-light mb-2">Vai trò *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as "actor" | "director" })}
                className="input-field w-full"
              >
                <option value="actor">Diễn viên</option>
                <option value="director">Đạo diễn</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-netflix-light mb-2">URL Ảnh</label>
              <input
                type="text"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="input-field w-full"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-netflix-light mb-2">Ngày sinh</label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                className="input-field w-full"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-netflix-light mb-2">Tiểu sử</label>
            <textarea
              value={formData.biography}
              onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
              className="input-field w-full h-24 resize-none"
              placeholder="Nhập tiểu sử..."
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
              Hủy
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Đang lưu..." : editingCast ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Xác nhận xóa" size="sm">
        <p className="text-netflix-light mb-6">
          Bạn có chắc chắn muốn xóa <strong className="text-white">"{deleteModal?.name}"</strong>?
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteModal(null)} className="btn-secondary">Hủy</button>
          <button onClick={handleDelete} disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-md">
            {deleting ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
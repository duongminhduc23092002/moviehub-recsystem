import { useState, useEffect } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import DataTable from "../../components/admin/DataTable";
import Pagination from "../../components/admin/Pagination";
import Modal from "../../components/admin/Modal";
import { getAdminUsers, updateUserRole, deleteUser } from "../../api/adminApi";
import { useAuth } from "../../context/AuthContext";

interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
  // ❌ DELETE: Xóa ratingsCount
  // ratingsCount: number;
}

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [roleModal, setRoleModal] = useState<{ user: User; newRole: "user" | "admin" } | null>(null);
  const [deleteModal, setDeleteModal] = useState<User | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers({ page, limit: 10, search, role: roleFilter });
      setUsers(res.data);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

  const handleRoleChange = async () => {
    if (!roleModal) return;
    setProcessing(true);
    try {
      await updateUserRole(roleModal.user.id, roleModal.newRole);
      setRoleModal(null);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || "Không thể thay đổi quyền");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setProcessing(true);
    try {
      await deleteUser(deleteModal.id);
      setDeleteModal(null);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || "Không thể xóa người dùng");
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Tên" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Quyền",
      render: (value: string, row: User) => (
        <select
          value={value}
          onChange={(e) => {
            if (row.id === currentUser?.id) {
              alert("Bạn không thể thay đổi quyền của chính mình!");
              return;
            }
            setRoleModal({ user: row, newRole: e.target.value as "user" | "admin" });
          }}
          className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer
            ${value === "admin" 
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-blue-500/20 text-blue-400"}`}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      ),
    },
    {
      key: "created_at",
      label: "Ngày tạo",
      render: (value: string) => new Date(value).toLocaleDateString("vi-VN"),
    },
  ];

  return (
    <AdminLayout title="Quản lý Người dùng" subtitle="Xem và quản lý tài khoản người dùng">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm theo tên hoặc email..."
              className="input-field pl-10 w-full sm:w-80"
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
            <option value="">Tất cả quyền</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-netflix-dark rounded-xl border border-white/10 overflow-hidden">
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          onDelete={(user) => {
            if (user.id === currentUser?.id) {
              alert("Bạn không thể xóa tài khoản của chính mình!");
              return;
            }
            setDeleteModal(user);
          }}
        />
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Role Change Confirmation Modal */}
      <Modal
        isOpen={!!roleModal}
        onClose={() => setRoleModal(null)}
        title="Xác nhận thay đổi quyền"
        size="sm"
      >
        <p className="text-netflix-light mb-6">
          Bạn có chắc chắn muốn thay đổi quyền của <strong className="text-white">"{roleModal?.user.name}"</strong> 
          thành <strong className={roleModal?.newRole === "admin" ? "text-yellow-400" : "text-blue-400"}>
            {roleModal?.newRole === "admin" ? "Admin" : "User"}
          </strong>?
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setRoleModal(null)} className="btn-secondary">Hủy</button>
          <button onClick={handleRoleChange} disabled={processing} className="btn-primary">
            {processing ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Xác nhận xóa" size="sm">
        <p className="text-netflix-light mb-6">
          Bạn có chắc chắn muốn xóa tài khoản <strong className="text-white">"{deleteModal?.name}"</strong>?
          Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteModal(null)} className="btn-secondary">Hủy</button>
          <button onClick={handleDelete} disabled={processing}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-md">
            {processing ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
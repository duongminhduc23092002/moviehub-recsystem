import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../api/authApi";
import { getWatchlist } from "../api/movieApi";

interface Movie {
  id: number;
  title: string;
  poster: string;
  year: number;
  avgRating: number;
}

interface UserStats {
  watchlistCount: number;
  favoriteGenre: string;
  joinedDays: number;
}

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'activity'>('info');
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // Change Password State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // User Stats
  const [stats, setStats] = useState<UserStats>({
    watchlistCount: 0,
    favoriteGenre: "Chưa có",
    joinedDays: 0,
  });
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      setLoadingStats(true);
      
      // Fetch watchlist
      const watchlistRes = await getWatchlist();
      const watchlistMovies = watchlistRes.data || [];
      
      // Calculate stats
      const joinedDate = new Date(user?.created_at || Date.now());
      const daysSinceJoined = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      setStats({
        watchlistCount: watchlistMovies.length,
        favoriteGenre: "Chưa có", // TODO: Calculate from watchlist
        joinedDays: daysSinceJoined,
      });

      // Get recent movies (top 6)
      setRecentMovies(watchlistMovies.slice(0, 6));
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

   const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    console.log("🔄 Starting profile update..."); // Debug log

    // Validation
    if (!formData.name.trim()) {
      setFormError("Vui lòng nhập tên");
      return;
    }

    if (!formData.email.trim()) {
      setFormError("Vui lòng nhập email");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setFormError("Email không hợp lệ");
      return;
    }

    setSaving(true);
    try {
      console.log("📨 Calling updateProfile with:", {
        name: formData.name.trim(),
        email: formData.email.trim(),
      }); // Debug log

      const response = await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

      console.log("📬 Response received:", response); // Debug log

      if (response.success) {
        // Update user in context
        updateUser(response.data);
        
        setFormSuccess("Cập nhật thông tin thành công!");
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setFormSuccess(""), 3000);
      } else {
        setFormError(response.message || "Cập nhật thất bại");
      }
    } catch (error: any) {
      console.error("💥 Update error:", error); // Debug log
      
      const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra";
      setFormError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordData.currentPassword) {
      setPasswordError("Vui lòng nhập mật khẩu hiện tại");
      return;
    }

    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return;
    }

    setChangingPassword(true);
    try {
      const response = await updateProfile({
        password: passwordData.newPassword,
      });

      if (response.success) {
        setPasswordSuccess("Đổi mật khẩu thành công!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
        setTimeout(() => setPasswordSuccess(""), 3000);
      }
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!")) {
      return;
    }

    // TODO: Implement delete account API
    alert("Tính năng xóa tài khoản đang được phát triển");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-netflix-black pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-netflix-light mb-4">
            <span>Trang chủ</span>
            <span>/</span>
            <span className="text-white">Hồ sơ</span>
          </div>
          <h1 className="text-4xl font-black text-white">Hồ sơ của tôi</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - User Card */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4
                              ${isAdmin 
                                ? "bg-gradient-to-br from-yellow-400 to-orange-500" 
                                : "bg-gradient-to-br from-netflix-red to-red-700"
                              }`}>
                  {getInitials(user?.name || "U")}
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
                <p className="text-sm text-netflix-light mb-3">{user?.email}</p>
                {isAdmin && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold 
                                 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    ADMINISTRATOR
                  </span>
                )}
              </div>

              {/* Quick Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-netflix-dark/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span className="text-sm text-netflix-light">Watchlist</span>
                  </div>
                  <span className="text-white font-bold">{stats.watchlistCount}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-netflix-dark/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-netflix-light">Đã tham gia</span>
                  </div>
                  <span className="text-white font-bold">{stats.joinedDays} ngày</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 
                           bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 
                           transition-colors border border-red-500/30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="glass-card p-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300
                    ${activeTab === 'info'
                      ? 'bg-netflix-red text-white shadow-lg'
                      : 'text-netflix-light hover:bg-white/10'
                    }`}
                >
                  <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Thông tin
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300
                    ${activeTab === 'security'
                      ? 'bg-netflix-red text-white shadow-lg'
                      : 'text-netflix-light hover:bg-white/10'
                    }`}
                >
                  <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Bảo mật
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-300
                    ${activeTab === 'activity'
                      ? 'bg-netflix-red text-white shadow-lg'
                      : 'text-netflix-light hover:bg-white/10'
                    }`}
                >
                  <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Hoạt động
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'info' && (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Thông tin cá nhân</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Chỉnh sửa
                    </button>
                  )}
                </div>

                {formSuccess && (
                  <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400">
                    {formSuccess}
                  </div>
                )}

                {formError && (
                  <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile}>
                  <div className="space-y-4">
                    <div>
                      <label className="label">Họ tên</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!isEditing}
                        className="input-field disabled:opacity-50"
                        required
                      />
                    </div>

                    <div>
                      <label className="label">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                        className="input-field disabled:opacity-50"
                        required
                      />
                    </div>

                    <div>
                      <label className="label">Vai trò</label>
                      <div className="flex items-center gap-2">
                        <span className={`px-4 py-2 rounded-lg font-medium
                          ${isAdmin 
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" 
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          }`}>
                          {isAdmin ? "Administrator" : "Người dùng"}
                        </span>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              name: user?.name || "",
                              email: user?.email || "",
                            });
                            setFormError("");
                          }}
                          className="btn-secondary flex-1"
                        >
                          Hủy
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="btn-primary flex-1 disabled:opacity-50"
                        >
                          {saving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Change Password */}
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">Đổi mật khẩu</h3>
                      <p className="text-sm text-netflix-light mt-1">
                        Cập nhật mật khẩu để bảo mật tài khoản của bạn
                      </p>
                    </div>
                    {!showPasswordForm && (
                      <button
                        onClick={() => setShowPasswordForm(true)}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Đổi mật khẩu
                      </button>
                    )}
                  </div>

                  {passwordSuccess && (
                    <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400">
                      {passwordSuccess}
                    </div>
                  )}

                  {passwordError && (
                    <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
                      {passwordError}
                    </div>
                  )}

                  {showPasswordForm && (
                    <form onSubmit={handleChangePassword}>
                      <div className="space-y-4">
                        <div>
                          <label className="label">Mật khẩu hiện tại</label>
                          <input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="input-field"
                            required
                          />
                        </div>

                        <div>
                          <label className="label">Mật khẩu mới</label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="input-field"
                            minLength={6}
                            required
                          />
                          <p className="text-xs text-netflix-light mt-1">
                            Mật khẩu phải có ít nhất 6 ký tự
                          </p>
                        </div>

                        <div>
                          <label className="label">Xác nhận mật khẩu mới</label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="input-field"
                            required
                          />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setShowPasswordForm(false);
                              setPasswordData({
                                currentPassword: "",
                                newPassword: "",
                                confirmPassword: "",
                              });
                              setPasswordError("");
                            }}
                            className="btn-secondary flex-1"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            disabled={changingPassword}
                            className="btn-primary flex-1 disabled:opacity-50"
                          >
                            {changingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>

                {/* Delete Account */}
                <div className="glass-card p-6 border-2 border-red-500/30">
                  <h3 className="text-xl font-bold text-white mb-2">Vùng nguy hiểm</h3>
                  <p className="text-sm text-netflix-light mb-4">
                    Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg 
                             hover:bg-red-500/30 transition-colors border border-red-500/30
                             flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Xóa tài khoản
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                {/* Recent Watchlist */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Phim yêu thích gần đây</h3>
                  {loadingStats ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-netflix-gray rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : recentMovies.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {recentMovies.map((movie) => (
                        <div key={movie.id} className="group relative">
                          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-netflix-gray">
                            {movie.poster ? (
                              <img
                                src={movie.poster}
                                alt={movie.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-netflix-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="mt-2">
                            <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                            {movie.year && (
                              <p className="text-xs text-netflix-light">{movie.year}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 mx-auto text-netflix-gray mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                      <p className="text-netflix-light">Chưa có phim nào trong watchlist</p>
                    </div>
                  )}
                </div>

                {/* Activity Timeline */}
                <div className="glass-card p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Hoạt động gần đây</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-netflix-dark/50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Đăng ký tài khoản</p>
                        <p className="text-sm text-netflix-light">
                          {stats.joinedDays} ngày trước
                        </p>
                      </div>
                    </div>

                    {stats.watchlistCount > 0 && (
                      <div className="flex items-start gap-4 p-4 bg-netflix-dark/50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">Đã thêm {stats.watchlistCount} phim vào watchlist</p>
                          <p className="text-sm text-netflix-light">Hoạt động gần đây</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
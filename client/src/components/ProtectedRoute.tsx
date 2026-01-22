import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, loading, user } = useAuth();
  const location = useLocation();

  console.log("🔐 ProtectedRoute check:", { 
    isAuthenticated, 
    isAdmin, 
    requireAdmin, 
    loading,
    userRole: user?.role 
  }); // Debug log

  // Đang load, hiển thị loading
  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-netflix-red border-t-transparent 
                        rounded-full animate-spin" />
          <p className="text-netflix-light">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!isAuthenticated) {
    console.log("❌ Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Yêu cầu admin nhưng không phải admin
  if (requireAdmin && !isAdmin) {
    console.log("❌ Require admin but user is not admin");
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-white mb-2">Truy cập bị từ chối</h1>
          <p className="text-netflix-light mb-6">
            Bạn không có quyền truy cập trang này. Chỉ Administrator mới được phép.
          </p>
          <div className="flex gap-3 justify-center">
            <a href="/" className="btn-primary">Về trang chủ</a>
            <button 
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
              className="btn-secondary"
            >
              Đăng nhập tài khoản khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log("✅ Access granted");
  return <>{children}</>;
}
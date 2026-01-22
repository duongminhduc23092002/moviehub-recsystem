import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { path: "/admin/movies", label: "Phim", icon: "M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" },
    { path: "/admin/genres", label: "Thể loại", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
    { path: "/admin/casts", label: "Diễn viên", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { path: "/admin/users", label: "Người dùng", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-netflix-black pt-20">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 min-h-[calc(100vh-5rem)] bg-netflix-dark border-r border-white/10">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 
                            flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-yellow-400">Administrator</p>
              </div>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive(item.path)
                      ? "bg-netflix-red text-white"
                      : "text-netflix-light hover:bg-white/10 hover:text-white"
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-netflix-light mt-1">{subtitle}</p>}
          </div>

          {/* Content */}
          {children}
        </main>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { getAdminMovies, getAdminGenres, getAdminCasts, getAdminUsers } from "../../api/adminApi";

interface Stats {
  movies: number;
  genres: number;
  casts: number;
  users: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ movies: 0, genres: 0, casts: 0, users: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [moviesRes, genresRes, castsRes, usersRes] = await Promise.all([
          getAdminMovies({ limit: 1 }),
          getAdminGenres({ limit: 1 }),
          getAdminCasts({ limit: 1 }),
          getAdminUsers({ limit: 1 }),
        ]);
        setStats({
          movies: moviesRes.meta?.total || 0,
          genres: genresRes.meta?.total || 0,
          casts: castsRes.meta?.total || 0,
          users: usersRes.meta?.total || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const menuItems = [
    {
      title: "Quản lý Phim",
      description: "Thêm, sửa, xóa phim",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      ),
      link: "/admin/movies",
      count: loading ? "..." : `${stats.movies} phim`,
      color: "from-red-500 to-pink-500",
    },
    {
      title: "Quản lý Thể loại",
      description: "Thêm, sửa, xóa thể loại",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      link: "/admin/genres",
      count: loading ? "..." : `${stats.genres} thể loại`,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Quản lý Diễn viên",
      description: "Thêm, sửa, xóa diễn viên/đạo diễn",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      link: "/admin/casts",
      count: loading ? "..." : `${stats.casts} người`,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Quản lý Người dùng",
      description: "Xem và quản lý tài khoản",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      link: "/admin/users",
      count: loading ? "..." : `${stats.users} users`,
      color: "from-purple-500 to-violet-500",
    },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle="Tổng quan hệ thống quản lý phim">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {menuItems.map((item) => (
          <Link
            key={item.title}
            to={item.link}
            className="group relative overflow-hidden rounded-xl bg-netflix-dark border border-white/10
                     hover:border-white/20 transition-all duration-300 hover:scale-105"
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 
                          group-hover:opacity-10 transition-opacity duration-300`} />

            <div className="relative p-6">
              {/* Icon */}
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${item.color} text-white mb-4`}>
                {item.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
              <p className="text-sm text-netflix-light mb-3">{item.description}</p>

              {/* Count Badge */}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white">
                {item.count}
              </span>

              {/* Arrow */}
              <div className="absolute top-6 right-6 text-netflix-light group-hover:text-white
                            transform group-hover:translate-x-1 transition-all duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-netflix-dark rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Thao tác nhanh</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/movies" className="btn-primary text-sm py-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm phim mới
          </Link>
          <Link to="/admin/genres" className="btn-secondary text-sm py-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm thể loại
          </Link>
          <Link to="/admin/casts" className="btn-secondary text-sm py-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm diễn viên
          </Link>
          <Link to="/" className="btn-secondary text-sm py-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Xem trang chủ
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
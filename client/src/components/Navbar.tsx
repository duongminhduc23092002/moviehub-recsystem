import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [scrolled, setScrolled] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === "admin";

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Clear search khi chuyển trang (không phải /movies)
  useEffect(() => {
    if (!location.pathname.startsWith('/movies')) {
      setSearchQuery("");
    }
  }, [location.pathname]);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    
    if (trimmedQuery) {
      // Always navigate to /movies with search param
      navigate(`/movies?search=${encodeURIComponent(trimmedQuery)}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    } else {
      // If empty, just navigate to /movies without search param
      navigate('/movies');
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { path: "/", label: "Trang chủ" },
    { path: "/movies", label: "Phim" },
    { path: "/top", label: "Xếp hạng" },
    { path: "/recommended", label: "Phim đề xuất" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav
      className={`navbar ${scrolled ? "navbar-scrolled" : "bg-gradient-to-b from-black/80 to-transparent"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-netflix-red rounded-lg flex items-center justify-center
                          transform group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-black text-xl">M</span>
            </div>
            <span className="text-2xl font-black text-white">
              Movie<span className="text-netflix-red">Hub</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative text-sm font-medium transition-all duration-300
                  ${isActive(link.path) 
                    ? "text-white" 
                    : "text-netflix-light hover:text-white"
                  }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 
                                 bg-netflix-red rounded-full animate-scale-in" />
                )}
              </Link>
            ))}
            
            {isAdmin && (
              <Link
                to="/admin"
                className={`relative text-sm font-medium transition-all duration-300 flex items-center gap-1
                  ${location.pathname.startsWith("/admin")
                    ? "text-netflix-red" 
                    : "text-netflix-light hover:text-netflix-red"
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin
                {location.pathname.startsWith("/admin") && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 
                                 bg-netflix-red rounded-full animate-scale-in" />
                )}
              </Link>
            )}
          </div>

          {/* Search & Auth */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search Form */}
            <form 
              onSubmit={handleSearchSubmit}
              className={`relative flex items-center transition-all duration-300 
                        ${isSearchOpen ? "w-64" : "w-10"}`}
            >
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="absolute left-2 z-10 text-netflix-light hover:text-white 
                         transition-colors duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm phim..."
                className={`w-full bg-netflix-black/80 border border-white/20 
                          text-white pl-10 pr-10 py-2 rounded-full text-sm
                          focus:border-netflix-red focus:outline-none
                          transition-all duration-300
                          ${isSearchOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
              />
              {searchQuery && isSearchOpen && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-netflix-light hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </form>

            {/* Auth Section */}
            {isAuthenticated && user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg
                           hover:bg-white/10 transition-all duration-300 group"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                              ${isAdmin 
                                ? "bg-gradient-to-br from-yellow-500 to-orange-500" 
                                : "bg-gradient-to-br from-netflix-red to-red-700"
                              }`}>
                    {getInitials(user.name)}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-white leading-tight">{user.name}</p>
                    {isAdmin && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-yellow-500/20 text-yellow-400 
                                     rounded-full border border-yellow-500/30">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <svg 
                    className={`w-4 h-4 text-netflix-light transition-transform duration-300
                              ${isProfileMenuOpen ? "rotate-180" : ""}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-netflix-dark/95 backdrop-blur-md 
                                rounded-lg shadow-2xl border border-white/10 overflow-hidden
                                animate-fade-in">
                    <div className="px-4 py-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{user.name}</p>
                        {isAdmin && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-yellow-500/20 text-yellow-400 
                                         rounded-full border border-yellow-500/30">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-netflix-light truncate">{user.email}</p>
                    </div>

                    {isAdmin && (
                      <div className="py-2 border-b border-white/10">
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-yellow-400
                                   hover:bg-yellow-500/10 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Trang quản trị
                        </Link>
                      </div>
                    )}

                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-netflix-light
                                 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Tài khoản
                      </Link>
                      <Link
                        to="/watchlist"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-netflix-light
                                 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Yêu thích
                      </Link>
                    </div>

                    <div className="py-2 border-t border-white/10">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-netflix-light
                                 hover:bg-red-500/10 hover:text-netflix-red transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn-secondary py-2 px-6">
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-slide-up">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-netflix-light"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm phim..."
                  className="input-field w-full pl-10"
                />
              </div>
            </form>

            {/* Mobile Nav Links */}
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg transition-colors
                    ${isActive(link.path) ? "bg-netflix-red text-white" : "text-netflix-light hover:bg-white/10"}`}
                >
                  {link.label}
                </Link>
              ))}
              
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg text-yellow-400 hover:bg-yellow-500/10 transition-colors"
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Mobile Auth */}
            {isAuthenticated && user ? (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 px-4 py-3 mb-3 bg-netflix-gray/30 rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                                ${isAdmin 
                                  ? "bg-gradient-to-br from-yellow-500 to-orange-500" 
                                  : "bg-gradient-to-br from-netflix-red to-red-700"}`}>
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      {isAdmin && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-yellow-500/20 text-yellow-400 
                                       rounded-full border border-yellow-500/30">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-netflix-light">{user.email}</p>
                  </div>
                </div>
                
                <Link 
                  to="/profile" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="block px-4 py-2 text-netflix-light hover:bg-white/10 rounded-lg"
                >
                  Tài khoản
                </Link>
                <Link 
                  to="/watchlist" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="block px-4 py-2 text-netflix-light hover:bg-white/10 rounded-lg"
                >
                  Yêu thích
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }} 
                  className="w-full text-left px-4 py-2 text-netflix-red hover:bg-red-500/10 rounded-lg mt-2"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-t border-white/10">
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="btn-primary w-full"
                >
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
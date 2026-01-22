import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { WatchlistProvider } from "./context/WatchlistContext";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetail from "./pages/MovieDetail";
import TopMovies from "./pages/TopMovies";
import Recommended from "./pages/Recommended";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Watchlist from "./pages/Watchlist";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminMovies from "./pages/admin/AdminMovies";
import AdminGenres from "./pages/admin/AdminGenres";
import AdminCasts from "./pages/admin/AdminCasts";
import AdminUsers from "./pages/admin/AdminUsers";

function App() {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/top" element={<TopMovies />} />
            <Route path="/recommended" element={<Recommended />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/watchlist" element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            } />
             {/* Profile Route */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            {/* Admin Routes - Protected */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/movies" element={
              <ProtectedRoute requireAdmin>
                <AdminMovies />
              </ProtectedRoute>
            } />
            <Route path="/admin/genres" element={
              <ProtectedRoute requireAdmin>
                <AdminGenres />
              </ProtectedRoute>
            } />
            <Route path="/admin/casts" element={
              <ProtectedRoute requireAdmin>
                <AdminCasts />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin>
                <AdminUsers />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </WatchlistProvider>
    </AuthProvider>
  );
}

export default App;
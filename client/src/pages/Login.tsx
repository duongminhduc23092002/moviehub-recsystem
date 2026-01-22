import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/authApi"; // ⭐ Changed import
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({ email, password });
      
      if (response.success && response.token) {
        authLogin(response.token);
        navigate("/");
      } else {
        setError(response.message || "Đăng nhập thất bại");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-netflix-black flex items-center justify-center px-4">
      <div className="max-w-md w-full glass-card p-8">
        <h1 className="text-3xl font-black text-white mb-6 text-center">
          Đăng nhập
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-netflix-light text-center mt-6">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-netflix-red hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
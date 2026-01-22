import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { getMe } from "../api/authApi";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean; // ⭐ Add this
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await getMe();
      console.log("👤 User data from getMe:", response); // Debug log
      
      if (response.success) {
        setUser(response.data);
        console.log("✅ User role:", response.data.role); // Debug log
      } else {
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    checkAuth();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    console.log("🔄 Updating user in context:", updatedUser);
    setUser(updatedUser);
  };

  // ⭐ Calculate isAdmin
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin, // ⭐ Provide isAdmin
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
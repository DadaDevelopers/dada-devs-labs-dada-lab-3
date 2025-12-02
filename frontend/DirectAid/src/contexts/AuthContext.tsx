import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from "react";
import type { ReactNode } from "react";
import api from "../services/api";

// Types
type Role = "Admin" | "Provider" | "Beneficiary" | "Donor" | string;

interface User {
  id: string | number;
  name?: string;
  email?: string;
  role?: Role;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  role: Role | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<{ ok: boolean; error?: any }>;
  signup: (payload: any) => Promise<{ ok: boolean; error?: any }>;
  updateProfile: (updates: Partial<User>) => Promise<{ ok: boolean; user?: User; error?: any }>;
  logout: () => void;
  hasRole: (r: Role) => boolean;
}

// Context + default value
const AuthContext = createContext<AuthContextType | null>(null);

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  // Save and clear localStorage
  const saveToStorage = useCallback((u: User | null, t: string | null) => {
    try {
      if (u && t) {
        localStorage.setItem("auth_user", JSON.stringify(u));
        localStorage.setItem("auth_token", t);
      } else {
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
      }
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    const storedToken = localStorage.getItem("auth_token");

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as User;
        setUser(parsed);
        setRole(parsed.role || null);
      } catch (e) {
        console.warn("Failed parsing stored user", e);
      }
    }
    if (storedToken) setToken(storedToken);
    setLoading(false);
  }, []);

  // ───── Automatically attach token to Axios ─────
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Login
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      const { user: u, token: t } = res.data as { user: User; token: string };

      setUser(u);
      setRole(u.role || null);
      setToken(t);
      saveToStorage(u, t);

      setLoading(false);
      return { ok: true };
    } catch (err: any) {
      const message = err?.response?.data?.message || "Login failed";
      setError(message);
      setLoading(false);
      return { ok: false, error: message };
    }
  };

  // Signup
  const signup = async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/signup", payload);
      const { user: u, token: t } = res.data as { user: User; token: string };

      setUser(u);
      setRole(u.role || null);
      setToken(t);
      saveToStorage(u, t);

      setLoading(false);
      return { ok: true };
    } catch (err: any) {
      const message = err?.response?.data?.message || "Signup failed";
      setError(message);
      setLoading(false);
      return { ok: false, error: message };
    }
  };

  // Update Profile
  const updateProfile = async (updates: Partial<User>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put("/user/me", updates);
      const updatedUser = res.data as User;

      setUser(updatedUser);
      saveToStorage(updatedUser, token);

      setLoading(false);
      return { ok: true, user: updatedUser };
    } catch (err: any) {
      const message = err?.response?.data?.message || "Update failed";
      setError(message);
      setLoading(false);
      return { ok: false, error: message };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setRole(null);
    setToken(null);
    saveToStorage(null, null);
  };

  // Role checker
  const hasRole = (r: Role): boolean => {
    if (!r) return false;
    return role === r || user?.role === r;
  };

  // Context value
  const value: AuthContextType = {
    user,
    role,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    signup,
    updateProfile,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
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
  role?: Role | string;
  [key: string]: any;
}

interface LoginResponse {
  ok: boolean;
  user?: any; // You can change 'any' to your 'User' type later
  error?: string;
}

interface AuthContextType {
  user: User | null;
  role: Role | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<{ ok: boolean; user?: User; error?: any }>;
  signup: (payload: any) => Promise<{ ok: boolean; error?: any }>;
  updateProfile: (updates: Partial<User>) => Promise<{ ok: boolean; user?: User; error?: any }>;
  selectRoleAndOnboard: (payload: any) => Promise<{ ok: boolean; user?: User; error?: any }>;
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

  const saveToStorage = useCallback((u: User | null, t: string | null) => {
    if (u && t) {
      localStorage.setItem("auth_user", JSON.stringify(u));
      localStorage.setItem("auth_token", t);
    } else {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
    }
  }, []);

  // Initialization: Load from storage AND set initial API token
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    const storedToken = localStorage.getItem("auth_token");

    if (storedUser && storedToken) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setRole(parsed.role || null);
        setToken(storedToken);
        api.setAuthToken(storedToken); // Link the API header on load
      } catch (e) {
        console.warn("Auth initialization failed", e);
      }
    }
    setLoading(false);
  }, []);

  // Add the return type : Promise<LoginResponse>
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/login", { email, password });
      console.log("[auth] login received res:", res); // res is already the data
      
      // Access data directly (no .data wrapper)
      const u = res.user;
      const accessToken = res.accessToken;

      if (!u || !accessToken) {
        throw new Error("Invalid response format from server");
      }

      api.setAuthToken(accessToken);
      setUser(u);
      setRole(u.role || null);
      setToken(accessToken);
      saveToStorage(u, accessToken);

      setLoading(false);
      return { ok: true, user: u };
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
      // Backend now uses /auth/register (from dev branch)
      const res = await api.post("/auth/register", payload);
      const { user: u, accessToken: t } = res.data;

      api.setAuthToken(t);
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

  // Role selection + basic onboarding (calls /auth/select-role)
  const selectRoleAndOnboard = async (payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/auth/select-role", payload);
      console.log("[auth] selectRole received res.data:", res.data, "res.data.user:", (res.data as any)?.user, "res.data.user.role:", (res.data as any)?.user?.role);

      const { user: updatedUser, accessToken: newAccessToken } = res.data as { user: User; accessToken?: string };

      setUser(updatedUser);
      setRole(updatedUser.role || null);
      const tokenToStore = newAccessToken ?? token;
      setToken(tokenToStore);
      saveToStorage(updatedUser, tokenToStore);

      setLoading(false);
      return { ok: true, user: updatedUser };
    } catch (err: any) {
      const message = err?.response?.data?.message || "Onboarding failed";
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
      const res = await api.put("/users/me", updates);
      const updatedUser = res.user || res.data?.user || res;

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
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Logout API failed", err);
    } finally {
      setUser(null);
      setRole(null);
      setToken(null);
      api.setAuthToken(null); // Clear header
      saveToStorage(null, null);
    }
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
    selectRoleAndOnboard,
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
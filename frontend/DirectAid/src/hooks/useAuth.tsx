import React, { createContext, useContext, useEffect, useState } from "react";
import * as api from "../services/api";

interface User {
  id: string;
  email: string;
  role?: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (payload: any) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (token) {
        const me = await api.me(token);
        if (me) setUser(me.user || me);
      }
      setLoading(false);
    };
    init();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    if (res?.token) {
      if (typeof window !== "undefined")
        localStorage.setItem("token", res.token);
      setToken(res.token);
      setUser(res.user || null);
    } else if (res?.user) {
      // fallback demo
      setUser(res.user);
    }
    return res;
  };

  const signup = async (payload: any) => {
    const res = await api.signup(payload);
    if (res?.user) {
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    if (typeof window !== "undefined") localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default useAuth;

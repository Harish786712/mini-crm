import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";
import type { User } from "../types";

type AuthContextType = {
  user: User | null; loading: boolean; login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api<{ user: User }>("/api/auth/me").then(x => setUser(x.user)).catch(() => {}).finally(() => setLoading(false));
  }, []);
  const login = async (email: string, password: string) => setUser((await api<{user:User}>("/api/auth/login",{method:"POST",body:JSON.stringify({email,password})})).user);
  const register = async (name: string, email: string, password: string) => setUser((await api<{user:User}>("/api/auth/register",{method:"POST",body:JSON.stringify({name,email,password})})).user);
  const logout = async () => { await api("/api/auth/logout",{method:"POST"}); setUser(null); };
  return <AuthContext.Provider value={{user,loading,login,register,logout}}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext)!; }

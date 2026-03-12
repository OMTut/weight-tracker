import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "@tanstack/react-router";
import { getMe } from "@/lib/apiService";
import type { User } from "@/types/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** Provides authentication state and actions to the entire component tree. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Start loading only when a token exists — avoids synchronous setState in effect body
  const [isLoading, setIsLoading] = useState(
    () => !!localStorage.getItem("auth_token"),
  );
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    getMe()
      .then((u) => setUser(u))
      .catch(() => localStorage.removeItem("auth_token"))
      .finally(() => setIsLoading(false));
  }, []);

  /** Store token in localStorage and set current user. */
  function login(token: string, u: User) {
    localStorage.setItem("auth_token", token);
    setUser(u);
  }

  /** Remove token from localStorage, clear user, and redirect to /login. */
  function logout() {
    localStorage.removeItem("auth_token");
    setUser(null);
    navigate({ to: "/login" });
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Returns auth context. Must be used inside AuthProvider. */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

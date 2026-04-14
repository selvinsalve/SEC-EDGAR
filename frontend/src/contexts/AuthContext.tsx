import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiClient } from "@/lib/api";

interface AuthUser {
  user_id: string;
  company: string;
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (userId: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("sec_auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);
        apiClient.setToken(parsed.token);
      } catch {
        localStorage.removeItem("sec_auth");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (userId: string, password: string) => {
    const res = await apiClient.login(userId, password);
    const authUser: AuthUser = {
      user_id: res.user_id,
      company: res.company,
      token: res.token,
    };
    apiClient.setToken(res.token);
    setUser(authUser);
    localStorage.setItem("sec_auth", JSON.stringify(authUser));
  };

  const register = async (data: any) => {
    await apiClient.register(data);
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
    localStorage.removeItem("sec_auth");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

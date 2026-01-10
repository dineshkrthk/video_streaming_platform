import { createContext, useState } from "react";

type AuthContextType = {
  token: string | null;
  role: "admin" | "editor" | "viewer" | null;
  login: (t: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);
const getRoleFromToken = (token: string | null) => {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1])).role;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [role, setRole] = useState<"admin" | "editor" | "viewer" | null>(
    getRoleFromToken(localStorage.getItem("token"))
  );

  const login = (t: string) => {
    localStorage.setItem("token", t);
    setToken(t);
    setRole(getRoleFromToken(t));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

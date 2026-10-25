import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, tokens } from "./api.js";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const RANK = { member: 1, moderator: 2, admin: 3 };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!tokens.get()) { setReady(true); return; }
    api("/auth/me/").then(setUser).catch(() => tokens.clear()).finally(() => setReady(true));
  }, []);

  const login = useCallback(async (username, password) => {
    tokens.set(await api("/auth/token/", { method: "POST", body: { username, password } }));
    setUser(await api("/auth/me/"));
  }, []);

  const register = useCallback(async (username, email, password) => {
    await api("/auth/register/", { method: "POST", body: { username, email, password } });
    await login(username, password);
  }, [login]);

  const logout = useCallback(() => { tokens.clear(); setUser(null); }, []);

  const hasRole = (min) => !!user && RANK[user.role] >= RANK[min];

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

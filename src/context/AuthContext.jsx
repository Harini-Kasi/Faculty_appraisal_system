import { createContext, useCallback, useContext, useState } from "react";
import { setAuthToken } from "../utils/api";

/* Session state kept in memory only (not persisted across a page
   reload) — same behavior as the original app, except now the
   session is backed by a real server-issued token instead of a
   locally-typed role/department/designation. */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // { role: 'admin'|'faculty', username, name, department, designation }

  const login = useCallback((token, sessionData) => {
    setAuthToken(token);
    setSession(sessionData);
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

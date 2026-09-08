import { createContext, useCallback, useContext, useState, useEffect } from "react";
import { setAuthToken, api } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const savedToken = sessionStorage.getItem("fpa_auth_token");
    const savedSession = sessionStorage.getItem("fpa_session_data");
    if (savedToken && savedSession) {
      setAuthToken(savedToken);
      try {
        return JSON.parse(savedSession);
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = useCallback((token, sessionData) => {
    setAuthToken(token);
    sessionStorage.setItem("fpa_auth_token", token);
    sessionStorage.setItem("fpa_session_data", JSON.stringify(sessionData));
    setSession(sessionData);
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    sessionStorage.removeItem("fpa_auth_token");
    sessionStorage.removeItem("fpa_session_data");
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

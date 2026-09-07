import { createContext, useCallback, useContext, useRef, useState } from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState({ visible: false, type: "success", message: "" });
  const timerRef = useRef(null);

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ visible: true, type, message });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, 3200);
  }, []);

  return (
    <NotificationContext.Provider value={{ notification, showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
}

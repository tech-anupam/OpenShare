"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckIcon, XIcon, ShieldIcon } from "@/components/icons";

interface Toast {
  id: string;
  message: string;
  type: "error" | "success" | "info";
}

interface ToastContextValue {
  showToast: (message: string, type?: "error" | "success" | "info") => void;
  error: (message: string) => void;
  success: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  error: () => {},
  success: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: "error" | "success" | "info" = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev.slice(-3), { id, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const error = useCallback(
    (message: string) => showToast(message, "error"),
    [showToast]
  );

  const success = useCallback(
    (message: string) => showToast(message, "success"),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, error, success }}>
      {children}
      <div className="fixed bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-[99999] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-xl animate-in"
            style={{
              background: "var(--bg-card)",
              borderColor:
                t.type === "error"
                  ? "var(--danger)"
                  : t.type === "success"
                  ? "var(--success)"
                  : "var(--border)",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div
              className="flex items-center justify-center w-6 h-6 rounded-lg shrink-0 text-white"
              style={{
                background:
                  t.type === "error"
                    ? "var(--danger)"
                    : t.type === "success"
                    ? "var(--success)"
                    : "var(--accent)",
              }}
            >
              {t.type === "error" ? (
                <ShieldIcon size={14} />
              ) : t.type === "success" ? (
                <CheckIcon size={14} />
              ) : (
                <CheckIcon size={14} />
              )}
            </div>

            <p
              className="text-xs font-medium flex-1 leading-snug"
              style={{ color: "var(--text-primary)" }}
            >
              {t.message}
            </p>

            <button
              onClick={() => removeToast(t.id)}
              className="p-1 hover:opacity-75 transition-opacity"
              style={{ color: "var(--text-muted)" }}
            >
              <XIcon size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

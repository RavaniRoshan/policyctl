import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone?: "default" | "success" | "danger" | "warning";
  duration?: number;
}

interface ToastCtx {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((list) => [...list, { ...t, id }].slice(-5));
      const ttl = t.duration ?? 3500;
      if (ttl > 0) {
        setTimeout(() => remove(id), ttl);
      }
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ toasts, push, remove }}>
      {children}
      <ToastHost />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function ToastHost() {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;
  const { toasts, remove } = ctx;
  return (
    <div aria-live="polite" className="fixed top-4 right-4 z-[2000] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [in_, setIn] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setIn(true));
  }, []);

  const accent =
    toast.tone === "danger"
      ? "border-l-danger"
      : toast.tone === "warning"
        ? "border-l-warning"
        : toast.tone === "success"
          ? "border-l-success"
          : "border-l-black-alpha-20";

  return (
    <div
      role="status"
      className={`pointer-events-auto pcl-card border border-border-faint border-l-2 ${accent} shadow-md transition-all duration-300 ${
        in_ ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-label-medium text-accent-black">{toast.title}</div>
          {toast.description && (
            <div className="text-body-small text-black-alpha-64 mt-1">{toast.description}</div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-black-alpha-48 hover:text-accent-black text-body-small"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
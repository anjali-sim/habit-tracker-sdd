import { useEffect } from "react";
import type { Toast as ToastType } from "../types";

interface ToastProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

function Toast({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastType;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const liveValue = toast.type === "error" ? "assertive" : "polite";
  const bgClass =
    toast.type === "error"
      ? "bg-red-900 border-red-700 text-red-100"
      : toast.type === "success"
        ? "bg-emerald-900 border-emerald-700 text-emerald-100"
        : "bg-zinc-800 border-zinc-700 text-zinc-100";

  return (
    <div
      role="status"
      aria-live={liveValue}
      className={`pointer-events-auto rounded-xl border px-4 py-3 flex items-center justify-between gap-3 shadow-lg ${bgClass}`}
    >
      <span className="text-sm">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center text-lg leading-none hover:opacity-70 transition-opacity"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

export default Toast;

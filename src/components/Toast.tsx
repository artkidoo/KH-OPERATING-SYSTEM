import React from "react";
import { CheckCircle2, Info, AlertCircle, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  text: string;
  type?: "success" | "info" | "error";
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div id="toast-notifications-container" className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-3.5 rounded-2xl border shadow-2xl flex items-center justify-between gap-3 text-xs animate-in slide-in-from-bottom-5 duration-200 bg-[var(--bento-card)] border-[var(--bento-border)] text-[var(--bento-text)]`}
        >
          <div className="flex items-center gap-2.5">
            {t.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
            {t.type === "error" && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
            {(!t.type || t.type === "info") && <Info className="w-4 h-4 text-[var(--accent-pill-text)] shrink-0" />}
            <span className="font-medium text-left">{t.text}</span>
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="p-1 rounded-lg hover:bg-[var(--bento-elevated)] text-[var(--bento-muted)] hover:text-[var(--bento-text)] cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

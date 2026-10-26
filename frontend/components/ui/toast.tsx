"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

type ToastItem = {
  id: number;
  type: ToastType;
  title: string;
  description?: string;
};

type ToastOptions = {
  title: string;
  description?: string;
  duration?: number;
};

type ToastContextType = {
  success: (options: ToastOptions) => void;
  error: (options: ToastOptions) => void;
  warning: (options: ToastOptions) => void;
  info: (options: ToastOptions) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const toastStyles = {
  success: {
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    border: "border-l-green-500",
    progress: "bg-green-500",
  },
  error: {
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    border: "border-l-red-500",
    progress: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    border: "border-l-amber-500",
    progress: "bg-amber-500",
  },
  info: {
    icon: Info,
    color: "text-blue-600 dark:text-blue-400",
    border: "border-l-blue-500",
    progress: "bg-blue-500",
  },
};

const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [durations, setDurations] = useState<Record<number, number>>({});

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    setDurations((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);

  const show = useCallback((type: ToastType, options: ToastOptions) => {
    const id = Date.now() + Math.random();
    const duration = options.duration ?? DEFAULT_DURATION;

    setToasts((current) => [
      ...current.slice(-3),
      {
        id,
        type,
        title: options.title,
        description: options.description,
      },
    ]);

    setDurations((current) => ({ ...current, [id]: duration }));
  }, []);

  const success = useCallback(
    (options: ToastOptions) => show("success", options),
    [show],
  );
  const error = useCallback(
    (options: ToastOptions) => show("error", options),
    [show],
  );
  const warning = useCallback(
    (options: ToastOptions) => show("warning", options),
    [show],
  );
  const info = useCallback(
    (options: ToastOptions) => show("info", options),
    [show],
  );

  return (
    <ToastContext.Provider value={{ success, error, warning, info, dismiss }}>
      {children}

      <div
        aria-label="Notifications"
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-4 z-200 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const style = toastStyles[toast.type];
            const Icon = style.icon;
            const duration = durations[toast.id] ?? DEFAULT_DURATION;

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 24, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto relative overflow-hidden rounded-xl border border-l-4 ${style.border} border-border bg-background shadow-lg`}
              >
                <div className="flex items-start gap-3 p-4">
                  <Icon
                    aria-hidden="true"
                    className={`mt-0.5 size-5 shrink-0 ${style.color}`}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {toast.title}
                    </p>

                    {toast.description && (
                      <p className="mt-1 text-sm leading-5 text-muted-foreground">
                        {toast.description}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => dismiss(toast.id)}
                    aria-label="Dismiss notification"
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <ToastTimer
                  key={toast.id}
                  duration={duration}
                  color={style.progress}
                  onComplete={() => dismiss(toast.id)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastTimer({
  duration,
  color,
  onComplete,
}: {
  duration: number;
  color: string;
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <motion.div
      aria-hidden="true"
      className={`h-0.5 origin-left ${color}`}
      initial={{ scaleX: 1 }}
      animate={{ scaleX: 0 }}
      transition={{ duration: duration / 1000, ease: "linear" }}
    />
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}

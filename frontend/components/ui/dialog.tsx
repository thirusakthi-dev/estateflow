"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

type DialogVariant = "default" | "danger" | "warning" | "success";

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  loading: boolean;
};

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialog() {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error("Dialog components must be used inside Dialog.");
  }

  return context;
}

type DialogProps = {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  loading?: boolean;
};

export function Dialog({
  children,
  open: controlledOpen,
  onOpenChange,
  loading = false,
}: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (loading && !nextOpen) return;

      if (controlledOpen === undefined) {
        setInternalOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [controlledOpen, onOpenChange, loading],
  );

  return (
    <DialogContext.Provider value={{ open, setOpen, loading }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children }: { children: ReactNode }) {
  const { setOpen, loading } = useDialog();

  return (
    <span
      onClick={() => {
        if (!loading) setOpen(true);
      }}
      className="inline-flex"
    >
      {children}
    </span>
  );
}

type DialogContentProps = {
  children?: ReactNode;
  title: string;
  description?: string;
  className?: string;
  variant?: DialogVariant;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  loading?: boolean;
  showCancel?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
};

const variantStyles = {
  default: {
    icon: Info,
    iconClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    buttonClass: "bg-primary text-white hover:opacity-90 dark:text-slate-900",
  },
  danger: {
    icon: AlertTriangle,
    iconClass: "bg-red-500/10 text-red-600 dark:text-red-400",
    buttonClass: "bg-destructive text-white hover:opacity-90",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    buttonClass: "bg-amber-500 text-white hover:bg-amber-600",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "bg-green-500/10 text-green-600 dark:text-green-400",
    buttonClass: "bg-green-600 text-white hover:bg-green-700",
  },
};

export function DialogContent({
  children,
  title,
  description,
  className = "",
  variant = "default",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  loading: externalLoading = false,
  showCancel = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
}: DialogContentProps) {
  const { open, setOpen, loading: dialogLoading } = useDialog();
  const id = useId();
  const reduceMotion = useReducedMotion();

  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const [internalLoading, setInternalLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const loading = externalLoading || dialogLoading || internalLoading;
  const config = variantStyles[variant];
  const Icon = config.icon;

  const settingsRef = useRef({ closeOnEscape, loading });
  const setOpenRef = useRef(setOpen);

  useEffect(() => {
    settingsRef.current = { closeOnEscape, loading };
  }, [closeOnEscape, loading]);

  useEffect(() => {
    setOpenRef.current = setOpen;
  }, [setOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !mounted) return;

    previousFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      closeRef.current?.focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      const settings = settingsRef.current;

      if (
        event.key === "Escape" &&
        settings.closeOnEscape &&
        !settings.loading
      ) {
        setOpenRef.current(false);
      }

      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = dialog.querySelectorAll<HTMLElement>(
        [
          "button:not(:disabled)",
          "input:not(:disabled)",
          "textarea:not(:disabled)",
          "select:not(:disabled)",
          "a[href]",
          '[tabindex]:not([tabindex="-1"])',
        ].join(", "),
      );

      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus.current?.focus();
    };
  }, [open, mounted]);

  async function handleConfirm() {
    if (!onConfirm || loading) return;

    setInternalLoading(true);

    try {
      await onConfirm();
    } finally {
      setInternalLoading(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <button
            type="button"
            tabIndex={-1}
            aria-label="Close dialog"
            className="absolute inset-0 cursor-default bg-black/35 backdrop-blur-[1px]"
            onClick={() => {
              if (closeOnBackdrop && !loading) {
                setOpen(false);
              }
            }}
          />

          <motion.section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-title`}
            aria-describedby={description ? `${id}-description` : undefined}
            initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.99 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={[
              "relative z-10 my-auto w-full max-w-lg overflow-hidden",
              "rounded-2xl border border-border bg-background",
              "shadow-2xl shadow-black/15",
              className,
            ].join(" ")}
          >
            <header className="flex items-start gap-3 border-b border-border p-5">
              <div
                className={[
                  "grid size-10 shrink-0 place-items-center rounded-xl",
                  config.iconClass,
                ].join(" ")}
              >
                <Icon size={20} aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <h2
                  id={`${id}-title`}
                  className="text-lg font-semibold text-foreground"
                >
                  {title}
                </h2>

                {description && (
                  <p
                    id={`${id}-description`}
                    className="mt-1.5 text-sm leading-6 text-muted-foreground"
                  >
                    {description}
                  </p>
                )}
              </div>

              <button
                ref={closeRef}
                type="button"
                disabled={loading}
                onClick={() => setOpen(false)}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            {children && <div className="p-5">{children}</div>}

            {onConfirm && (
              <footer className="flex flex-col-reverse gap-2 border-t border-border bg-surface/50 p-4 sm:flex-row sm:justify-end">
                {showCancel && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setOpen(false)}
                    className="min-h-10 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cancelText}
                  </button>
                )}

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConfirm}
                  className={[
                    "inline-flex min-h-10 items-center justify-center gap-2",
                    "rounded-lg px-4 text-sm font-medium transition-all duration-200",
                    "hover:shadow-sm active:scale-[0.98]",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    config.buttonClass,
                  ].join(" ")}
                >
                  {loading && (
                    <span
                      aria-hidden="true"
                      className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                    />
                  )}

                  {loading ? "Please wait..." : confirmText}
                </button>
              </footer>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function DialogClose({ children }: { children: ReactNode }) {
  const { setOpen, loading } = useDialog();

  return (
    <span
      onClick={() => {
        if (!loading) setOpen(false);
      }}
      className="inline-flex"
    >
      {children}
    </span>
  );
}

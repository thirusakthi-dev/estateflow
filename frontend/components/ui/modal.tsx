"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  maxWidth?: string;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  loading = false,
  maxWidth = "max-w-3xl",
}: ModalProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, loading]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/65 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !loading) {
              onClose();
            }
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.995 }
            }
            transition={{
              duration: reduceMotion ? 0 : 0.18,
              ease: "easeOut",
            }}
            className={`my-auto flex max-h-[92dvh] w-full ${maxWidth} shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-2xl`}
          >
            <header className="shrink-0 border-b border-border px-5 py-4 sm:px-7">
              <h2 id="modal-title" className="text-xl font-semibold">
                {title}
              </h2>

              {description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </header>

            <div className="modal-scrollbar-hidden min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
              {children}
            </div>

            {footer && (
              <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-border px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                {footer}
              </footer>
            )}
          </motion.section>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

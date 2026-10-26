"use client";

import type { ReactNode } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

type AlertVariant = "success" | "warning" | "error" | "info";

type AlertProps = {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
};

const variants = {
  success: {
    icon: CheckCircle2,
    styles:
      "border-green-500/25 bg-green-500/5 text-green-700 dark:text-green-400",
  },
  warning: {
    icon: AlertTriangle,
    styles:
      "border-amber-500/25 bg-amber-500/5 text-amber-700 dark:text-amber-400",
  },
  error: {
    icon: AlertCircle,
    styles: "border-red-500/25 bg-red-500/5 text-red-700 dark:text-red-400",
  },
  info: {
    icon: Info,
    styles: "border-blue-500/25 bg-blue-500/5 text-blue-700 dark:text-blue-400",
  },
};

export function Alert({
  variant = "info",
  title,
  children,
  onClose,
  className = "",
}: AlertProps) {
  const reduceMotion = useReducedMotion();
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      role={variant === "error" ? "alert" : "status"}
      className={[
        "flex items-start gap-3 rounded-xl border p-4",
        config.styles,
        className,
      ].join(" ")}
    >
      <Icon size={20} aria-hidden="true" className="mt-0.5 shrink-0" />

      <div className="min-w-0 flex-1">
        {title && <h3 className="text-sm font-semibold">{title}</h3>}

        <div className={`${title ? "mt-1" : ""} text-sm leading-5`}>
          {children}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </motion.div>
  );
}

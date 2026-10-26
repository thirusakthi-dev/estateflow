"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  block?: boolean;
  children: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:opacity-90 dark:bg-slate-100 dark:text-slate-900",
  secondary:
    "bg-surface text-foreground hover:bg-slate-100 dark:hover:bg-slate-800",
  outline:
    "border border-border bg-background text-foreground hover:bg-surface",
  ghost: "bg-transparent text-foreground hover:bg-surface",
  danger: "bg-destructive text-white hover:opacity-90",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-10 px-4 text-sm",
  lg: "min-h-12 px-5 text-sm",
  icon: "size-10 shrink-0 p-0",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  block = false,
  disabled,
  className = "",
  children,
  type = "button",
  whileHover: customHover,
  whileTap: customTap,
  ...props
}: ButtonProps) {
  const reduceMotion = useReducedMotion();
  const isDisabled = Boolean(disabled || loading);
  const isIconOnly = size === "icon";

  return (
    <motion.button
      {...props}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      whileHover={
        !reduceMotion && !isDisabled ? (customHover ?? { y: -1 }) : undefined
      }
      whileTap={
        !reduceMotion && !isDisabled
          ? (customTap ?? { scale: 0.98 })
          : undefined
      }
      transition={{ duration: 0.16 }}
      className={[
        "inline-flex min-w-0 items-center justify-center gap-2 rounded-lg",
        "whitespace-nowrap font-semibold tracking-[0.01em]",
        "transition-[background-color,color,border-color,opacity] duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "focus-visible:outline-slate-500",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        block && !isIconOnly ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading ? (
        <>
          <LoaderCircle
            size={16}
            aria-hidden="true"
            className="shrink-0 animate-spin"
          />
          {!isIconOnly && (
            <span className="whitespace-nowrap">{loadingText ?? children}</span>
          )}
        </>
      ) : (
        <>
          {LeftIcon && (
            <LeftIcon size={16} aria-hidden="true" className="shrink-0" />
          )}

          {!isIconOnly && <span className="whitespace-nowrap">{children}</span>}

          {RightIcon && (
            <RightIcon size={16} aria-hidden="true" className="shrink-0" />
          )}

          {isIconOnly && !LeftIcon && !RightIcon && children}
        </>
      )}
    </motion.button>
  );
}

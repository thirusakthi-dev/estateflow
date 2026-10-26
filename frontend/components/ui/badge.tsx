"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "outline";

type BadgeProps = Omit<HTMLMotionProps<"span">, "children"> & {
  variant?: BadgeVariant;
  dot?: boolean;
  children: ReactNode;
};
const variants: Record<BadgeVariant, string> = {
  default: "bg-surface text-muted",
  success: "bg-green-500/10 text-green-700 dark:text-green-400",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  danger: "bg-red-500/10 text-red-700 dark:text-red-400",
  info: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  outline: "border border-border bg-transparent text-foreground",
};

const dots: Record<BadgeVariant, string> = {
  default: "bg-slate-400",
  success: "bg-green-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
  outline: "bg-current",
};

export function Badge({
  variant = "default",
  dot = false,
  children,
  className = "",
  ...props
}: BadgeProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      {...props}
      initial={false}
      whileHover={reduceMotion ? undefined : { y: -1 }}
      transition={{ duration: 0.15 }}
      className={[
        "inline-flex w-fit items-center gap-1.5 rounded-full",
        "px-2.5 py-1 text-xs font-medium leading-4",
        variants[variant],
        className,
      ].join(" ")}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={`size-1.5 shrink-0 rounded-full ${dots[variant]}`}
        />
      )}
      {children}
    </motion.span>
  );
}

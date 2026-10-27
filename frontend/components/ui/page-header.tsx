"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

type PageHeaderProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className = "",
}: PageHeaderProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.25,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={[
        "flex min-w-0 flex-col gap-4",
        "sm:flex-row sm:items-center sm:justify-between",
        className,
      ].join(" ")}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <div
            className={[
              "relative flex size-11 shrink-0 items-center justify-center",
              "overflow-hidden rounded-xl",
              "border border-blue-500/20",
              "bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-violet-500/15",
              "text-blue-400",
            ].join(" ")}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
            />

            <Icon
              size={22}
              strokeWidth={1.8}
              aria-hidden="true"
              className="relative"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="break-words text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>

          {description && (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div
          className={[
            "flex w-full min-w-0 flex-wrap items-center gap-2",
            "sm:w-auto sm:shrink-0 sm:justify-end",
            "[&>button]:max-w-full",
          ].join(" ")}
        >
          {actions}
        </div>
      )}
    </motion.header>
  );
}

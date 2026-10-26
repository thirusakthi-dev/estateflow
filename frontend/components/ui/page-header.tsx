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
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={[
        "flex flex-col gap-4 sm:flex-row sm:items-center",
        "sm:justify-between",
        className,
      ].join(" ")}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={reduceMotion ? undefined : { scale: 1.05, rotate: -3 }}
            transition={{
              duration: reduceMotion ? 0 : 0.3,
              ease: "easeOut",
            }}
            className={[
              "relative mt-0.5 flex size-11 shrink-0 items-center",
              "justify-center overflow-hidden rounded-2xl",
              "border border-indigo-200/70 dark:border-indigo-400/20",
              "bg-gradient-to-br from-indigo-500/15 via-violet-500/10",
              "to-sky-500/15 text-indigo-600 shadow-sm",
              "dark:text-indigo-300",
              "transition-shadow duration-300 hover:shadow-md",
            ].join(" ")}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5"
            />
            <Icon
              size={21}
              strokeWidth={1.9}
              aria-hidden="true"
              className="relative shrink-0"
            />
          </motion.div>
        )}

        <div className="min-w-0">
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.3,
              delay: reduceMotion ? 0 : 0.06,
              ease: "easeOut",
            }}
            className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
          >
            {title}
          </motion.h1>

          {description && (
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.3,
                delay: reduceMotion ? 0 : 0.1,
                ease: "easeOut",
              }}
              className="mt-1 max-w-2xl text-sm leading-6 text-muted"
            >
              {description}
            </motion.p>
          )}
        </div>
      </div>

      {actions && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.3,
            delay: reduceMotion ? 0 : 0.12,
            ease: "easeOut",
          }}
          className={[
            "flex w-full min-w-0 items-center gap-2",
            "sm:w-auto sm:shrink-0 sm:justify-end",
            "[&>button]:max-w-full",
          ].join(" ")}
        >
          {actions}
        </motion.div>
      )}
    </motion.header>
  );
}

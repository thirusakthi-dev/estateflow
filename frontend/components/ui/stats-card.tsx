"use client";

import { motion, useReducedMotion } from "motion/react";
import type { LucideIcon } from "lucide-react";

type StatsCardTone = "blue" | "green" | "violet" | "amber";

type StatsCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  tone?: StatsCardTone;
  index?: number;
};

const tones: Record<
  StatsCardTone,
  { icon: string; glow: string; accent: string }
> = {
  blue: {
    icon: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    glow: "group-hover:border-blue-200 dark:group-hover:border-blue-500/30",
    accent: "bg-blue-500",
  },
  green: {
    icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    glow: "group-hover:border-emerald-200 dark:group-hover:border-emerald-500/30",
    accent: "bg-emerald-500",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
    glow: "group-hover:border-violet-200 dark:group-hover:border-violet-500/30",
    accent: "bg-violet-500",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    glow: "group-hover:border-amber-200 dark:group-hover:border-amber-500/30",
    accent: "bg-amber-500",
  },
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "blue",
  index = 0,
}: StatsCardProps) {
  const reduceMotion = useReducedMotion();
  const colors = tones[tone];

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.3,
        delay: reduceMotion ? 0 : index * 0.06,
        ease: "easeOut",
      }}
      whileHover={
        reduceMotion ? undefined : { y: -3, transition: { duration: 0.18 } }
      }
      className={[
        "group relative min-w-0 overflow-hidden rounded-2xl",
        "border border-border bg-background p-4 sm:p-5",
        "shadow-sm transition-colors duration-200",
        "hover:shadow-md",
        colors.glow,
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className={[
          "absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0",
          "transition-transform duration-300 group-hover:scale-x-100",
          colors.accent,
        ].join(" ")}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>

          <motion.p
            key={String(value)}
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {value}
          </motion.p>
        </div>

        <div
          className={[
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            "transition-transform duration-200 group-hover:scale-105",
            colors.icon,
          ].join(" ")}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        {description}
      </p>
    </motion.article>
  );
}

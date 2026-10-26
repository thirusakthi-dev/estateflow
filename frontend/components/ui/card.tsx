"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

type CardProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  animated?: boolean;
  hover?: boolean;
  icon?: LucideIcon;
  iconClassName?: string;
};

const paddingStyles = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  children,
  padding = "md",
  animated = true,
  hover = false,
  icon: Icon,
  iconClassName = "",
  className = "",
  initial: customInitial,
  animate: customAnimate,
  whileHover: customHover,
  transition: customTransition,
  ...props
}: CardProps) {
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animated && !reduceMotion;

  return (
    <motion.div
      {...props}
      initial={
        customInitial !== undefined
          ? customInitial
          : shouldAnimate
            ? { opacity: 0, y: 8 }
            : false
      }
      animate={customAnimate ?? { opacity: 1, y: 0 }}
      whileHover={
        hover && !reduceMotion
          ? (customHover ?? {
              y: -3,
              transition: { duration: 0.18 },
            })
          : customHover
      }
      transition={customTransition ?? { duration: 0.22, ease: "easeOut" }}
      className={[
        "rounded-xl border border-border bg-background shadow-sm",
        hover ? "hover:shadow-md" : "",
        paddingStyles[padding],
        className,
      ].join(" ")}
    >
      {Icon && (
        <div
          className={[
            "mb-3 inline-flex size-10 items-center justify-center",
            "rounded-xl bg-surface text-muted",
            iconClassName,
          ].join(" ")}
        >
          <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
        </div>
      )}

      {children}
    </motion.div>
  );
}

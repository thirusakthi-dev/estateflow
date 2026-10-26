"use client";

import { motion, useReducedMotion } from "motion/react";

type SkeletonProps = {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animated?: boolean;
};

export function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
  animated = true,
}: SkeletonProps) {
  const reduceMotion = useReducedMotion();

  const shapeStyles = {
    text: "h-4 rounded-md",
    circular: "aspect-square rounded-full",
    rectangular: "rounded-xl",
  };

  return (
    <motion.div
      aria-hidden="true"
      initial={false}
      animate={
        animated && !reduceMotion
          ? { opacity: [0.55, 1, 0.55] }
          : { opacity: 0.75 }
      }
      transition={
        animated && !reduceMotion
          ? {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }
          : undefined
      }
      style={{ width, height }}
      className={[
        "bg-slate-200 dark:bg-slate-800",
        shapeStyles[variant],
        className,
      ].join(" ")}
    />
  );
}

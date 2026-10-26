"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type AnimatedCardProps = {
  children: ReactNode;
  className?: string;
};

export function AnimatedCard({ children, className = "" }: AnimatedCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{
        duration: 0.2,
        ease: "easeOut",
      }}
      className={`rounded-2xl border border-border bg-background transition-colors duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}

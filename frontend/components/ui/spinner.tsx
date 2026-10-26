"use client";

import { motion, useReducedMotion } from "motion/react";

import { AppLogo } from "./brand/app-logo";

type SpinnerProps = {
  size?: "xs" | "sm" | "md" | "lg";
  label?: string;
  className?: string;
  variant?: "default" | "logo";
};

const sizes = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 32,
};

const logoSizes = {
  xs: 20,
  sm: 28,
  md: 40,
  lg: 56,
};

export function Spinner({
  size = "md",
  label = "Loading",
  className = "",
  variant = "default",
}: SpinnerProps) {
  const reduceMotion = useReducedMotion();

  if (variant === "logo") {
    return (
      <span
        role="status"
        aria-label={label}
        className={`inline-flex shrink-0 items-center justify-center ${className}`}
      >
        <motion.span
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          className="inline-flex rounded-2xl"
        >
          <AppLogo
            iconSize={logoSizes[size]}
            iconClassName="rounded-2xl shadow-lg shadow-primary/15"
          />
        </motion.span>

        <span className="sr-only">{label}</span>
      </span>
    );
  }

  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
    >
      <svg
        width={sizes[size]}
        height={sizes[size]}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="animate-spin motion-reduce:animate-none"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="3"
          strokeOpacity="0.2"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      <span className="sr-only">{label}</span>
    </span>
  );
}

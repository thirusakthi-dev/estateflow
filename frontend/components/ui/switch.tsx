"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { motion, useReducedMotion } from "motion/react";

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  description?: string;
  containerClassName?: string;
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    id,
    name,
    label,
    description,
    disabled,
    className = "",
    containerClassName = "",
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const switchId = id ?? name ?? generatedId;
  const descriptionId = `${switchId}-description`;
  const reduceMotion = useReducedMotion();

  return (
    <label
      htmlFor={switchId}
      className={[
        "flex items-center justify-between gap-4",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        containerClassName,
      ].join(" ")}
    >
      <span className="min-w-0 space-y-1">
        {label && (
          <span className="block text-sm font-medium text-foreground">
            {label}
          </span>
        )}

        {description && (
          <span
            id={descriptionId}
            className="block text-xs leading-5 text-muted"
          >
            {description}
          </span>
        )}
      </span>

      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          {...props}
          ref={ref}
          id={switchId}
          name={name}
          type="checkbox"
          role="switch"
          disabled={disabled}
          aria-describedby={description ? descriptionId : undefined}
          className={[
            "peer absolute inset-0 z-10 h-6 w-11 cursor-pointer",
            "opacity-0 disabled:cursor-not-allowed",
            className,
          ].join(" ")}
        />

        <span
          aria-hidden="true"
          className={[
            "absolute inset-0 rounded-full bg-slate-300",
            "transition-colors duration-200",
            "peer-checked:bg-primary",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-slate-500",
            "peer-focus-visible:ring-offset-2",
            "peer-disabled:opacity-60",
            "dark:bg-slate-700",
          ].join(" ")}
        />

        <motion.span
          aria-hidden="true"
          className={[
            "pointer-events-none absolute left-0.5 top-0.5",
            "size-5 rounded-full bg-white shadow-sm",
          ].join(" ")}
          animate={reduceMotion ? undefined : { x: props.checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </span>
    </label>
  );
});

Switch.displayName = "Switch";

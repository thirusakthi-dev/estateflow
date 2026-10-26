"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  description?: string;
  error?: string;
  containerClassName?: string;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      id,
      name,
      label,
      description,
      error,
      disabled,
      required,
      className = "",
      containerClassName = "",
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const checkboxId = id ?? name ?? generatedId;
    const descriptionId = `${checkboxId}-description`;
    const errorId = `${checkboxId}-error`;
    const reduceMotion = useReducedMotion();

    return (
      <div className={`space-y-1.5 ${containerClassName}`}>
        <label
          htmlFor={checkboxId}
          className={[
            "inline-flex items-start gap-3",
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          ].join(" ")}
        >
          <span className="relative mt-0.5 size-5 shrink-0">
            <input
              {...props}
              ref={ref}
              id={checkboxId}
              name={name}
              type="checkbox"
              required={required}
              disabled={disabled}
              aria-invalid={error ? true : undefined}
              aria-describedby={
                error ? errorId : description ? descriptionId : undefined
              }
              className={[
                "peer absolute inset-0 z-10 size-5 cursor-pointer",
                "rounded-md opacity-0",
                "disabled:cursor-not-allowed",
                className,
              ].join(" ")}
            />

            <motion.span
              aria-hidden="true"
              className={[
                "pointer-events-none absolute inset-0 grid place-items-center",
                "rounded-md border border-border bg-background",
                "text-white shadow-sm transition-colors duration-150",
                "peer-checked:border-primary peer-checked:bg-primary",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-slate-500",
                "peer-focus-visible:ring-offset-2",
                "peer-disabled:opacity-60",
              ].join(" ")}
              whileTap={reduceMotion || disabled ? undefined : { scale: 0.9 }}
              transition={{ duration: 0.12 }}
            >
              <Check
                size={14}
                strokeWidth={3}
                className={[
                  "transition-opacity duration-150",
                  "opacity-0 peer-checked:opacity-100",
                ].join(" ")}
              />
            </motion.span>
          </span>

          {(label || description) && (
            <span className="space-y-0.5">
              {label && (
                <span className="block text-sm font-medium text-foreground">
                  {label}
                  {required && (
                    <span className="ml-1 text-destructive" aria-hidden="true">
                      *
                    </span>
                  )}
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
          )}
        </label>

        {error && (
          <p id={errorId} role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

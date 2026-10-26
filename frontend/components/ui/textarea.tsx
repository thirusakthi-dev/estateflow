"use client";

import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { motion, useReducedMotion } from "motion/react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      id,
      name,
      label,
      error,
      helperText,
      required,
      disabled,
      className = "",
      containerClassName = "",
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const textareaId = id ?? name ?? generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;
    const reduceMotion = useReducedMotion();

    return (
      <div className={`w-full space-y-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
            {required && (
              <span className="ml-1 text-destructive" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <motion.div
          whileHover={reduceMotion || disabled ? undefined : { y: -1 }}
          transition={{ duration: 0.15 }}
        >
          <textarea
            {...props}
            ref={ref}
            id={textareaId}
            name={name}
            required={required}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={[
              "min-h-28 w-full resize-y rounded-lg border",
              "border-border bg-background px-3 py-2.5",
              "text-sm text-foreground outline-none",
              "placeholder:text-muted",
              "transition-colors duration-200",
              "focus-visible:border-slate-500",
              "focus-visible:ring-2 focus-visible:ring-slate-500/30",
              "disabled:cursor-not-allowed disabled:opacity-60",
              className,
            ].join(" ")}
          />
        </motion.div>

        {error ? (
          <p id={errorId} role="alert" className="text-xs text-destructive">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

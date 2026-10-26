"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { LucideIcon } from "lucide-react";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  containerClassName?: string;
  iconClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id,
    label,
    error,
    helperText,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className = "",
    iconClassName = "text-muted",
    containerClassName = "",
    disabled,
    required,
    onFocus,
    onBlur,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? props.name ?? generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const [focused, setFocused] = useState(false);
  const reduceMotion = useReducedMotion();

  const describedBy =
    [error ? errorId : undefined, !error && helperText ? helperId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={`w-full space-y-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground transition-colors duration-500"
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
        animate={
          reduceMotion ? undefined : { scale: focused && !disabled ? 1.005 : 1 }
        }
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={[
          "relative flex h-11 items-center gap-2 rounded-xl border px-3",
          "bg-background",
          "transition-[background-color,border-color,box-shadow] duration-300 ease-in-out",
          error
            ? "border-destructive shadow-[0_0_0_3px_rgba(220,38,38,0.10)]"
            : focused
              ? "border-slate-500 shadow-[0_0_0_3px_rgba(100,116,139,0.12)] dark:border-slate-400 dark:shadow-[0_0_0_3px_rgba(148,163,184,0.12)]"
              : "border-border shadow-none",
          disabled ? "cursor-not-allowed opacity-60" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {LeftIcon && (
          <LeftIcon
            size={18}
            aria-hidden="true"
            className={`shrink-0 transition-colors duration-200 ${iconClassName}`}
          />
        )}

        <input
          {...props}
          ref={ref}
          id={inputId}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          className={[
            "h-full min-w-0 flex-1 appearance-none border-0 outline-none",
            "bg-transparent text-sm text-foreground shadow-none ring-0",
            "placeholder:text-muted",
            "focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none",
            "focus-visible:ring-0",
            "disabled:cursor-not-allowed",
            "[&:-webkit-autofill]:[border-radius:0]",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            outline: "none",
            boxShadow: "none",
          }}
        />

        {RightIcon && (
          <RightIcon
            size={18}
            aria-hidden="true"
            className="shrink-0 text-muted transition-colors duration-300"
          />
        )}
      </motion.div>

      {error ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : helperText ? (
        <p
          id={helperId}
          className="text-xs text-muted transition-colors duration-500"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Input.displayName = "Input";

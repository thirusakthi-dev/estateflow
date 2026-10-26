"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronDown, Search, X } from "lucide-react";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  name?: string;
  className?: string;
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

export function Select({
  label,
  placeholder = "Select an option",
  options,
  value,
  defaultValue = "",
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  searchable = false,
  clearable = false,
  name,
  className = "",
}: SelectProps) {
  const id = useId();
  const reduceMotion = useReducedMotion();

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [mounted, setMounted] = useState(false);

  const selectedValue = value ?? internalValue;
  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  );

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase()),
      )
    : options;

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const gap = 8;
    const viewportPadding = 12;
    const availableBelow =
      window.innerHeight - rect.bottom - gap - viewportPadding;
    const availableAbove = rect.top - gap - viewportPadding;
    const estimatedHeight = Math.min(
      Math.max(filteredOptions.length * 42 + (searchable ? 58 : 8), 72),
      280,
    );

    const placement =
      availableBelow >= Math.min(estimatedHeight, 160) ||
      availableBelow >= availableAbove
        ? "bottom"
        : "top";

    const maxHeight = Math.max(
      100,
      Math.min(280, placement === "bottom" ? availableBelow : availableAbove),
    );

    const width = Math.min(
      Math.max(rect.width, 180),
      window.innerWidth - viewportPadding * 2,
    );

    const left = Math.min(
      Math.max(viewportPadding, rect.left),
      window.innerWidth - width - viewportPadding,
    );

    const top =
      placement === "bottom"
        ? rect.bottom + gap
        : Math.max(
            viewportPadding,
            rect.top - gap - Math.min(estimatedHeight, maxHeight),
          );

    setPosition({ top, left, width, maxHeight });
  };

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        !rootRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
    // Reposition when options change while open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filteredOptions.length]);

  useEffect(() => {
    if (open && searchable) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open, searchable]);

  const choose = (option: SelectOption) => {
    if (value === undefined) setInternalValue(option.value);
    onChange?.(option.value);
    setOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  };

  const clear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (value === undefined) setInternalValue("");
    onChange?.("");
    setQuery("");
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen((previous) => !previous);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!open) {
        setOpen(true);
      } else {
        setActiveIndex((previous) =>
          Math.min(previous + 1, filteredOptions.length - 1),
        );
      }
    }

    if (event.key === "ArrowUp" && open) {
      event.preventDefault();
      setActiveIndex((previous) => Math.max(previous - 1, 0));
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
      )}

      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={Boolean(error)}
        onClick={() => {
          if (!disabled) setOpen((previous) => !previous);
        }}
        onKeyDown={handleKeyDown}
        className={[
          "flex min-h-10 w-full items-center justify-between gap-2 rounded-xl border bg-background px-3 py-2 text-left text-sm text-foreground shadow-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          error
            ? "border-destructive"
            : "border-border hover:border-foreground/20",
          disabled ? "cursor-not-allowed opacity-50" : "",
        ].join(" ")}
      >
        <span
          className={
            selectedOption ? "truncate" : "truncate text-muted-foreground"
          }
        >
          {selectedOption?.label ?? placeholder}
        </span>

        <span className="flex shrink-0 items-center gap-1">
          {clearable && selectedValue !== "" && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear selection"
              onClick={(event) => {
                event.stopPropagation();
                if (value === undefined) setInternalValue("");
                onChange?.("");
                setOpen(false);
                setQuery("");
              }}
              className="rounded-md p-1 text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              <X className="size-3.5" />
            </span>
          )}
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {name && <input type="hidden" name={name} value={selectedValue} />}

      {error ? (
        <p className="mt-1.5 text-xs text-destructive">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{helperText}</p>
      ) : null}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && position && (
              <motion.div
                ref={menuRef}
                initial={
                  reduceMotion ? false : { opacity: 0, y: 4, scale: 0.99 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.99 }}
                transition={{ duration: reduceMotion ? 0 : 0.12 }}
                style={{
                  position: "fixed",
                  top: position.top,
                  left: position.left,
                  width: position.width,
                  maxHeight: position.maxHeight,
                  zIndex: 9999,
                }}
                className="overflow-hidden rounded-xl border border-border bg-background shadow-xl"
              >
                {searchable && (
                  <div className="border-b border-border p-2">
                    <div className="flex items-center gap-2 rounded-lg border border-border px-2">
                      <Search className="size-4 text-muted-foreground" />
                      <input
                        ref={searchRef}
                        value={query}
                        onChange={(event) => {
                          setQuery(event.target.value);
                          setActiveIndex(0);
                        }}
                        placeholder="Search options..."
                        className="h-9 w-full bg-transparent text-sm outline-none"
                      />
                    </div>
                  </div>
                )}

                <div
                  role="listbox"
                  aria-label={label ?? placeholder}
                  className="overflow-y-auto p-1"
                  style={{
                    maxHeight: position.maxHeight - (searchable ? 60 : 0),
                  }}
                >
                  {filteredOptions.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No options found
                    </p>
                  ) : (
                    filteredOptions.map((option, index) => {
                      const selected = option.value === selectedValue;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => choose(option)}
                          className={[
                            "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                            selected
                              ? "bg-primary/10 font-medium text-primary"
                              : "text-foreground hover:bg-surface",
                            activeIndex === index ? "bg-surface" : "",
                          ].join(" ")}
                        >
                          <span className="truncate">{option.label}</span>
                          {selected && (
                            <Check className="size-4 shrink-0 text-primary" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}

"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type DatePickerProps = {
  id?: string;
  name?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  type?: "date" | "datetime-local";
  min?: string;
  max?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  placeholder?: string;
  containerClassName?: string;
};

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const CALENDAR_WIDTH = 340;
const VIEWPORT_PADDING = 16;
const CALENDAR_GAP = 8;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDate(value: string) {
  if (!value) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );

  if (
    date.getFullYear() !== Number(match[1]) ||
    date.getMonth() !== Number(match[2]) - 1 ||
    date.getDate() !== Number(match[3])
  ) {
    return null;
  }

  return date;
}

function formatDisplay(value: string, type: "date" | "datetime-local") {
  const date = parseDate(value);
  if (!date) return "";

  const dateText = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);

  if (type === "date") return dateText;

  const timeMatch = /^\d{4}-\d{2}-\d{2}T(\d{2}):(\d{2})/.exec(value);
  if (!timeMatch) return dateText;

  const time = new Date();
  time.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0);

  return `${dateText} · ${new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(time)}`;
}

function toDateTimeValue(date: Date, time: string) {
  const [hours = "09", minutes = "00"] = time.split(":");
  return `${formatDate(date)}T${hours}:${minutes}`;
}

function getTime(value: string) {
  const match = /^\d{4}-\d{2}-\d{2}T(\d{2}:\d{2})/.exec(value);
  return match?.[1] ?? "09:00";
}

function monthTitle(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function DatePicker({
  id,
  name,
  label,
  value,
  onChange,
  type = "datetime-local",
  min,
  max,
  disabled = false,
  required = false,
  error,
  helperText,
  placeholder = "Choose date and time",
  containerClassName = "",
}: DatePickerProps) {
  const generatedId = useId();
  const inputId = id ?? name ?? generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [calendarStyle, setCalendarStyle] = useState<CSSProperties>({});
  const [viewDate, setViewDate] = useState(
    () => parseDate(value) ?? new Date(),
  );
  const [selectedDate, setSelectedDate] = useState(() => parseDate(value));
  const [time, setTime] = useState(() => getTime(value));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const date = parseDate(value);

    setSelectedDate(date);
    setTime(getTime(value));

    if (date) setViewDate(date);
  }, [value]);

  useEffect(() => {
    if (!open || !mounted) return;

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const calendarWidth = Math.min(
        CALENDAR_WIDTH,
        viewportWidth - VIEWPORT_PADDING * 2,
      );

      const calendarHeight = calendarRef.current?.offsetHeight ?? 430;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      const openAbove =
        spaceBelow < calendarHeight + CALENDAR_GAP && spaceAbove > spaceBelow;

      const left = Math.max(
        VIEWPORT_PADDING,
        Math.min(rect.left, viewportWidth - calendarWidth - VIEWPORT_PADDING),
      );

      const availableHeight = openAbove
        ? spaceAbove - CALENDAR_GAP
        : spaceBelow - CALENDAR_GAP;

      setCalendarStyle({
        position: "fixed",
        left,
        width: calendarWidth,
        maxHeight: Math.max(180, availableHeight),
        ...(openAbove
          ? { bottom: viewportHeight - rect.top + CALENDAR_GAP }
          : { top: rect.bottom + CALENDAR_GAP }),
        zIndex: 9999,
      });
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, mounted, viewDate, selectedDate, time, type]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!(event.target instanceof Node)) return;

      const insideTrigger = rootRef.current?.contains(event.target);
      const insideCalendar = calendarRef.current?.contains(event.target);

      if (!insideTrigger && !insideCalendar) {
        setOpen(false);
      }
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const minDate = parseDate(min ?? "");
  const maxDate = parseDate(max ?? "");

  const today = formatDate(new Date());

  const firstDay = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1,
  ).getDay();

  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0,
  ).getDate();

  // Monday-first calendar.
  const startOffset = (firstDay + 6) % 7;

  const calendarDays: (number | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null);
  }

  function isDisabledDate(date: Date) {
    const day = formatDate(date);

    return Boolean(
      (minDate && day < formatDate(minDate)) ||
      (maxDate && day > formatDate(maxDate)),
    );
  }

  function selectDate(day: number) {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);

    if (isDisabledDate(date)) return;

    setSelectedDate(date);

    if (type === "date") {
      onChange(formatDate(date));
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

    // Immediately update the controlled value when a date is selected.
    onChange(toDateTimeValue(date, time));
  }

  function changeTime(nextTime: string) {
    setTime(nextTime);

    if (selectedDate) {
      onChange(toDateTimeValue(selectedDate, nextTime));
    }
  }

  function selectToday() {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (isDisabledDate(date)) return;

    setViewDate(date);
    setSelectedDate(date);

    if (type === "date") {
      onChange(formatDate(date));
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }

    const nextTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

    setTime(nextTime);
    onChange(toDateTimeValue(date, nextTime));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
    }
  }

  function changeMonth(offset: number) {
    setViewDate(
      new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1),
    );
  }

  return (
    <div
      ref={rootRef}
      className={`relative w-full space-y-1.5 ${containerClassName}`}
    >
      {label && (
        <label
          htmlFor={inputId}
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

      <button
        ref={triggerRef}
        id={inputId}
        type="button"
        name={name}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className={[
          "flex h-11 w-full items-center gap-3 rounded-xl border px-3.5",
          "bg-background text-left transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          error
            ? "border-destructive"
            : open
              ? "border-slate-500 shadow-[0_0_0_3px_rgba(100,116,139,0.10)]"
              : "border-border hover:border-slate-400",
          disabled ? "cursor-not-allowed opacity-60" : "",
        ].join(" ")}
      >
        <CalendarDays size={18} className="shrink-0 text-muted" />

        <span
          className={`min-w-0 flex-1 truncate text-sm ${
            value ? "text-foreground" : "text-muted"
          }`}
        >
          {formatDisplay(value, type) || placeholder}
        </span>

        {value && !disabled && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear date"
            className="rounded-md p-1 text-muted hover:bg-surface hover:text-foreground"
            onClick={(event) => {
              event.stopPropagation();
              onChange("");
              setSelectedDate(null);
              setTime("09:00");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                onChange("");
                setSelectedDate(null);
                setTime("09:00");
              }
            }}
          >
            <X size={14} />
          </span>
        )}

        <ChevronDown
          size={16}
          className={`shrink-0 text-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            ref={calendarRef}
            role="dialog"
            aria-label={label ?? "Choose date"}
            style={calendarStyle}
            className="overflow-y-auto rounded-2xl border border-border bg-background p-4 shadow-xl shadow-black/10"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted">SELECT DATE</p>
                <h3 className="mt-1 text-base font-semibold text-foreground">
                  {monthTitle(viewDate)}
                </h3>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => changeMonth(-1)}
                  className="rounded-lg p-2 text-muted transition hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => changeMonth(1)}
                  className="rounded-lg p-2 text-muted transition hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-y-1">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="flex h-8 items-center justify-center text-xs font-medium text-muted"
                >
                  {day}
                </div>
              ))}

              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} />;
                }

                const date = new Date(
                  viewDate.getFullYear(),
                  viewDate.getMonth(),
                  day,
                );

                const dateValue = formatDate(date);
                const isSelected =
                  selectedDate !== null &&
                  dateValue === formatDate(selectedDate);
                const isToday = dateValue === today;
                const isDisabled = isDisabledDate(date);

                return (
                  <button
                    key={dateValue}
                    type="button"
                    disabled={isDisabled}
                    aria-pressed={isSelected}
                    aria-label={new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "full",
                    }).format(date)}
                    onClick={() => selectDate(day)}
                    className={[
                      "mx-auto flex size-9 items-center justify-center rounded-xl text-sm",
                      "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected
                        ? "bg-primary font-semibold text-primary-foreground"
                        : isToday
                          ? "border border-primary/40 font-semibold text-primary"
                          : "text-foreground hover:bg-surface",
                      isDisabled
                        ? "cursor-not-allowed opacity-30 hover:bg-transparent"
                        : "",
                    ].join(" ")}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {type === "datetime-local" && (
              <div className="mt-4 border-t border-border pt-4">
                <label
                  htmlFor={`${inputId}-time`}
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <Clock3 size={16} className="text-muted" />
                  Time
                </label>

                <input
                  id={`${inputId}-time`}
                  type="time"
                  value={time}
                  onChange={(event) => changeTime(event.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
              <button
                type="button"
                onClick={selectToday}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Today
              </button>

              <Button
                type="button"
                className="h-10"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                Done
              </Button>
            </div>
          </div>,
          document.body,
        )}

      {error ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-muted-foreground">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

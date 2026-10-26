"use client";

import {
  Building2,
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  Mail,
  Phone,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Booking } from "../lib/bookings.types";

type BookingSummaryDialogProps = {
  booking: Booking;
  onClose: () => void;
  onCancel?: (booking: Booking) => void;
  isCancelling?: boolean;
};

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-muted-foreground">
        <Icon size={17} aria-hidden="true" />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 break-words text-sm font-medium text-foreground">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

function formatDate(value?: string | Date | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function BookingSummaryDialog({
  booking,
  onClose,
  onCancel,
  isCancelling = false,
}: BookingSummaryDialogProps) {
  const isConfirmed = booking.status === "CONFIRMED";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isCancelling) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-summary-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarDays size={22} aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <h2
                id="booking-summary-title"
                className="truncate text-lg font-semibold text-foreground"
              >
                Booking details
              </h2>

              <p className="mt-1 truncate text-xs text-muted-foreground">
                Booking ID: {booking.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isCancelling}
            aria-label="Close booking summary"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="space-y-6 p-5 sm:p-6">
          <section>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Booking status
            </p>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                isConfirmed
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
              }`}
            >
              {isConfirmed ? (
                <CheckCircle2 size={14} aria-hidden="true" />
              ) : (
                <XCircle size={14} aria-hidden="true" />
              )}

              {isConfirmed ? "Confirmed" : "Cancelled"}
            </span>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              Customer information
            </h3>

            <div className="grid gap-5 sm:grid-cols-2">
              <InfoItem
                icon={UserRound}
                label="Customer name"
                value={booking.lead.name}
              />

              <InfoItem
                icon={Phone}
                label="Phone number"
                value={booking.lead.phone}
              />
            </div>
          </section>

          <section className="space-y-4 border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-foreground">
              Property information
            </h3>

            <div className="grid gap-5 sm:grid-cols-2">
              <InfoItem
                icon={Building2}
                label="Building"
                value={booking.building.name}
              />

              <InfoItem
                icon={FolderKanban}
                label="Project"
                value={booking.building.project.name}
              />

              <InfoItem
                icon={Building2}
                label="City"
                value={booking.building.project.city}
              />
            </div>
          </section>

          <section className="space-y-4 border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-foreground">
              Booking information
            </h3>

            <div className="grid gap-5 sm:grid-cols-2">
              <InfoItem
                icon={CalendarDays}
                label="Booked on"
                value={formatDate(booking.bookedAt)}
              />

              <InfoItem
                icon={UserRound}
                label="Booked by"
                value={booking.bookedBy.name}
              />

              {booking.cancelledAt && (
                <InfoItem
                  icon={CalendarDays}
                  label="Cancelled on"
                  value={formatDate(booking.cancelledAt)}
                />
              )}

              <InfoItem
                icon={Mail}
                label="Employee email"
                value={booking.bookedBy.email}
              />
            </div>
          </section>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-border bg-surface/50 p-4 sm:flex-row sm:justify-end sm:px-6">
          <Button variant="outline" onClick={onClose} disabled={isCancelling}>
            Close
          </Button>

          {isConfirmed && onCancel && (
            <Button
              variant="danger"
              leftIcon={XCircle}
              loading={isCancelling}
              loadingText="Cancelling..."
              onClick={() => onCancel(booking)}
            >
              Cancel booking
            </Button>
          )}
        </footer>
      </section>
    </div>
  );
}

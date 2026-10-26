"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  UserRound,
  Users,
} from "lucide-react";

import type { DashboardLead, DashboardBooking } from "../lib/dashboard.types";

type Props = {
  leads: DashboardLead[];
  bookings: DashboardBooking[];
};

function formatDate(value: string | Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();

  const colors =
    normalized === "CONFIRMED" ||
    normalized === "BOOKED" ||
    normalized === "ACTIVE"
      ? "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400"
      : normalized === "CANCELLED" || normalized === "LOST"
        ? "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
        : normalized === "PENDING" ||
            normalized === "INTERESTED" ||
            normalized === "NEGOTIATION"
          ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          : "border-border bg-muted text-muted-foreground";

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${colors}`}
    >
      {formatLabel(status)}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mx-4 mb-4 flex min-h-20 items-center justify-center rounded-lg border border-dashed border-border px-4 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function ActivityHeader({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
  icon: typeof Users;
  href: string;
}) {
  return (
    <header className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon size={18} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground sm:text-base">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <Link
        href={href}
        className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:opacity-75"
      >
        View all
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </header>
  );
}

export default function DashboardActivity({ leads, bookings }: Props) {
  return (
    <section
      aria-label="Recent leads and bookings"
      className="grid min-w-0 gap-4 xl:grid-cols-2"
    >
      <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
        <ActivityHeader
          title="Recent Leads"
          description="Latest lead activity"
          icon={Users}
          href="/leads"
        />

        <div className="mt-3">
          {leads.length === 0 ? (
            <EmptyState message="No leads to display yet." />
          ) : (
            <ul className="divide-y divide-border">
              {leads.slice(0, 5).map((lead) => (
                <li key={lead.id}>
                  <Link
                    href={`/leads/${lead.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40 sm:px-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserRound size={17} aria-hidden="true" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {lead.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {lead.phone || "No phone number"}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <StatusBadge status={lead.stage} />
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(lead.updatedAt)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>

      <article className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
        <ActivityHeader
          title="Recent Bookings"
          description="Latest booking activity"
          icon={CalendarCheck}
          href="/bookings"
        />

        <div className="mt-3">
          {bookings.length === 0 ? (
            <EmptyState message="No bookings to display yet." />
          ) : (
            <ul className="divide-y divide-border">
              {bookings.slice(0, 5).map((booking) => (
                <li key={booking.id}>
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40 sm:px-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
                        <CheckCircle2 size={17} aria-hidden="true" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {booking.lead?.name ?? "Unknown lead"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {booking.building?.project?.name ??
                            booking.building?.name ??
                            "Property booking"}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <StatusBadge status={booking.status} />
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(booking.bookedAt)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </section>
  );
}

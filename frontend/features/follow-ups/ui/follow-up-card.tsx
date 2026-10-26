"use client";

import { CalendarClock, Phone, UserRound } from "lucide-react";

import type { FollowUp } from "../lib/follow-ups.types";

type FollowUpCardProps = {
  followUp: FollowUp;
  actions?: React.ReactNode;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function label(value: string) {
  return value.replaceAll("_", " ");
}

function statusStyle(status: FollowUp["status"]) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";
    case "CANCELLED":
      return "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300";
    default:
      return "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
  }
}

export function FollowUpCard({ followUp, actions }: FollowUpCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-background p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">
              {followUp.lead.name}
            </h2>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(followUp.status)}`}
            >
              {label(followUp.status)}
            </span>
          </div>

          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-4 shrink-0" />
            {followUp.lead.phone}
          </p>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarClock className="size-4" />
                Scheduled for
              </p>
              <p className="mt-1 font-medium text-foreground">
                {formatDate(followUp.scheduledAt)}
              </p>
            </div>

            <div>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <UserRound className="size-4" />
                Assigned employee
              </p>
              <p className="mt-1 font-medium text-foreground">
                {followUp.assignedTo.name}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Lead stage</p>
              <p className="mt-1 font-medium text-foreground">
                {label(followUp.lead.stage)}
              </p>
            </div>

            {followUp.outcome && (
              <div>
                <p className="text-xs text-muted-foreground">Outcome</p>
                <p className="mt-1 font-medium text-foreground">
                  {label(followUp.outcome)}
                </p>
              </div>
            )}
          </div>

          {followUp.notes && (
            <p className="mt-4 whitespace-pre-wrap rounded-lg bg-surface p-3 text-sm leading-6 text-muted-foreground">
              {followUp.notes}
            </p>
          )}
        </div>

        {actions && (
          <div className="w-full space-y-3 lg:max-w-xs">{actions}</div>
        )}
      </div>
    </article>
  );
}

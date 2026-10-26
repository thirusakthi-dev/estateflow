"use client";

import { CalendarDays, Mail, Phone, Tag, UserRound, X } from "lucide-react";

import type { Lead, LeadStage } from "../lib/leads.types";
import { Button } from "@/components/ui/button";

type LeadSummaryDialogProps = {
  lead: Lead;
  onClose: () => void;
  onEdit?: (lead: Lead) => void;
};

const stageStyles: Record<LeadStage, string> = {
  NEW: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  CONTACTED:
    "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  SITE_VISIT:
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  INTERESTED:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  NEGOTIATION:
    "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  BOOKED: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  LOST: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
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
  }).format(date);
}

export function LeadSummaryDialog({
  lead,
  onClose,
  onEdit,
}: LeadSummaryDialogProps) {
  const stageLabel = lead.stage.replaceAll("_", " ");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-summary-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary">
              {lead.name.trim().charAt(0).toUpperCase() || "L"}
            </div>

            <div className="min-w-0">
              <h2
                id="lead-summary-title"
                className="truncate text-lg font-semibold text-foreground"
              >
                {lead.name}
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Lead ID: {lead.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close lead summary"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <X size={18} />
          </button>
        </header>

        <div className="p-5 sm:p-6">
          <div className="mb-6">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Current stage
            </p>

            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${stageStyles[lead.stage]}`}
            >
              {stageLabel}
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <InfoItem icon={Phone} label="Phone number" value={lead.phone} />

            <InfoItem icon={Mail} label="Email address" value={lead.email} />

            <InfoItem icon={Tag} label="Lead source" value={lead.source} />

            <InfoItem
              icon={UserRound}
              label="Assigned employee"
              value={lead.assignedTo?.name}
            />

            <InfoItem
              icon={CalendarDays}
              label="Created on"
              value={formatDate(lead.createdAt)}
            />

            <InfoItem
              icon={CalendarDays}
              label="Last updated"
              value={formatDate(lead.updatedAt)}
            />
          </div>
        </div>

        <footer className="flex justify-end gap-3 border-t border-border bg-surface/50 p-4 sm:px-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          {onEdit && (
            <Button
              onClick={() => {
                onClose();
                onEdit(lead);
              }}
            >
              Edit lead
            </Button>
          )}
        </footer>
      </section>
    </div>
  );
}

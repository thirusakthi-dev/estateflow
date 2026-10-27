"use client";

import {
  CalendarDays,
  Mail,
  Phone,
  Tag,
  UserRound,
  ArrowUpRight,
} from "lucide-react";

import type { Lead, LeadStage } from "../lib/leads.types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type LeadSummaryDialogProps = {
  lead: Lead;
  onClose: () => void;
  onEdit?: (lead: Lead) => void;
};

const stageStyles: Record<LeadStage, string> = {
  NEW: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  CONTACTED:
    "border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400",
  SITE_VISIT:
    "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  INTERESTED:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  NEGOTIATION:
    "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  BOOKED:
    "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400",
  LOST: "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
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
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-border/70 bg-surface/40 p-3.5 transition-colors hover:bg-surface/80">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background text-muted-foreground">
        <Icon size={17} aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1.5 break-words text-sm font-semibold text-foreground">
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
    <Modal
      open
      onClose={onClose}
      title="Lead details"
      description="View contact information and lead activity."
      maxWidth="max-w-2xl"
      footer={
        <div className="flex w-full flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="outline"
            className="h-10 w-full px-4 sm:w-auto"
            onClick={onClose}
          >
            Close
          </Button>

          {onEdit && (
            <Button
              className="h-10 w-full px-4 sm:w-auto"
              leftIcon={ArrowUpRight}
              onClick={() => {
                onClose();
                onEdit(lead);
              }}
            >
              Edit lead
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Lead profile */}
        <section className="flex items-center gap-4 rounded-2xl border border-border bg-gradient-to-br from-primary/[0.07] via-background to-background p-4 sm:p-5">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary ring-1 ring-primary/15">
            {lead.name.trim().charAt(0).toUpperCase() || "L"}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-foreground sm:text-lg">
              {lead.name}
            </h3>

            <p className="mt-1 break-all text-xs text-muted-foreground">
              ID: {lead.id}
            </p>

            <span
              className={`mt-2.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${stageStyles[lead.stage]}`}
            >
              <span className="size-1.5 rounded-full bg-current" />
              {stageLabel}
            </span>
          </div>
        </section>

        {/* Contact information */}
        <section>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-foreground">
              Contact information
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Lead contact details and assignment.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoItem icon={Phone} label="Phone number" value={lead.phone} />

            <InfoItem icon={Mail} label="Email address" value={lead.email} />

            <InfoItem icon={Tag} label="Lead source" value={lead.source} />

            <InfoItem
              icon={UserRound}
              label="Assigned employee"
              value={lead.assignedTo?.name}
            />
          </div>
        </section>

        {/* Record activity */}
        <section>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-foreground">
              Record activity
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Dates associated with this lead.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
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
        </section>
      </div>
    </Modal>
  );
}

"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  CalendarClock,
  Clock3,
  FileText,
  Pencil,
  Phone,
  Save,
  UserRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

import {
  FOLLOW_UP_OUTCOMES,
  FOLLOW_UP_STATUSES,
  type FollowUp,
  type FollowUpOutcome,
  type FollowUpStatus,
  type UpdateFollowUpInput,
} from "../lib/follow-ups.types";

type FollowUpCardProps = {
  followUp: FollowUp;
  actions?: ReactNode;
  isSaving?: boolean;
  onSave?: (input: UpdateFollowUpInput) => Promise<void>;
};

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function toLocalDateTime(value: string | Date | null | undefined) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function label(value: string | null | undefined) {
  if (!value) return "Not set";

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function statusStyle(status: FollowUpStatus) {
  switch (status) {
    case "COMPLETED":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600";

    case "CANCELLED":
      return "border-muted bg-muted text-muted-foreground";

    default:
      return "border-blue-500/20 bg-blue-500/10 text-blue-600";
  }
}

export function FollowUpCard({
  followUp,
  actions,
  isSaving = false,
  onSave,
}: FollowUpCardProps) {
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<FollowUpStatus>(followUp.status);
  const [outcome, setOutcome] = useState<FollowUpOutcome | "">(
    followUp.outcome ?? "",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setScheduledAt(toLocalDateTime(followUp.scheduledAt));
    setNotes(followUp.notes ?? "");
    setStatus(followUp.status);
    setOutcome(followUp.outcome ?? "");
  }, [
    followUp.id,
    followUp.scheduledAt,
    followUp.notes,
    followUp.status,
    followUp.outcome,
  ]);

  const isOverdue =
    followUp.status === "PENDING" &&
    new Date(followUp.scheduledAt).getTime() < Date.now();

  function startEditing() {
    setScheduledAt(toLocalDateTime(followUp.scheduledAt));
    setNotes(followUp.notes ?? "");
    setStatus(followUp.status);
    setOutcome(followUp.outcome ?? "");
    setErrors({});
    setEditing(true);
  }

  function discardEditing() {
    setScheduledAt(toLocalDateTime(followUp.scheduledAt));
    setNotes(followUp.notes ?? "");
    setStatus(followUp.status);
    setOutcome(followUp.outcome ?? "");
    setErrors({});
    setEditing(false);
  }

  async function handleSave() {
    if (!onSave) return;

    const nextErrors: Record<string, string> = {};

    if (!scheduledAt) {
      nextErrors.scheduledAt = "Please select a date and time.";
    } else if (Number.isNaN(new Date(scheduledAt).getTime())) {
      nextErrors.scheduledAt = "Please select a valid date and time.";
    }

    if (status === "COMPLETED" && !outcome) {
      nextErrors.outcome = "Select an outcome before completing.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.warning({
        title: "Check the form",
        description: "Please correct the highlighted fields.",
      });
      return;
    }

    try {
      await onSave({
        scheduledAt: new Date(scheduledAt).toISOString(),
        notes: notes.trim() || undefined,
        status,
        outcome: outcome || undefined,
      });

      setEditing(false);
      setErrors({});
    } catch {
      // The parent handles the API error toast.
    }
  }

  return (
    <article className="min-w-0 rounded-2xl border border-border bg-background p-4 shadow-sm transition-colors sm:p-5">
      {/* Header */}
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <CalendarClock className="size-5" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold text-foreground">
              {followUp.lead?.name ?? "Unknown lead"}
            </h3>

            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="size-3.5 shrink-0" />
              <span className="truncate">
                {followUp.lead?.phone ?? "No phone number"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyle(
              followUp.status,
            )}`}
          >
            {label(followUp.status)}
          </span>

          {isOverdue && (
            <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-600">
              Overdue
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="flex min-w-0 items-start gap-3 rounded-xl bg-muted/40 p-3">
          <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Scheduled for</p>
            <p className="mt-1 break-words text-sm font-medium">
              {formatDate(followUp.scheduledAt)}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-start gap-3 rounded-xl bg-muted/40 p-3">
          <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Assigned to</p>
            <p className="mt-1 truncate text-sm font-medium">
              {followUp.assignedTo?.name ?? "Unassigned"}
            </p>
          </div>
        </div>
      </div>

      {/* Edit form */}
      {editing ? (
        <div className="mt-5 space-y-4 border-t border-border pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <DatePicker
                label="Scheduled date and time"
                type="datetime-local"
                value={scheduledAt}
                onChange={setScheduledAt}
                required
                error={errors.scheduledAt}
              />
            </div>

            <div className="min-w-0">
              <Select
                label="Status"
                value={status}
                onChange={(value) => setStatus(value as FollowUpStatus)}
                options={FOLLOW_UP_STATUSES.map((item) => ({
                  value: item,
                  label: label(item),
                }))}
              />
            </div>
          </div>

          <div className="min-w-0">
            <Select
              label="Outcome"
              value={outcome}
              onChange={(value) => setOutcome(value as FollowUpOutcome | "")}
              options={[
                { value: "", label: "Select outcome" },
                ...FOLLOW_UP_OUTCOMES.map((item) => ({
                  value: item,
                  label: label(item),
                })),
              ]}
            />

            {errors.outcome && (
              <p className="mt-1.5 text-xs text-destructive">
                {errors.outcome}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={`follow-up-notes-${followUp.id}`}
              className="mb-1.5 block text-sm font-medium"
            >
              Notes
            </label>

            <textarea
              id={`follow-up-notes-${followUp.id}`}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Add follow-up notes..."
              className="w-full resize-y rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="outline"
              className="h-10"
              leftIcon={X}
              onClick={discardEditing}
              disabled={isSaving}
            >
              Discard
            </Button>

            <Button
              className="h-10"
              leftIcon={Save}
              onClick={() => void handleSave()}
              disabled={isSaving}
              loading={isSaving}
              loadingText="Saving..."
            >
              Save changes
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Outcome and notes */}
          <div className="mt-4 space-y-3">
            {followUp.outcome && (
              <div>
                <p className="text-xs text-muted-foreground">Outcome</p>
                <p className="mt-1 text-sm font-medium">
                  {label(followUp.outcome)}
                </p>
              </div>
            )}

            {followUp.notes && (
              <div className="flex items-start gap-2">
                <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                  {followUp.notes}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-5 flex min-w-0 flex-col gap-3 border-t border-border pt-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 max-w-full items-center gap-2 overflow-x-auto  lg:justify-end">
              {actions}

              {onSave && (
                <div className="pt-6">
                  <Button
                    variant="outline"
                    className="shrink-0 whitespace-nowrap"
                    leftIcon={Pencil}
                    onClick={startEditing}
                    disabled={isSaving}
                  >
                    Edit details
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </article>
  );
}

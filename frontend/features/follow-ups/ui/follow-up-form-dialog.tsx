"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CalendarClock, FileText, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

import { useLeads } from "@/features/leads/lib/leads-queries";
import { useCreateFollowUp } from "../lib/follow-ups.queries";

type FollowUpFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

function toLocalInputDate(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function FollowUpFormDialog({
  open,
  onClose,
  onCreated,
}: FollowUpFormDialogProps) {
  const [leadId, setLeadId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [submitError, setSubmitError] = useState("");

  const toast = useToast();
  const createMutation = useCreateFollowUp();

  const {
    data: leadsResponse,
    isLoading: isLoadingLeads,
    isError: isLeadsError,
  } = useLeads({ page: 1, limit: 100 });

  const leads = leadsResponse?.leads ?? [];

  useEffect(() => {
    if (open) {
      setLeadId("");
      setScheduledAt("");
      setNotes("");
      setSubmitError("");
    }
  }, [open]);

  function handleClose() {
    if (createMutation.isPending) return;
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (createMutation.isPending) return;

    setSubmitError("");

    if (!leadId || !scheduledAt) {
      setSubmitError("Select a lead and scheduled date.");
      return;
    }

    const date = new Date(scheduledAt);

    if (Number.isNaN(date.getTime()) || date.getTime() < Date.now()) {
      setSubmitError("Choose a valid future date and time.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        leadId,
        scheduledAt: date.toISOString(),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });

      toast.success({
        title: "Follow-up scheduled",
        description: "The follow-up has been created.",
      });

      onCreated();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Please check the details and try again.";

      setSubmitError(message);

      toast.error({
        title: "Unable to schedule follow-up",
        description: message,
      });
    }
  }

  const leadOptions = leads.map((lead) => ({
    label: `${lead.name} (${lead.phone})`,
    value: lead.id,
  }));

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Schedule follow-up"
      description="Choose a lead and schedule the next customer conversation."
      loading={createMutation.isPending}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleClose}
            disabled={createMutation.isPending}
            className="h-11 w-full font-semibold sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="follow-up-form"
            size="lg"
            loading={createMutation.isPending}
            loadingText="Scheduling..."
            leftIcon={createMutation.isPending ? undefined : Save}
            disabled={isLoadingLeads || leads.length === 0}
            className="h-11 w-full font-semibold sm:w-auto"
          >
            Schedule follow-up
          </Button>
        </div>
      }
    >
      <form
        id="follow-up-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6"
      >
        {submitError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
          >
            {submitError}
          </div>
        )}

        <section className="space-y-5">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
              <CalendarClock className="size-[18px]" />
            </span>

            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Follow-up details
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Select the customer and when to contact them
              </p>
            </div>
          </div>

          <div>
            <Select
              label="Lead"
              placeholder={
                isLoadingLeads ? "Loading leads..." : "Select a lead"
              }
              options={leadOptions}
              value={leadId}
              onChange={(value) => setLeadId(value)}
              searchable
              disabled={
                isLoadingLeads || isLeadsError || createMutation.isPending
              }
              required
              helperText={
                isLeadsError
                  ? "Unable to load leads. Close this dialog and try again."
                  : "Choose the customer for this follow-up."
              }
            />

            {!isLoadingLeads && !isLeadsError && leads.length === 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                No leads available. Create a lead first.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="follow-up-scheduled-at"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Scheduled date and time
            </label>

            <input
              id="follow-up-scheduled-at"
              type="datetime-local"
              required
              min={toLocalInputDate(new Date())}
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              disabled={createMutation.isPending}
              className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300">
              <FileText className="size-[18px]" />
            </span>

            <div>
              <h3 className="text-sm font-semibold text-foreground">Notes</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Add context for the planned conversation
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="follow-up-notes"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Notes{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>

            <textarea
              id="follow-up-notes"
              rows={4}
              maxLength={1000}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              disabled={createMutation.isPending}
              placeholder="Customer requirements, callback details, or next steps..."
              className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p className="mt-1 text-right text-xs text-muted-foreground">
              {notes.length}/1000
            </p>
          </div>
        </section>
      </form>
    </Modal>
  );
}

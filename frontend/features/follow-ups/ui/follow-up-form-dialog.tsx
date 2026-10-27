"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CalendarClock, FileText, Save } from "lucide-react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

import { useLeads } from "@/features/leads/lib/leads-queries";
import { useCreateFollowUp } from "../lib/follow-ups.queries";

type FollowUpFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

type FormErrors = {
  leadId?: string;
  scheduledAt?: string;
  notes?: string;
};

function toLocalInputDate(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return error instanceof Error
    ? error.message
    : "Please check the details and try again.";
}

export function FollowUpFormDialog({
  open,
  onClose,
  onCreated,
}: FollowUpFormDialogProps) {
  const [leadId, setLeadId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
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
    if (!open) return;

    setLeadId("");
    setScheduledAt("");
    setNotes("");
    setErrors({});
    setSubmitError("");
  }, [open]);

  function handleClose() {
    if (createMutation.isPending) return;
    onClose();
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!leadId) {
      nextErrors.leadId = "Please select a lead.";
    }

    if (!scheduledAt) {
      nextErrors.scheduledAt = "Please select a date and time.";
    } else {
      const date = new Date(scheduledAt);

      if (Number.isNaN(date.getTime())) {
        nextErrors.scheduledAt = "Please select a valid date and time.";
      } else if (date.getTime() <= Date.now()) {
        nextErrors.scheduledAt = "Choose a future date and time.";
      }
    }

    if (notes.length > 1000) {
      nextErrors.notes = "Notes must be 1,000 characters or fewer.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (createMutation.isPending) return;

    setSubmitError("");

    if (!validateForm()) return;

    try {
      await createMutation.mutateAsync({
        leadId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });

      toast.success({
        title: "Follow-up scheduled",
        description: "The follow-up has been created.",
      });

      onCreated();
    } catch (error) {
      const message = getErrorMessage(error);
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
            disabled={isLoadingLeads || isLeadsError || leads.length === 0}
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
            className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {submitError}
          </div>
        )}

        <section className="space-y-5">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <span className="flex size-9 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
              <CalendarClock className="size-[18px]" />
            </span>

            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Follow-up details
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Select the customer and when to contact them.
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
              onChange={(value) => {
                setLeadId(value);
                setErrors((current) => ({
                  ...current,
                  leadId: undefined,
                }));
              }}
              searchable
              disabled={
                isLoadingLeads || isLeadsError || createMutation.isPending
              }
              helperText={
                isLeadsError
                  ? "Unable to load leads. Close this dialog and try again."
                  : "Choose the customer for this follow-up."
              }
            />

            {errors.leadId && (
              <p role="alert" className="mt-1.5 text-xs text-destructive">
                {errors.leadId}
              </p>
            )}

            {!isLoadingLeads && !isLeadsError && leads.length === 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                No leads available. Create a lead first.
              </p>
            )}
          </div>

          <DatePicker
            id="follow-up-scheduled-at"
            label="Scheduled date and time"
            value={scheduledAt}
            onChange={(value) => {
              setScheduledAt(value);
              setErrors((current) => ({
                ...current,
                scheduledAt: undefined,
              }));
            }}
            min={toLocalInputDate(new Date())}
            disabled={createMutation.isPending}
            required
            error={errors.scheduledAt}
            helperText="Choose a future date and time."
          />
        </section>

        <section className="space-y-5">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <span className="flex size-9 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300">
              <FileText className="size-[18px]" />
            </span>

            <div>
              <h3 className="text-sm font-semibold text-foreground">Notes</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Add context for the planned conversation.
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
              onChange={(event) => {
                setNotes(event.target.value);
                setErrors((current) => ({
                  ...current,
                  notes: undefined,
                }));
              }}
              disabled={createMutation.isPending}
              placeholder="Customer requirements, callback details, or next steps..."
              className="w-full resize-y rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            />

            {errors.notes && (
              <p role="alert" className="mt-1.5 text-xs text-destructive">
                {errors.notes}
              </p>
            )}

            <p className="mt-1 text-right text-xs text-muted-foreground">
              {notes.length}/1000
            </p>
          </div>
        </section>
      </form>
    </Modal>
  );
}

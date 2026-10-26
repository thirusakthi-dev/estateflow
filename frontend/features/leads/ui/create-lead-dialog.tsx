"use client";

import { useEffect, useState, type FormEvent } from "react";
import { GitBranch, Globe, Mail, Phone, Save, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";

import {
  LEAD_STAGES,
  type CreateLeadInput,
  type Employee,
  type Lead,
  type LeadStage,
  type UpdateLeadInput,
} from "../lib/leads.types";

type LeadFormValues = {
  name: string;
  phone: string;
  email: string;
  source: string;
  stage: LeadStage;
  assignedToId: string;
};

type LeadFormErrors = {
  name: string;
  phone: string;
  email: string;
  stage: string;
};

type CreateLeadFormProps = {
  mode?: "create" | "edit";
  lead?: Lead | null;
  employees: Employee[];
  loading?: boolean;
  onCreate: (input: CreateLeadInput) => Promise<unknown>;
  onUpdate?: (input: {
    id: string;
    details: UpdateLeadInput;
    assignedToId: string | null;
  }) => Promise<unknown>;
  onCancel?: () => void;
};

const EMPTY_FORM: LeadFormValues = {
  name: "",
  phone: "",
  email: "",
  source: "",
  stage: "NEW",
  assignedToId: "",
};

const EMPTY_ERRORS: LeadFormErrors = {
  name: "",
  phone: "",
  email: "",
  stage: "",
};

const stageLabels: Record<LeadStage, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  SITE_VISIT: "Site visit",
  INTERESTED: "Interested",
  NEGOTIATION: "Negotiation",
  BOOKED: "Booked",
  LOST: "Lost",
};

const sectionHeadingClass =
  "flex items-center gap-3 text-sm font-semibold text-foreground";

const iconBaseClass =
  "flex size-9 shrink-0 items-center justify-center rounded-xl border";

export function CreateLeadForm({
  mode = "create",
  lead,
  employees,
  loading = false,
  onCreate,
  onUpdate,
  onCancel,
}: CreateLeadFormProps) {
  const [form, setForm] = useState<LeadFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<LeadFormErrors>(EMPTY_ERRORS);
  const [submitError, setSubmitError] = useState("");

  const isEdit = mode === "edit";

  useEffect(() => {
    setForm(
      isEdit && lead
        ? {
            name: lead.name,
            phone: lead.phone,
            email: lead.email ?? "",
            source: lead.source ?? "",
            stage: lead.stage,
            assignedToId: lead.assignedToId ?? "",
          }
        : EMPTY_FORM,
    );

    setErrors(EMPTY_ERRORS);
    setSubmitError("");
  }, [mode, lead]);

  function setField<K extends keyof LeadFormValues>(
    key: K,
    value: LeadFormValues[K],
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));

    if (key in EMPTY_ERRORS) {
      setErrors((previous) => ({
        ...previous,
        [key]: "",
      }));
    }

    setSubmitError("");
  }

  function validateForm(): boolean {
    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();

    const nextErrors: LeadFormErrors = {
      name: name.length < 2 ? "Name must contain at least 2 characters." : "",
      phone: !/^\d{7,15}$/.test(phone)
        ? "Enter a valid phone number using 7–15 digits."
        : "",
      email:
        email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ? "Enter a valid email address."
          : "",
      stage: !form.stage ? "Please select a lead stage." : "",
    };

    setErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setSubmitError("");

    if (!validateForm()) return;

    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();
    const source = form.source.trim();

    try {
      if (mode === "create") {
        await onCreate({
          name,
          phone,
          email: email || undefined,
          source: source || undefined,
          assignedToId: form.assignedToId || undefined,
        });
      } else {
        if (!lead || !onUpdate) {
          setSubmitError("Unable to update this lead.");
          return;
        }

        await onUpdate({
          id: lead.id,
          details: {
            name,
            phone,
            email: email || null,
            source: source || null,
            stage: form.stage,
          },
          assignedToId: form.assignedToId || null,
        });
      }

      // The parent handles closing the modal after success.
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : `Could not ${mode === "create" ? "create" : "update"} lead.`,
      );
    }
  }

  const employeeOptions = [
    { label: "Unassigned", value: "" },
    ...employees
      .filter(
        (employee) => employee.isActive && employee.role === "SALES_EMPLOYEE",
      )
      .map((employee) => ({
        label: `${employee.name} (${employee.email})`,
        value: employee.id,
      })),
  ];

  const stageOptions = LEAD_STAGES.map((stage) => ({
    label: stageLabels[stage],
    value: stage,
  }));

  return (
    <Modal
      open
      onClose={() => {
        if (!loading) onCancel?.();
      }}
      title={isEdit ? "Edit lead" : "Create lead"}
      description={
        isEdit
          ? "Update contact information and sales pipeline details."
          : "Add a new contact to your sales pipeline."
      }
      loading={loading}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onCancel}
            disabled={loading}
            className="h-11 w-full font-semibold sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="lead-form"
            size="lg"
            loading={loading}
            loadingText={isEdit ? "Saving changes..." : "Creating lead..."}
            leftIcon={loading ? undefined : Save}
            className="h-11 w-full font-semibold sm:w-auto"
          >
            {isEdit ? "Save changes" : "Create lead"}
          </Button>
        </div>
      }
    >
      <form
        id="lead-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-7"
      >
        {submitError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
          >
            {submitError}
          </div>
        )}

        {/* Contact information */}
        <section className="space-y-5">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
            <div className={sectionHeadingClass}>
              <span
                className={`${iconBaseClass} border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300`}
              >
                <User className="size-[18px]" />
              </span>

              <div>
                <h3>Contact information</h3>
                <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                  Basic details about your lead
                </p>
              </div>
            </div>

            <span className="hidden text-xs text-muted-foreground sm:block">
              * Required
            </span>
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
            <Input
              label="Full name"
              placeholder="Enter full name"
              value={form.name}
              onChange={(event) => setField("name", event.target.value)}
              leftIcon={User}
              disabled={loading}
              required
              error={errors.name}
              autoComplete="name"
            />

            <Input
              label="Phone number"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={(event) => setField("phone", event.target.value)}
              leftIcon={Phone}
              disabled={loading}
              required
              error={errors.phone}
              type="tel"
              autoComplete="tel"
            />

            <Input
              label="Email address"
              placeholder="name@example.com"
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
              leftIcon={Mail}
              disabled={loading}
              error={errors.email}
              type="email"
              autoComplete="email"
            />

            <Input
              label="Lead source"
              placeholder="Website, referral, campaign"
              value={form.source}
              onChange={(event) => setField("source", event.target.value)}
              leftIcon={Globe}
              disabled={loading}
            />
          </div>
        </section>

        {/* Pipeline and assignment */}
        <section className="space-y-5">
          <div className={`${sectionHeadingClass} border-b border-border pb-3`}>
            <span
              className={`${iconBaseClass} border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-300`}
            >
              <GitBranch className="size-[18px]" />
            </span>

            <div>
              <h3>Pipeline & assignment</h3>
              <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                Manage progress and ownership
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
            <Select
              label="Lead stage"
              placeholder="Select lead stage"
              options={stageOptions}
              value={form.stage}
              onChange={(value) => setField("stage", value as LeadStage)}
              disabled={loading}
              required
              error={errors.stage}
            />

            <Select
              label="Assigned sales employee"
              placeholder="Select an employee"
              options={employeeOptions}
              value={form.assignedToId}
              onChange={(value) => setField("assignedToId", value)}
              searchable
              clearable
              disabled={loading}
              helperText="Optional. You can assign this lead later."
            />
          </div>
        </section>
      </form>
    </Modal>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { Save } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

import { useCreateEmployee, useUpdateEmployee } from "../lib/employees.queries";
import type { Employee } from "../lib/employees.types";

type EmployeeFormDialogProps = {
  open: boolean;
  employee?: Employee | null;
  onClose: () => void;
};

export function EmployeeFormDialog({
  open,
  employee,
  onClose,
}: EmployeeFormDialogProps) {
  const isEditing = Boolean(employee);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState("");

  const toast = useToast();
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) return;

    setName(employee?.name ?? "");
    setEmail(employee?.email ?? "");
    setPassword("");
    setSubmitError("");
  }, [open, employee]);

  function handleClose() {
    if (!isPending) onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    try {
      if (employee) {
        await updateMutation.mutateAsync({
          id: employee.id,
          input: { name: name.trim(), email: email.trim() },
        });

        toast.success({
          title: "Employee updated",
          description: "Employee details have been updated.",
        });
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          email: email.trim(),
          password,
        });

        toast.success({
          title: "Employee created",
          description: "The sales employee account has been created.",
        });
      }

      onClose();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Unable to save employee."
        : "Unable to save employee.";

      setSubmitError(message);

      toast.error({
        title: "Unable to save employee",
        description: message,
      });
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? "Edit employee" : "Add sales employee"}
      description={
        isEditing
          ? "Update the employee's account details."
          : "Create an account for a new sales employee."
      }
      loading={isPending}
      maxWidth="max-w-xl"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="employee-form"
            loading={isPending}
            loadingText="Saving..."
            leftIcon={!isPending ? Save : undefined}
          >
            {isEditing ? "Save changes" : "Create employee"}
          </Button>
        </div>
      }
    >
      <form id="employee-form" onSubmit={handleSubmit} className="space-y-5">
        {submitError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
          >
            {submitError}
          </div>
        )}

        <Input
          label="Full name"
          placeholder="Enter employee name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          minLength={2}
          maxLength={100}
          required
          disabled={isPending}
        />

        <Input
          label="Email address"
          type="email"
          placeholder="employee@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={isPending}
        />

        {!isEditing && (
          <Input
            label="Temporary password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            maxLength={100}
            autoComplete="new-password"
            required
            disabled={isPending}
            helperText="Share this securely with the employee. A password-reset flow can be added later."
          />
        )}

        {isEditing && (
          <p className="text-sm text-muted-foreground">
            Password changes should be handled through a secure password-reset
            flow.
          </p>
        )}
      </form>
    </Modal>
  );
}

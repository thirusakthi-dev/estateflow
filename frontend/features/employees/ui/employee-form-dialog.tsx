"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { Eye, EyeOff, KeyRound, Save } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
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
    setShowPassword(false);
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
        const input: {
          name: string;
          email: string;
          password?: string;
        } = {
          name: name.trim(),
          email: email.trim(),
        };

        // Only send a password if a new one was entered.
        if (password.length > 0) {
          input.password = password;
        }

        await updateMutation.mutateAsync({
          id: employee.id,
          input,
        });

        toast.success({
          title: "Employee updated",
          description:
            password.length > 0
              ? "Employee details and password have been updated."
              : "Employee details have been updated.",
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
        : error instanceof Error
          ? error.message
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
          ? "Update account details or set a new password."
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

        <div className="space-y-2">
          <label
            htmlFor="employee-password"
            className="flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <KeyRound
              className="size-4 text-violet-600 dark:text-violet-400"
              aria-hidden={true}
            />
            {isEditing ? "New password" : "Temporary password"}
            {!isEditing && <span className="text-destructive">*</span>}
          </label>

          <div className="relative">
            <Input
              id="employee-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={
                isEditing
                  ? "Leave blank to keep current password"
                  : "At least 8 characters"
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              maxLength={100}
              autoComplete="new-password"
              required={!isEditing}
              disabled={isPending}
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              disabled={isPending}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden={true} />
              ) : (
                <Eye className="size-4" aria-hidden={true} />
              )}
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            {isEditing
              ? "Optional. Enter at least 8 characters to change the password. Leave blank to keep the current password."
              : "Use at least 8 characters. Share the temporary password securely with the employee."}
          </p>
        </div>
      </form>
    </Modal>
  );
}

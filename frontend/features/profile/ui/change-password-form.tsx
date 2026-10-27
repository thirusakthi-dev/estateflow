"use client";

import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChangePassword } from "../lib/profile.queries";

export function ChangePasswordForm() {
  const mutation = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    if (newPassword.length > 72) {
      setError("Your new password cannot exceed 72 characters.");
      return;
    }

    if (newPassword === currentPassword) {
      setError("Your new password must differ from your current password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }

    mutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setError("");
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Security information */}
      <div className="flex items-start gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <ShieldCheck className="size-5" />
        </div>

        <div>
          <h3 className="text-sm font-semibold">Keep your account secure</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a unique password with at least 8 characters.
          </p>
        </div>
      </div>

      {/* Password fields */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Current password"
            type="password"
            autoComplete="current-password"
            leftIcon={LockKeyhole}
            value={currentPassword}
            onChange={(event) => {
              setCurrentPassword(event.target.value);
              setError("");
            }}
            placeholder="Enter your current password"
            required
            disabled={mutation.isPending}
          />
        </div>

        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          leftIcon={KeyRound}
          value={newPassword}
          onChange={(event) => {
            setNewPassword(event.target.value);
            setError("");
          }}
          placeholder="At least 8 characters"
          minLength={8}
          maxLength={72}
          required
          disabled={mutation.isPending}
        />

        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          leftIcon={KeyRound}
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setError("");
          }}
          placeholder="Re-enter new password"
          required
          disabled={mutation.isPending}
        />
      </div>

      {/* Validation error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Success message */}
      {mutation.isSuccess && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4 shrink-0" />
          Password updated successfully.
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          You will need your current password to continue.
        </p>

        <Button
          type="submit"
          loading={mutation.isPending}
          loadingText="Updating..."
          leftIcon={LockKeyhole}
          className="min-w-[9rem]"
        >
          Update password
        </Button>
      </div>
    </form>
  );
}

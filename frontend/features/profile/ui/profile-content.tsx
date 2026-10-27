"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Globe,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppLoader } from "@/components/ui/app-loader";
import { isAdmin } from "@/lib/permissions";

import { useProfile, useUpdateProfile } from "../lib/profile.queries";
import type { UpdateProfileInput } from "../lib/profile.types";
import { ChangePasswordForm } from "./change-password-form";

type ProfileFieldErrors = Partial<Record<keyof UpdateProfileInput, string>>;

export function ProfileContent() {
  const { data: user, isLoading, isError, refetch } = useProfile();
  const updateMutation = useUpdateProfile();

  const [form, setForm] = useState<UpdateProfileInput>({
    name: "",
    email: "",
    phone: "",
    websiteUrl: "",
  });

  const [errors, setErrors] = useState<ProfileFieldErrors>({});

  const admin = isAdmin(user?.role);

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      websiteUrl: user.websiteUrl ?? "",
    });
  }, [user]);

  function updateField<K extends keyof UpdateProfileInput>(
    field: K,
    value: UpdateProfileInput[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function validateForm(): boolean {
    const nextErrors: ProfileFieldErrors = {};

    const name = form.name?.trim() ?? "";
    const email = form.email?.trim() ?? "";
    const phone = form.phone?.trim() ?? "";
    const websiteUrl = form.websiteUrl?.trim() ?? "";

    if (!name) {
      nextErrors.name = "Full name is required.";
    } else if (name.length < 2) {
      nextErrors.name = "Name must contain at least 2 characters.";
    } else if (name.length > 100) {
      nextErrors.name = "Name cannot exceed 100 characters.";
    }

    if (!email) {
      nextErrors.email = "Email address is required.";
    } else if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (phone && !/^\+?[0-9()\s.-]{7,20}$/.test(phone)) {
      nextErrors.phone = "Enter a valid phone number.";
    }

    if (websiteUrl) {
      try {
        const url = new URL(websiteUrl);

        if (
          !["http:", "https:"].includes(url.protocol) ||
          !url.hostname.includes(".")
        ) {
          nextErrors.websiteUrl =
            "Enter a valid website URL starting with https://.";
        }
      } catch {
        nextErrors.websiteUrl =
          "Enter a valid website URL starting with https://.";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (updateMutation.isPending || !validateForm()) return;

    updateMutation.mutate({
      name: form.name?.trim() ?? "",
      email: form.email?.trim() ?? "",
      phone: form.phone?.trim() || null,
      websiteUrl: form.websiteUrl?.trim() || null,
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center">
        <AppLoader message="Loading your profile" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="mx-auto flex min-h-[320px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-border p-6 text-center xl:w-3/4">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertCircle className="size-6 text-destructive" />
        </div>

        <h2 className="text-lg font-semibold">Unable to load your profile</h2>

        <p className="max-w-sm text-sm text-muted-foreground">
          Check your connection and try again.
        </p>

        <Button type="button" variant="outline" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full space-y-6 pb-10 xl:w-3/4">
      {/* Profile banner */}
      <section className="relative isolate overflow-hidden rounded-2xl border border-border bg-card">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600" />

        <div className="absolute -right-12 -top-24 -z-10 size-72 rounded-full border-[40px] border-white/10" />
        <div className="absolute right-24 top-16 -z-10 size-24 rounded-full bg-pink-300/20 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 -z-10 h-20 w-48 rounded-full bg-blue-300/20 blur-2xl" />

        <div className="relative flex flex-col gap-6 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/15 shadow-lg backdrop-blur-sm sm:size-24">
              <div className="flex size-16 items-center justify-center rounded-xl bg-gradient-to-br from-white/30 to-white/5 sm:size-20">
                <UserRound
                  className="size-10 text-white sm:size-12"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                  <Sparkles className="size-3.5" />
                  My profile
                </span>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    user.isActive
                      ? "bg-emerald-400/20 text-emerald-100"
                      : "bg-rose-400/20 text-rose-100"
                  }`}
                >
                  {user.isActive ? "Active account" : "Inactive account"}
                </span>
              </div>

              <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
                {user.name}
              </h1>

              <p className="mt-1 flex items-center gap-2 truncate text-sm text-white/80">
                <Mail className="size-4 shrink-0" />
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/15">
              <ShieldCheck className="size-5" />
            </div>

            <div>
              <p className="text-sm font-semibold">
                {admin ? "Administrator" : "Sales Employee"}
              </p>

              <p className="mt-0.5 text-xs text-white/75">
                EstateFlow workspace
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-between gap-4 border-t border-white/20 bg-black/10 px-6 py-3 text-xs text-white/80 sm:px-8">
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-300" />
            Manage your account details
          </span>

          <span className="hidden items-center gap-1 sm:flex">
            Account settings
            <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </section>

      {/* Personal information */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-8">
        <div className="mb-7">
          <h2 className="text-lg font-semibold tracking-tight">
            Personal information
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Keep your contact details up to date.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              id="profile-name"
              name="name"
              label="Full name"
              value={form.name ?? ""}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Enter your full name"
              error={errors.name}
              maxLength={100}
              disabled={updateMutation.isPending}
            />

            <Input
              id="profile-email"
              name="email"
              label="Email address"
              type="email"
              leftIcon={Mail}
              value={form.email ?? ""}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="you@example.com"
              error={errors.email}
              disabled={updateMutation.isPending}
            />

            <Input
              id="profile-phone"
              name="phone"
              label="Phone number"
              type="tel"
              leftIcon={Phone}
              value={form.phone ?? ""}
              onChange={(event) => updateField("phone", event.target.value)}
              placeholder="Enter your phone number"
              error={errors.phone}
              disabled={updateMutation.isPending}
            />

            <Input
              id="profile-website"
              name="websiteUrl"
              label="Website"
              type="url"
              leftIcon={Globe}
              value={form.websiteUrl ?? ""}
              onChange={(event) =>
                updateField("websiteUrl", event.target.value)
              }
              placeholder="https://example.com"
              error={errors.websiteUrl}
              helperText={
                errors.websiteUrl
                  ? undefined
                  : "Optional. Add your professional website."
              }
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Your changes will be saved to your account.
            </p>

            <Button
              type="submit"
              loading={updateMutation.isPending}
              loadingText="Saving..."
              leftIcon={Save}
              className="min-w-[9rem]"
            >
              Save
            </Button>
          </div>
        </form>
      </section>

      {/* Password settings — administrators only */}
      {admin && (
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-start gap-4 border-b border-border p-5 sm:p-7">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <ShieldCheck className="size-5" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight">
                  Password and security
                </h2>

                <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-300">
                  Admin only
                </span>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Update your administrator password to help keep your account
                secure.
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <ChangePasswordForm />
          </div>
        </section>
      )}
    </div>
  );
}

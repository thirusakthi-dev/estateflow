"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Globe, Phone, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfile, useUpdateProfile } from "../lib/profile.queries";
import type { Profile, UpdateProfileInput } from "../lib/profile.types";
import { ChangePasswordForm } from "./change-password-form";

export function ProfileContent() {
  const { data, isLoading, isError, refetch } = useProfile();
  const updateMutation = useUpdateProfile();

  const user = data?.user;

  const [form, setForm] = useState<UpdateProfileInput>({});

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        avatarUrl: user.avatarUrl ?? "",
        linkedinUrl: user.linkedinUrl ?? "",
        websiteUrl: user.websiteUrl ?? "",
      });
    }
  }, [user]);

  function updateField<K extends keyof UpdateProfileInput>(
    key: K,
    value: UpdateProfileInput[K],
  ) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: UpdateProfileInput = {
      name: form.name?.trim(),
      email: form.email?.trim(),
      phone: form.phone?.trim() || null,
      avatarUrl: form.avatarUrl?.trim() || null,
      linkedinUrl: form.linkedinUrl?.trim() || null,
      websiteUrl: form.websiteUrl?.trim() || null,
    };

    updateMutation.mutate(payload);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
        <p className="font-medium">Unable to load your profile.</p>
        <Button className="mt-4" onClick={() => void refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const initials = user.name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your personal information and account security.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="h-24 bg-slate-100 dark:bg-slate-900" />

        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          <div className="-mt-10 flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-slate-200 text-xl font-semibold text-slate-700 dark:border-slate-950 dark:bg-slate-800 dark:text-white">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.name}'s avatar`}
                className="size-full object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div className="min-w-0 flex-1 sm:pb-1">
            <h2 className="truncate text-lg font-semibold">{user.name}</h2>
            <p className="truncate text-sm text-slate-500">{user.email}</p>
          </div>

          <div className="flex flex-wrap gap-2 sm:pb-1">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium dark:bg-slate-800">
              {user.role === "ADMIN" ? "Administrator" : "Sales Employee"}
            </span>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
              {user.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-6">
          <h2 className="font-semibold">Personal information</h2>
          <p className="mt-1 text-sm text-slate-500">
            Update the information associated with your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Full name"
              value={form.name ?? ""}
              onChange={(event) => updateField("name", event.target.value)}
              minLength={2}
              maxLength={100}
              required
            />

            <Input
              label="Email address"
              type="email"
              value={form.email ?? ""}
              onChange={(event) => updateField("email", event.target.value)}
              required
            />

            <Input
              label="Phone number"
              type="tel"
              value={form.phone ?? ""}
              onChange={(event) => updateField("phone", event.target.value)}
              maxLength={20}
              leftIcon={Phone}
            />

            <Input
              label="Avatar image URL"
              type="url"
              value={form.avatarUrl ?? ""}
              onChange={(event) => updateField("avatarUrl", event.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />

            <Input
              label="LinkedIn profile"
              type="url"
              value={form.linkedinUrl ?? ""}
              onChange={(event) =>
                updateField("linkedinUrl", event.target.value)
              }
              placeholder="https://linkedin.com/in/your-profile"
            />

            <Input
              label="Website"
              type="url"
              value={form.websiteUrl ?? ""}
              onChange={(event) =>
                updateField("websiteUrl", event.target.value)
              }
              placeholder="https://example.com"
              leftIcon={Globe}
            />
          </div>

          <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-800">
            <Button
              type="submit"
              loading={updateMutation.isPending}
              leftIcon={Save}
            >
              Save changes
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        <ChangePasswordForm />
      </section>

      <p className="text-xs text-slate-500">
        Account created {new Date(user.createdAt).toLocaleDateString()}. Your
        role and account status are managed by an administrator.
      </p>
    </div>
  );
}

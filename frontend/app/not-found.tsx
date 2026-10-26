"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Compass, Home, Search } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function NotFound() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground transition-colors duration-500 sm:px-6">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 -top-32 size-80 rounded-full bg-slate-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 size-96 rounded-full bg-slate-400/10 blur-3xl" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_75%)]" />
      </div>

      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg text-center"
      >
        {/* Icon */}
        <div className="mx-auto mb-7 flex size-16 items-center justify-center rounded-2xl border border-border bg-surface shadow-sm">
          <Compass
            size={30}
            strokeWidth={1.7}
            className="text-muted"
            aria-hidden="true"
          />
        </div>

        {/* Error code */}
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted">
          Page not found
        </p>

        <h1 className="mt-3 text-7xl font-semibold tracking-tighter sm:text-8xl">
          404
        </h1>

        <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
          Looks like you&apos;re off the map.
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted sm:text-base">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved. Let&apos;s get you back to your workspace.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
          >
            <Home size={17} aria-hidden="true" />
            Go to home
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 dark:text-slate-900"
          >
            Back to dashboard
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>

        {/* Footer hint */}
        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted">
          <Search size={14} aria-hidden="true" />
          <span>Check the URL or choose one of the options above.</span>
        </div>

        <Link
          href="/login"
          className="mt-5 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-500"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Sign in to EstateFlow
        </Link>
      </motion.section>
    </main>
  );
}

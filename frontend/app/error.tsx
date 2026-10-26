"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Workflow,
} from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    console.error("EstateFlow application error:", error);
  }, [error]);

  const fadeUp = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 18 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-12 text-foreground transition-colors duration-500 sm:px-6">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : { x: [0, 18, 0], y: [0, -16, 0], scale: [1, 1.06, 1] }
          }
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-36 -top-36 size-96 rounded-full bg-slate-400/10 blur-3xl"
        />

        <motion.div
          animate={
            reduceMotion
              ? undefined
              : { x: [0, -16, 0], y: [0, 18, 0], scale: [1, 1.08, 1] }
          }
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-40 -right-32 size-[28rem] rounded-full bg-slate-400/10 blur-3xl"
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_75%)]" />
      </div>

      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 sm:p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-500"
          aria-label="EstateFlow home"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-background">
            <Workflow size={19} strokeWidth={2.2} aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            EstateFlow
          </span>
        </Link>

        <ThemeToggle />
      </header>

      {/* Main content */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: reduceMotion ? 0 : 0.09,
              delayChildren: reduceMotion ? 0 : 0.05,
            },
          },
        }}
        className="relative z-10 mx-auto w-full max-w-xl text-center"
      >
        {/* Animated error illustration */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mb-8 flex size-28 items-center justify-center"
        >
          <motion.div
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 rounded-[2rem] border border-dashed border-border"
          />

          <motion.div
            animate={
              reduceMotion
                ? undefined
                : { y: [0, -5, 0], rotate: [0, -2, 2, 0] }
            }
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative flex size-20 items-center justify-center rounded-3xl border border-destructive/20 bg-background shadow-xl shadow-black/[0.04]"
          >
            <AlertTriangle
              size={34}
              strokeWidth={1.6}
              className="text-destructive"
              aria-hidden="true"
            />

            <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full border-2 border-background bg-destructive text-white">
              <span className="text-xs font-bold">!</span>
            </span>
          </motion.div>
        </motion.div>

        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.45 }}
          className="text-xs font-semibold uppercase tracking-[0.28em] text-muted"
        >
          Unexpected interruption
        </motion.p>

        <motion.h1
          variants={fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl"
        >
          Something went
          <span className="mt-1 block text-muted">off track.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-5 max-w-md text-sm leading-7 text-muted sm:text-base"
        >
          An unexpected error interrupted this page. Your workspace is still
          here — try again, or return to your dashboard.
        </motion.p>

        {/* Actions */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
        >
          <motion.button
            type="button"
            onClick={reset}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-primary px-6 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-slate-500 dark:text-slate-900"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Try again
          </motion.button>

          <motion.div
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          >
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl border border-border bg-background px-6 text-sm font-medium transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-slate-500"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Back to dashboard
            </Link>
          </motion.div>
        </motion.div>

        {/* Error reference */}
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mt-10 border-t border-border pt-5"
        >
          <p className="text-xs leading-5 text-muted">
            If this keeps happening, try again in a moment.
          </p>

          {error.digest && (
            <p className="mt-2 font-mono text-[11px] text-muted/80">
              Reference: {error.digest}
            </p>
          )}
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="mt-8 flex items-center justify-center gap-2 text-xs text-muted"
        >
          <span className="size-1.5 rounded-full bg-success" />
          <span>EstateFlow workspace</span>
          <span aria-hidden="true">·</span>
          <Link
            href="/login"
            className="font-medium transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-slate-500"
          >
            Sign in
          </Link>
          <ArrowRight size={12} aria-hidden="true" />
        </motion.div>
      </motion.section>
    </main>
  );
}

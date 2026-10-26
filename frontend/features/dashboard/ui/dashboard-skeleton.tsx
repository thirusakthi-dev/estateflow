"use client";

import { useReducedMotion } from "motion/react";

export default function DashboardSkeleton() {
  const reduceMotion = useReducedMotion();
  const pulse = reduceMotion ? "" : "animate-pulse";

  return (
    <main
      className="space-y-7 p-4 md:p-8"
      aria-label="Loading dashboard"
      aria-busy="true"
    >
      <p role="status" className="sr-only">
        Loading dashboard data...
      </p>

      <header className="space-y-3">
        <div className={`h-4 w-24 rounded bg-muted ${pulse}`} />
        <div className={`h-8 w-44 rounded-lg bg-muted ${pulse}`} />
        <div className={`h-4 w-64 max-w-full rounded bg-muted ${pulse}`} />
      </header>

      <section
        aria-label="Dashboard statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-background p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className={`h-4 w-28 rounded bg-muted ${pulse}`} />
              <div className={`h-10 w-10 rounded-xl bg-muted ${pulse}`} />
            </div>
            <div className={`mt-5 h-8 w-20 rounded bg-muted ${pulse}`} />
            <div className={`mt-3 h-3 w-36 rounded bg-muted ${pulse}`} />
          </div>
        ))}
      </section>

      <section
        aria-label="Recent activity"
        className="grid gap-6 xl:grid-cols-2"
      >
        {["Recent leads", "Recent bookings"].map((title) => (
          <div
            key={title}
            className="overflow-hidden rounded-2xl border border-border bg-background"
          >
            <div className="border-b border-border p-5">
              <div className={`h-5 w-36 rounded bg-muted ${pulse}`} />
              <div className={`mt-2 h-4 w-48 rounded bg-muted ${pulse}`} />
            </div>

            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-5">
                  <div
                    className={`h-10 w-10 shrink-0 rounded-xl bg-muted ${pulse}`}
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div
                      className={`h-4 w-36 max-w-full rounded bg-muted ${pulse}`}
                    />
                    <div
                      className={`h-3 w-24 max-w-full rounded bg-muted ${pulse}`}
                    />
                    <div
                      className={`h-3 w-32 max-w-full rounded bg-muted ${pulse}`}
                    />
                  </div>
                  <div
                    className={`h-6 w-16 shrink-0 rounded-full bg-muted ${pulse}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section
        aria-label="Additional statistics"
        className="grid gap-4 sm:grid-cols-2"
      >
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 rounded-2xl border border-border bg-background p-5"
          >
            <div className={`h-12 w-12 rounded-xl bg-muted ${pulse}`} />
            <div className="space-y-2">
              <div className={`h-4 w-24 rounded bg-muted ${pulse}`} />
              <div className={`h-7 w-16 rounded bg-muted ${pulse}`} />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

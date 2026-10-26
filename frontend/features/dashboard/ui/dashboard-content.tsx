"use client";

import { AlertCircle, LayoutDashboard, RefreshCw } from "lucide-react";
import { useReducedMotion } from "motion/react";

import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { useDashboard } from "../lib/use-dashboard";
import DashboardStats from "./dashboard-stats";
import DashboardCharts from "./dashboard-charts";
import DashboardActivity from "./dashboard-activity";
import DashboardSkeleton from "./dashboard-skeleton";

export default function DashboardContent() {
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();

  const reduceMotion = useReducedMotion();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-4">
        <EmptyState
          title="Unable to load dashboard"
          description="Check your connection and try again."
          icon={AlertCircle}
          actionLabel={isFetching ? "Retrying..." : "Try again"}
          onAction={() => void refetch()}
          className="w-full max-w-xl"
        />
      </main>
    );
  }

  const { summary, charts, recentLeads, recentBookings } = data;

  return (
    <main className="mx-auto min-w-0 w-full max-w-7xl space-y-5 px-4 sm:space-y-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Dashboard"
        description="Here's an overview of your real estate operations."
        icon={LayoutDashboard}
        actions={
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-label={
              isFetching ? "Refreshing dashboard" : "Refresh dashboard"
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={15}
              className={isFetching && !reduceMotion ? "animate-spin" : ""}
              aria-hidden="true"
            />
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        }
      />

      <DashboardStats summary={summary} />

      <DashboardCharts charts={charts} />

      <DashboardActivity leads={recentLeads} bookings={recentBookings} />
    </main>
  );
}

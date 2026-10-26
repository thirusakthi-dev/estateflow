"use client";

import { useCallback, useMemo, useState } from "react";
import {
  CalendarClock,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FilterX,
  Plus,
  RefreshCw,
  ServerCrash,
  XCircle,
} from "lucide-react";
import axios from "axios";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { StatsCard } from "@/components/ui/stats-card";
import { SearchFilterToolbar } from "@/components/ui/search-filter-toolbar";
import { useToast } from "@/components/ui/toast";

import { useFollowUps, useUpdateFollowUp } from "../lib/follow-ups.queries";

import {
  FOLLOW_UP_OUTCOMES,
  FOLLOW_UP_STATUSES,
} from "../lib/follow-ups.types";

import type {
  FollowUp,
  FollowUpFilters,
  FollowUpOutcome,
  FollowUpStatus,
} from "../lib/follow-ups.types";

import { FollowUpCard } from "./follow-up-card";
import { FollowUpFormDialog } from "./follow-up-form-dialog";

const PAGE_SIZE = 10;

function errorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
}

function label(value: string) {
  return value.replaceAll("_", " ");
}

export function FollowUpsContent() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const [outcomeById, setOutcomeById] = useState<
    Record<string, FollowUpOutcome | "">
  >({});

  const toast = useToast();

  const filters: FollowUpFilters = {
    page,
    limit: PAGE_SIZE,
    ...(statusFilter ? { status: statusFilter as FollowUpStatus } : {}),
  };

  const { data, isLoading, isFetching, isError, refetch } =
    useFollowUps(filters);

  const updateMutation = useUpdateFollowUp();

  const followUps = data?.followUps ?? [];
  const pagination = data?.pagination;

  // Search the currently loaded page without changing the API contract.
  const visibleFollowUps = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return followUps;

    return followUps.filter((followUp) =>
      [followUp.id, followUp.status, followUp.outcome].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [followUps, search]);

  const hasFilters = Boolean(search.trim() || statusFilter);

  const activeFilterCount =
    Number(Boolean(search.trim())) + Number(Boolean(statusFilter));

  const stats = [
    {
      title: "Total Follow-ups",
      value: pagination?.total ?? followUps.length,
      description: "Follow-ups matching the status filter",
      icon: CalendarClock,
      tone: "blue" as const,
    },
    {
      title: "Pending",
      value: followUps.filter((item) => item.status === "PENDING").length,
      description: "On this page",
      icon: Clock3,
      tone: "amber" as const,
    },
    {
      title: "Completed",
      value: followUps.filter((item) => item.status === "COMPLETED").length,
      description: "On this page",
      icon: CheckCircle2,
      tone: "green" as const,
    },
    {
      title: "Active Filters",
      value: activeFilterCount,
      description: "Search and status filters",
      icon: FilterX,
      tone: "violet" as const,
    },
  ];

  const clearFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("");
    setPage(1);
  }, []);

  async function handleComplete(followUp: FollowUp) {
    const outcome = outcomeById[followUp.id];

    if (!outcome) {
      toast.error({
        title: "Select an outcome",
        description: "Choose the result before completing this follow-up.",
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: followUp.id,
        input: {
          status: "COMPLETED",
          outcome,
        },
      });

      setOutcomeById((current) => {
        const updated = { ...current };
        delete updated[followUp.id];
        return updated;
      });

      toast.success({
        title: "Follow-up completed",
        description: "The outcome has been saved.",
      });
    } catch (error) {
      toast.error({
        title: "Unable to complete follow-up",
        description: errorMessage(error, "Please try again."),
      });
    }
  }

  async function handleCancel(followUp: FollowUp) {
    try {
      await updateMutation.mutateAsync({
        id: followUp.id,
        input: { status: "CANCELLED" },
      });

      toast.success({
        title: "Follow-up cancelled",
        description: "The follow-up has been cancelled.",
      });
    } catch (error) {
      toast.error({
        title: "Unable to cancel follow-up",
        description: errorMessage(error, "Please try again."),
      });
    }
  }

  async function handleRefresh() {
    try {
      await refetch({ throwOnError: true });

      toast.success({
        title: "Follow-ups refreshed",
        description: "Your follow-up records are up to date.",
      });
    } catch (error) {
      toast.error({
        title: "Refresh failed",
        description: errorMessage(error, "Please try again."),
      });
    }
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  return (
    <main className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Follow-ups"
        description="Schedule customer callbacks, track conversations, and record outcomes."
        icon={CalendarClock}
        actions={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              size="icon"
              onClick={() => void handleRefresh()}
              disabled={isFetching}
              aria-label="Refresh follow-ups"
            >
              <RefreshCw
                className={`size-4 ${isFetching ? "animate-spin" : ""}`}
              />
            </Button>

            <Button
              leftIcon={Plus}
              onClick={() => setShowCreate(true)}
              className="w-full whitespace-nowrap sm:w-auto"
            >
              Schedule follow-up
            </Button>
          </div>
        }
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={isLoading ? "—" : stat.value}
            description={stat.description}
            icon={stat.icon}
            tone={stat.tone}
            index={index}
          />
        ))}
      </div>

      {/* Search and filters */}
      <SearchFilterToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search follow-ups..."
        searchLabel="Search follow-ups"
        filters={[
          {
            key: "status",
            value: statusFilter,
            onChange: handleStatusChange,
            options: FOLLOW_UP_STATUSES.map((status) => ({
              value: status,
              label: label(status),
            })),
            label: "statuses",
            placeholder: "All statuses",
            ariaLabel: "Filter by status",
          },
        ]}
        onClear={clearFilters}
        hasFilters={hasFilters}
      />

      {/* Error state */}
      {isError ? (
        <section
          role="alert"
          className="rounded-2xl border border-rose-200 bg-background p-8 text-center dark:border-rose-900/50"
        >
          <ServerCrash className="mx-auto size-10 text-rose-600" />

          <h2 className="mt-4 text-lg font-semibold text-foreground">
            Unable to load follow-ups
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Check your connection and try again.
          </p>

          <Button
            className="mt-4"
            variant="outline"
            leftIcon={RefreshCw}
            onClick={() => void handleRefresh()}
            disabled={isFetching}
          >
            Try again
          </Button>
        </section>
      ) : isLoading ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-background">
          <Spinner size="lg" label="Loading follow-ups" />

          <p className="text-sm text-muted-foreground">
            Loading follow-up records…
          </p>
        </div>
      ) : visibleFollowUps.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No matching follow-ups" : "No follow-ups found"}
          description={
            hasFilters
              ? "Try changing your search or status filter."
              : "Schedule a follow-up to keep track of customer conversations."
          }
          icon={hasFilters ? FilterX : ClipboardList}
          actionLabel={hasFilters ? "Clear filters" : "Schedule follow-up"}
          onAction={hasFilters ? clearFilters : () => setShowCreate(true)}
        />
      ) : (
        <>
          {isFetching && (
            <div
              role="status"
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Spinner size="sm" label="Refreshing follow-ups" />
              Refreshing records…
            </div>
          )}

          <div className="space-y-3">
            {visibleFollowUps.map((followUp) => {
              const isPending = followUp.status === "PENDING";

              const isUpdating =
                updateMutation.isPending &&
                updateMutation.variables?.id === followUp.id;

              return (
                <FollowUpCard
                  key={followUp.id}
                  followUp={followUp}
                  actions={
                    isPending ? (
                      <>
                        <div>
                          <label
                            htmlFor={`outcome-${followUp.id}`}
                            className="mb-2 block text-sm font-medium text-foreground"
                          >
                            Record outcome
                          </label>

                          <select
                            id={`outcome-${followUp.id}`}
                            value={outcomeById[followUp.id] ?? ""}
                            onChange={(event) =>
                              setOutcomeById((current) => ({
                                ...current,
                                [followUp.id]: event.target.value as
                                  | FollowUpOutcome
                                  | "",
                              }))
                            }
                            disabled={isUpdating}
                            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
                          >
                            <option value="">Select outcome</option>

                            {FOLLOW_UP_OUTCOMES.map((outcome) => (
                              <option key={outcome} value={outcome}>
                                {label(outcome)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <Button
                          className="w-full"
                          leftIcon={Check}
                          onClick={() => void handleComplete(followUp)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Saving…" : "Complete follow-up"}
                        </Button>

                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => void handleCancel(followUp)}
                          disabled={isUpdating}
                        >
                          Cancel follow-up
                        </Button>
                      </>
                    ) : undefined
                  }
                />
              );
            })}
          </div>

          {/* Pagination */}
          <footer className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {pagination?.total ?? followUps.length} follow-ups total
              {search.trim() ? ` · ${visibleFollowUps.length} shown` : ""}
            </p>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {page} of {pagination?.totalPages ?? 1}
              </span>

              <Button
                variant="outline"
                disabled={page >= (pagination?.totalPages ?? 1) || isFetching}
                onClick={() =>
                  setPage((current) =>
                    Math.min(pagination?.totalPages ?? 1, current + 1),
                  )
                }
              >
                Next
              </Button>
            </div>
          </footer>
        </>
      )}

      <FollowUpFormDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => {
          setShowCreate(false);

          if (page !== 1) {
            setPage(1);
          } else {
            void refetch();
          }
        }}
      />
    </main>
  );
}

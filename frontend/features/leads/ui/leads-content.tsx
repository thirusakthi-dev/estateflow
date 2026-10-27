"use client";

import { useCallback, useState } from "react";
import {
  Users,
  RefreshCw,
  ServerCrash,
  WifiOff,
  CircleHelp,
  Plus,
  UserPlus,
  MessagesSquare,
  CalendarCheck,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Tooltip } from "@/components/ui/tooltip";
import { StatsCard } from "@/components/ui/stats-card";
import { AppLoader, useMinimumLoading } from "@/components/ui/app-loader";
import { useToast } from "@/components/ui/toast";

import { useCurrentUser } from "@/features/auth/auth.queries";
import { isAdmin } from "@/lib/permissions";

import {
  useAssignLead,
  useCreateLead,
  useEmployees,
  useLeads,
  useUpdateLead,
} from "../lib/leads-queries";

import type {
  CreateLeadInput,
  Lead,
  LeadStage,
  UpdateLeadInput,
} from "../lib/leads.types";

import { LeadsTable } from "./leads-table";
import { CreateLeadForm } from "./create-lead-dialog";
import { LeadSummaryDialog } from "./lead-summary-dialog";

const PAGE_SIZE = 10;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.18 },
  },
};

function LeadsLoadingState() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <EmptyState
        title="Loading your leads"
        description="Retrieving lead records and pipeline information."
        icon={Users}
        className="min-h-80"
      />

      <div
        role="status"
        className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground"
      >
        <Spinner size="sm" label="Loading leads" />
        Connecting to your workspace…
      </div>
    </motion.div>
  );
}

function LeadsErrorState({
  onRetry,
  isRetrying,
}: {
  onRetry: () => void;
  isRetrying: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      role="alert"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="overflow-hidden rounded-2xl border border-rose-200 bg-background dark:border-rose-900/50"
    >
      <div className="p-6 text-center sm:p-8">
        <motion.div
          initial={reduceMotion ? false : { scale: 0.8, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 220,
            damping: 18,
          }}
          className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
        >
          <ServerCrash size={27} />
        </motion.div>

        <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
          We couldn't load your leads
        </h2>

        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
          Your connection may have been interrupted, or the API server may be
          temporarily unavailable. Check your connection and try again.
        </p>

        <Button
          className="mt-5"
          variant="outline"
          leftIcon={RefreshCw}
          onClick={onRetry}
          disabled={isRetrying}
        >
          {isRetrying ? "Retrying..." : "Try again"}
        </Button>

        <AnimatePresence>
          {isRetrying && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex items-center justify-center gap-2 overflow-hidden text-sm text-muted-foreground"
            >
              <Spinner size="sm" label="Retrying connection" />
              Requesting your leads…
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="grid gap-px border-t border-border bg-border sm:grid-cols-2">
        <div className="flex items-start gap-3 bg-surface p-4 sm:p-5">
          <WifiOff className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Check your connection
            </h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Ensure your device is connected before retrying.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-surface p-4 sm:p-5">
          <CircleHelp className="mt-0.5 size-5 shrink-0 text-violet-600" />
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Still having trouble?
            </h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Contact your workspace administrator if the problem continues.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export function LeadsContent() {
  const reduceMotion = useReducedMotion();

  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const toast = useToast();

  const { data: user } = useCurrentUser();
  const admin = isAdmin(user?.role);

  const {
    data: leadsResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useLeads({
    page,
    limit: PAGE_SIZE,
  });

  const { data: employeesResponse } = useEmployees(admin);

  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const assignLead = useAssignLead();

  const showLoading = useMinimumLoading(isLoading, 700);

  const leads = leadsResponse?.leads ?? [];
  const employees = employeesResponse ?? [];

  const totalPages = leadsResponse?.pagination?.totalPages ?? 1;
  const total = leadsResponse?.pagination?.total ?? leads.length;

  // These stage counts describe the currently loaded page.
  const newLeadsCount = leads.filter((lead) => lead.stage === "NEW").length;

  const activeLeadsCount = leads.filter((lead) =>
    ["CONTACTED", "SITE_VISIT", "INTERESTED", "NEGOTIATION"].includes(
      lead.stage,
    ),
  ).length;

  const bookedLeadsCount = leads.filter(
    (lead) => lead.stage === "BOOKED",
  ).length;

  const lostLeadsCount = leads.filter((lead) => lead.stage === "LOST").length;

  const openCreateModal = useCallback(() => {
    if (!admin || createLead.isPending) return;
    setShowCreate(true);
  }, [admin, createLead.isPending]);

  const closeCreateModal = useCallback(() => {
    if (createLead.isPending) return;
    setShowCreate(false);
  }, [createLead.isPending]);

  const closeEditModal = useCallback(() => {
    if (updateLead.isPending || assignLead.isPending) return;
    setEditingLead(null);
  }, [updateLead.isPending, assignLead.isPending]);

  const handleStageChange = async (id: string, stage: LeadStage) => {
    try {
      await updateLead.mutateAsync({
        id,
        input: { stage },
      });
    } catch {
      // The mutation hook displays the error toast.
    }
  };

  const handleCreate = async (input: CreateLeadInput) => {
    try {
      await createLead.mutateAsync(input);

      setShowCreate(false);

      if (page !== 1) {
        setPage(1);
      } else {
        await refetch();
      }
    } catch (error) {
      // The mutation hook displays the error toast.
      throw error;
    }
  };

  const handleUpdate = async ({
    id,
    details,
    assignedToId,
  }: {
    id: string;
    details: UpdateLeadInput;
    assignedToId: string | null;
  }) => {
    try {
      const previousAssignedToId = editingLead?.assignedToId ?? null;

      await updateLead.mutateAsync({
        id,
        input: details,
      });

      if (assignedToId !== previousAssignedToId) {
        await assignLead.mutateAsync({
          id,
          assignedToId,
        });
      }

      setEditingLead(null);

      await refetch();
    } catch (error) {
      // The mutation hook displays the error toast.
      throw error;
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch({ throwOnError: true });

      toast.success({
        title: "Leads refreshed",
        description: "Your lead records are up to date.",
      });
    } catch (error) {
      toast.error({
        title: "Refresh failed",
        description: getErrorMessage(
          error,
          "Unable to refresh leads. Please try again.",
        ),
      });
    }
  };

  const handleEditLead = (lead: Lead) => {
    if (!admin || updateLead.isPending || assignLead.isPending) return;

    setSelectedLead(null);
    setEditingLead(lead);
  };

  return (
    <motion.div
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      variants={sectionVariants}
      className="space-y-6"
    >
      <PageHeader
        title="Leads"
        description="Manage customer relationships and track opportunities through your sales pipeline."
        icon={Users}
        actions={
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Tooltip content="Refresh leads">
              <Button
                variant="outline"
                size="icon"
                onClick={() => void handleRefresh()}
                disabled={isFetching}
                aria-label="Refresh leads"
              >
                <RefreshCw
                  className={`size-4 ${isFetching ? "animate-spin" : ""}`}
                />
              </Button>
            </Tooltip>

            {admin && (
              <motion.div
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="min-w-0 flex-1 sm:flex-none"
              >
                <Button
                  onClick={openCreateModal}
                  disabled={createLead.isPending}
                  leftIcon={Plus}
                  className="w-full sm:w-auto"
                >
                  Create Lead
                </Button>
              </motion.div>
            )}
          </div>
        }
      />

      {/* Lead summary cards */}
      <motion.section
        variants={sectionVariants}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Lead summary"
      >
        {/* Lead summary cards */}

  <StatsCard
    title="Total Leads"
    value={total}
    description="Across all pages"
    icon={Users}
    tone="blue"
    index={0}
  />

  <StatsCard
    title="New Leads"
    value={newLeadsCount}
    description="On this page"
    icon={UserPlus}
    tone="violet"
    index={1}
  />

  <StatsCard
    title="Active Pipeline"
    value={activeLeadsCount}
    description="On this page"
    icon={MessagesSquare}
    tone="amber"
    index={2}
  />

  <StatsCard
    title="Booked Leads"
    value={bookedLeadsCount}
    description="On this page"
    icon={CalendarCheck}
    tone="green"
    index={3}
  />

      </motion.section>

      <AnimatePresence mode="wait" initial={false}>
        {isError ? (
          <motion.div
            key="error"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <LeadsErrorState
              onRetry={() => void handleRefresh()}
              isRetrying={isFetching}
            />
          </motion.div>
        ) : showLoading ? (
          <motion.div
            key="loading"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <AppLoader message="Loading your leads" />
          </motion.div>
        ) : leads.length === 0 ? (
          <motion.div
            key="empty"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <EmptyState
              title="No leads yet"
              description="Create your first lead to start organizing customer enquiries and tracking opportunities."
              icon={Users}
              actionLabel={admin ? "Create your first lead" : undefined}
              onAction={admin ? openCreateModal : undefined}
              className="min-h-80"
            />
          </motion.div>
        ) : (
          <motion.div
            key="table"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-3"
          >
            <AnimatePresence>
              {isFetching && (
                <motion.div
                  key="refreshing"
                  initial={{ opacity: 0, height: 0, y: -5 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -5 }}
                  className="flex items-center gap-2 overflow-hidden rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300"
                >
                  <Spinner size="sm" label="Refreshing leads" />
                  Refreshing lead records…
                </motion.div>
              )}
            </AnimatePresence>

            <LeadsTable
              leads={leads}
              loading={isLoading}
              page={page}
              totalPages={totalPages}
              isFetching={isFetching}
              onPageChange={(nextPage) => {
                if (
                  Number.isInteger(nextPage) &&
                  nextPage >= 1 &&
                  nextPage <= totalPages &&
                  nextPage !== page
                ) {
                  setPage(nextPage);
                }
              }}
              onStageChange={handleStageChange}
              onViewLead={setSelectedLead}
              onEditLead={admin ? handleEditLead : undefined}
            />

            <p className="text-xs text-muted-foreground">
              Showing {leads.length} leads on this page out of {total} total{" "}
              {total === 1 ? "lead" : "leads"}.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedLead && (
          <motion.div
            key="lead-summary"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LeadSummaryDialog
              lead={selectedLead}
              onClose={() => setSelectedLead(null)}
              onEdit={admin ? handleEditLead : undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {admin && showCreate && (
          <motion.div
            key="create-lead"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <CreateLeadForm
              mode="create"
              employees={employees}
              loading={createLead.isPending}
              onCancel={closeCreateModal}
              onCreate={handleCreate}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {admin && editingLead && (
          <motion.div
            key="edit-lead"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <CreateLeadForm
              mode="edit"
              lead={editingLead}
              employees={employees}
              loading={updateLead.isPending || assignLead.isPending}
              onCancel={closeEditModal}
              onCreate={handleCreate}
              onUpdate={handleUpdate}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

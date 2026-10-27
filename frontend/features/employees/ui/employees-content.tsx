"use client";

import { useCallback, useState } from "react";
import axios from "axios";
import { Plus, RefreshCw, UserCheck, UserRoundX, Users } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/ui/stats-card";
import { AppLoader, useMinimumLoading } from "@/components/ui/app-loader";
import { useToast } from "@/components/ui/toast";

import {
  useEmployees,
  useUpdateEmployeeStatus,
} from "../lib/employees.queries";
import type { Employee } from "../lib/employees.types";
import { EmployeeFormDialog } from "./employee-form-dialog";
import { EmployeesTable } from "./employees-table";

export function EmployeesContent() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toast = useToast();
  const shouldReduceMotion = useReducedMotion();

  const { data, isLoading, isError, isFetching, refetch } = useEmployees();

  const statusMutation = useUpdateEmployeeStatus();
  const showLoading = useMinimumLoading(isLoading, 700);

  const employees = data?.users ?? [];
  const activeCount = employees.filter((employee) => employee.isActive).length;
  const inactiveCount = employees.length - activeCount;

  const openCreateDialog = useCallback(() => {
    setSelectedEmployee(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedEmployee(null);
  }, []);

  const handleToggleStatus = useCallback(
    async (employee: Employee) => {
      try {
        await statusMutation.mutateAsync({
          id: employee.id,
          input: {
            isActive: !employee.isActive,
          },
        });

        toast.success({
          title: employee.isActive
            ? "Employee deactivated"
            : "Employee activated",
          description: `${employee.name}'s account has been ${
            employee.isActive ? "deactivated" : "activated"
          }.`,
        });
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message
          : undefined;

        toast.error({
          title: "Unable to update employee",
          description:
            typeof message === "string"
              ? message
              : "Something went wrong. Please try again.",
        });
      }
    },
    [statusMutation, toast],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await refetch({ throwOnError: true });

      toast.success({
        title: "Employees refreshed",
        description: "The employee list is up to date.",
      });
    } catch {
      toast.error({
        title: "Refresh failed",
        description: "Unable to refresh employees. Please try again.",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast]);

  if (showLoading) {
    return <AppLoader message="Loading sales employees" />;
  }

  if (isError && !data) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border border-border bg-background p-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 via-violet-500/15 to-fuchsia-500/15 ring-1 ring-blue-500/20">
          <Users className="size-7 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="space-y-1">
          <h2 className="font-semibold text-foreground">
            Unable to load employees
          </h2>
          <p className="text-sm text-muted-foreground">
            Please check your connection and try again.
          </p>
        </div>

        <Button
          onClick={() => void handleRefresh()}
          disabled={isRefreshing}
          leftIcon={RefreshCw}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 via-violet-500/15 to-fuchsia-500/15 ring-1 ring-blue-500/20">
            <Users
              className="size-6 text-blue-600 dark:text-blue-400"
              strokeWidth={2.2}
            />
          </div>

          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Sales Employees
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your sales team and employee access.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="icon"
            onClick={() => void handleRefresh()}
            disabled={isRefreshing || isFetching}
            aria-label="Refresh bookings"
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button onClick={openCreateDialog} leftIcon={Plus}>
            Add employee
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatsCard
          title="Total Employees"
          value={employees.length}
          description="All sales employees"
          icon={Users}
          tone="blue"
          index={0}
        />

        <StatsCard
          title="Active Employees"
          value={activeCount}
          description="Employees with active access"
          icon={UserCheck}
          tone="green"
          index={1}
        />

        <StatsCard
          title="Inactive Employees"
          value={inactiveCount}
          description="Employees with inactive access"
          icon={UserRoundX}
          tone="amber"
          index={2}
        />
      </div>

      {/* Employees table */}
      <AnimatePresence mode="wait">
        <motion.section
          key="employees-table"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="min-w-0"
        >
          <EmployeesTable
            employees={employees}
            loading={false}
            isFetching={isFetching || isRefreshing || statusMutation.isPending}
            onEdit={openEditDialog}
            onToggleStatus={handleToggleStatus}
            updatingEmployeeId={
              statusMutation.isPending
                ? statusMutation.variables?.id
                : undefined
            }
          />
        </motion.section>
      </AnimatePresence>

      {/* Create / Edit employee */}
      <EmployeeFormDialog
        open={dialogOpen}
        employee={selectedEmployee}
        onClose={closeDialog}
      />
    </div>
  );
}

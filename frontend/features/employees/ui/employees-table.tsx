"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  Pencil,
  ShieldCheck,
  UserRound,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";

import { DataTable } from "@/components/ui/data-table/data-table";
import type {
  DataTableColumn,
  DataTableFilter,
} from "@/components/ui/data-table/data-table-types";

import type { Employee } from "../lib/employees.types";

type EmployeesTableProps = {
  employees: Employee[];
  loading: boolean;
  isFetching: boolean;
  onEdit: (employee: Employee) => void;
  onToggleStatus: (employee: Employee) => void | Promise<void>;
  updatingEmployeeId?: string;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function EmployeeStatus({ isActive }: { isActive: boolean }) {
  const Icon = isActive ? CheckCircle2 : Clock3;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        "text-xs font-medium",
        isActive
          ? "bg-green-500/10 text-green-700 dark:text-green-400"
          : "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      ].join(" ")}
    >
      <Icon className="size-3.5" />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function EmployeeRowActions({
  employee,
  onEdit,
  onToggleStatus,
  updating,
}: {
  employee: Employee;
  onEdit: () => void;
  onToggleStatus: () => void;
  updating: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();

    if (!rect) return;

    const menuWidth = 208;
    const menuHeight = 104;

    const left = Math.max(
      8,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8),
    );

    const top =
      rect.bottom + menuHeight + 8 <= window.innerHeight
        ? rect.bottom + 6
        : Math.max(8, rect.top - menuHeight - 6);

    setPosition({ top, left });
  };

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        !rootRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  const runAction = (callback: () => void) => {
    setOpen(false);
    callback();
  };

  return (
    <div ref={rootRef} className="inline-flex">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Actions for ${employee.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={updating}
        onClick={(event) => {
          event.stopPropagation();

          setOpen((previous) => !previous);
        }}
        className="inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <MoreHorizontal className="size-5" />
      </button>

      {mounted &&
        createPortal(
          open ? (
            <div
              ref={menuRef}
              role="menu"
              aria-label={`${employee.name} actions`}
              style={{
                position: "fixed",
                top: position.top,
                left: position.left,
                width: 208,
                zIndex: 10000,
              }}
              className="overflow-hidden rounded-xl border border-border bg-background p-1.5 shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => runAction(onEdit)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Pencil className="size-4 text-violet-500" />
                Edit employee
              </button>

              <div className="my-1 border-t border-border" />

              <button
                type="button"
                role="menuitem"
                disabled={updating}
                onClick={() => runAction(onToggleStatus)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                {employee.isActive ? (
                  <UserRoundX className="size-4 text-amber-600 dark:text-amber-400" />
                ) : (
                  <UserRoundCheck className="size-4 text-green-600 dark:text-green-400" />
                )}

                {employee.isActive
                  ? "Deactivate employee"
                  : "Activate employee"}
              </button>
            </div>
          ) : null,
          document.body,
        )}
    </div>
  );
}

export function EmployeesTable({
  employees,
  loading,
  isFetching,
  onEdit,
  onToggleStatus,
  updatingEmployeeId,
}: EmployeesTableProps) {
  const columns: DataTableColumn<Employee>[] = [
    {
      id: "employee",
      header: "Employee",
      sortable: true,
      sortValue: (employee) => employee.name,
      exportValue: (employee) => `${employee.name} (${employee.email})`,
      cell: (employee) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 via-violet-500/10 to-fuchsia-500/15 ring-1 ring-blue-500/10">
            <UserRound className="size-5 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="min-w-0 space-y-0.5">
            <p className="truncate font-medium text-foreground">
              {employee.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {employee.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      sortable: true,
      sortValue: () => "Sales employee",
      exportValue: () => "Sales employee",
      cell: () => (
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 text-violet-500" />
          Sales employee
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      sortValue: (employee) => (employee.isActive ? "Active" : "Inactive"),
      exportValue: (employee) => (employee.isActive ? "Active" : "Inactive"),
      cell: (employee) => <EmployeeStatus isActive={employee.isActive} />,
    },
    {
      id: "createdAt",
      header: "Created",
      sortable: true,
      sortValue: (employee) => new Date(employee.createdAt).getTime(),
      exportValue: (employee) => formatDate(employee.createdAt),
      cell: (employee) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDate(employee.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      sortable: false,
      searchable: false,
      cell: (employee) => (
        <EmployeeRowActions
          employee={employee}
          onEdit={() => onEdit(employee)}
          onToggleStatus={() => onToggleStatus(employee)}
          updating={updatingEmployeeId === employee.id}
        />
      ),
    },
  ];

  const filters: DataTableFilter<Employee>[] = [
    {
      id: "status",
      label: "Status",
      options: [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
      ],
      getValue: (employee) => (employee.isActive ? "ACTIVE" : "INACTIVE"),
    },
  ];

  return (
    <DataTable
      data={employees}
      columns={columns}
      getRowId={(employee) => employee.id}
      searchable
      searchPlaceholder="Search employees by name or email..."
      filters={filters}
      loading={loading}
      emptyTitle="No employees found"
      emptyDescription="Try changing your search or status filter."
      exportable
      exportFileName="estateflow-sales-employees"
      minWidth="850px"
    />
  );
}

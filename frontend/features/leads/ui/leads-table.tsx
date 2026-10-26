"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Eye, Pencil, Trash2, Plus } from "lucide-react";

import { DataTable } from "@/components/ui/data-table/data-table";
import type {
  DataTableColumn,
  DataTableFilter,
} from "@/components/ui/data-table/data-table-types";
import { Select } from "@/components/ui/select";

import type { Lead, LeadStage } from "../lib/leads.types";
import { LEAD_STAGES } from "../lib/leads.types";
import { stageLabels } from "./lead-stage-badge";

type LeadsTableProps = {
  leads: Lead[];
  loading: boolean;
  page: number;
  totalPages: number;
  isFetching: boolean;
  onViewLead?: (lead: Lead) => void;
  onPageChange: (page: number) => void;
  onStageChange: (id: string, stage: LeadStage) => void;
  onAddLead?: () => void;
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (lead: Lead) => void;
};

function LeadRowActions({
  lead,
  onView,
  onEdit,
  onDelete,
}: {
  lead: Lead;
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
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

    const menuWidth = 176;
    const menuHeight = 48 + (onEdit ? 44 : 0) + (onDelete ? 44 : 0) + 12;

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
  }, [open, onEdit, onDelete]);

  const runAction = (callback: () => void) => {
    setOpen(false);
    callback();
  };

  return (
    <div ref={rootRef} className="inline-flex">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Actions for ${lead.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((previous) => !previous);
        }}
        className="inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MoreHorizontal className="size-5" />
      </button>

      {mounted &&
        createPortal(
          open ? (
            <div
              ref={menuRef}
              role="menu"
              style={{
                position: "fixed",
                top: position.top,
                left: position.left,
                width: 176,
                zIndex: 10000,
              }}
              className="overflow-hidden rounded-xl border border-border bg-background p-1.5 shadow-xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => runAction(onView)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface"
              >
                <Eye className="size-4 text-sky-500" />
                View details
              </button>

              {onEdit && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => runAction(onEdit)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-surface"
                >
                  <Pencil className="size-4 text-violet-500" />
                  Edit lead
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => runAction(onDelete)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                  Delete lead
                </button>
              )}
            </div>
          ) : null,
          document.body,
        )}
    </div>
  );
}

export function LeadsTable({
  leads,
  loading,
  page,
  totalPages,
  isFetching,
  onPageChange,
  onStageChange,
  onViewLead,
  onAddLead,
  onEditLead,
  onDeleteLead,
}: LeadsTableProps) {
  const columns: DataTableColumn<Lead>[] = [
    {
      id: "name",
      header: "Name",
      accessor: "name",
      searchable: true,
      sortValue: (lead) => lead.name,
      cell: (lead) => (
        <span className="font-medium text-foreground">{lead.name}</span>
      ),
    },
    {
      id: "email",
      header: "Email",
      accessor: "email",
      searchable: true,
      sortValue: (lead) => lead.email ?? "",
      cell: (lead) => (
        <span className="text-muted-foreground">{lead.email || "—"}</span>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      accessor: "phone",
      searchable: true,
      sortValue: (lead) => lead.phone,
    },
    {
      id: "source",
      header: "Source",
      accessor: "source",
      sortValue: (lead) => lead.source ?? "",
      cell: (lead) => (
        <span className="text-muted-foreground">{lead.source || "—"}</span>
      ),
    },
    {
      id: "assignedTo",
      header: "Assigned To",
      sortable: true,
      sortValue: (lead) => lead.assignedTo?.name ?? "",
      cell: (lead) =>
        lead.assignedTo ? (
          <div className="flex flex-col">
            <span className="font-medium text-foreground">
              {lead.assignedTo.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {lead.assignedTo.email}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        ),
      exportValue: (lead) => lead.assignedTo?.name ?? "Unassigned",
    },
    {
      id: "stage",
      header: "Stage",
      sortable: true,
      sortValue: (lead) => stageLabels[lead.stage],
      cell: (lead) => (
        <div className="min-w-40" onClick={(event) => event.stopPropagation()}>
          <Select
            value={lead.stage}
            onChange={(value) => onStageChange(lead.id, value as LeadStage)}
            options={LEAD_STAGES.map((stage) => ({
              label: stageLabels[stage],
              value: stage,
            }))}
          />
        </div>
      ),
      exportValue: (lead) => stageLabels[lead.stage],
    },
    {
      id: "updatedAt",
      header: "Last Updated",
      sortable: true,
      sortValue: (lead) => new Date(lead.updatedAt),
      cell: (lead) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {new Date(lead.updatedAt).toLocaleDateString()}
        </span>
      ),
      exportValue: (lead) => new Date(lead.updatedAt).toLocaleDateString(),
    },
  ];

  const filters: DataTableFilter<Lead>[] = [
    {
      id: "stage",
      label: "Stage",
      options: LEAD_STAGES.map((stage) => ({
        label: stageLabels[stage],
        value: stage,
      })),
      getValue: (lead) => lead.stage,
    },
  ];

  return (
    <DataTable
      data={leads}
      columns={columns}
      getRowId={(lead) => lead.id}
      onRowClick={onViewLead}
      searchKeys={["name", "email", "phone"]}
      searchPlaceholder="Search name, email or phone..."
      filters={filters}
      actions={
        onAddLead
          ? [
              {
                label: "Add Lead",
                icon: Plus,
                onClick: onAddLead,
                variant: "primary",
              },
            ]
          : []
      }
      rowActions={(lead) => (
        <LeadRowActions
          lead={lead}
          onView={() => onViewLead?.(lead)}
          onEdit={onEditLead ? () => onEditLead(lead) : undefined}
          onDelete={onDeleteLead ? () => onDeleteLead(lead) : undefined}
        />
      )}
      loading={loading}
      emptyTitle="No leads found"
      emptyDescription="Try changing your search or stage filter."
      exportFileName="estateflow-leads"
      minWidth="1100px"
      pagination={{
        page,
        totalPages,
        onPageChange,
        disabled: isFetching,
      }}
    />
  );
}

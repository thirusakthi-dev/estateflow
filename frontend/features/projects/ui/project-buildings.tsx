"use client";

import { Building2, ChevronRight, Plus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProjectBuilding } from "../lib/projects.types";

type ProjectBuildingsProps = {
  buildings: ProjectBuilding[];
  onAdd?: () => void;
  onEdit?: (building: ProjectBuilding) => void;
  onDelete?: (building: ProjectBuilding) => void;
  onSelect?: (building: ProjectBuilding) => void;
};

export function ProjectBuildings({
  buildings,
  onAdd,
  onEdit,
  onDelete,
  onSelect,
}: ProjectBuildingsProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5 sm:p-6">
        <div>
          <h2 className="font-semibold">Buildings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage buildings within this project.
          </p>
        </div>

        {onAdd && (
          <Button size="sm" leftIcon={Plus} onClick={onAdd}>
            Add building
          </Button>
        )}
      </div>

      {buildings.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <Building2 size={30} className="mx-auto text-muted-foreground" />
          <p className="mt-3 font-medium">No buildings added</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add the first building to this project.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
          {buildings.map((building) => (
            <article
              key={building.id}
              className="overflow-hidden rounded-xl border border-border transition hover:border-slate-300 hover:shadow-sm"
            >
              <button
                type="button"
                onClick={() => onSelect?.(building)}
                className="flex w-full items-center gap-4 p-4 text-left"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface text-muted-foreground">
                  <Building2 size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{building.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {building.units?.length ?? 0} units
                  </p>
                </div>

                <ChevronRight
                  size={18}
                  className="shrink-0 text-muted-foreground"
                />
              </button>

              <div className="flex items-center justify-between border-t border-border px-4 py-3">
                <span className="text-xs text-muted-foreground">Building</span>

                <div className="flex items-center gap-1">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={Pencil}
                      onClick={() => onEdit(building)}
                    >
                      Edit
                    </Button>
                  )}

                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(building)}
                      aria-label={`Delete ${building.name}`}
                      className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

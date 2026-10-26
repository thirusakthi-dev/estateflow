"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ProjectBuilding, ProjectUnit } from "../lib/projects.types";

type ProjectUnitsProps = {
  buildings: ProjectBuilding[];
  onAdd?: (building?: ProjectBuilding) => void;
  onEdit?: (unit: ProjectUnit, building: ProjectBuilding) => void;
  onDelete?: (unit: ProjectUnit, building: ProjectBuilding) => void;
};

function formatPrice(price: number | string) {
  const amount = Number(price);

  if (!Number.isFinite(amount)) return String(price);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function UnitStatus({ status }: { status: string }) {
  const normalized = status.toUpperCase();

  const styles =
    normalized === "AVAILABLE"
      ? "bg-emerald-50 text-emerald-700"
      : normalized === "SOLD"
        ? "bg-red-50 text-red-700"
        : normalized === "BOOKED"
          ? "bg-blue-50 text-blue-700"
          : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function ProjectUnits({
  buildings,
  onAdd,
  onEdit,
  onDelete,
}: ProjectUnitsProps) {
  const units = buildings.flatMap((building) =>
    (building.units ?? []).map((unit) => ({
      unit,
      building,
    })),
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5 sm:p-6">
        <div>
          <h2 className="font-semibold">Units</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {units.length} units across {buildings.length} buildings.
          </p>
        </div>

        {onAdd && (
          <Button size="sm" leftIcon={Plus} onClick={() => onAdd()}>
            Add unit
          </Button>
        )}
      </div>

      {units.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="font-medium">No units added</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a unit to start managing availability and pricing.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-surface text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Unit</th>
                <th className="px-5 py-3 font-medium">Building</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Status</th>
                {(onEdit || onDelete) && (
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {units.map(({ unit, building }) => (
                <tr
                  key={unit.id}
                  className="transition-colors hover:bg-surface/60"
                >
                  <td className="px-5 py-4 font-medium">{unit.unitNumber}</td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {building.name}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {unit.type}
                  </td>
                  <td className="px-5 py-4 font-medium">
                    {formatPrice(unit.price)}
                  </td>
                  <td className="px-5 py-4">
                    <UnitStatus status={unit.status} />
                  </td>

                  {(onEdit || onDelete) && (
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        {onEdit && (
                          <button
                            type="button"
                            aria-label={`Edit unit ${unit.unitNumber}`}
                            onClick={() => onEdit(unit, building)}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-slate-100 hover:text-foreground"
                          >
                            <Pencil size={16} />
                          </button>
                        )}

                        {onDelete && (
                          <button
                            type="button"
                            aria-label={`Delete unit ${unit.unitNumber}`}
                            onClick={() => onDelete(unit, building)}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

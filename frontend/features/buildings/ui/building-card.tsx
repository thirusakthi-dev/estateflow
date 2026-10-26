"use client";

import {
  Building2,
  Layers3,
  MapPin,
  Pencil,
  Trash2,
  ArrowRight,
  Image as ImageIcon,
} from "lucide-react";
import type { Building } from "../lib/buildings.types";

type BuildingCardProps = {
  building: Building;
  onClick?: (building: Building) => void;
  onEdit?: (building: Building) => void;
  onDelete?: (building: Building) => void;
};

export function BuildingCard({
  building,
  onClick,
  onEdit,
  onDelete,
}: BuildingCardProps) {
  const coverImage =
    building.images?.find((image) => image.isCover) ?? building.images?.[0];

  const totalUnits = building.units?.length ?? 0;

  const availableUnits =
    building.units?.filter((unit) => unit.status === "AVAILABLE").length ?? 0;

  const occupiedUnits = totalUnits - availableUnits;

  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950">
      {/* Image */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onClick?.(building)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick?.(building);
          }
        }}
        aria-label={`View details for ${building.name}`}
        className="relative h-44 cursor-pointer overflow-hidden bg-slate-100 dark:bg-slate-900"
      >
        {coverImage ? (
          <img
            src={coverImage.imageUrl}
            alt={coverImage.alt || building.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Building2
              className="h-12 w-12 text-slate-400"
              strokeWidth={1.25}
              aria-hidden="true"
            />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />

        {building.images?.length > 0 && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white">
            <ImageIcon className="h-3.5 w-3.5" />
            {building.images.length}{" "}
            {building.images.length === 1 ? "image" : "images"}
          </span>
        )}

        {/* Actions */}
        <div className="absolute right-3 top-3 flex gap-2">
          {onEdit && (
            <button
              type="button"
              aria-label={`Edit ${building.name}`}
              title="Edit building"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(building);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/70 bg-white/95 text-slate-700 shadow-sm transition hover:bg-white dark:bg-slate-900/95 dark:text-slate-200"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              aria-label={`Delete ${building.name}`}
              title="Delete building"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(building);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/70 bg-white/95 text-red-600 shadow-sm transition hover:bg-red-50 dark:bg-slate-900/95 dark:hover:bg-red-950"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <button
        type="button"
        onClick={() => onClick?.(building)}
        className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
        aria-label={`View details for ${building.name}`}
      >
        <div className="space-y-4 p-4">
          {/* Name and project */}
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
              {building.name}
            </h3>

            <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <MapPin className="h-4 w-4 shrink-0 text-blue-500" />
              <span className="truncate">
                {building.project?.city
                  ? `${building.project.name} · ${building.project.city}`
                  : (building.project?.name ?? "No project")}
              </span>
            </div>
          </div>

          {/* Description */}
          {building.description && (
            <p className="line-clamp-2 text-sm leading-5 text-slate-600 dark:text-slate-400">
              {building.description}
            </p>
          )}

          {/* Building stats */}
          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950/40">
                <Layers3 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total units
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {totalUnits}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40">
                <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total floors
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {building.totalFloors ?? "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {availableUnits} available
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {occupiedUnits} other {occupiedUnits === 1 ? "unit" : "units"}
              </p>
            </div>

            <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-blue-600 transition group-hover:gap-2 dark:text-blue-400">
              View details
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}

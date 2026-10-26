"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Building2, Home, MapPin, Pencil, Trash2 } from "lucide-react";

import type { Project } from "../lib/projects.types";

type ProjectRowProps = {
  project: Project;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const statusStyles: Record<string, string> = {
  PLANNING: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  ONGOING:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  COMPLETED:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  ON_HOLD:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
};

export function ProjectRow({
  project,
  onSelect,
  onEdit,
  onDelete,
}: ProjectRowProps) {
  const shouldReduceMotion = useReducedMotion();

  const coverImage =
    project.images?.find((image) => image.isCover) ??
    [...(project.images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)[0];

  const unitCount =
    project.buildings?.reduce(
      (total, building) => total + (building.units?.length ?? 0),
      0,
    ) ?? 0;

  const statusClass =
    statusStyles[project.status] ??
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

  return (
    <motion.article
      layout={!shouldReduceMotion}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      role="link"
      tabIndex={0}
      aria-label={`Open project ${project.name}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className="group relative h-44 min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-border bg-background p-3 transition-colors hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:p-4"
    >
      {/* Top-right actions */}
      <div
        className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-xl border border-border bg-background/95 p-1 shadow-sm backdrop-blur"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label={`Edit ${project.name}`}
          title="Edit project"
          onClick={onEdit}
          className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Pencil aria-hidden="true" className="size-4" />
        </button>

        <button
          type="button"
          aria-label={`Delete ${project.name}`}
          title="Delete project"
          onClick={onDelete}
          className="inline-flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
        >
          <Trash2 aria-hidden="true" className="size-4" />
        </button>
      </div>

      <div className="flex h-full min-w-0 gap-3 sm:gap-4">
        {/* Fixed-size cover image */}
        <div className="relative h-full w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-surface sm:w-40">
          {coverImage?.imageUrl && (
            <img
              src={coverImage.imageUrl}
              alt={coverImage.alt || `${project.name} project`}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = "none";
                event.currentTarget.nextElementSibling?.classList.remove(
                  "hidden",
                );
              }}
              className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}

          <div
            className={`absolute inset-0 flex items-center justify-center ${
              coverImage?.imageUrl ? "hidden" : ""
            }`}
          >
            <Building2
              aria-hidden="true"
              className="size-8 text-muted"
              strokeWidth={1.4}
            />
          </div>
        </div>

        {/* Fixed-height details */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden pr-16 sm:pr-24">
          <div className="flex min-w-0 items-center gap-2">
            <h2
              title={project.name}
              className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight text-foreground sm:text-lg"
            >
              {project.name}
            </h2>

            <span
              title={project.status.replaceAll("_", " ")}
              className={`inline-flex max-w-24 shrink-0 truncate rounded-full px-2 py-1 text-xs font-medium ${statusClass}`}
            >
              {project.status.replaceAll("_", " ")}
            </span>
          </div>

          <p
            title={`${project.address}, ${project.city}`}
            className="mt-2 flex min-w-0 items-center gap-1.5 text-sm leading-5 text-muted"
          >
            <MapPin aria-hidden="true" className="size-4 shrink-0" />
            <span className="min-w-0 truncate">
              {project.address}, {project.city}
            </span>
          </p>

          <p
            title={project.description || "No description"}
            className="mt-1 line-clamp-2 text-sm leading-5 text-muted"
          >
            {project.description || "No description"}
          </p>

          <dl className="mt-auto flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 pt-2">
            <div className="flex min-w-0 items-center gap-1.5 text-sm text-foreground">
              <Building2
                aria-hidden="true"
                className="size-4 shrink-0 text-muted"
              />
              <dt className="sr-only">Buildings</dt>
              <dd className="truncate">
                {project.buildings?.length ?? 0} buildings
              </dd>
            </div>

            <div className="flex min-w-0 items-center gap-1.5 text-sm text-foreground">
              <Home aria-hidden="true" className="size-4 shrink-0 text-muted" />
              <dt className="sr-only">Units</dt>
              <dd className="truncate">{unitCount} units</dd>
            </div>
          </dl>
        </div>
      </div>
    </motion.article>
  );
}

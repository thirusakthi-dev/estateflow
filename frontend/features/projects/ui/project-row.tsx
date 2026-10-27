"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock3,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";

import type { Project } from "../lib/projects.types";

type ProjectRowProps = {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
};

const statusStyles: Record<string, string> = {
  ACTIVE:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
  INACTIVE: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  PLANNING:
    "bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-300",
  ONGOING: "bg-blue-100 text-blue-800 dark:bg-blue-400/15 dark:text-blue-300",
  COMPLETED:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300",
  ON_HOLD:
    "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
};

export function ProjectRow({ project, onEdit, onDelete }: ProjectRowProps) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [imageFailed, setImageFailed] = useState(false);

  const coverImage =
    project.images?.find((image) => image.isCover) ??
    [...(project.images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)[0];

  const imageUrl = coverImage?.imageUrl;
  const buildingCount = project.buildings?.length ?? 0;

  const statusClass =
    statusStyles[project.status] ??
    "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";

  const isActive = project.status === "ACTIVE";

  function openProject() {
    router.push(`/projects/${project.id}`);
  }

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.2 }}
      role="link"
      tabIndex={0}
      aria-label={`View project ${project.name}`}
      onClick={openProject}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openProject();
        }
      }}
      className="group relative flex min-h-[250px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-border  bg-background shadow-sm transition-shadow duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:flex-row"
    >
      {/* Normal-size image with a simple fallback */}
      <div className="relative min-h-[220px] shrink-0 overflow-hidden bg-surface sm:w-[280px] lg:w-[320px]">
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={project.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-100 p-6 dark:bg-slate-800">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card text-primary shadow-sm">
              <Building2 size={38} strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                EstateFlow
              </p>
              <p className="mt-1 line-clamp-2 text-base font-semibold text-foreground">
                {project.name}
              </p>
            </div>
          </div>
        )}

        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-black/60 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
          <Building2 size={15} />
          Project
        </div>
      </div>

      {/* Project details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-5 sm:p-6 lg:p-7">
        <div>
          <div className="flex flex-wrap items-center gap-3 pr-24">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Project overview
            </span>
          </div>

          <h3 className="mt-3 line-clamp-2 text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-2xl">
            {project.name}
          </h3>

          <div className="mt-4 flex items-start gap-2.5 text-sm text-muted">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
              <MapPin size={17} />
            </span>
            <span className="pt-1.5">
              {project.address || project.city || "Location not specified"}
              {project.address && project.city ? `, ${project.city}` : ""}
            </span>
          </div>

          <p className="mt-4 line-clamp-3 max-w-2xl text-sm leading-6 text-muted">
            {project.description ||
              "View project information, buildings, and other details."}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Building2 size={20} />
            </span>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {buildingCount}
              </p>
              <p className="text-xs text-muted">
                {buildingCount === 1 ? "Building" : "Buildings"}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-transform group-hover:translate-x-1">
            View details
            <ArrowUpRight size={17} />
          </span>
        </div>
      </div>

      {/* Visible status badge and exactly two actions */}
      <div
        className="absolute right-3 top-3 z-10 flex items-center gap-2 sm:right-5 sm:top-5"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <span
          className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold shadow-sm ${statusClass}`}
        >
          {isActive ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
          {project.status.replaceAll("_", " ")}
        </span>

        <button
          type="button"
          title="Edit project"
          aria-label={`Edit ${project.name}`}
          onClick={onEdit}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-indigo-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-400/10"
        >
          <Pencil size={16} />
        </button>

        <button
          type="button"
          title="Delete project"
          aria-label={`Delete ${project.name}`}
          onClick={onDelete}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-rose-600 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-400/10"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.article>
  );
}

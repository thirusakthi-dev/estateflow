"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CalendarPlus,
  FolderKanban,
  Layers3,
  MapPin,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useToast } from "@/components/ui/toast";

import { useProject } from "../lib/projects.queries";
import type { Project, ProjectStatus } from "../lib/projects.types";

import { ProjectBuildings } from "./project-buildings";
import { ImageGallery } from "@/components/ui/image-gallery";
import { DetailStatCard } from "@/components/ui/detail-stat-card";
import { DetailSection } from "@/components/ui/detail-section";

const statusLabels: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  ON_HOLD: "On hold",
};

const statusStyles: Record<ProjectStatus, string> = {
  PLANNING:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  ONGOING: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  COMPLETED:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  ON_HOLD: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300",
};

function formatDate(date?: string | Date | null) {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Not available";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const reduceMotion = useReducedMotion();

  const { data, isLoading, isError, error, refetch, isFetching } = useProject(
    params.id,
  );

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [buildingSearch, setBuildingSearch] = useState("");

  const project = data as Project | undefined;

  const fadeIn = {
    initial: reduceMotion ? false : { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: { duration: reduceMotion ? 0 : 0.35 },
  };

  async function handleDeleteProject() {
    setDeleteLoading(true);

    try {
      toast.info({
        title: "Delete action not connected",
        description:
          "Connect your project deletion API before enabling this action.",
      });

      setDeleteOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  }

  if (isLoading) {
    return (
      <main className="w-full min-w-0 space-y-6 pb-8">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-surface" />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-surface" />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-surface"
            />
          ))}
        </div>

        <div className="h-48 w-full animate-pulse rounded-2xl bg-surface" />
      </main>
    );
  }

  if (isError || !project) {
    return (
      <main className="w-full min-w-0">
        <Breadcrumbs
          items={[
            { label: "Projects", href: "/projects" },
            { label: "Project details" },
          ]}
        />

        <div className="mt-8 rounded-2xl border border-border bg-background px-6 py-14 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
            <Building2 className="size-7" aria-hidden="true" />
          </div>

          <h1 className="mt-4 text-xl font-semibold text-foreground">
            {isError ? "Unable to load project" : "Project not found"}
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {isError
              ? error instanceof Error
                ? error.message
                : "Something went wrong. Please try again."
              : "This project may have been deleted or the link is invalid."}
          </p>

          {isError && (
            <Button
              className="mt-5"
              leftIcon={RefreshCw}
              loading={isFetching}
              onClick={() => void refetch()}
            >
              Try again
            </Button>
          )}

          <div>
            <Button
              variant="outline"
              className="mt-5"
              leftIcon={ArrowLeft}
              onClick={() => router.push("/projects")}
            >
              Back to projects
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const buildings = project.buildings ?? [];

  const filteredBuildings = buildings.filter((building) =>
    building.name.toLowerCase().includes(buildingSearch.trim().toLowerCase()),
  );

  const stats = [
    {
      label: "Buildings",
      value: buildings.length,
      hint: "Buildings in this project",
      icon: Building2,
      colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Project status",
      value: statusLabels[project.status],
      hint: "Current project status",
      icon: FolderKanban,
      colorClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
    {
      label: "Photos",
      value: project.images?.length ?? 0,
      hint: "Project gallery images",
      icon: Layers3,
      colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Created",
      value: formatDate(project.createdAt),
      hint: "Project creation date",
      icon: CalendarPlus,
      colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <main className="w-full min-w-0 space-y-6 pb-8">
      {/* Breadcrumbs */}
      <motion.div {...fadeIn}>
        <Breadcrumbs
          items={[
            { label: "Projects", href: "/projects" },
            { label: project.name },
          ]}
        />
      </motion.div>

      {/* Project heading */}
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.35 }}
        className="flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-start"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Building2 size={20} aria-hidden="true" />
            </span>

            <p className="text-sm font-medium text-muted-foreground">
              Project overview
            </p>
          </div>

          <h1 className="break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {project.name}
          </h1>

          <p className="mt-2 flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
            <MapPin size={16} className="shrink-0" aria-hidden="true" />
            <span className="break-words">
              {[project.address, project.city].filter(Boolean).join(", ")}
            </span>
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="outline"
            leftIcon={Pencil}
            onClick={() =>
              toast.info({
                title: "Edit project",
                description: "Connect your existing project edit dialog here.",
              })
            }
          >
            Edit project
          </Button>

          <Button
            variant="danger"
            leftIcon={Trash2}
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </Button>
        </div>
      </motion.header>

      {/* Full-width gallery */}
      <motion.section {...fadeIn} className="w-full min-w-0">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Layers3 size={17} aria-hidden="true" />
          </span>

          <h2 className="font-semibold text-foreground">Project gallery</h2>

          <span className="text-xs text-muted-foreground">
            {project.images?.length ?? 0} photos
          </span>
        </div>

        <ImageGallery images={project.images ?? []} title={project.name} />
      </motion.section>

      {/* Project status */}
      <motion.section
        {...fadeIn}
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background p-4 sm:p-5"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Status</span>

          <span
            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[project.status]}`}
          >
            {statusLabels[project.status]}
          </span>
        </div>

        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays size={16} aria-hidden="true" />
          Updated {formatDate(project.updatedAt)}
        </span>
      </motion.section>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.35,
              delay: reduceMotion ? 0 : index * 0.07,
            }}
            whileHover={reduceMotion ? undefined : { y: -3 }}
          >
            <DetailStatCard {...stat} />
          </motion.div>
        ))}
      </section>

      {/* Description */}
      <motion.div {...fadeIn}>
        <DetailSection
          title="About this project"
          subtitle="Overview and project description"
          icon={Layers3}
        >
          <p className="whitespace-pre-line break-words text-sm leading-7 text-muted-foreground">
            {project.description?.trim() ||
              "No description has been added for this project yet."}
          </p>
        </DetailSection>
      </motion.div>

      {/* Buildings */}
      <motion.section {...fadeIn} className="min-w-0 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Buildings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {buildings.length} building
            {buildings.length === 1 ? "" : "s"} in this project
          </p>
        </div>

        {buildings.length > 0 && (
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={17}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <Input
              value={buildingSearch}
              onChange={(event) => setBuildingSearch(event.target.value)}
              placeholder="Search buildings..."
              aria-label="Search buildings"
              className="pl-9"
            />
          </div>
        )}

        {buildings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-background px-6 py-12 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 size={23} aria-hidden="true" />
            </div>

            <h3 className="mt-4 font-semibold text-foreground">
              No buildings yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              No buildings have been added to this project yet.
            </p>
          </div>
        ) : filteredBuildings.length === 0 ? (
          <div className="rounded-xl border border-border px-5 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No buildings match &quot;{buildingSearch}&quot;.
            </p>

            <Button
              className="mt-3"
              variant="outline"
              onClick={() => setBuildingSearch("")}
            >
              Clear search
            </Button>
          </div>
        ) : (
          <ProjectBuildings buildings={filteredBuildings} />
        )}
      </motion.section>

      {/* Delete confirmation */}
      <ConfirmationModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete project?"
        description={`Are you sure you want to delete "${project.name}"? The deletion API is not connected yet, so this action will not delete the project.`}
        confirmText="Delete project"
        loading={deleteLoading}
        variant="danger"
      />
    </main>
  );
}

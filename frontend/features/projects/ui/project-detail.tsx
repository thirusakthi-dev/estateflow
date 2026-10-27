"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Images,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ImageGallery } from "@/components/ui/image-gallery";
import { StatsCard } from "@/components/ui/stats-card";
import { AppLoader } from "@/components/ui/app-loader";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchFilterToolbar } from "@/components/ui/search-filter-toolbar";
import { useToast } from "@/components/ui/toast";

import BuildingCard from "@/features/buildings/ui/building-card";
import { BuildingFormDialog } from "@/features/buildings/ui/building-form-dialog";
import { ProjectFormDialog } from "../ui/project-form-dialog";
import { useProject, useDeleteProject } from "../lib/projects.queries";

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatPrice(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) return null;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
  iconColor,
}: {
  icon: typeof UserRound;
  label: string;
  value?: string | null;
  href?: string;
  iconColor: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 py-3">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconColor}`}
      >
        <Icon className="size-4" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>

        {value ? (
          href ? (
            <a
              href={href}
              className="mt-1 block break-words text-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {value}
            </a>
          ) : (
            <p className="mt-1 break-words text-sm font-medium text-foreground">
              {value}
            </p>
          )
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">Not provided</p>
        )}
      </div>
    </div>
  );
}

function Panel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "min-w-0 rounded-xl border border-border",
        "bg-background p-4 text-foreground sm:p-5",
        className,
      ].join(" ")}
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>

          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {action && (
          <div className="flex shrink-0 items-center gap-2">{action}</div>
        )}
      </div>

      <div className="mt-4 min-w-0">{children}</div>
    </section>
  );
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const toast = useToast();

  const projectId = params.id;

  const { data: project, isLoading, isError, refetch } = useProject(projectId);

  const deleteProject = useDeleteProject();

  const [editOpen, setEditOpen] = useState(false);
  const [buildingDialogOpen, setBuildingDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [buildingSearch, setBuildingSearch] = useState("");

  const buildings = useMemo(() => {
    const items = project?.buildings ?? [];
    const query = buildingSearch.trim().toLowerCase();

    if (!query) return items;

    return items.filter((building) =>
      building.name.toLowerCase().includes(query),
    );
  }, [project?.buildings, buildingSearch]);

  const handleDelete = async () => {
    if (!project || deleteProject.isPending) return;

    try {
      await deleteProject.mutateAsync(project.id);

      setDeleteOpen(false);

      toast.success({
        title: "Project deleted",
        description: `"${project.name}" was deleted successfully.`,
      });

      router.push("/projects");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to delete the project. Please try again.";

      toast.error({
        title: "Delete failed",
        description: message,
      });
    }
  };

  if (isLoading) {
    return <AppLoader />;
  }

  if (isError || !project) {
    return (
      <main className="mx-auto max-w-[1600px] space-y-5 p-4 text-foreground sm:p-6 lg:p-8">
        <Breadcrumbs
          items={[
            { label: "Projects", href: "/projects" },
            { label: "Project Details" },
          ]}
        />

        <EmptyState
          title="Unable to load project"
          description="Something went wrong while loading this project."
          actionLabel="Try again"
          onAction={() => void refetch()}
        />
      </main>
    );
  }

  const images = project.images ?? [];
  const buildingCount = project.buildings?.length ?? 0;
  const description = project.description?.trim() ?? "";

  const priceMin = formatPrice(project.minPrice);
  const priceMax = formatPrice(project.maxPrice);

  const priceRange =
    priceMin && priceMax
      ? `${priceMin} – ${priceMax}`
      : priceMin || priceMax || "Not specified";

  const longDescription = description.length > 260;

  const visibleDescription =
    longDescription && !descriptionExpanded
      ? `${description.slice(0, 260).trimEnd()}…`
      : description;

  return (
    <motion.main
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.22,
        ease: "easeOut",
      }}
      className="mx-auto min-w-0 w-full max-w-[1600px] space-y-6 text-foreground"
    >
      {/* Breadcrumbs and actions */}
      <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              { label: project.name },
            ]}
          />
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Button
            variant="outline"
            leftIcon={ArrowLeft}
            onClick={() => router.push("/projects")}
          >
            Back
          </Button>

          <Button
            variant="outline"
            leftIcon={Pencil}
            onClick={() => setEditOpen(true)}
          >
            Edit Project
          </Button>

          <Button
            variant="danger"
            leftIcon={Trash2}
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </Button>
        </div>
      </header>

      {/* Project heading */}
      <section className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <h1 className="break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {project.name}
          </h1>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            {formatStatus(project.status)}
          </span>
        </div>

        <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin
            className="mt-0.5 size-4 shrink-0 text-rose-500"
            aria-hidden="true"
          />

          <span className="break-words">
            {[project.address, project.city].filter(Boolean).join(", ") ||
              "Location not provided"}
          </span>
        </p>
      </section>

      {/* Project stats */}
      <section className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatsCard
          title="Buildings"
          value={String(buildingCount)}
          description="In this project"
          icon={Building2}
          tone="blue"
          index={0}
        />

        <StatsCard
          title="Price Range"
          value={priceRange}
          description="Project pricing"
          icon={CircleDollarSign}
          tone="green"
          index={1}
        />

        <StatsCard
          title="Created On"
          value={formatDate(project.createdAt)}
          description="Project creation date"
          icon={CalendarDays}
          tone="violet"
          index={2}
        />
      </section>

      {/* Project description */}
      <Panel title="Project Description">
        {description ? (
          <>
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
              {visibleDescription}
            </p>

            {longDescription && (
              <button
                type="button"
                onClick={() => setDescriptionExpanded((expanded) => !expanded)}
                className="mt-2 rounded-sm text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-expanded={descriptionExpanded}
              >
                {descriptionExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No description added.</p>
        )}
      </Panel>

      {/* Gallery and contact information */}
      <section className="grid min-w-0 grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
        <Panel
          title="Project Gallery"
          description={`${images.length} ${images.length === 1 ? "image" : "images"}`}
          action={
            <Button
              size="sm"
              variant="outline"
              leftIcon={Images}
              onClick={() => setEditOpen(true)}
            >
              Edit Images
            </Button>
          }
          className="flex flex-col"
        >
          <div className="min-w-0 flex-1">
            {images.length > 0 ? (
              <ImageGallery images={images} />
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-8 text-center">
                <div className="flex size-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Images className="size-6" aria-hidden="true" />
                </div>

                <p className="mt-3 text-sm font-medium text-foreground">
                  No project images
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Add images to showcase this project.
                </p>

                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={Plus}
                  className="mt-4"
                  onClick={() => setEditOpen(true)}
                >
                  Add Images
                </Button>
              </div>
            )}
          </div>
        </Panel>

        <Panel
          title="Contact Information"
          description="Primary project contact"
        >
          <div className="divide-y divide-border">
            <ContactRow
              icon={UserRound}
              label="Contact Name"
              value={project.contactName}
              iconColor="bg-violet-500/10 text-violet-600 dark:text-violet-400"
            />

            <ContactRow
              icon={Phone}
              label="Phone Number"
              value={project.contactPhone}
              href={
                project.contactPhone
                  ? `tel:${project.contactPhone.replace(/[^\d+]/g, "")}`
                  : undefined
              }
              iconColor="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
            />

            <ContactRow
              icon={Mail}
              label="Email Address"
              value={project.contactEmail}
              href={
                project.contactEmail
                  ? `mailto:${project.contactEmail}`
                  : undefined
              }
              iconColor="bg-blue-500/10 text-blue-700 dark:text-blue-400"
            />
          </div>
        </Panel>
      </section>

      {/* Buildings */}
      <section className="min-w-0 space-y-4">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground">Buildings</h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage the buildings associated with this project.
            </p>
          </div>

          <Button leftIcon={Plus} onClick={() => setBuildingDialogOpen(true)}>
            Add Building
          </Button>
        </div>

        {buildingCount > 0 && (
          <div className="rounded-xl border border-border bg-background p-3 sm:p-4">
            <SearchFilterToolbar
              search={buildingSearch}
              onSearchChange={setBuildingSearch}
              searchPlaceholder="Search buildings..."
              searchLabel="Search buildings"
              onClear={() => setBuildingSearch("")}
              hasFilters={Boolean(buildingSearch.trim())}
            />
          </div>
        )}

        {buildingCount === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background px-4 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Building2 className="size-6" aria-hidden="true" />
            </div>

            <h3 className="mt-3 text-base font-semibold text-foreground">
              No buildings yet
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Add the first building to this project.
            </p>

            <Button
              className="mt-4"
              leftIcon={Plus}
              onClick={() => setBuildingDialogOpen(true)}
            >
              Add Building
            </Button>
          </div>
        ) : buildings.length === 0 ? (
          <EmptyState
            title="No matching buildings"
            description="Try a different building name or clear your search."
            actionLabel="Clear search"
            onAction={() => setBuildingSearch("")}
          />
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {buildings.map((building) => (
              <BuildingCard
                key={building.id}
                building={building}
                onClick={(selectedBuilding) =>
                  router.push(`/buildings/${selectedBuilding.id}`)
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Edit project */}
      <ProjectFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project}
      />

      {/* Add building */}
      <BuildingFormDialog
        open={buildingDialogOpen}
        onOpenChange={setBuildingDialogOpen}
        projectId={project.id}
      />

      {/* Delete confirmation */}
      <ConfirmationModal
        open={deleteOpen}
        onClose={() => {
          if (!deleteProject.isPending) {
            setDeleteOpen(false);
          }
        }}
        onConfirm={handleDelete}
        title={`Delete "${project.name}"?`}
        description={[
          "Are you sure you want to delete this project?",
          "",
          `Project: ${project.name}`,
          `Description: ${project.description?.trim() || "No description available"}`,
          "",
          "This action cannot be undone.",
        ].join("\n")}
        confirmText="Delete Project"
        loading={deleteProject.isPending}
        variant="danger"
      />
    </motion.main>
  );
}

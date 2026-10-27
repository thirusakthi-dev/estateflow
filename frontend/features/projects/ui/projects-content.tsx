"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import gsap from "gsap";
import {
  FilterX,
  FolderOpen,
  FolderKanban,
  Layers3,
  ListChecks,
  Plus,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SearchFilterToolbar } from "@/components/ui/search-filter-toolbar";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { StatsCard } from "@/components/ui/stats-card";
import { AppLoader, useMinimumLoading } from "@/components/ui/app-loader";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";

import { useProjects, useDeleteProject } from "../lib/projects.queries";
import type { Project, ProjectStatus } from "../lib/projects.types";

import { ProjectRow } from "./project-row";
import { ProjectFormDialog } from "./project-form-dialog";

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { label: string; value: ProjectStatus }[] = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];
type ProjectsListProps = {
  onSelectProject?: (project: Project) => void;
  onCreateProject?: () => void;
  onEditProject?: (project: Project) => void;
};

export function ProjectsList({
  onSelectProject,
  onCreateProject,
  onEditProject,
}: ProjectsListProps) {
  const reduceMotion = useReducedMotion();
  const toast = useToast();
  const contentRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "">("");

  const [page, setPage] = useState(1);
  const [loadedProjects, setLoadedProjects] = useState<Project[]>([]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      city: city || undefined,
      status: status || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, city, status, page],
  );

  const { data, isPending, isFetching, isError, refetch } =
    useProjects(filters);

  const deleteProjectMutation = useDeleteProject();

  const hasActiveFilters = Boolean(search.trim() || city || status);

  const activeFilterCount =
    Number(Boolean(search.trim())) +
    Number(Boolean(city)) +
    Number(Boolean(status));

  const isInitialLoading = isPending && !data;
  const showLoading = useMinimumLoading(isInitialLoading || isRefreshing, 1000);

  const totalPages = data?.pagination.totalPages ?? 1;
  const totalProjects = data?.pagination.total ?? loadedProjects.length;
  const remainingProjects = Math.max(totalProjects - loadedProjects.length, 0);

  // Reset accumulated results when filters change.
  useEffect(() => {
    setLoadedProjects([]);
    setPage(1);
  }, [search, city, status]);

  // Accumulate pages without duplicating project records.
  useEffect(() => {
    if (!data?.projects) return;

    setLoadedProjects((previous) => {
      if (page === 1) {
        return data.projects;
      }

      const existingIds = new Set(previous.map((project) => project.id));
      const newProjects = data.projects.filter(
        (project) => !existingIds.has(project.id),
      );

      return [...previous, ...newProjects];
    });
  }, [data, page]);

  // Build city options from projects currently available in the query results.
  const cityOptions = useMemo(() => {
    const cities = new Set<string>();

    loadedProjects.forEach((project) => {
      if (project.city?.trim()) {
        cities.add(project.city.trim());
      }
    });

    data?.projects.forEach((project) => {
      if (project.city?.trim()) {
        cities.add(project.city.trim());
      }
    });

    return Array.from(cities)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: value }));
  }, [loadedProjects, data]);

  // Animate the results container with GSAP.
  useLayoutEffect(() => {
    const element = contentRef.current;

    if (!element || reduceMotion || showLoading || isError) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        element,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: "power2.out",
          clearProps: "all",
        },
      );
    }, element);

    return () => context.revert();
  }, [loadedProjects.length, reduceMotion, showLoading, isError]);

  const handleSelectProject = useCallback(
    (project: Project) => {
      onSelectProject?.(project);
    },
    [onSelectProject],
  );

  const handleCreateClick = useCallback(() => {
    if (onCreateProject) {
      onCreateProject();
      return;
    }

    setEditingProject(null);
    setIsProjectDialogOpen(true);
  }, [onCreateProject]);

  const handleEditClick = useCallback(
    (project: Project) => {
      if (onEditProject) {
        onEditProject(project);
        return;
      }

      setEditingProject(project);
      setIsProjectDialogOpen(true);
    },
    [onEditProject],
  );

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsProjectDialogOpen(open);

    if (!open) {
      setEditingProject(null);
    }
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleCityChange = useCallback((value: string) => {
    setCity(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value as ProjectStatus | "");
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setCity("");
    setStatus("");
    setPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isFetching && page < totalPages) {
      setPage((currentPage) => currentPage + 1);
    }
  }, [isFetching, page, totalPages]);

  const handleRefresh = async () => {
    if (isRefreshing || isFetching) return;

    setIsRefreshing(true);

    try {
      const result = await refetch({ throwOnError: true });

      if (result.error) {
        throw result.error;
      }

      toast.success({
        title: "Projects refreshed",
        description: "Your project records are up to date.",
      });
    } catch {
      toast.error({
        title: "Refresh failed",
        description: "Unable to refresh projects. Please try again.",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRetry = async () => {
    try {
      const result = await refetch({ throwOnError: true });

      if (result.error) {
        throw result.error;
      }

      toast.success({
        title: "Projects loaded",
        description: "Your project records are available.",
      });
    } catch {
      toast.error({
        title: "Unable to load projects",
        description: "Please check your connection and try again.",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingProject || deleteProjectMutation.isPending) return;

    const projectToDelete = deletingProject;

    try {
      await deleteProjectMutation.mutateAsync(projectToDelete.id);

      setLoadedProjects((previous) =>
        previous.filter((project) => project.id !== projectToDelete.id),
      );

      setDeletingProject(null);

      toast.success({
        title: "Project deleted",
        description: `"${projectToDelete.name}" was deleted successfully.`,
      });

      try {
        const result = await refetch({ throwOnError: true });

        if (result.error) {
          throw result.error;
        }
      } catch {
        toast.error({
          title: "List refresh failed",
          description:
            "The project was deleted, but the list could not be refreshed.",
        });
      }
    } catch (error) {
      toast.error({
        title: "Unable to delete project",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  return (
    <section className="w-full min-w-0 space-y-6">
      {/* Page header */}
      <PageHeader
        title="Projects"
        description="Manage your projects, buildings, and units."
        icon={FolderKanban}
        actions={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              size="icon"
              onClick={() => void handleRefresh()}
              disabled={isRefreshing || isFetching}
              aria-label="Refresh projects"
            >
              <RefreshCw className="size-4" />
            </Button>

            <Button
              onClick={handleCreateClick}
              leftIcon={Plus}
              className="w-full shrink-0 whitespace-nowrap sm:w-auto"
            >
              New project
            </Button>
          </div>
        }
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total projects"
          value={totalProjects}
          description="Projects matching your filters"
          icon={FolderKanban}
          tone="blue"
          index={0}
        />

        <StatsCard
          title="Projects loaded"
          value={loadedProjects.length}
          description="Records currently displayed"
          icon={Layers3}
          tone="green"
          index={1}
        />

        <StatsCard
          title="Remaining"
          value={remainingProjects}
          description="Records not loaded yet"
          icon={ListChecks}
          tone="violet"
          index={2}
        />

        <StatsCard
          title="Active filters"
          value={activeFilterCount}
          description="Search, city, and status filters"
          icon={FilterX}
          tone="amber"
          index={3}
        />
      </div>

      {/* Search and filters — shared toolbar used by Buildings */}
      <SearchFilterToolbar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search projects..."
        searchLabel="Search projects"
        filters={[
          {
            key: "city",
            value: city,
            onChange: handleCityChange,
            options: cityOptions,
            label: "cities",
            placeholder: "All cities",
            ariaLabel: "Filter projects by city",
          },
          {
            key: "status",
            value: status,
            onChange: handleStatusChange,
            options: STATUS_OPTIONS,
            label: "statuses",
            placeholder: "All statuses",
            ariaLabel: "Filter projects by status",
          },
        ]}
        onClear={clearFilters}
        hasFilters={hasActiveFilters}
      />

      {/* Results summary / fetching state */}
      {/* <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">
          {hasActiveFilters ? "Filtered projects" : "All projects"}
          {data && (
            <>
              {" · "}
              {loadedProjects.length} loaded of {totalProjects}
            </>
          )}
        </p>

        {isFetching && !showLoading && (
          <span className="inline-flex items-center gap-2 text-xs text-muted">
            <Spinner />
            Updating projects...
          </span>
        )}
      </div> */}

      {/* Initial load and manual refresh */}
      {showLoading && (
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-border bg-background">
          <AppLoader message="Loading projects" />
        </div>
      )}

      {/* Error state */}
      {!showLoading && isError && (
        <div className="rounded-2xl border border-border bg-background p-6">
          <EmptyState
            title="Unable to load projects"
            description="Something went wrong while loading your projects. Please try again."
            icon={RefreshCw}
            actionLabel="Try again"
            onAction={handleRetry}
          />
        </div>
      )}

      {/* Project results */}
      {!showLoading && !isError && loadedProjects.length > 0 && (
        <div ref={contentRef} className="space-y-4">
          {/* <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Project directory
              </h2>
              <p className="mt-1 text-sm text-muted">
                Browse projects and manage their buildings and units.
              </p>
            </div>

            <p className="text-xs text-muted">
              Showing {loadedProjects.length} of {totalProjects} projects
            </p>
          </div> */}

          <motion.div layout={!reduceMotion} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {loadedProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout={!reduceMotion}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.2,
                    delay: reduceMotion
                      ? 0
                      : Math.min(index % PAGE_SIZE, 5) * 0.035,
                  }}
                >
                  <ProjectRow
                    project={project}
                    // onSelect={() => handleSelectProject(project)}
                    onEdit={() => handleEditClick(project)}
                    onDelete={() => setDeletingProject(project)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Empty state */}
      {!showLoading && !isError && loadedProjects.length === 0 && data && (
        <div className="flex min-h-[320px] items-center justify-center p-5">
          {hasActiveFilters ? (
            <EmptyState
              title="No matching projects"
              description="Try changing your search or filters to find what you're looking for."
              icon={FilterX}
              actionLabel="Clear filters"
              onAction={clearFilters}
              className="w-full max-w-lg border-0"
            />
          ) : (
            <EmptyState
              title="No projects yet"
              description="Create your first project to start managing buildings and units."
              icon={FolderOpen}
              actionLabel="Create your first project"
              onAction={handleCreateClick}
              className="w-full max-w-lg border-0"
            />
          )}
        </div>
      )}

      {/* Load more */}
      {!showLoading &&
        !isError &&
        loadedProjects.length > 0 &&
        page < totalPages && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isFetching}
              loading={isFetching}
              loadingText="Loading..."
              leftIcon={isFetching ? undefined : RefreshCw}
            >
              Load more projects
            </Button>
          </div>
        )}

      {/* End of list */}
      {!showLoading &&
        !isError &&
        loadedProjects.length > 0 &&
        page >= totalPages && (
          <p className="pb-2 text-center text-xs text-muted">
            You've reached the end of the project list.
          </p>
        )}

      {/* Create / edit dialog */}
      <ProjectFormDialog
        open={isProjectDialogOpen}
        onOpenChange={handleDialogOpenChange}
        project={editingProject}
      />

      {/* Delete confirmation */}
      <ConfirmationModal
        open={Boolean(deletingProject)}
        onClose={() => {
          if (!deleteProjectMutation.isPending) {
            setDeletingProject(null);
          }
        }}
        title="Delete project?"
        description={
          deletingProject
            ? `Are you sure you want to delete "${deletingProject.name}"? This action cannot be undone.`
            : "This action cannot be undone."
        }
        confirmText="Delete project"
        variant="danger"
        loading={deleteProjectMutation.isPending}
        onConfirm={handleDelete}
      />
    </section>
  );
}

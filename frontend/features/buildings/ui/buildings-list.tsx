"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import gsap from "gsap";
import {
  Building2,
  CheckCircle2,
  FilterX,
  Layers3,
  Plus,
  RefreshCw,
  Warehouse,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { EmptyState } from "@/components/ui/empty-state";
import { AppLoader, useMinimumLoading } from "@/components/ui/app-loader";
import { SearchFilterToolbar } from "@/components/ui/search-filter-toolbar";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useToast } from "@/components/ui/toast";

import { BuildingCard } from "./building-card";
import { BuildingFormDialog } from "./building-form-dialog";
import { useBuildings, useDeleteBuilding } from "../lib/buildings.queries";
import type { Building } from "../lib/buildings.types";

const PAGE_SIZE = 10;

export function BuildingsList() {
  const router = useRouter();
  const toast = useToast();
  const reduceMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [projectId, setProjectId] = useState("");
  const [page, setPage] = useState(1);
  const [loadedBuildings, setLoadedBuildings] = useState<Building[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<Building | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const deleteMutation = useDeleteBuilding();

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      projectId: projectId || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, projectId, page],
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useBuildings(filters);

  const isInitialLoading = isLoading && !data;
  const showLoading = useMinimumLoading(isInitialLoading || isRefreshing, 1000);

  const buildings = loadedBuildings;
  const totalBuildings = data?.pagination.total ?? loadedBuildings.length;
  const totalPages = data?.pagination.totalPages ?? 1;

  const remainingBuildings = Math.max(
    totalBuildings - loadedBuildings.length,
    0,
  );

  const hasFilters = Boolean(search.trim() || projectId);

  const activeFilterCount =
    Number(Boolean(search.trim())) + Number(Boolean(projectId));

  const hasMore = page < totalPages;

  // Reset accumulated results when filters change.
  useEffect(() => {
    setLoadedBuildings([]);
    setPage(1);
  }, [search, projectId]);

  // Accumulate pages and prevent duplicate buildings.
  useEffect(() => {
    if (!data?.buildings) return;

    setLoadedBuildings((previous) => {
      if (page === 1) {
        return data.buildings;
      }

      const merged = new Map<string, Building>();

      previous.forEach((building) => {
        merged.set(building.id, building);
      });

      data.buildings.forEach((building) => {
        merged.set(building.id, building);
      });

      return Array.from(merged.values());
    });
  }, [data, page]);

  // Build project filter options from the available building records.
  const projectOptions = useMemo(() => {
    const projects = new Map<string, string>();

    buildings.forEach((building) => {
      if (building.project) {
        projects.set(building.project.id, building.project.name);
      }
    });

    data?.buildings.forEach((building) => {
      if (building.project) {
        projects.set(building.project.id, building.project.name);
      }
    });

    return Array.from(projects.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [buildings, data]);

  // Animate the building results and clean up GSAP on changes/unmount.
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
  }, [buildings.length, reduceMotion, showLoading, isError]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setProjectId("");
    setPage(1);
  }, []);

  const handleAddBuilding = useCallback(() => {
    setSelectedBuilding(null);
    setFormOpen(true);
  }, []);

  const handleEditBuilding = useCallback((building: Building) => {
    setSelectedBuilding(building);
    setFormOpen(true);
  }, []);

  const handleShowMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPage((currentPage) => currentPage + 1);
    }
  }, [hasMore, isFetching]);

  const handleRefresh = async () => {
    if (isRefreshing || isFetching) return;

    setIsRefreshing(true);

    try {
      const result = await refetch({ throwOnError: true });

      if (result.error) {
        throw result.error;
      }

      toast.success({
        title: "Buildings refreshed",
        description: "Your building records are up to date.",
      });
    } catch {
      toast.error({
        title: "Refresh failed",
        description: "Unable to refresh buildings. Please try again.",
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
        title: "Buildings loaded",
        description: "Your building records are available.",
      });
    } catch {
      toast.error({
        title: "Unable to load buildings",
        description: "Please check your connection and try again.",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || deleteMutation.isPending) return;

    const buildingId = deleteTarget.id;
    const buildingName = deleteTarget.name;

    try {
      await deleteMutation.mutateAsync(buildingId);

      setLoadedBuildings((current) =>
        current.filter((building) => building.id !== buildingId),
      );

      setDeleteTarget(null);

      toast.success({
        title: "Building deleted",
        description: `"${buildingName}" was deleted successfully.`,
      });

      // Refresh the current page to update totals and records.
      try {
        const result = await refetch({ throwOnError: true });

        if (result.error) {
          throw result.error;
        }
      } catch {
        toast.error({
          title: "List refresh failed",
          description:
            "The building was deleted, but the list could not be refreshed.",
        });
      }
    } catch (error) {
      toast.error({
        title: "Unable to delete building",
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  return (
    <main className="w-full min-w-0 space-y-6">
      {/* Page header */}
      <PageHeader
        title="Buildings"
        description="Manage buildings and view their projects and units."
        icon={Building2}
        actions={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              size="icon"
              onClick={() => void handleRefresh()}
              disabled={isRefreshing || isFetching}
              aria-label="Refresh bookings"
            >
              <RefreshCw className="size-4" />
            </Button>

            <Button
              leftIcon={Plus}
              onClick={handleAddBuilding}
              className="w-full shrink-0 whitespace-nowrap sm:w-auto"
            >
              Add Building
            </Button>
          </div>
        }
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Buildings"
          value={totalBuildings}
          description="Buildings matching your filters"
          icon={Building2}
          tone="blue"
          index={0}
        />

        <StatsCard
          title="Buildings Loaded"
          value={loadedBuildings.length}
          description="Records currently displayed"
          icon={Warehouse}
          tone="green"
          index={1}
        />

        <StatsCard
          title="Remaining"
          value={remainingBuildings}
          description="Records not loaded yet"
          icon={Layers3}
          tone="violet"
          index={2}
        />

        <StatsCard
          title="Active Filters"
          value={activeFilterCount}
          description="Search and project filters"
          icon={FilterX}
          tone="amber"
          index={3}
        />
      </div>

      {/* Search and filters */}
      <SearchFilterToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search buildings or projects..."
        searchLabel="Search buildings"
        filters={[
          {
            key: "projectId",
            value: projectId,
            onChange: (value) => {
              setProjectId(value);
              setPage(1);
            },
            options: projectOptions,
            label: "projects",
            placeholder: "All projects",
            ariaLabel: "Filter by project",
          },
        ]}
        onClear={clearFilters}
        hasFilters={hasFilters}
      />

      {/* Loading state */}
      {showLoading && (
        <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-border bg-background">
          <AppLoader message="Loading buildings" />
        </div>
      )}

      {/* Error state */}
      {!showLoading && isError && (
        <div className="rounded-2xl border border-border bg-background p-6">
          <EmptyState
            title="Unable to load buildings"
            description="Something went wrong while loading your buildings. Please try again."
            icon={RefreshCw}
            actionLabel="Try again"
            onAction={handleRetry}
          />
        </div>
      )}

      {/* Building results */}
      {!showLoading && !isError && buildings.length > 0 && (
        <div ref={contentRef} className="space-y-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Building Directory
              </h2>
              <p className="mt-1 text-sm text-muted">
                Browse buildings and manage their details.
              </p>
            </div>

            <p className="text-xs text-muted">
              Showing {buildings.length} of {totalBuildings} buildings
            </p>
          </div>

          <motion.div
            layout={!reduceMotion}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <AnimatePresence mode="popLayout">
              {buildings.map((building, index) => (
                <motion.div
                  key={building.id}
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
                  <BuildingCard
                    building={building}
                    onClick={(selected) =>
                      router.push(`/buildings/${selected.id}`)
                    }
                    onEdit={handleEditBuilding}
                    onDelete={setDeleteTarget}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Empty state */}
      {!showLoading && !isError && buildings.length === 0 && data && (
        <div className="flex min-h-[320px] items-center justify-center p-5">
          <EmptyState
            title={hasFilters ? "No matching buildings" : "No buildings yet"}
            description={
              hasFilters
                ? "Try changing your search or project filter."
                : "Create a building to start managing its units."
            }
            icon={hasFilters ? FilterX : Building2}
            actionLabel={
              hasFilters ? "Clear filters" : "Add your first building"
            }
            onAction={hasFilters ? clearFilters : handleAddBuilding}
          />
        </div>
      )}

      {/* Load more */}
      {!showLoading && !isError && buildings.length > 0 && hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={handleShowMore}
            disabled={isFetching}
            loading={isFetching}
            loadingText="Loading..."
          >
            Show More Buildings
          </Button>
        </div>
      )}

      {/* End of list */}
      {!showLoading && !isError && buildings.length > 0 && !hasMore && (
        <p className="pb-2 text-center text-xs text-muted">
          You've reached the end of the building list.
        </p>
      )}

      {/* Create / edit dialog */}
      <BuildingFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);

          if (!open) {
            setSelectedBuilding(null);
          }
        }}
        building={selectedBuilding}
      />

      {/* Delete confirmation */}
      <ConfirmationModal
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete building?"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This action cannot be undone. Buildings containing booked units cannot be deleted.`
            : "This action cannot be undone."
        }
        confirmText="Delete building"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Building2,
  CalendarCheck,
  UserRound,
  FolderKanban,
  IndianRupee,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";

import { useLeads } from "@/features/leads/lib/leads-queries";
import { useBuildings } from "@/features/buildings/lib/buildings.queries";

import type { Lead } from "@/features/leads/lib/leads.types";
import type { Building } from "@/features/buildings/lib/buildings.types";
import type { CreateBookingInput } from "../lib/bookings.types";

type CreateBookingDialogProps = {
  open: boolean;
  initialBuildingId?: string;
  loading?: boolean;
  onCreate: (input: CreateBookingInput) => Promise<unknown>;
  onCancel: () => void;
};

export function CreateBookingDialog({
  open,
  initialBuildingId,
  loading = false,
  onCreate,
  onCancel,
}: CreateBookingDialogProps) {
  const [leadId, setLeadId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [buildingId, setBuildingId] = useState("");

  const {
    data: leadsData,
    isLoading: leadsLoading,
    isError: leadsError,
  } = useLeads({ page: 1, limit: 100 });

  const {
    data: buildingsData,
    isLoading: buildingsLoading,
    isError: buildingsError,
  } = useBuildings({ page: 1, limit: 100 });

  const leads: Lead[] = leadsData?.leads ?? [];
  const buildings: Building[] = buildingsData?.buildings ?? [];

  const eligibleLeads = useMemo(
    () =>
      leads.filter((lead) => lead.stage !== "BOOKED" && lead.stage !== "LOST"),
    [leads],
  );

  const projects = useMemo(() => {
    const uniqueProjects = new Map<
      string,
      { id: string; name: string; city: string }
    >();

    for (const building of buildings) {
      const project = building.project;

      if (project?.id && !uniqueProjects.has(project.id)) {
        uniqueProjects.set(project.id, {
          id: project.id,
          name: project.name,
          city: project.city,
        });
      }
    }

    return Array.from(uniqueProjects.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [buildings]);

  const filteredBuildings = useMemo(
    () => buildings.filter((building) => building.project.id === projectId),
    [buildings, projectId],
  );

  const selectedBuilding = buildings.find(
    (building) => building.id === buildingId,
  );

  const leadOptions = eligibleLeads.map((lead) => ({
    label: `${lead.name} · ${lead.phone}`,
    value: lead.id,
  }));

  const projectOptions = projects.map((project) => ({
    label: project.city ? `${project.name} · ${project.city}` : project.name,
    value: project.id,
  }));

  const buildingOptions = filteredBuildings.map((building) => ({
    label: building.name,
    value: building.id,
  }));

  // Reset the form when the dialog opens.
  useEffect(() => {
    if (!open) return;

    setLeadId("");
    setProjectId("");
    setBuildingId("");
  }, [open]);

  // Preselect a building and its project when opened from a building page.
  useEffect(() => {
    if (!open || !initialBuildingId || buildings.length === 0) return;

    const initialBuilding = buildings.find(
      (building) => building.id === initialBuildingId,
    );

    if (initialBuilding) {
      setProjectId(initialBuilding.project.id);
      setBuildingId(initialBuilding.id);
    }
  }, [open, initialBuildingId, buildings]);

  const handleProjectChange = (value: string) => {
    setProjectId(value);
    setBuildingId("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!leadId || !projectId || !buildingId) return;

    const validBuilding = filteredBuildings.some(
      (building) => building.id === buildingId,
    );

    if (!validBuilding) return;

    // The parent handles errors and displays the toast.
    try {
      await onCreate({ leadId, buildingId });
    } catch {
      // Intentionally no inline error card.
      // Preserve the parent's toast and error handling.
    }
  };

  const isLoadingOptions = leadsLoading || buildingsLoading;
  const hasOptionsError = leadsError || buildingsError;

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Create booking"
      description="Select a lead, project, and building."
      loading={loading}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Lead */}
        <div className="space-y-2">
          <label
            htmlFor="booking-lead"
            className="flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <UserRound
              className="size-4 text-blue-600 dark:text-blue-400"
              aria-hidden={true}
            />
            Lead <span className="text-destructive">*</span>
          </label>

          <Select
            name="leadId"
            value={leadId}
            onChange={setLeadId}
            options={leadOptions}
            placeholder={leadsLoading ? "Loading leads..." : "Select a lead"}
            disabled={loading || leadsLoading || leadsError}
            required
          />

          {!leadsLoading && !leadsError && eligibleLeads.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No eligible leads available for booking.
            </p>
          )}
        </div>

        {/* Project */}
        <div className="space-y-2">
          <label
            htmlFor="booking-project"
            className="flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <FolderKanban
              className="size-4 text-violet-600 dark:text-violet-400"
              aria-hidden={true}
            />
            Project <span className="text-destructive">*</span>
          </label>

          <Select
            name="projectId"
            value={projectId}
            onChange={handleProjectChange}
            options={projectOptions}
            placeholder={
              buildingsLoading ? "Loading projects..." : "Select a project"
            }
            disabled={
              loading ||
              buildingsLoading ||
              buildingsError ||
              projects.length === 0 ||
              Boolean(initialBuildingId)
            }
            required
          />

          {!buildingsLoading && !buildingsError && projects.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No projects with buildings were found.
            </p>
          )}
        </div>

        {/* Building */}
        <div className="space-y-2">
          <label
            htmlFor="booking-building"
            className="flex items-center gap-2 text-sm font-medium text-foreground"
          >
            <Building2
              className="size-4 text-emerald-600 dark:text-emerald-400"
              aria-hidden={true}
            />
            Building <span className="text-destructive">*</span>
          </label>

          <Select
            name="buildingId"
            value={buildingId}
            onChange={setBuildingId}
            options={buildingOptions}
            placeholder={
              !projectId
                ? "Select a project first"
                : buildingsLoading
                  ? "Loading buildings..."
                  : "Select a building"
            }
            disabled={
              loading ||
              buildingsLoading ||
              buildingsError ||
              !projectId ||
              filteredBuildings.length === 0 ||
              Boolean(initialBuildingId)
            }
            required
          />

          {projectId && !buildingsLoading && filteredBuildings.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No buildings are available for this project.
            </p>
          )}

          {initialBuildingId && !buildingsLoading && !selectedBuilding && (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              The selected building could not be found in the loaded list.
            </p>
          )}
        </div>

        {/* Selected building summary */}
        {selectedBuilding && (
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Building2 className="size-5" aria-hidden={true} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">
                  {selectedBuilding.name}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedBuilding.project.name}
                  {selectedBuilding.project.city
                    ? ` · ${selectedBuilding.project.city}`
                    : ""}
                </p>

                {(selectedBuilding.minPrice != null ||
                  selectedBuilding.maxPrice != null) && (
                  <div className="mt-2 flex items-start gap-1.5 text-sm font-medium text-foreground">
                    <IndianRupee
                      className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                      aria-hidden={true}
                    />

                    <span>
                      {selectedBuilding.minPrice != null
                        ? Number(selectedBuilding.minPrice).toLocaleString(
                            "en-IN",
                          )
                        : "Price not specified"}

                      {selectedBuilding.maxPrice != null
                        ? ` – ₹${Number(selectedBuilding.maxPrice).toLocaleString("en-IN")}`
                        : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Data loading error stays separate from submission errors. */}
        {hasOptionsError && (
          <p className="text-sm text-muted-foreground">
            Unable to load leads or buildings. Please try again.
          </p>
        )}

        {/* Guidance */}
        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
          <CalendarCheck
            className="mt-0.5 size-4 shrink-0"
            aria-hidden={true}
          />
          <p>
            Confirm the lead, project, and building before creating the booking.
            Booking status and availability are managed separately.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={
              loading ||
              isLoadingOptions ||
              hasOptionsError ||
              !leadId ||
              !projectId ||
              !buildingId ||
              eligibleLeads.length === 0 ||
              !filteredBuildings.some((building) => building.id === buildingId)
            }
          >
            {loading ? "Creating..." : "Create booking"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

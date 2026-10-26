"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Building2, CalendarCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";

import { useLeads } from "@/features/leads/lib/leads-queries";
import { useBuildings } from "@/features/buildings/lib/buildings.queries";

import type { Lead } from "@/features/leads/lib/leads.types";
import type { Building } from "@/features/buildings/lib/buildings.types";
import type { CreateBookingInput } from "../lib/bookings.types";

type CreateBookingDialogProps = {
  initialBuildingId?: string;
  loading?: boolean;
  onCreate: (input: CreateBookingInput) => Promise<unknown>;
  onCancel: () => void;
};

export function CreateBookingDialog({
  initialBuildingId,
  loading = false,
  onCreate,
  onCancel,
}: CreateBookingDialogProps) {
  const [leadId, setLeadId] = useState("");
  const [buildingId, setBuildingId] = useState(initialBuildingId ?? "");
  const [submitError, setSubmitError] = useState("");

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

  useEffect(() => {
    setLeadId("");
    setBuildingId(initialBuildingId ?? "");
    setSubmitError("");
  }, [initialBuildingId]);

  const leads: Lead[] = leadsData?.leads ?? [];
  const buildings: Building[] = buildingsData?.buildings ?? [];

  const eligibleLeads = leads.filter(
    (lead) => lead.stage !== "BOOKED" && lead.stage !== "LOST",
  );

  const leadOptions = eligibleLeads.map((lead) => ({
    label: `${lead.name} · ${lead.phone}`,
    value: lead.id,
  }));

  const buildingOptions = buildings.map((building) => ({
    label: `${building.name} · ${building.project.name}`,
    value: building.id,
  }));

  const isLoadingOptions = leadsLoading || buildingsLoading;
  const hasLoadingError = leadsError || buildingsError;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setSubmitError("");

    if (!leadId || !buildingId) {
      setSubmitError("Please select a lead and a building.");
      return;
    }

    try {
      await onCreate({
        leadId,
        buildingId,
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Could not create booking.",
      );
    }
  }

  return (
    <Modal
      open
      onClose={() => {
        if (!loading) onCancel();
      }}
      title="Create booking"
      description="Select a customer and the building they want to book."
      loading={loading}
      maxWidth="max-w-xl"
      footer={
        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="create-booking-form"
            size="lg"
            loading={loading}
            loadingText="Creating booking..."
            leftIcon={CalendarCheck}
            disabled={
              loading ||
              isLoadingOptions ||
              hasLoadingError ||
              eligibleLeads.length === 0 ||
              buildings.length === 0
            }
            className="w-full sm:w-auto"
          >
            Create booking
          </Button>
        </div>
      }
    >
      <form
        id="create-booking-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6"
      >
        {submitError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
          >
            {submitError}
          </div>
        )}

        {hasLoadingError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
          >
            Could not load leads or buildings. Please close this dialog and try
            again.
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <UserRound
              size={17}
              className="text-muted-foreground"
              aria-hidden="true"
            />
            <h3 className="text-sm font-semibold text-foreground">Customer</h3>
          </div>

          <Select
            label="Select lead"
            placeholder={
              isLoadingOptions ? "Loading leads..." : "Choose a customer"
            }
            options={leadOptions}
            value={leadId}
            onChange={(value) => {
              setLeadId(value);
              setSubmitError("");
            }}
            searchable
            disabled={loading || isLoadingOptions || hasLoadingError}
            required
            helperText="Booked and lost leads are excluded."
          />

          {!isLoadingOptions &&
            !hasLoadingError &&
            eligibleLeads.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No eligible leads are available for booking.
              </p>
            )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building2
              size={17}
              className="text-muted-foreground"
              aria-hidden="true"
            />
            <h3 className="text-sm font-semibold text-foreground">Property</h3>
          </div>

          <Select
            label="Select building"
            placeholder={
              isLoadingOptions ? "Loading buildings..." : "Choose a building"
            }
            options={buildingOptions}
            value={buildingId}
            onChange={(value) => {
              setBuildingId(value);
              setSubmitError("");
            }}
            searchable
            disabled={loading || isLoadingOptions || hasLoadingError}
            required
          />

          {!isLoadingOptions && !hasLoadingError && buildings.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Create a building before making a booking.
            </p>
          )}
        </div>

        <p className="rounded-lg border border-border bg-surface/60 px-4 py-3 text-xs leading-5 text-muted-foreground">
          New bookings are created as confirmed. You can change the status later
          from the bookings table. This booking does not change the
          building&apos;s availability.
        </p>
      </form>
    </Modal>
  );
}

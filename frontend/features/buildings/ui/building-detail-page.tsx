"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Layers3,
  Pencil,
  Trash2,
  Images,
  FolderKanban,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useToast } from "@/components/ui/toast";

import {
  useBuilding,
  useDeleteBuilding,
} from "@/features/buildings/lib/buildings.queries";
import { BuildingFormDialog } from "@/features/buildings/ui/building-form-dialog";

import { ImageGallery } from "@/components/ui/image-gallery";
import { DetailStatCard } from "@/components/ui/detail-stat-card";
import { ContactInfoCard } from "@/components/ui/contact-info-card";
import { DetailSection } from "@/components/ui/detail-section";

function formatDate(value?: string | Date | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function BuildingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { data: building, isLoading, isError } = useBuilding(id);
  const deleteMutation = useDeleteBuilding();
  const toast = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleDelete() {
    if (!building) return;

    deleteMutation.mutate(building.id, {
      onSuccess: () => {
        toast.success({
          title: "Building deleted",
          description: "The building was deleted successfully.",
        });

        router.push("/buildings");
      },
      onError: () => {
        toast.error({
          title: "Unable to delete building",
          description: "Please try again.",
        });
      },
    });
  }

  if (isLoading) {
    return (
      <div className="w-full space-y-6 pb-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />

        <div className="aspect-[16/7] animate-pulse rounded-2xl bg-muted" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>

        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (isError || !building) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <Building2 size={28} />
        </div>

        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Building not found
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The building could not be loaded. It may have been deleted.
          </p>
        </div>

        <Button
          variant="outline"
          leftIcon={ArrowLeft}
          onClick={() => router.push("/buildings")}
        >
          Back to Buildings
        </Button>
      </div>
    );
  }

  const imageCount = building.images?.length ?? 0;
  const floorCount = building.totalFloors ?? 0;

  return (
    <div className="w-full space-y-7 pb-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Buildings", href: "/buildings" },
          { label: building.name },
        ]}
      />

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"
      >
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600">
            <Building2 size={25} />
          </div>

          <div className="min-w-0">
            <h1 className="break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {building.name}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Building details and information
            </p>

            {building.project?.name && (
              <Link
                href={`/projects/${building.projectId}`}
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <FolderKanban size={15} />
                {building.project.name}
              </Link>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="outline"
            leftIcon={Pencil}
            onClick={() => setEditOpen(true)}
          >
            Edit
          </Button>

          <Button
            variant="danger"
            leftIcon={Trash2}
            onClick={() => setDeleteOpen(true)}
          >
            Delete
          </Button>
        </div>
      </motion.div>

      {/* Image gallery */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ImageGallery images={building.images ?? []} title={building.name} />
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DetailStatCard
          label="Total Floors"
          value={floorCount}
          hint="Floors in this building"
          icon={Layers3}
          colorClass="bg-blue-500/10 text-blue-600"
        />

        <DetailStatCard
          label="Images"
          value={imageCount}
          hint="Uploaded building images"
          icon={Images}
          colorClass="bg-violet-500/10 text-violet-600"
        />

        <DetailStatCard
          label="Project"
          value={building.project?.name || "Unassigned"}
          hint="Parent project"
          icon={FolderKanban}
          colorClass="bg-emerald-500/10 text-emerald-600"
        />

        <DetailStatCard
          label="Created"
          value={formatDate(building.createdAt)}
          hint="Building record created"
          icon={CalendarDays}
          colorClass="bg-amber-500/10 text-amber-600"
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <DetailSection
            title="Building Overview"
            subtitle="General information about this building"
            icon={Building2}
          >
            <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
              {building.description || "No description available."}
            </p>
          </DetailSection>

          <DetailSection
            title="Building Information"
            subtitle="Key details from the building record"
            icon={MapPin}
          >
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Building Name</dt>
                <dd className="mt-1 break-words text-sm font-medium text-foreground">
                  {building.name}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-muted-foreground">Total Floors</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {floorCount}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-muted-foreground">Created On</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {formatDate(building.createdAt)}
                </dd>
              </div>

              <div>
                <dt className="text-sm text-muted-foreground">
                  Parent Project
                </dt>
                <dd className="mt-1 text-sm font-medium text-foreground">
                  {building.project?.name || "Unassigned"}
                </dd>
              </div>
            </dl>
          </DetailSection>

          {building.project && (
            <DetailSection
              title="Parent Project"
              subtitle="The project associated with this building"
              icon={FolderKanban}
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <p className="break-words font-medium text-foreground">
                    {building.project.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    View the parent project for more information.
                  </p>
                </div>

                <Link
                  href={`/projects/${building.projectId}`}
                  className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  View Project
                  <ArrowLeft className="rotate-180" size={16} />
                </Link>
              </div>
            </DetailSection>
          )}
        </div>

        {/* Contact sidebar */}
        <aside className="space-y-6">
          <ContactInfoCard
            title="Building Contact"
            name={building.contactName}
            phone={building.contactPhone}
            email={building.contactEmail}
          />
        </aside>
      </div>

      {/* Edit dialog */}
      <BuildingFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        building={building}
      />

      {/* Delete confirmation */}
      <ConfirmationModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete building?"
        description={`Are you sure you want to delete "${building.name}"? This action cannot be undone.`}
        confirmText="Delete Building"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </div>
  );
}

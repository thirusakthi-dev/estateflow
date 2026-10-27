"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  FolderKanban,
  Images,
  IndianRupee,
  Layers3,
  MapPin,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ImageGallery } from "@/components/ui/image-gallery";
import { DetailStatCard } from "@/components/ui/detail-stat-card";
import { ContactInfoCard } from "@/components/ui/contact-info-card";
import { useToast } from "@/components/ui/toast";

import {
  useBuilding,
  useDeleteBuilding,
} from "@/features/buildings/lib/buildings.queries";
import { BuildingFormDialog } from "@/features/buildings/ui/building-form-dialog";
import { CreateBookingDialog } from "@/features/bookings/ui/create-booking-dialog";
import { useCreateBooking } from "../../bookings/lib/bookings.queries";

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

function formatPrice(price: number | string) {
  const value = Number(price);

  if (!Number.isFinite(value)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getPriceRange(
  minPrice: number | string | null | undefined,
  maxPrice: number | string | null | undefined,
) {
  if (minPrice == null && maxPrice == null) {
    return "Price not specified";
  }

  if (minPrice != null && maxPrice != null) {
    return `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`;
  }

  if (minPrice != null) {
    return `From ${formatPrice(minPrice)}`;
  }

  return `Up to ${formatPrice(maxPrice!)}`;
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
      className={`min-w-0 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:p-5 ${className}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-100">{title}</h2>

          {description && (
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          )}
        </div>

        {action}
      </div>

      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function BuildingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const toast = useToast();

  const id = params.id;

  const { data: building, isLoading, isError, refetch } = useBuilding(id);

  const deleteMutation = useDeleteBuilding();
  const createBookingMutation = useCreateBooking();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const imageCount = building?.images?.length ?? 0;
  const floorCount = building?.totalFloors ?? 0;

  const priceRange = useMemo(
    () =>
      building
        ? getPriceRange(building.minPrice, building.maxPrice)
        : "Price not specified",
    [building],
  );

  const description = building?.description?.trim() ?? "";
  const longDescription = description.length > 260;

  const visibleDescription =
    longDescription && !descriptionExpanded
      ? `${description.slice(0, 260).trimEnd()}…`
      : description;

  function handleDelete() {
    if (!building || deleteMutation.isPending) return;

    deleteMutation.mutate(building.id, {
      onSuccess: () => {
        setDeleteOpen(false);

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
      <main
        className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8"
        aria-label="Loading building details"
      >
        <div className="h-5 w-48 animate-pulse rounded bg-slate-800" />

        <div className="flex flex-col justify-between gap-4 sm:flex-row">
          <div className="flex gap-3">
            <div className="size-12 animate-pulse rounded-xl bg-slate-800" />
            <div className="space-y-2 pt-1">
              <div className="h-7 w-56 animate-pulse rounded bg-slate-800" />
              <div className="h-4 w-40 animate-pulse rounded bg-slate-800" />
            </div>
          </div>
        </div>

        <div className="mx-auto h-64 w-full max-w-5xl animate-pulse rounded-xl bg-slate-900" />

        <div className="h-24 animate-pulse rounded-xl bg-slate-900" />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl bg-slate-900"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="h-56 animate-pulse rounded-xl bg-slate-900" />
          <div className="h-48 animate-pulse rounded-xl bg-slate-900" />
        </div>
      </main>
    );
  }

  if (isError || !building) {
    return (
      <main className="mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:p-6 lg:p-8">
        <Breadcrumbs
          items={[
            { label: "Buildings", href: "/buildings" },
            { label: "Building Details" },
          ]}
        />

        <section className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950 px-5 py-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
            <Building2 className="size-7" aria-hidden="true" />
          </div>

          <h1 className="mt-4 text-lg font-semibold text-slate-100">
            Building not found
          </h1>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
            The building could not be loaded. It may have been deleted or is
            temporarily unavailable.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>

            <Button
              leftIcon={ArrowLeft}
              onClick={() => router.push("/buildings")}
            >
              Back to Buildings
            </Button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <motion.main
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.22 }}
      className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8"
    >
      {/* Breadcrumbs and actions */}
      <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Breadcrumbs
            items={[
              { label: "Buildings", href: "/buildings" },
              { label: building.name },
            ]}
          />
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="outline"
            leftIcon={ArrowLeft}
            onClick={() => router.push("/buildings")}
          >
            Back
          </Button>

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
      </header>

      {/* Building heading */}
      <section className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
            <Building2 className="size-6" aria-hidden="true" />
          </div>

          <h1 className="break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {building.name}
          </h1>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Building Details
          </span>
        </div>

        <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0 text-rose-400" />
          <span>
            {building.project?.city?.trim() || "Location not provided"}
          </span>
        </p>

        {building.project?.name && (
          <Link
            href={`/projects/${building.projectId}`}
            className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
          >
            <FolderKanban className="size-4 text-violet-400" />
            {building.project.name}
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </section>

      {/* Image gallery: same centered max-width as Project Detail */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.25,
          delay: reduceMotion ? 0 : 0.03,
        }}
        className="mx-auto w-full max-w-5xl"
      >
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
          <ImageGallery images={building.images ?? []} title={building.name} />
        </div>
      </motion.div>

      {/* Price summary and booking action */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.25,
          delay: reduceMotion ? 0 : 0.04,
        }}
        className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
      >
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <IndianRupee className="size-5" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <p className="text-sm text-slate-400">Building price range</p>
            <p className="mt-1 break-words text-lg font-semibold text-slate-100">
              {priceRange}
            </p>
          </div>
        </div>

        <Button leftIcon={CalendarPlus} onClick={() => setBookingOpen(true)}>
          Book Unit
        </Button>
      </motion.section>

      {/* Building statistics */}
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.25,
          delay: reduceMotion ? 0 : 0.06,
        }}
        className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <DetailStatCard
          label="Total Floors"
          value={floorCount}
          hint="Floors in this building"
          icon={Layers3}
          colorClass="bg-blue-500/15 text-blue-400"
        />

        <DetailStatCard
          label="Images"
          value={imageCount}
          hint="Uploaded building images"
          icon={Images}
          colorClass="bg-violet-500/15 text-violet-400"
        />

        <DetailStatCard
          label="Project"
          value={building.project?.name || "Unassigned"}
          hint="Parent project"
          icon={FolderKanban}
          colorClass="bg-emerald-500/15 text-emerald-400"
        />

        <DetailStatCard
          label="Created On"
          value={formatDate(building.createdAt)}
          hint="Building record created"
          icon={CalendarDays}
          colorClass="bg-amber-500/15 text-amber-400"
        />
      </motion.section>

      {/* Main details */}
      <section className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          {/* Overview */}
          <Panel
            title="Building Overview"
            description="General information about this building"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                <Building2 className="size-4.5" aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                {description ? (
                  <>
                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
                      {visibleDescription}
                    </p>

                    {longDescription && (
                      <button
                        type="button"
                        onClick={() =>
                          setDescriptionExpanded((expanded) => !expanded)
                        }
                        className="mt-2 text-sm font-semibold text-blue-400 transition-colors hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        {descriptionExpanded ? "Show less" : "Show more"}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-sm leading-6 text-slate-400">
                    No description added for this building yet.
                  </p>
                )}
              </div>
            </div>
          </Panel>

          {/* Building information */}
          <Panel
            title="Building Information"
            description="Key details from the building record"
          >
            <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                  <Building2 className="size-4" aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <dt className="text-xs text-slate-400">Building Name</dt>
                  <dd className="mt-1 break-words text-sm font-medium text-slate-100">
                    {building.name}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-400">
                  <Layers3 className="size-4" aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <dt className="text-xs text-slate-400">Total Floors</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-100">
                    {floorCount}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                  <IndianRupee className="size-4" aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <dt className="text-xs text-slate-400">Price Range</dt>
                  <dd className="mt-1 break-words text-sm font-semibold text-slate-100">
                    {priceRange}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                  <CalendarDays className="size-4" aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <dt className="text-xs text-slate-400">Created On</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-100">
                    {formatDate(building.createdAt)}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:col-span-2">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400">
                  <FolderKanban className="size-4" aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <dt className="text-xs text-slate-400">Parent Project</dt>
                  <dd className="mt-1 break-words text-sm font-medium text-slate-100">
                    {building.project?.name || "Unassigned"}
                  </dd>
                </div>
              </div>
            </dl>
          </Panel>

          {/* Parent project */}
          {building.project && (
            <Panel
              title="Parent Project"
              description="The project associated with this building"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
                    <FolderKanban className="size-5" aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <p className="break-words font-medium text-slate-100">
                      {building.project.name}
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      View the parent project for more information.
                    </p>
                  </div>
                </div>

                <Link
                  href={`/projects/${building.projectId}`}
                  className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
                >
                  View Project
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </Panel>
          )}
        </div>

        {/* Contact information */}
        <aside className="min-w-0 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
              <MapPin className="size-5" aria-hidden="true" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Building Contact
              </h2>
              <p className="mt-1 text-sm text-slate-400">Contact information</p>
            </div>
          </div>

          <ContactInfoCard
            title="Building Contact"
            name={building.contactName}
            phone={building.contactPhone}
            email={building.contactEmail}
          />
        </aside>
      </section>

      {/* Edit building */}
      <BuildingFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        building={building}
      />

      {/* Create booking */}
      <CreateBookingDialog
        open={bookingOpen}
        initialBuildingId={building.id}
        onCancel={() => setBookingOpen(false)}
        onCreate={async (input) => {
          await createBookingMutation.mutateAsync(input);

          toast.success({
            title: "Booking created",
            description: "The booking was created successfully.",
          });

          setBookingOpen(false);
        }}
        loading={createBookingMutation.isPending}
      />

      {/* Delete confirmation */}
      <ConfirmationModal
        open={deleteOpen}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeleteOpen(false);
          }
        }}
        onConfirm={handleDelete}
        title="Delete building?"
        description={`Are you sure you want to delete "${building.name}"? This action cannot be undone.`}
        confirmText="Delete Building"
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </motion.main>
  );
}

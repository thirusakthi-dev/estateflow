"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCw,
  ServerCrash,
  WifiOff,
  XCircle,
} from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { AppLoader, useMinimumLoading } from "@/components/ui/app-loader";
import { StatsCard } from "@/components/ui/stats-card";
import { Tooltip } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

import {
  useBookings,
  useCancelBooking,
  useCreateBooking,
  useUpdateBookingStatus,
} from "../lib/bookings.queries";

import type {
  Booking,
  BookingStatus,
  CreateBookingInput,
} from "../lib/bookings.types";

import { BookingsTable } from "./bookings-table";
import { CreateBookingDialog } from "./create-booking-dialog";
import { BookingSummaryDialog } from "./booking-summary-dialog";
import { getApiErrorMessage } from "@/lib/api";

const DEFAULT_PAGE_SIZE = 10;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
}

export function BookingsContent() {
  const toast = useToast();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const searchParams = useSearchParams();

  const initialBuildingId = searchParams.get("buildingId");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  const {
    data: bookingsResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useBookings({
    page,
    limit: pageSize,
  });

  const createBookingMutation = useCreateBooking();
  const cancelBookingMutation = useCancelBooking();
  const updateBookingStatusMutation = useUpdateBookingStatus();

  // Open the form automatically when a building ID is in the URL.
  useEffect(() => {
    if (initialBuildingId) {
      setShowCreate(true);
    }
  }, [initialBuildingId]);

  const bookings = bookingsResponse?.bookings ?? [];
  const total = bookingsResponse?.pagination.total ?? 0;
  const totalPages = bookingsResponse?.pagination.totalPages ?? 1;

  const isInitialLoading = isLoading && !bookingsResponse;

  const showLoading = useMinimumLoading(isInitialLoading || isRefreshing, 1000);

  // Statistics are based on the currently loaded page.
  const confirmedCount = bookings.filter(
    (booking) => booking.status === "CONFIRMED",
  ).length;

  const cancelledCount = bookings.filter(
    (booking) => booking.status === "CANCELLED",
  ).length;

  const pendingCount = bookings.filter(
    (booking) => booking.status === "PENDING",
  ).length;

  const openCreateDialog = () => {
    if (!createBookingMutation.isPending) {
      setShowCreate(true);
    }
  };

  const closeCreateDialog = () => {
    if (createBookingMutation.isPending) return;

    setShowCreate(false);

    if (initialBuildingId) {
      router.replace("/bookings", { scroll: false });
    }
  };

  const handleCreate = async (input: CreateBookingInput) => {
    try {
      await createBookingMutation.mutateAsync(input);

      toast.success({
        title: "Booking created",
        description: "The booking was created successfully.",
      });

      closeCreateDialog();
    } catch (error) {
      toast.error({
        title: "Unable to create booking",
        description: getApiErrorMessage(
          error,
          "Unable to create the booking. Please try again.",
        ),
      });
    }
  };

  const handleCancel = async (booking: Booking) => {
    if (booking.status !== "CONFIRMED" || cancelBookingMutation.isPending) {
      return;
    }

    try {
      const updatedBooking = await cancelBookingMutation.mutateAsync(
        booking.id,
      );

      setSelectedBooking((current) =>
        current?.id === updatedBooking.id ? updatedBooking : current,
      );

      toast.success({
        title: "Booking cancelled",
        description: "The booking was cancelled successfully.",
      });
    } catch (error) {
      toast.error({
        title: "Unable to cancel booking",
        description: getErrorMessage(
          error,
          "Something went wrong. Please try again.",
        ),
      });
    }
  };

  const handleStatusChange = async (
    booking: Booking,
    status: BookingStatus,
  ) => {
    if (status === booking.status || updateBookingStatusMutation.isPending) {
      return;
    }

    try {
      const updatedBooking = await updateBookingStatusMutation.mutateAsync({
        id: booking.id,
        status,
      });

      setSelectedBooking((current) =>
        current?.id === updatedBooking.id ? updatedBooking : current,
      );

      toast.success({
        title: "Booking status updated",
        description:
          status === "CONFIRMED"
            ? "The booking has been confirmed."
            : "The booking has been cancelled.",
      });
    } catch (error) {
      toast.error({
        title: "Unable to update booking status",
        description: getErrorMessage(
          error,
          "Something went wrong. Please try again.",
        ),
      });
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing || isFetching) return;

    setIsRefreshing(true);

    try {
      await refetch({ throwOnError: true });

      toast.success({
        title: "Bookings refreshed",
        description: "Your booking records are up to date.",
      });
    } catch (error) {
      toast.error({
        title: "Refresh failed",
        description: getErrorMessage(
          error,
          "Unable to refresh bookings. Please try again.",
        ),
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePageChange = (nextPage: number) => {
    if (
      Number.isInteger(nextPage) &&
      nextPage >= 1 &&
      nextPage <= totalPages &&
      nextPage !== page
    ) {
      setPage(nextPage);
    }
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    if (
      Number.isInteger(nextPageSize) &&
      nextPageSize >= 1 &&
      nextPageSize !== pageSize
    ) {
      setPageSize(nextPageSize);
      setPage(1);
    }
  };

  const pageAnimation = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: 0.22,
          ease: "easeOut" as const,
        },
      };

  if (showLoading) {
    return (
      <section className="flex min-h-[60vh] w-full items-center justify-center">
        <AppLoader message="Loading bookings" />
      </section>
    );
  }

  if (isError && !bookingsResponse) {
    return (
      <motion.section className="w-full space-y-6" {...pageAnimation}>
        <PageHeader
          title="Bookings"
          description="Manage and track building bookings."
          icon={CalendarCheck}
          actions={
            <>
              <Tooltip content="Refresh bookings">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => void handleRefresh()}
                  disabled={isRefreshing || isFetching}
                  aria-label="Refresh bookings"
                >
                  <RefreshCw className="size-4" />
                </Button>
              </Tooltip>

              <Button
                leftIcon={Plus}
                onClick={openCreateDialog}
                disabled={createBookingMutation.isPending}
              >
                Create Booking
              </Button>
            </>
          }
        />

        <EmptyState
          icon={ServerCrash}
          title="Unable to load bookings"
          description="There was a problem loading your bookings. Please try again."
          actionLabel="Retry"
          onAction={() => void handleRefresh()}
        />

        {showCreate && (
          <CreateBookingDialog
            open={bookingOpen}
            initialBuildingId={initialBuildingId ?? undefined}
            onCancel={closeCreateDialog}
            onCreate={handleCreate}
            loading={createBookingMutation.isPending}
          />
        )}
      </motion.section>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.section
        key="bookings-content"
        className="w-full min-w-0 space-y-6"
        {...pageAnimation}
      >
        <PageHeader
          title="Bookings"
          description="Manage and track building bookings."
          icon={CalendarCheck}
          actions={
            <>
              <Tooltip content="Refresh bookings">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => void handleRefresh()}
                  disabled={isRefreshing || isFetching}
                  aria-label="Refresh bookings"
                >
                  <RefreshCw
                    className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </Button>
              </Tooltip>

              <Button
                leftIcon={Plus}
                onClick={openCreateDialog}
                disabled={createBookingMutation.isPending}
              >
                Create Booking
              </Button>
            </>
          }
        />

        {/* Booking statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Total Bookings"
            value={total}
            icon={CalendarDays}
            description="Across all booking records"
            tone="blue"
            index={0}
          />

          <StatsCard
            title="Confirmed"
            value={confirmedCount}
            icon={CheckCircle2}
            description="On the current page"
            tone="green"
            index={1}
          />

          <StatsCard
            title="Pending"
            value={pendingCount}
            icon={Clock3}
            description="On the current page"
            tone="amber"
            index={2}
          />

          <StatsCard
            title="Cancelled"
            value={cancelledCount}
            icon={XCircle}
            description="On the current page"
            tone="violet"
            index={3}
          />
        </div>

        {/* Refresh error */}
        {isError && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4"
          >
            <WifiOff className="mt-0.5 size-5 shrink-0 text-amber-600" />

            <div>
              <p className="text-sm font-medium text-foreground">
                Could not refresh booking data
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Showing the previously loaded data. Try refreshing again.
              </p>

              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => void handleRefresh()}
                disabled={isRefreshing || isFetching}
              >
                <RefreshCw className="size-3.5" />
                Try again
              </Button>
            </div>
          </div>
        )}

        {/* Booking table */}
        <div className="space-y-3">
          <BookingsTable
            bookings={bookings}
            loading={false}
            page={page}
            totalPages={totalPages}
            totalRecords={total}
            pageSize={pageSize}
            isFetching={
              isFetching ||
              isRefreshing ||
              updateBookingStatusMutation.isPending
            }
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onViewBooking={setSelectedBooking}
            onStatusChange={handleStatusChange}
          />

          <p className="text-xs text-muted-foreground">
            Showing {bookings.length}{" "}
            {bookings.length === 1 ? "booking" : "bookings"} on this page out of{" "}
            {total} total {total === 1 ? "booking" : "bookings"}.
          </p>
        </div>

        {/* Create booking */}
        {showCreate && (
          <CreateBookingDialog
            open={showCreate}
            initialBuildingId={initialBuildingId ?? undefined}
            onCancel={closeCreateDialog}
            onCreate={handleCreate}
            loading={createBookingMutation.isPending}
          />
        )}

        {/* Booking details */}
        {selectedBooking && (
          <BookingSummaryDialog
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onCancel={handleCancel}
            isCancelling={cancelBookingMutation.isPending}
          />
        )}
      </motion.section>
    </AnimatePresence>
  );
}

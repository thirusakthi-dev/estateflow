"use client";

import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table/data-table";

import type {
  DataTableColumn,
  DataTableFilter,
} from "@/components/ui/data-table/data-table-types";

import type { Booking, BookingStatus } from "../lib/bookings.types";

type BookingsTableProps = {
  bookings: Booking[];
  loading: boolean;
  page: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onViewBooking: (booking: Booking) => void;
  onStatusChange: (
    booking: Booking,
    status: BookingStatus,
  ) => void | Promise<void>;
};

const statusLabels: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function StatusSelect({
  booking,
  onStatusChange,
  disabled,
}: {
  booking: Booking;
  onStatusChange: (
    booking: Booking,
    status: BookingStatus,
  ) => void | Promise<void>;
  disabled: boolean;
}) {
  return (
    <div className="min-w-32" onClick={(event) => event.stopPropagation()}>
      <Select
        value={booking.status}
        options={[
          { label: "Pending", value: "PENDING" },
          { label: "Confirmed", value: "CONFIRMED" },
          { label: "Cancelled", value: "CANCELLED" },
        ]}
        onChange={(value) => {
          const nextStatus = value as BookingStatus;

          if (nextStatus !== booking.status) {
            void onStatusChange(booking, nextStatus);
          }
        }}
        disabled={disabled}
      />
    </div>
  );
}

export function BookingsTable({
  bookings,
  loading,
  page,
  totalPages,
  totalRecords,
  pageSize,
  isFetching,
  onPageChange,
  onPageSizeChange,
  onViewBooking,
  onStatusChange,
}: BookingsTableProps) {
  const columns: DataTableColumn<Booking>[] = [
    {
      id: "customer",
      header: "Customer",
      sortable: true,
      sortValue: (booking) => booking.lead.name,
      exportValue: (booking) => `${booking.lead.name} ${booking.lead.phone}`,
      cell: (booking) => (
        <div className="flex min-w-36 flex-col gap-0.5">
          <span className="font-medium text-foreground">
            {booking.lead.name}
          </span>

          <span className="text-xs text-muted-foreground">
            {booking.lead.phone}
          </span>
        </div>
      ),
    },
    {
      id: "building",
      header: "Building",
      sortable: true,
      sortValue: (booking) => booking.building.name,
      exportValue: (booking) =>
        `${booking.building.name} ${booking.building.project.name}`,
      cell: (booking) => (
        <div className="flex min-w-36 flex-col gap-0.5">
          <span className="font-medium text-foreground">
            {booking.building.name}
          </span>

          <span className="text-xs text-muted-foreground">
            {booking.building.project.name}
          </span>
        </div>
      ),
    },
    {
      id: "city",
      header: "City",
      sortable: true,
      sortValue: (booking) => booking.building.project.city,
      exportValue: (booking) => booking.building.project.city,
      cell: (booking) => (
        <span className="text-muted-foreground">
          {booking.building.project.city || "—"}
        </span>
      ),
    },
    {
      id: "bookedBy",
      header: "Booked By",
      sortable: true,
      sortValue: (booking) => booking.bookedBy.name,
      exportValue: (booking) =>
        `${booking.bookedBy.name} ${booking.bookedBy.email}`,
      cell: (booking) => (
        <div className="flex min-w-36 flex-col gap-0.5">
          <span className="text-foreground">{booking.bookedBy.name}</span>

          <span className="text-xs text-muted-foreground">
            {booking.bookedBy.email}
          </span>
        </div>
      ),
    },
    {
      id: "bookedAt",
      header: "Booking Date",
      sortable: true,
      sortValue: (booking) => new Date(booking.bookedAt),
      exportValue: (booking) => formatDate(booking.bookedAt),
      cell: (booking) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatDate(booking.bookedAt)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      sortValue: (booking) => statusLabels[booking.status],
      exportValue: (booking) => statusLabels[booking.status],
      cell: (booking) => (
        <StatusSelect
          booking={booking}
          onStatusChange={onStatusChange}
          disabled={isFetching}
        />
      ),
    },
  ];

  const filters: DataTableFilter<Booking>[] = [
    {
      id: "status",
      label: "Status",
      options: [
        { label: "Pending", value: "PENDING" },
        { label: "Confirmed", value: "CONFIRMED" },
        { label: "Cancelled", value: "CANCELLED" },
      ],
      getValue: (booking) => booking.status,
    },
  ];

  return (
    <DataTable
      data={bookings}
      columns={columns}
      getRowId={(booking) => booking.id}
      onRowClick={onViewBooking}
      searchable
      searchPlaceholder="Search customers or buildings..."
      filters={filters}
      loading={loading}
      emptyTitle="No bookings found"
      emptyDescription="Try changing your search or status filter."
      exportable
      exportFileName="bookings"
      minWidth="1000px"
      pagination={{
        page,
        totalPages,
        totalRecords,
        pageSize,
        pageSizeOptions: [10, 25, 50],
        onPageChange,
        onPageSizeChange,
        disabled: isFetching,
      }}
    />
  );
}

"use client";

import { useState, type ReactNode, type ComponentType } from "react";
import {
  CalendarCheck,
  UserRound,
  Building2,
  ClipboardList,
  Clock3,
  CheckCircle2,
  Ban,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { Booking } from "../lib/bookings.types";

type BookingSummaryDialogProps = {
  booking: Booking;
  onClose: () => void;
  onCancel?: (booking: Booking) => void | Promise<void>;
  isCancelling?: boolean;
};

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

const statusConfig: Record<
  BookingStatus,
  {
    label: string;
    description: string;
    icon: typeof Clock3;
    color: string;
    iconColor: string;
    background: string;
    border: string;
  }
> = {
  PENDING: {
    label: "Pending",
    description: "Awaiting booking confirmation",
    icon: Clock3,
    color: "text-amber-800 dark:text-amber-300",
    iconColor: "text-amber-700 dark:text-amber-300",
    background: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  CONFIRMED: {
    label: "Confirmed",
    description: "This booking has been confirmed",
    icon: CheckCircle2,
    color: "text-emerald-800 dark:text-emerald-300",
    iconColor: "text-emerald-700 dark:text-emerald-300",
    background: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    description: "This booking has been cancelled",
    icon: Ban,
    color: "text-red-800 dark:text-red-300",
    iconColor: "text-red-700 dark:text-red-300",
    background: "bg-red-500/10",
    border: "border-red-500/20",
  },
};

function StatusCard({ status }: { status: BookingStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-4 ${config.background} ${config.border}`}
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-background/80">
        <Icon className={`size-5 ${config.iconColor}`} aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">
          BOOKING STATUS
        </p>
        <p className={`text-base font-semibold ${config.color}`}>
          {config.label}
        </p>
        <p className="text-xs leading-5 text-muted-foreground">
          {config.description}
        </p>
      </div>

      <span
        className={`hidden shrink-0 rounded-full border bg-background/70 px-3 py-1 text-xs font-semibold sm:inline-flex ${config.border} ${config.color}`}
      >
        {config.label}
      </span>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="break-words text-sm font-medium leading-5 text-foreground">
        {value || "Not provided"}
      </p>
    </div>
  );
}

function DetailSection({
  title,
  icon: Icon,
  iconStyle,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  iconStyle: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconStyle}`}
        >
          <Icon className="size-[18px]" aria-hidden={true} />
        </div>

        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function formatDate(value?: string | Date | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function BookingSummaryDialog({
  booking,
  onClose,
  onCancel,
  isCancelling = false,
}: BookingSummaryDialogProps) {
  const [cancelError, setCancelError] = useState("");

  const canCancel = booking.status === "CONFIRMED" && Boolean(onCancel);

  const handleCancel = async () => {
    if (!onCancel || !canCancel || isCancelling) return;

    setCancelError("");

    try {
      await onCancel(booking);
    } catch {
      setCancelError("Unable to cancel this booking. Please try again.");
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Booking details"
      description="Customer, property and booking information."
      loading={isCancelling}
      maxWidth="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isCancelling}>
            Close
          </Button>

          {canCancel && (
            <Button
              variant="danger"
              loading={isCancelling}
              loadingText="Cancelling..."
              onClick={() => void handleCancel()}
            >
              <Ban className="mr-2 size-4" aria-hidden="true" />
              Cancel booking
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        <StatusCard status={booking.status} />

        <DetailSection
          title="Customer information"
          icon={UserRound}
          iconStyle="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        >
          <InfoItem label="Customer name" value={booking.lead.name} />
          <InfoItem label="Phone number" value={booking.lead.phone} />
        </DetailSection>

        <div className="border-t border-border" />

        <DetailSection
          title="Property information"
          icon={Building2}
          iconStyle="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        >
          <InfoItem label="Building" value={booking.building.name} />
          <InfoItem label="Project" value={booking.building.project.name} />
          <InfoItem label="City" value={booking.building.project.city} />
        </DetailSection>

        <div className="border-t border-border" />

        <DetailSection
          title="Booking information"
          icon={ClipboardList}
          iconStyle="bg-violet-500/10 text-violet-600 dark:text-violet-400"
        >
          <InfoItem label="Booked on" value={formatDate(booking.bookedAt)} />
          <InfoItem label="Booked by" value={booking.bookedBy.name} />
          <InfoItem label="Employee email" value={booking.bookedBy.email} />

          {booking.cancelledAt && (
            <InfoItem
              label="Cancelled on"
              value={formatDate(booking.cancelledAt)}
            />
          )}
        </DetailSection>

        {cancelError && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {cancelError}
          </p>
        )}
      </div>
    </Modal>
  );
}

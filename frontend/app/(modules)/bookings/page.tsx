import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { BookingsContent } from "@/features/bookings/ui/bookings-content";

export const metadata: Metadata = createMetadata({
  title: "Bookings",
  description: "Manage real estate bookings and booking activity.",
  path: "/bookings",
  noIndex: true,
});

export default function BookingsPage() {
  return <BookingsContent />;
}

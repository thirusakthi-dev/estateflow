import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import DashboardContent from "@/features/dashboard/ui/dashboard-content";

export const metadata: Metadata = createMetadata({
  title: "Dashboard",
  description:
    "View real estate leads, projects, available units, and booking activity.",
  path: "/dashboard",
  noIndex: true,
});

export default function DashboardPage() {
  return <DashboardContent />;
}

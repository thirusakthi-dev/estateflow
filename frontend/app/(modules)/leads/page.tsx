import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { LeadsContent } from "@/features/leads/ui/leads-content";

export const metadata: Metadata = createMetadata({
  title: "Leads",
  description: "Manage real estate enquiries and lead activity.",
  path: "/leads",
  noIndex: true,
});

export const instant = false;

export default function LeadsPage() {
  return <LeadsContent />;
}

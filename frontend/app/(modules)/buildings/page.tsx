import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { BuildingsList } from "@/features/buildings/ui/buildings-list";

export const metadata: Metadata = createMetadata({
  title: "Buildings",
  description: "Manage buildings and their associated projects.",
  path: "/buildings",
  noIndex: true,
});

export default function BuildingsPage() {
  return <BuildingsList />;
}

import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import BuildingDetailPage from "@/features/buildings/ui/building-detail-page";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Building Details",
};

export default function Page() {
  return <BuildingDetailPage />;
}

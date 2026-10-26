import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import BuildingDetailPage from "@/features/buildings/ui/building-detail-page";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  return createMetadata({
    title: "Building Details",
    description: `View and manage building ${id} in EstateFlow.`,
    path: `/buildings/${id}`,
    noIndex: true,
  });
}

export default function Page() {
  return <BuildingDetailPage />;
}

import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { ProjectDetail } from "@/features/projects/ui/project-detail";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  return createMetadata({
    title: "Project Details",
    description: `View and manage real estate project ${id}.`,
    path: `/projects/${id}`,
    noIndex: true,
  });
}

export default function ProjectDetailPage() {
  return <ProjectDetail />;
}

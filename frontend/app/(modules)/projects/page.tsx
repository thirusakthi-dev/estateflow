import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { ProjectsList } from "@/features/projects/ui/projects-content";

export const metadata: Metadata = createMetadata({
  title: "Projects",
  description:
    "Manage real estate projects, buildings, and units in EstateFlow.",
  path: "/projects",
  noIndex: true,
});

export default function ProjectsPage() {
  return <ProjectsList />;
}

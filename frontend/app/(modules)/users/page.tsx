import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { EmployeesContent } from "@/features/employees/ui/employees-content";

export const metadata: Metadata = createMetadata({
  title: "Employees",
  description:
    "Manage employee profiles, information, and team details in EstateFlow.",
  path: "/employees",
  noIndex: true,
});

export default function EmployeesPage() {
  return <EmployeesContent />;
}

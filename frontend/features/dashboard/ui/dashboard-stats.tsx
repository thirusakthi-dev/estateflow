"use client";

import { Building2, CalendarCheck, FolderKanban, Users } from "lucide-react";

import { StatsCard } from "@/components/ui/stats-card";
import type { DashboardSummary } from "../lib/dashboard.types";

type Props = {
  summary: DashboardSummary;
};

export default function DashboardStats({ summary }: Props) {
  const stats = [
    {
      title: "Total Leads",
      value: summary.totalLeads,
      description: `${summary.newLeads} new leads`,
      icon: Users,
      tone: "blue" as const,
    },
    {
      title: "Active Projects",
      value: summary.totalProjects,
      description: "Projects in your portfolio",
      icon: FolderKanban,
      tone: "green" as const,
    },
    {
      title: "Buildings",
      value: summary.totalBuildings,
      description: "Registered buildings",
      icon: Building2,
      tone: "violet" as const,
    },
    {
      title: "Confirmed Bookings",
      value: summary.confirmedBookings,
      description: `${summary.bookedLeads} leads marked booked`,
      icon: CalendarCheck,
      tone: "amber" as const,
    },
  ];

  return (
    <section
      aria-label="Dashboard statistics"
      className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map((stat, index) => (
        <StatsCard key={stat.title} {...stat} index={index} />
      ))}
    </section>
  );
}

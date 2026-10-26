import type { LeadStage } from "../lib/leads.types";

export const stageLabels: Record<LeadStage, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  SITE_VISIT: "Site Visit",
  INTERESTED: "Interested",
  NEGOTIATION: "Negotiation",
  BOOKED: "Booked",
  LOST: "Lost",
};

const stageStyles: Record<LeadStage, string> = {
  NEW: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  CONTACTED:
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  SITE_VISIT:
    "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  INTERESTED:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  NEGOTIATION:
    "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  BOOKED: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  LOST: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function LeadStageBadge({ stage }: { stage: LeadStage }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${stageStyles[stage]}`}
    >
      {stageLabels[stage]}
    </span>
  );
}

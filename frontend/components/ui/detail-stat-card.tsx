import type { LucideIcon } from "lucide-react";

interface DetailStatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  colorClass?: string;
}

export function DetailStatCard({
  label,
  value,
  hint,
  icon: Icon,
  colorClass = "bg-blue-500/10 text-blue-600",
}: DetailStatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>

          <p className="mt-2 break-words text-2xl font-semibold text-foreground">
            {value}
          </p>

          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>

        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${colorClass}`}
        >
          <Icon size={21} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

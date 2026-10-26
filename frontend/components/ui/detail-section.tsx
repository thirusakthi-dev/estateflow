import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface DetailSectionProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

export function DetailSection({
  title,
  subtitle,
  icon: Icon,
  children,
  className = "",
}: DetailSectionProps) {
  return (
    <section
      className={`rounded-2xl border border-border bg-card p-5 sm:p-6 ${className}`}
    >
      <div className="mb-5 flex items-start gap-3">
        {Icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon size={20} aria-hidden="true" />
          </div>
        )}

        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>

          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

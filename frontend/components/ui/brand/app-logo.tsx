import { Workflow } from "lucide-react";

type AppLogoProps = {
  showName?: boolean;
  iconSize?: number;
  className?: string;
  iconClassName?: string;
};

export function AppLogo({
  showName = false,
  iconSize = 24,
  className = "",
  iconClassName = "",
}: AppLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#0f172a] text-white dark:bg-slate-100 dark:text-slate-900">
        <Workflow size={23} strokeWidth={2.2} aria-hidden="true" />
      </div>

      {showName && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          EstateFlow
        </span>
      )}
    </div>
  );
}

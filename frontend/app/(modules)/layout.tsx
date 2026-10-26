import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={<div className="min-h-screen animate-pulse bg-background" />}
    >
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}

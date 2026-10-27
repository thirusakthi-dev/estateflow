"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { useReducedMotion } from "motion/react";

import { AppLoader, useMinimumLoading } from "@/components/ui/app-loader";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useCurrentUser } from "@/features/auth/auth.queries";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: user, isPending, isError } = useCurrentUser();
  const showLoading = useMinimumLoading(isPending, 1000);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((previous) => !previous);
  }, []);

  // Animate page content when the route changes.
  useLayoutEffect(() => {
    const content = contentRef.current;

    if (!content || showLoading || !user) return;

    if (reduceMotion) {
      gsap.set(content, { clearProps: "all" });
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        content,
        { autoAlpha: 0, y: 8 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
          clearProps: "transform,opacity,visibility",
        },
      );
    }, content);

    return () => context.revert();
  }, [pathname, reduceMotion, showLoading, user]);

  // Redirect unauthenticated users to the login page.
  useLayoutEffect(() => {
    if (!isPending && (isError || !user)) {
      router.replace("/login");
    }
  }, [isPending, isError, user, router]);

  // Prevent background scrolling only while the mobile sidebar is open.
  useLayoutEffect(() => {
    if (!sidebarOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sidebarOpen, closeSidebar]);

  // Close the mobile sidebar after navigating to another page.
  useLayoutEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (showLoading) {
    return <AppLoader message="Loading your workspace" fullScreen />;
  }

  if (isError || !user) {
    return <AppLoader message="Redirecting to sign in" fullScreen />;
  }

  return (
    <div className="min-h-dvh overflow-x-clip bg-card text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-background focus:p-3"
      >
        Skip to main content
      </a>

      <Sidebar
        open={sidebarOpen}
        onClose={closeSidebar}
        collapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebar}
      />

      <div
        className={[
          "min-w-0",
          reduceMotion ? "" : "transition-[margin] duration-300 ease-in-out",
          sidebarCollapsed ? "md:ml-20" : "md:ml-64",
        ].join(" ")}
      >
        <Topbar
          user={user}
          onMenuClick={openSidebar}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />

        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1600px] px-4 py-4 outline-none sm:px-6 lg:px-8 lg:py-6"
        >
          <div ref={contentRef}>{children}</div>
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
} from "lucide-react";

import { AppLogo } from "@/components/ui/brand/app-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import type { AuthUser } from "@/features/auth/auth.type";
import { useLogout } from "@/features/auth/auth.queries";

type TopbarProps = {
  user: AuthUser;
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

export function Topbar({
  user,
  onMenuClick,
  sidebarCollapsed,
  onToggleSidebar,
}: TopbarProps) {
  const router = useRouter();
  const logout = useLogout();

  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleLogout = () => {
    setLogoutConfirmOpen(false);
    setProfileOpen(false);
    logout();
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-19 items-center justify-between border-b border-border bg-background/95 px-4 text-foreground backdrop-blur sm:px-6">
        {/* Left side */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile menu */}
          <button
            type="button"
            aria-label="Open navigation menu"
            title="Open navigation menu"
            onClick={onMenuClick}
            className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:hover:bg-slate-800 dark:hover:text-white md:hidden"
          >
            <Menu size={20} aria-hidden="true" />
          </button>

          {/* Desktop sidebar toggle */}
          <button
            type="button"
            aria-label={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
            title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
            aria-pressed={!sidebarCollapsed}
            onClick={onToggleSidebar}
            className="hidden shrink-0 items-center justify-center rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:hover:bg-slate-800 dark:hover:text-white md:inline-flex"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={19} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={19} aria-hidden="true" />
            )}
          </button>

          {/* Brand when sidebar is collapsed */}
          {sidebarCollapsed && (
            <div className="flex min-w-0 shrink-0 items-center gap-3">
              <AppLogo iconSize={20} iconClassName="size-9 rounded-xl" />
              <span className="truncate text-base font-semibold tracking-tight text-foreground">
                EstateFlow
              </span>
            </div>
          )}

          {/* Workspace label when sidebar is expanded */}
          {!sidebarCollapsed && (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="h-5 w-px bg-border" />
              <span className="text-sm text-muted-foreground">Workspace</span>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />

          {/* Profile dropdown: opens on hover, closes on mouse leave */}
          <div
            className="relative"
            onMouseEnter={() => setProfileOpen(true)}
            onMouseLeave={() => setProfileOpen(false)}
          >
            <button
              type="button"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              aria-label="Open profile menu"
              onFocus={() => setProfileOpen(true)}
              onClick={() => setProfileOpen((open) => !open)}
              className={[
                "flex items-center gap-2 rounded-xl p-1.5",
                "transition-colors duration-200",
                "hover:bg-slate-100 dark:hover:bg-slate-800",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                profileOpen ? "bg-slate-100 dark:bg-slate-800" : "",
              ].join(" ")}
            >
              <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="hidden min-w-0 text-left sm:block">
                <p className="max-w-36 truncate text-sm font-medium text-foreground">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.role === "ADMIN" ? "Administrator" : "Sales Employee"}
                </p>
              </div>

              <ChevronDown
                size={16}
                aria-hidden="true"
                className={[
                  "hidden text-muted-foreground transition-transform duration-200 sm:block",
                  profileOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            {profileOpen && (
              <div
                role="menu"
                aria-label="Profile options"
                className="absolute right-0 top-full z-50 w-60 rounded-xl border border-slate-200 bg-white p-1.5 text-slate-900 shadow-xl shadow-black/5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:shadow-black/30"
              >
                {/* User details */}
                <div className="border-b border-slate-200 px-3 py-3 dark:border-slate-700">
                  <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                    {user.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-400">
                    {user.email}
                  </p>
                </div>

                {/* Profile */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/profile");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-800 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <UserRound
                    size={17}
                    className="shrink-0 text-slate-500 dark:text-slate-400"
                    aria-hidden="true"
                  />
                  Profile
                </button>

                {/* Log out */}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileOpen(false);
                    setLogoutConfirmOpen(true);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
                >
                  <LogOut size={17} aria-hidden="true" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout confirmation */}
      <ConfirmationModal
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Log out?"
        description="Are you sure you want to log out of your account?"
        confirmText="Log out"
        loading={false}
        variant="danger"
      />
    </>
  );
}

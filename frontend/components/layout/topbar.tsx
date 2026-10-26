"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();
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
      <header className="sticky top-0 z-40 flex h-19 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile menu */}
          <button
            type="button"
            aria-label="Open navigation menu"
            title="Open navigation menu"
            onClick={onMenuClick}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
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
            className="hidden shrink-0 rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={19} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={19} aria-hidden="true" />
            )}
          </button>

          {/* Brand shown in the topbar only when the sidebar is hidden */}
          {sidebarCollapsed && (
            <div className="flex shrink-0 items-center gap-3">
              <AppLogo iconSize={20} iconClassName="size-9 rounded-xl" />

              {sidebarCollapsed && (
                <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
                  EstateFlow
                </span>
              )}
            </div>
          )}

          {/* Subtle workspace label when the sidebar is expanded */}
          {!sidebarCollapsed && (
            <div className="hidden sm:flex sm:items-center sm:gap-2">
              <span className="h-5 w-px bg-border" />
              <span className="text-sm text-muted-foreground">Workspace</span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />

          {/* Profile menu */}
          <div className="relative">
            <button
              type="button"
              aria-expanded={profileOpen}
              aria-label="Open profile menu"
              onClick={() => setProfileOpen((open) => !open)}
              className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-muted"
            >
              <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {user.name?.charAt(0)?.toUpperCase() ?? "U"}
              </div>

              <div className="hidden text-left sm:block">
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
                className={`hidden text-muted-foreground transition-transform duration-200 sm:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close profile menu"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setProfileOpen(false)}
                />

                <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-background p-1.5 shadow-lg">
                  <div className="border-b border-border px-3 py-3">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.name}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      router.push("/profile");
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <UserRound size={17} aria-hidden="true" />
                    Profile
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      setLogoutConfirmOpen(true);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <LogOut size={17} aria-hidden="true" />
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

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

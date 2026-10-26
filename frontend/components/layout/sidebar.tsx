"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  CalendarCheck,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { AppLogo } from "@/components/ui/brand/app-logo";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleSidebar: () => void;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const navigationItems: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Follow-ups", href: "/follow-ups", icon: CalendarCheck },
  { label: "Bookings", href: "/bookings", icon: Bell },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Buildings", href: "/buildings", icon: Building2 },
  { label: "Users", href: "/users", icon: Users },
];

const settingsItem: NavigationItem = {
  label: "Settings",
  href: "/settings",
  icon: Settings,
};

const activeLinkClasses =
  "bg-[#0f172a] text-white shadow-sm dark:bg-[#e2e8f0] dark:text-[#0f172a]";

const inactiveLinkClasses =
  "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-white/[0.07] dark:hover:text-foreground";

export function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleSidebar,
}: SidebarProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);

  const floatingExpanded = collapsed && hovered;

  const cancelCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const showFloatingSidebar = useCallback(() => {
    cancelCloseTimer();
    setHovered(true);
  }, [cancelCloseTimer]);

  const hideFloatingSidebar = useCallback(() => {
    cancelCloseTimer();

    closeTimer.current = setTimeout(() => {
      setHovered(false);
    }, 180);
  }, [cancelCloseTimer]);

  useEffect(() => {
    setMounted(true);

    return () => cancelCloseTimer();
  }, [cancelCloseTimer]);

  useEffect(() => {
    cancelCloseTimer();
    setHovered(false);
    onClose();
    // Reset the temporary preview after navigating.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    const focusTimer = setTimeout(() => {
      mobileCloseButtonRef.current?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  // Pin the floating sidebar as the full-height sidebar.
  const expandAndPinSidebar = useCallback(() => {
    cancelCloseTimer();
    setHovered(false);

    if (collapsed) {
      onToggleSidebar();
    }
  }, [cancelCloseTimer, collapsed, onToggleSidebar]);

  const closeFloatingPreview = useCallback(() => {
    cancelCloseTimer();
    setHovered(false);
  }, [cancelCloseTimer]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const renderNavigationLink = (
    item: NavigationItem,
    expanded: boolean,
    mobile = false,
  ) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={mobile ? onClose : undefined}
        title={!expanded ? item.label : undefined}
        aria-current={active ? "page" : undefined}
        className={[
          "group relative flex h-10 shrink-0 items-center gap-3 rounded-xl px-3",
          "text-sm font-medium outline-none transition-colors duration-200",
          "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          active ? activeLinkClasses : inactiveLinkClasses,
          !expanded ? "justify-center px-0" : "",
        ].join(" ")}
      >
        <Icon
          size={19}
          strokeWidth={active ? 2.2 : 1.8}
          className="shrink-0 transition-transform duration-200 group-hover:scale-110"
        />

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.span
              initial={reduceMotion ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: -6 }}
              transition={{ duration: reduceMotion ? 0 : 0.16 }}
              className="min-w-0 flex-1 truncate whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {expanded && (
          <ChevronRight
            size={15}
            className={[
              "shrink-0 transition-all duration-200",
              "opacity-0 group-hover:translate-x-0.5 group-hover:opacity-70",
              active ? "opacity-50" : "",
            ].join(" ")}
          />
        )}
      </Link>
    );
  };

  const renderSidebarContent = (
    expanded: boolean,
    mobile = false,
    floating = false,
  ) => (
    <div className="flex h-full min-h-0 flex-col">
      {/* Brand header */}
      <div
        className={[
          "flex h-19 shrink-0 items-center border-b border-border/70 px-4",
          expanded ? "justify-between" : "justify-center",
        ].join(" ")}
      >
        <Link
          href="/dashboard"
          onClick={mobile ? onClose : undefined}
          aria-label="EstateFlow dashboard"
          className="flex min-w-0 items-center gap-2 overflow-hidden rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <span className="flex size-9 shrink-0 items-center justify-center">
            <AppLogo />
          </span>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.span
                initial={reduceMotion ? false : { opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -5 }}
                transition={{ duration: reduceMotion ? 0 : 0.16 }}
                className="truncate text-sm font-semibold tracking-tight text-foreground"
              >
                EstateFlow
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {/* Only floating preview and mobile drawer have header controls. */}
        {/* {expanded && (floating || mobile) && (
          <button
            ref={mobile ? mobileCloseButtonRef : undefined}
            type="button"
            onClick={mobile ? onClose : closeFloatingPreview}
            aria-label={mobile ? "Close sidebar" : "Collapse floating preview"}
            title={mobile ? "Close sidebar" : "Collapse preview"}
            className="ml-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {mobile ? <X size={17} /> : <PanelLeftClose size={17} />}
          </button>
        )} */}
      </div>

      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2 py-3"
      >
        {navigationItems.map((item) =>
          renderNavigationLink(item, expanded, mobile),
        )}
      </nav>

      {/* Settings */}
      <div className="shrink-0 border-t border-border/70 px-2 py-3">
        {renderNavigationLink(settingsItem, expanded, mobile)}
      </div>
    </div>
  );

  return (
    <>
      {/* Hover detection area when the sidebar is collapsed */}
      {collapsed && !open && (
        <div
          aria-hidden="true"
          onMouseEnter={showFloatingSidebar}
          className="fixed inset-y-0 left-0 z-40 hidden w-3 lg:block"
        />
      )}

      {/* Full-height desktop sidebar: intentionally no toggle button */}
      {!collapsed && (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-background lg:block">
          {renderSidebarContent(true)}
        </aside>
      )}

      {/* Floating desktop sidebar */}
      <AnimatePresence>
        {collapsed && hovered && !open && (
          <motion.aside
            initial={reduceMotion ? false : { opacity: 0, x: -10, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -8, scale: 0.98 }}
            transition={{
              duration: reduceMotion ? 0 : 0.18,
              ease: "easeOut",
            }}
            onMouseEnter={showFloatingSidebar}
            onMouseLeave={hideFloatingSidebar}
            className={[
              "fixed left-3 top-1/2 z-50 hidden -translate-y-1/2",
              "h-[min(65vh,560px)] min-h-[300px]",
              "max-h-[calc(100dvh-32px)] overflow-visible",
              "rounded-2xl border border-border/80",
              "bg-background/95 shadow-xl shadow-black/[0.10]",
              "backdrop-blur-xl lg:block",
            ].join(" ")}
            style={{
              width: floatingExpanded ? 240 : 68,
              transition: reduceMotion ? "none" : "width 180ms ease",
            }}
          >
            {/* Always visible: stays clickable while the panel is hovered. */}
            <button
              type="button"
              onClick={expandAndPinSidebar}
              aria-label="Expand to full-height sidebar"
              title="Expand sidebar"
              className="absolute -right-2 -top-2 z-30 flex size-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <PanelLeftOpen size={15} />
            </button>

            {renderSidebarContent(floatingExpanded, false, true)}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      {mounted && (
        <AnimatePresence>
          {open && (
            <>
              <motion.button
                type="button"
                aria-label="Close navigation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-[2px] lg:hidden"
              />

              <motion.aside
                initial={reduceMotion ? false : { x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{
                  duration: reduceMotion ? 0 : 0.22,
                  ease: "easeOut",
                }}
                className="fixed inset-y-0 left-0 z-[80] w-[280px] max-w-[85vw] border-r border-border bg-background shadow-2xl lg:hidden"
              >
                {renderSidebarContent(true, true)}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      )}
    </>
  );
}

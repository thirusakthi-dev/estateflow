"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { AppLogo } from "../ui/brand/app-logo";

type AppLoaderProps = {
  message?: string;
  fullScreen?: boolean;
};

export function useMinimumLoading(isLoading: boolean, minimumDuration = 1000) {
  const [showLoading, setShowLoading] = useState(isLoading);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    if (isLoading) {
      startedAt.current = Date.now();
      setShowLoading(true);
    } else if (showLoading) {
      const elapsed = startedAt.current
        ? Date.now() - startedAt.current
        : minimumDuration;

      const remaining = Math.max(0, minimumDuration - elapsed);

      timeout = setTimeout(() => {
        setShowLoading(false);
        startedAt.current = null;
      }, remaining);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading, minimumDuration, showLoading]);

  return showLoading;
}

export function AppLoader({
  message = "Loading your workspace",
  fullScreen = false,
}: AppLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const logo = logoRef.current;
    const ring = ringRef.current;

    if (!container || !logo || !ring) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        container,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" },
      );

      gsap.to(logo, {
        scale: 1.06,
        duration: 0.85,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(ring, {
        rotation: 360,
        duration: 2.4,
        repeat: -1,
        ease: "none",
      });
    }, container);

    return () => context.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      role="status"
      aria-live="polite"
      className={[
        "flex flex-col items-center justify-center gap-5",
        fullScreen ? "min-h-screen bg-background" : "min-h-64 w-full",
      ].join(" ")}
    >
      <div className="relative flex size-20 items-center justify-center">
        <div
          ref={ringRef}
          aria-hidden="true"
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/30"
        />

        <div
          aria-hidden="true"
          className="absolute inset-2 rounded-full border border-border"
        />

        <div ref={logoRef} className="relative z-10">
          <AppLogo iconSize={28} />
        </div>
      </div>

      <div className="space-y-3 text-center">
        <p className="text-sm font-medium text-foreground">{message}</p>

        <div
          aria-hidden="true"
          className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-muted"
        >
          <div className="h-full w-1/3 animate-loader-progress rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

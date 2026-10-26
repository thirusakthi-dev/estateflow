"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

export function AnimatedBackground() {
  const reduceMotion = useReducedMotion();

  const x = useMotionValue(-1000);
  const y = useMotionValue(-1000);

  const mouseX = useSpring(x, { stiffness: 120, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 120, damping: 30 });

  const spotlight = useMotionTemplate`
    radial-gradient(
      180px circle at ${mouseX}px ${mouseY}px,
      color-mix(in srgb, var(--primary) 20%, transparent),
      transparent 100%
    )
  `;

  useEffect(() => {
    if (reduceMotion) return;

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      x.set(event.clientX);
      y.set(event.clientY);
    };

    window.addEventListener("pointermove", handleMove, {
      passive: true,
    });

    return () => window.removeEventListener("pointermove", handleMove);
  }, [x, y, reduceMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-background"
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          opacity: 0.22,
          maskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 20%, transparent 90%)",
        }}
      />

      {/* Mouse-reactive grid glow */}
      {!reduceMotion && (
        <>
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, color-mix(in srgb, var(--primary) 35%, transparent) 1px, transparent 1px),
                linear-gradient(to bottom, color-mix(in srgb, var(--primary) 35%, transparent) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
              maskImage: spotlight,
              WebkitMaskImage: spotlight,
            }}
          />

          {/* Soft light behind the highlighted grid */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: useMotionTemplate`
                radial-gradient(
                  220px circle at ${mouseX}px ${mouseY}px,
                  color-mix(in srgb, var(--primary) 8%, transparent),
                  transparent 100%
                )
              `,
            }}
          />
        </>
      )}
    </div>
  );
}

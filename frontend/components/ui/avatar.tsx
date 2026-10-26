"use client";

import { useState } from "react";
import Image from "next/image";
import { UserRound } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
type AvatarStatus = "online" | "offline" | "busy" | "away";

type AvatarProps = {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  showStatus?: boolean;
  className?: string;
};

const sizes: Record<AvatarSize, string> = {
  xs: "size-7",
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
  xl: "size-16",
};

const iconSizes: Record<AvatarSize, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 30,
};

const statusStyles: Record<AvatarStatus, string> = {
  online: "bg-green-500",
  offline: "bg-slate-400",
  busy: "bg-red-500",
  away: "bg-amber-500",
};

export function Avatar({
  src,
  name,
  size = "md",
  status = "offline",
  showStatus = false,
  className = "",
}: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const reduceMotion = useReducedMotion();

  const showImage = Boolean(src) && !imageFailed;

  return (
    <motion.span
      initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.16 }}
      className={["relative inline-flex shrink-0", sizes[size], className].join(
        " ",
      )}
    >
      <span
        className={[
          "relative flex size-full items-center justify-center",
          "overflow-hidden rounded-full border border-border",
          "bg-surface text-muted",
        ].join(" ")}
      >
        {showImage ? (
          <Image
            src={src!}
            alt={`${name}'s profile`}
            fill
            sizes={
              {
                xs: "28px",
                sm: "32px",
                md: "40px",
                lg: "48px",
                xl: "64px",
              }[size]
            }
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <UserRound
            size={iconSizes[size]}
            strokeWidth={1.7}
            aria-label={`${name}'s profile`}
            role="img"
          />
        )}
      </span>

      {showStatus && (
        <span
          role="img"
          aria-label={`Status: ${status}`}
          title={status}
          className={[
            "absolute bottom-0 right-0 rounded-full",
            "size-3 border-2 border-background",
            statusStyles[status],
            size === "xs" ? "size-2" : "",
            size === "xl" ? "size-4" : "",
          ].join(" ")}
        />
      )}
    </motion.span>
  );
}

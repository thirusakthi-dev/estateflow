"use client";

import {
  Building2,
  MapPin,
  Layers3,
  IndianRupee,
  Image as ImageIcon,
  ArrowUpRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";

type BuildingCardData = {
  id: string;
  name: string;
  description?: string | null;
  totalFloors?: number | null;
  minPrice?: number | string | null;
  maxPrice?: number | string | null;
  project?: {
    name: string;
    city?: string | null;
  } | null;
  images?: Array<{
    id: string;
    imageUrl: string;
    alt?: string | null;
    isCover: boolean;
    sortOrder?: number;
  }>;
};

type BuildingCardProps<T extends BuildingCardData> = {
  building: T;
  onClick?: (building: T) => void;
  onEdit?: (building: T) => void;
  onDelete?: (building: T) => void;
};

function formatPrice(price?: number | string | null) {
  if (price == null || price === "") return null;

  const value = Number(price);
  if (!Number.isFinite(value)) return null;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getPriceLabel(
  minPrice?: number | string | null,
  maxPrice?: number | string | null,
) {
  const min = formatPrice(minPrice);
  const max = formatPrice(maxPrice);

  if (min && max) return min === max ? min : `${min} – ${max}`;
  if (min) return `From ${min}`;
  if (max) return `Up to ${max}`;

  return "Price on request";
}

export default function BuildingCard<T extends BuildingCardData>({
  building,
  onClick,
  onEdit,
  onDelete,
}: BuildingCardProps<T>) {
  const [imageFailed, setImageFailed] = useState(false);

  const images = [...(building.images ?? [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );

  const coverImage =
    images.find((image) => image.isCover && image.imageUrl?.trim()) ??
    images.find((image) => image.imageUrl?.trim());

  const showImage = Boolean(coverImage?.imageUrl) && !imageFailed;

  const city = building.project?.city?.trim() || "Location unavailable";
  const projectName = building.project?.name?.trim() || "Project not assigned";

  return (
    <article className="group flex h-full min-h-[440px] flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
      {/* Building image: fixed height */}
      <div className="relative h-48 shrink-0 overflow-hidden bg-surface">
        {showImage ? (
          <img
            src={coverImage!.imageUrl}
            alt={coverImage?.alt?.trim() || building.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-sky-500/10">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
              <Building2 size={34} strokeWidth={1.6} />
            </div>

            <span className="text-xs text-muted-foreground">
              No image available
            </span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
          <span className="truncate rounded-lg border border-white/20  px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            {projectName}
          </span>

          {images.length > 0 && (
            <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-black/35 px-2.5 py-1.5 text-xs text-white backdrop-blur-md">
              <ImageIcon size={13} />
              {images.length}
            </span>
          )}
        </div>

        {/* Edit and delete actions */}
        {(onEdit || onDelete) && (
          <div className="absolute right-3 top-3 flex gap-2">
            {onEdit && (
              <button
                type="button"
                aria-label={`Edit ${building.name}`}
                onClick={() => onEdit(building)}
                className="flex size-9 items-center justify-center rounded-xl bg-white/95 text-indigo-600 shadow-sm transition-colors hover:bg-indigo-600 hover:text-white"
              >
                <Pencil size={15} />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                aria-label={`Delete ${building.name}`}
                onClick={() => onDelete(building)}
                className="flex size-9 items-center justify-center rounded-xl bg-white/95 text-rose-600 shadow-sm transition-colors hover:bg-rose-600 hover:text-white"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Details fill remaining height */}
      <div className="flex flex-1 flex-col p-5">
        <h3
          className="line-clamp-1 min-h-7 text-lg font-semibold text-foreground"
          title={building.name}
        >
          {building.name || "Unnamed building"}
        </h3>

        <div className="mt-2 flex min-h-5 items-center gap-2 text-sm text-muted-foreground">
          <MapPin size={16} className="shrink-0 text-emerald-500" />
          <span className="truncate">{city}</span>
        </div>

        {/* Price range */}
        <div className="mt-4 flex min-h-[76px] items-center justify-between gap-3 rounded-xl border border-border bg-surface/60 p-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <IndianRupee size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Price range</p>
              <p
                className="truncate text-sm font-semibold text-foreground"
                title={getPriceLabel(building.minPrice, building.maxPrice)}
              >
                {getPriceLabel(building.minPrice, building.maxPrice)}
              </p>
            </div>
          </div>

          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400"
            title={
              building.totalFloors != null
                ? `${building.totalFloors} floors`
                : "Floor count unavailable"
            }
          >
            <Layers3 size={20} />
          </div>
        </div>

        {/* Fixed-height floor information area */}
        <div className="mt-3 min-h-6 text-sm text-muted-foreground">
          {building.totalFloors != null && (
            <p>
              <span className="font-medium text-foreground">
                {building.totalFloors}
              </span>{" "}
              {building.totalFloors === 1 ? "floor" : "floors"}
            </p>
          )}
        </div>

        {/* Button stays at the bottom */}
        {onClick && (
          <button
            type="button"
            onClick={() => onClick(building)}
            className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            View details
            <ArrowUpRight size={16} />
          </button>
        )}
      </div>
    </article>
  );
}

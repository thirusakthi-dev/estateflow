"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  Maximize2,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { ProjectImage } from "../lib/projects.types";

type ProjectGalleryProps = {
  images: ProjectImage[];
  onAdd?: () => void;
  onEdit?: (image: ProjectImage) => void;
  onDelete?: (image: ProjectImage) => void;
};

function GalleryImage({
  image,
  className,
}: {
  image: ProjectImage;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !image.imageUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className ?? ""}`}
      >
        <ImageIcon size={30} strokeWidth={1.4} />
      </div>
    );
  }

  return (
    <img
      src={image.imageUrl}
      alt={image.alt || "Project image"}
      onError={() => setFailed(true)}
      className={`object-cover ${className ?? ""}`}
    />
  );
}

export function ProjectGallery({
  images,
  onAdd,
  onEdit,
  onDelete,
}: ProjectGalleryProps) {
  const [preview, setPreview] = useState<ProjectImage | null>(null);

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-border bg-background">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5 sm:p-6">
          <div>
            <h2 className="font-semibold">Project gallery</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {images.length} uploaded{" "}
              {images.length === 1 ? "image" : "images"}
            </p>
          </div>

          {onAdd && (
            <Button leftIcon={Plus} onClick={onAdd} size="sm">
              Add images
            </Button>
          )}
        </div>

        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-surface text-muted-foreground">
              <ImageIcon size={23} />
            </div>
            <p className="mt-3 font-medium">No images yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload project images to showcase this property.
            </p>
            {onAdd && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                leftIcon={Plus}
                onClick={onAdd}
              >
                Upload images
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:p-5 lg:grid-cols-4">
            {images.map((image) => (
              <article
                key={image.id}
                className="group overflow-hidden rounded-xl border border-border bg-background"
              >
                <button
                  type="button"
                  onClick={() => setPreview(image)}
                  aria-label={`Preview ${image.alt || "project image"}`}
                  className="relative block aspect-[4/3] w-full overflow-hidden bg-slate-100"
                >
                  <GalleryImage
                    image={image}
                    className="size-full transition-transform duration-300 group-hover:scale-105"
                  />

                  {image.isCover && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-slate-950/75 px-2 py-1 text-xs font-medium text-white">
                      <Star size={12} />
                      Cover
                    </span>
                  )}

                  <span className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-lg bg-slate-950/70 text-white opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                    <Maximize2 size={15} />
                  </span>
                </button>

                <div className="flex items-center justify-between gap-2 p-3">
                  <p className="truncate text-xs text-muted-foreground">
                    {image.alt || "Project image"}
                  </p>

                  <div className="flex shrink-0 items-center gap-1">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(image)}
                        aria-label="Edit image"
                        className="rounded-md p-2 text-muted-foreground transition hover:bg-surface hover:text-foreground"
                      >
                        <Star size={15} />
                      </button>
                    )}

                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(image)}
                        aria-label="Delete image"
                        className="rounded-md p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={preview?.alt || "Image preview"}
        maxWidth="max-w-5xl"
      >
        {preview && (
          <div className="space-y-3">
            <div className="flex max-h-[65dvh] min-h-40 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
              <GalleryImage
                image={preview}
                className="max-h-[65dvh] max-w-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              {preview.isCover ? (
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <Star size={14} />
                  Cover image
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Project image
                </span>
              )}

              <Button
                variant="outline"
                size="sm"
                leftIcon={X}
                onClick={() => setPreview(null)}
              >
                Close preview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, ImageIcon, X } from "lucide-react";

export interface DetailGalleryImage {
  id: string;
  imageUrl: string;
  alt?: string | null;
  isCover?: boolean;
  sortOrder?: number;
}

interface ImageGalleryProps {
  images?: DetailGalleryImage[];
  title?: string;
}

export function ImageGallery({
  images = [],
  title = "Images",
}: ImageGalleryProps) {
  const sortedImages = [...images].sort(
    (a, b) =>
      Number(Boolean(b.isCover)) - Number(Boolean(a.isCover)) ||
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const currentImage = sortedImages[activeIndex];

  const previous = useCallback(() => {
    setActiveIndex((index) =>
      index <= 0 ? sortedImages.length - 1 : index - 1,
    );
  }, [sortedImages.length]);

  const next = useCallback(() => {
    setActiveIndex((index) =>
      index >= sortedImages.length - 1 ? 0 : index + 1,
    );
  }, [sortedImages.length]);

  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  useEffect(() => {
    if (!fullscreen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setFullscreen(false);
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [fullscreen, previous, next]);

  if (!currentImage) {
    return (
      <div className="flex min-h-[200px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center sm:min-h-[260px]">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ImageIcon size={28} strokeWidth={1.6} aria-hidden="true" />
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">
            No images available
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Images for {title} will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full space-y-3">
        {/* Main image */}
        <div className="group relative overflow-hidden rounded-2xl bg-muted">
          <AnimatePresence mode="wait">
            <motion.button
              key={currentImage.id}
              type="button"
              initial={{ opacity: 0.6, scale: 1.01 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.6 }}
              transition={{ duration: 0.2 }}
              onClick={() => setFullscreen(true)}
              className="relative block h-[200px] w-full cursor-zoom-in overflow-hidden sm:h-[260px] lg:h-[320px] xl:h-[360px]"
              aria-label={`View ${currentImage.alt || title} fullscreen`}
            >
              <Image
                src={currentImage.imageUrl}
                alt={currentImage.alt || title}
                fill
                priority={activeIndex === 0}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1024px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </motion.button>
          </AnimatePresence>

          {/* Image navigation */}
          {sortedImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={previous}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white shadow-lg transition hover:scale-105 hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:size-10"
              >
                <ChevronLeft size={22} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={next}
                aria-label="Next image"
                className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white shadow-lg transition hover:scale-105 hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:size-10"
              >
                <ChevronRight size={22} aria-hidden="true" />
              </button>

              <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {activeIndex + 1} / {sortedImages.length}
              </span>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {sortedImages.length > 1 && (
          <div className="flex gap-2.5 overflow-x-auto pb-1">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`View image ${index + 1}`}
                aria-pressed={activeIndex === index}
                className={`relative size-[68px] shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 sm:size-20 ${
                  activeIndex === index
                    ? "border-primary ring-2 ring-primary/15"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={image.imageUrl}
                  alt={image.alt || `${title} ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen image viewer */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            key="gallery-fullscreen"
            role="dialog"
            aria-modal="true"
            aria-label={`${title} image viewer`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-3 sm:p-6"
            onClick={() => setFullscreen(false)}
          >
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              aria-label="Close image viewer"
              className="absolute right-4 top-4 z-20 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6 sm:top-6 sm:size-11"
            >
              <X size={24} aria-hidden="true" />
            </button>

            {sortedImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    previous();
                  }}
                  aria-label="Previous image"
                  className="absolute left-2 z-20 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-5 sm:size-12"
                >
                  <ChevronLeft size={26} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    next();
                  }}
                  aria-label="Next image"
                  className="absolute right-2 z-20 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-5 sm:size-12"
                >
                  <ChevronRight size={26} aria-hidden="true" />
                </button>
              </>
            )}

            <motion.div
              key={currentImage.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="relative h-[75vh] w-full max-w-6xl sm:h-[85vh]"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={currentImage.imageUrl}
                alt={currentImage.alt || title}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </motion.div>

            {sortedImages.length > 1 && (
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                {activeIndex + 1} / {sortedImages.length}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

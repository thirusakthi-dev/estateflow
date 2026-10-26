"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

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

  function previous() {
    setActiveIndex((index) =>
      index === 0 ? sortedImages.length - 1 : index - 1,
    );
  }

  function next() {
    setActiveIndex((index) =>
      index === sortedImages.length - 1 ? 0 : index + 1,
    );
  }

  useEffect(() => {
    if (!fullscreen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setFullscreen(false);
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fullscreen, sortedImages.length]);

  if (!currentImage) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
        No images available
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="group relative overflow-hidden rounded-2xl bg-muted">
          <AnimatePresence mode="wait">
            <motion.button
              key={currentImage.id}
              type="button"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.5 }}
              transition={{ duration: 0.2 }}
              onClick={() => setFullscreen(true)}
              className="relative block h-[280px] w-full cursor-zoom-in sm:h-[380px] lg:h-[480px] xl:h-[560px]"
              aria-label={`View ${currentImage.alt || title} fullscreen`}
            >
              <Image
                src={currentImage.imageUrl}
                alt={currentImage.alt || title}
                fill
                priority={activeIndex === 0}
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-cover"
              />
            </motion.button>
          </AnimatePresence>

          {sortedImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={previous}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
              >
                <ChevronLeft size={22} />
              </button>

              <button
                type="button"
                onClick={next}
                aria-label="Next image"
                className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
              >
                <ChevronRight size={22} />
              </button>

              <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                {activeIndex + 1} / {sortedImages.length}
              </span>
            </>
          )}
        </div>

        {sortedImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`View image ${index + 1}`}
                aria-pressed={activeIndex === index}
                className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition sm:size-24 ${
                  activeIndex === index
                    ? "border-primary"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={image.imageUrl}
                  alt={image.alt || `${title} ${index + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {fullscreen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} image viewer`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setFullscreen(false)}
        >
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            aria-label="Close image viewer"
            className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X size={24} />
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
                className="absolute left-3 z-10 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft size={26} />
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  next();
                }}
                aria-label="Next image"
                className="absolute right-3 z-10 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight size={26} />
              </button>
            </>
          )}

          <div
            className="relative h-[85vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={currentImage.imageUrl}
              alt={currentImage.alt || title}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      )}
    </>
  );
}

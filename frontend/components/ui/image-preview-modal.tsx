"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type PreviewImage = {
  imageUrl: string;
  alt?: string | null;
};

type ImagePreviewModalProps = {
  images: PreviewImage[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
};

export function ImagePreviewModal({
  images,
  initialIndex = 0,
  open,
  onClose,
}: ImagePreviewModalProps) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setActiveIndex(initialIndex);
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();

      if (event.key === "ArrowRight") {
        setActiveIndex((index) => (index + 1) % images.length);
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((index) => (index - 1 + images.length) % images.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, images.length, onClose]);

  if (!open || images.length === 0) return null;

  const activeImage = images[activeIndex];

  const previousImage = () => {
    setActiveIndex((index) => (index - 1 + images.length) % images.length);
  };

  const nextImage = () => {
    setActiveIndex((index) => (index + 1) % images.length);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close image preview"
        className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <X size={22} />
      </button>

      <div
        className="relative flex max-h-[90vh] w-full max-w-6xl flex-col items-center gap-4"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="relative flex h-[65vh] w-full items-center justify-center sm:h-[75vh]">
          <Image
            key={activeImage.imageUrl}
            src={activeImage.imageUrl}
            alt={activeImage.alt || "Image preview"}
            fill
            priority
            sizes="100vw"
            className="object-contain"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={previousImage}
                aria-label="Previous image"
                className="absolute left-2 flex size-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 sm:left-4"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                type="button"
                onClick={nextImage}
                aria-label="Next image"
                className="absolute right-2 flex size-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 sm:right-4"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        <div className="text-center text-sm text-white">
          {activeImage.alt && (
            <p className="mb-1 text-white/80">{activeImage.alt}</p>
          )}
          <p>
            {activeIndex + 1} / {images.length}
          </p>
        </div>

        {images.length > 1 && (
          <div className="flex max-w-full gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={`${image.imageUrl}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition sm:size-20 ${
                  index === activeIndex
                    ? "border-white"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={image.imageUrl}
                  alt={image.alt || `Thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

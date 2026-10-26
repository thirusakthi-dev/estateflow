"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { ImagePlus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export type ExistingUploadImage = {
  id: string;
  url: string;
  name?: string;
};

type ImageUploadProps = {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  label?: string;
  existingImages?: ExistingUploadImage[];
  onRemoveExisting?: (id: string) => void;
};

type PreviewImage = {
  id: string;
  url: string;
  name: string;
  size?: number;
  source: "existing" | "new";
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ImageUpload({
  files,
  onChange,
  maxFiles = 10,
  label = "Images",
  existingImages = [],
  onRemoveExisting,
}: ImageUploadProps) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [filePreviews, setFilePreviews] = useState<
    { file: File; url: string; id: string }[]
  >([]);

  // Create and clean up object URLs when selected files change.
  useEffect(() => {
    const previews = files.map((file, index) => ({
      file,
      url: URL.createObjectURL(file),
      id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
    }));

    setFilePreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [files]);

  const images = useMemo<PreviewImage[]>(
    () => [
      ...existingImages.map((image) => ({
        id: `existing-${image.id}`,
        url: image.url,
        name: image.name ?? "Building image",
        source: "existing" as const,
      })),
      ...filePreviews.map((preview) => ({
        id: preview.id,
        url: preview.url,
        name: preview.file.name,
        size: preview.file.size,
        source: "new" as const,
      })),
    ],
    [existingImages, filePreviews],
  );

  const closePreview = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const showPrevious = useCallback(() => {
    setActiveIndex((index) =>
      index === null || images.length <= 1
        ? index
        : (index - 1 + images.length) % images.length,
    );
  }, [images.length]);

  const showNext = useCallback(() => {
    setActiveIndex((index) =>
      index === null || images.length <= 1
        ? index
        : (index + 1) % images.length,
    );
  }, [images.length]);

  useEffect(() => {
    if (activeIndex !== null && activeIndex >= images.length) {
      setActiveIndex(images.length > 0 ? images.length - 1 : null);
    }
  }, [activeIndex, images.length]);

  useEffect(() => {
    if (activeIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closePreview();

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, closePreview, showPrevious, showNext]);

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!selected.length) return;

    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of selected) {
      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        errors.push(`${file.name}: use JPEG, PNG, or WebP.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: exceeds the 10 MB limit.`);
        continue;
      }

      validFiles.push(file);
    }

    const remaining = Math.max(
      0,
      maxFiles - existingImages.length - files.length,
    );
    const acceptedFiles = validFiles.slice(0, remaining);

    if (validFiles.length > remaining) {
      errors.push(
        remaining === 0
          ? `You can upload a maximum of ${maxFiles} images.`
          : `Only ${remaining} more image(s) can be added.`,
      );
    }

    if (acceptedFiles.length) {
      onChange([...files, ...acceptedFiles]);
    }

    if (errors.length) {
      toast.warning({
        title: "Some images were not added",
        description:
          errors.length === 1
            ? errors[0]
            : `${errors.length} files could not be added. Check the file types, sizes, and upload limit.`,
      });
    } else if (acceptedFiles.length) {
      toast.success({
        title: "Images added",
        description: `${acceptedFiles.length} image(s) added successfully.`,
      });
    }
  }

  function removeImage(index: number) {
    const image = images[index];

    if (!image) return;

    if (image.source === "existing") {
      const existing = existingImages.find(
        (item) => `existing-${item.id}` === image.id,
      );

      if (existing) onRemoveExisting?.(existing.id);
    } else {
      const newFileIndex = filePreviews.findIndex(
        (preview) => preview.id === image.id,
      );

      if (newFileIndex !== -1) {
        const removedFile = files[newFileIndex];

        onChange(files.filter((_, fileIndex) => fileIndex !== newFileIndex));

        toast.info({
          title: "Image removed",
          description: removedFile?.name ?? "Image removed",
        });
      }
    }

    setActiveIndex((current) => {
      if (current === null) return null;
      if (current === index)
        return images.length > 1 ? Math.max(0, index - 1) : null;
      if (index < current) return current - 1;
      return current;
    });
  }

  const totalImages = existingImages.length + files.length;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <label className="text-sm font-medium text-foreground">{label}</label>
          <p className="mt-1 text-xs text-muted-foreground">
            JPEG, PNG or WebP · Maximum 10 MB per image
          </p>
        </div>

        <span className="shrink-0 text-xs text-muted-foreground">
          {totalImages}/{maxFiles}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group relative min-w-0 overflow-hidden rounded-lg border border-border bg-muted"
          >
            <button
              type="button"
              className="block aspect-[4/3] w-full cursor-zoom-in"
              onClick={() => setActiveIndex(index)}
              aria-label={`Preview image ${index + 1}: ${image.name}`}
            >
              <img
                src={image.url}
                alt={image.name}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </button>

            {index === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded bg-black/75 px-2 py-1 text-[10px] font-medium text-white">
                Cover
              </span>
            )}

            <button
              type="button"
              onClick={() => removeImage(index)}
              aria-label={`Remove ${image.name}`}
              className="absolute right-1.5 top-1.5 z-10 rounded-full bg-black/75 p-1.5 text-white shadow transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X size={14} />
            </button>

            <div className="space-y-0.5 border-t border-border bg-background px-2 py-1.5">
              <p
                className="truncate text-xs font-medium text-foreground"
                title={image.name}
              >
                {image.name}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {image.source === "existing"
                  ? "Saved image"
                  : formatFileSize(image.size ?? 0)}
              </p>
            </div>
          </div>
        ))}

        {totalImages < maxFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground transition hover:border-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ImagePlus size={22} />
            <span className="text-xs font-medium">Add images</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {activeIndex !== null && images[activeIndex] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePreview();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <button
            type="button"
            onClick={closePreview}
            aria-label="Close preview"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20"
          >
            <X size={22} />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Previous image"
              className="absolute left-3 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          <div className="flex max-h-[85vh] max-w-[85vw] flex-col items-center gap-3">
            <img
              key={images[activeIndex].id}
              src={images[activeIndex].url}
              alt={images[activeIndex].name}
              className="max-h-[78vh] max-w-full rounded-lg object-contain"
            />
            <p className="text-sm text-white/80">
              {images[activeIndex].name}
              {images[activeIndex].size !== undefined
                ? ` · ${formatFileSize(images[activeIndex].size)}`
                : ""}
            </p>
            <p className="text-xs text-white/60">
              {activeIndex + 1} / {images.length}
            </p>
          </div>

          {images.length > 1 && (
            <button
              type="button"
              onClick={showNext}
              aria-label="Next image"
              className="absolute right-3 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 sm:right-6"
            >
              <ChevronRight size={28} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

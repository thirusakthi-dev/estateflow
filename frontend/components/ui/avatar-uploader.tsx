"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Trash2, Upload, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

type AvatarUploaderProps = {
  name: string;
  avatarUrl?: string | null;
  onUrlChange: (url: string) => void;
  onFileSelect?: (file: File | null) => void;
  disabled?: boolean;
};

export function AvatarUploader({
  name,
  avatarUrl,
  onUrlChange,
  onFileSelect,
  disabled = false,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    setPreview(avatarUrl ?? "");
  }, [avatarUrl]);

  function handleFile(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    if (file.size > 5 * 1024 * 1024) {
      window.alert("Please choose an image smaller than 5 MB.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview((previous) => {
      if (previous.startsWith("blob:")) URL.revokeObjectURL(previous);
      return objectUrl;
    });
    setFileName(file.name);
    onFileSelect?.(file);
  }

  function handleRemove() {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview("");
    setFileName("");
    onUrlChange("");
    onFileSelect?.(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted">
        {preview ? (
          <img
            src={preview}
            alt={`${name || "Profile"} avatar preview`}
            className="size-full object-cover"
          />
        ) : initials ? (
          <span className="text-3xl font-semibold text-muted-foreground">
            {initials}
          </span>
        ) : (
          <UserRound className="size-10 text-muted-foreground" />
        )}

        <span className="absolute bottom-1.5 right-1.5 rounded-lg border border-border bg-background p-1.5">
          <Camera className="size-3.5" />
        </span>
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div>
          <p className="font-medium">Profile photo</p>
          <p className="mt-1 text-sm text-muted-foreground">
            JPG, PNG, WebP or GIF. Maximum file size: 5 MB.
          </p>
          {fileName && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              Selected: {fileName}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={disabled}
            onChange={(event) => handleFile(event.target.files?.[0])}
          />

          <Button
            type="button"
            variant="outline"
            leftIcon={Upload}
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            Upload photo
          </Button>

          {preview && (
            <Button
              type="button"
              variant="ghost"
              leftIcon={Trash2}
              disabled={disabled}
              onClick={handleRemove}
            >
              Remove
            </Button>
          )}
        </div>

        {!preview && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ImagePlus className="size-4" />
            <span>No photo selected. Your initials will be displayed.</span>
          </div>
        )}
      </div>
    </div>
  );
}

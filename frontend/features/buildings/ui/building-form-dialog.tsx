"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Image from "next/image";
import {
  Building2,
  ImagePlus,
  LoaderCircle,
  Mail,
  Phone,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

import {
  useCreateBuilding,
  useUpdateBuilding,
} from "@/features/buildings/lib/buildings.queries";

import type {
  Building,
  CreateBuildingInput,
  UpdateBuildingInput,
} from "@/features/buildings/lib/buildings.types";

type BuildingFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  building?: Building | null;
  projectId?: string;
};

type FormValues = {
  projectId: string;
  name: string;
  description: string;
  totalFloors: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
};

type ExistingImage = {
  id: string;
  imageUrl: string;
  alt?: string | null;
  isCover?: boolean;
};

const emptyForm: FormValues = {
  projectId: "",
  name: "",
  description: "",
  totalFloors: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
};

export function BuildingFormDialog({
  open,
  onOpenChange,
  building,
  projectId,
}: BuildingFormDialogProps) {
  const isEditing = Boolean(building);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createBuilding = useCreateBuilding();
  const updateBuilding = useUpdateBuilding();
  const { success, error } = useToast();

  const [values, setValues] = useState<FormValues>(emptyForm);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [formError, setFormError] = useState("");

  const isPending = createBuilding.isPending || updateBuilding.isPending;

  useEffect(() => {
    if (!open) return;

    setValues({
      projectId: building?.projectId ?? projectId ?? "",
      name: building?.name ?? "",
      description: building?.description ?? "",
      totalFloors:
        building?.totalFloors != null ? String(building.totalFloors) : "",
      contactName: building?.contactName ?? "",
      contactPhone: building?.contactPhone ?? "",
      contactEmail: building?.contactEmail ?? "",
    });

    setExistingImages(
      (building?.images ?? []).map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        alt: image.alt,
        isCover: image.isCover,
      })),
    );

    setNewImages([]);
    setRemovedImageIds([]);
    setFormError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [open, building, projectId]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isPending, onOpenChange]);

  const updateField = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFormError("");
  };

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    const remainingSlots = Math.max(
      0,
      10 - existingImages.length - newImages.length,
    );

    if (selectedFiles.length > remainingSlots) {
      setFormError(
        `You can upload a maximum of 10 images. You can add ${remainingSlots} more.`,
      );
    }

    const acceptedFiles = selectedFiles
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, remainingSlots);

    setNewImages((current) => [...current, ...acceptedFiles]);

    // Allow selecting the same file again after removing it.
    event.target.value = "";
  };

  const removeExistingImage = (imageId: string) => {
    setExistingImages((current) =>
      current.filter((image) => image.id !== imageId),
    );

    setRemovedImageIds((current) =>
      current.includes(imageId) ? current : [...current, imageId],
    );
  };

  const removeNewImage = (indexToRemove: number) => {
    setNewImages((current) =>
      current.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!values.name.trim()) {
      setFormError("Building name is required.");
      return;
    }

    if (values.name.trim().length < 2) {
      setFormError("Building name must contain at least 2 characters.");
      return;
    }

    if (!isEditing && !values.projectId.trim()) {
      setFormError("Project is required.");
      return;
    }

    const totalFloors =
      values.totalFloors.trim() === "" ? undefined : Number(values.totalFloors);

    if (
      totalFloors !== undefined &&
      (!Number.isInteger(totalFloors) || totalFloors <= 0)
    ) {
      setFormError("Total floors must be a positive whole number.");
      return;
    }

    const contactEmail = values.contactEmail.trim();

    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      setFormError("Enter a valid contact email.");
      return;
    }

    const commonFields = {
      name: values.name.trim(),
      description: values.description.trim(),
      totalFloors,
      contactName: values.contactName.trim(),
      contactPhone: values.contactPhone.trim(),
      contactEmail,
    };

    if (building) {
      const input: UpdateBuildingInput = commonFields;

      updateBuilding.mutate(
        {
          id: building.id,
          input,
          images: newImages,
          removedImageIds,
        },
        {
          onSuccess: () => {
            success({
              title: "Building updated",
              description: "Your building details have been saved.",
            });

            onOpenChange(false);
          },
          onError: (mutationError: Error) => {
            const message =
              mutationError instanceof Error
                ? mutationError.message
                : "Please try again.";

            error({
              title: "Update failed",
              description: message,
            });
          },
        },
      );

      return;
    }

    const input: CreateBuildingInput = {
      ...commonFields,
      projectId: values.projectId.trim(),
    };

    createBuilding.mutate(
      {
        input,
        images: newImages,
      },
      {
        onSuccess: () => {
          success({
            title: "Building created",
            description: "The building has been created successfully.",
          });

          onOpenChange(false);
        },
        onError: (mutationError: Error) => {
          const message =
            mutationError instanceof Error
              ? mutationError.message
              : "Please try again.";

          error({
            title: "Creation failed",
            description: message,
          });
        },
      },
    );
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onOpenChange(false);
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="building-dialog-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 size={20} />
            </div>

            <div>
              <h2
                id="building-dialog-title"
                className="text-lg font-semibold text-foreground"
              >
                {isEditing ? "Edit building" : "Create building"}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {isEditing
                  ? "Update building details and photos."
                  : "Add a building to your project."}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            aria-label="Close dialog"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            className="!min-h-9 !px-2"
          >
            <X size={18} />
          </Button>
        </header>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="space-y-6 px-5 py-5 sm:px-6">
            {formError && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-sm text-red-600 dark:text-red-400"
              >
                {formError}
              </div>
            )}

            {/* Basic information */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                Basic information
              </h3>

              {!isEditing && (
                <Field label="Project ID" required>
                  <Input
                    value={values.projectId}
                    onChange={(event) =>
                      updateField("projectId", event.target.value)
                    }
                    placeholder="Enter project ID"
                    required
                  />
                </Field>
              )}

              <Field label="Building name" required>
                <Input
                  value={values.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="e.g. Tower A"
                  required
                  maxLength={150}
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={values.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Describe the building..."
                  rows={3}
                  maxLength={1000}
                  className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </Field>

              <Field label="Total floors">
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={values.totalFloors}
                  onChange={(event) =>
                    updateField("totalFloors", event.target.value)
                  }
                  placeholder="e.g. 12"
                />
              </Field>
            </section>

            {/* Contact information */}
            <section className="space-y-4 border-t border-border pt-5">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Contact information
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  All contact fields are optional.
                </p>
              </div>

              <Field label="Contact name">
                <Input
                  value={values.contactName}
                  onChange={(event) =>
                    updateField("contactName", event.target.value)
                  }
                  placeholder="Contact person's name"
                  maxLength={150}
                />
              </Field>

              <Field label="Phone number">
                <Input
                  type="tel"
                  value={values.contactPhone}
                  onChange={(event) =>
                    updateField("contactPhone", event.target.value)
                  }
                  placeholder="Contact phone number"
                  maxLength={30}
                />
              </Field>

              <Field label="Email address">
                <Input
                  type="email"
                  value={values.contactEmail}
                  onChange={(event) =>
                    updateField("contactEmail", event.target.value)
                  }
                  placeholder="name@example.com"
                  maxLength={254}
                />
              </Field>
            </section>

            {/* Images */}
            <section className="space-y-4 border-t border-border pt-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Building photos
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add up to 10 images in total.
                  </p>
                </div>

                <span className="rounded-full bg-surface px-2.5 py-1 text-xs text-muted-foreground">
                  {existingImages.length + newImages.length}/10
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                aria-label="Choose building images"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={existingImages.length + newImages.length >= 10}
                className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 px-4 py-6 text-center transition hover:border-primary/50 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-background">
                  <ImagePlus size={20} className="text-primary" />
                </div>

                <span className="mt-3 text-sm font-medium text-foreground">
                  Choose images
                </span>

                <span className="mt-1 text-xs text-muted-foreground">
                  Select one or more image files
                </span>
              </button>

              {(existingImages.length > 0 || newImages.length > 0) && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {existingImages.map((image) => (
                    <div
                      key={image.id}
                      className="group relative overflow-hidden rounded-xl border border-border"
                    >
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={image.imageUrl}
                          alt={image.alt || "Building photo"}
                          fill
                          sizes="200px"
                          className="object-cover"
                        />
                      </div>

                      {image.isCover && (
                        <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-[10px] font-medium text-white">
                          Cover
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => removeExistingImage(image.id)}
                        aria-label="Remove existing image"
                        className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  {newImages.map((file, index) => (
                    <div
                      key={`${file.name}-${file.lastModified}-${index}`}
                      className="group relative overflow-hidden rounded-xl border border-border"
                    >
                      <div className="relative aspect-[4/3]">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="absolute inset-0 size-full object-cover"
                        />
                      </div>

                      <span className="absolute bottom-2 left-2 max-w-[75%] truncate rounded-md bg-black/60 px-2 py-1 text-[10px] text-white">
                        New image
                      </span>

                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        aria-label={`Remove ${file.name}`}
                        className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-red-600"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Footer */}
          <footer className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-border bg-background px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              loading={isPending}
              loadingText={isEditing ? "Saving changes..." : "Creating..."}
              leftIcon={isEditing ? undefined : Plus}
              disabled={isPending}
            >
              {isEditing ? "Save changes" : "Create building"}
            </Button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

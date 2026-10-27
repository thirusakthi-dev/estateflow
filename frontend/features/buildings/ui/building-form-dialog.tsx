"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Building2,
  FileText,
  Layers3,
  RotateCcw,
  UserRound,
  FolderKanban,
  LoaderCircle,
  ImagePlus,
  IndianRupee,
  CircleAlert,
} from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/components/ui/toast";

import { useProjects } from "../../projects/lib/projects.queries";
import { useCreateBuilding, useUpdateBuilding } from "../lib/buildings.queries";

import type {
  Building,
  BuildingImage,
  CreateBuildingInput,
  UpdateBuildingInput,
} from "../lib/buildings.types";

type BuildingFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  building?: Building | null;
  projectId?: string;
};

type BuildingFormValues = {
  projectId: string;
  name: string;
  description: string;
  totalFloors: string;
  minPrice: string;
  maxPrice: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
};

type BuildingFormErrors = Partial<Record<keyof BuildingFormValues, string>>;

const EMPTY_FORM: BuildingFormValues = {
  projectId: "",
  name: "",
  description: "",
  totalFloors: "",
  minPrice: "",
  maxPrice: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
};

const MAX_IMAGES = 10;

function getInitialValues(
  building?: Building | null,
  projectId?: string,
): BuildingFormValues {
  if (!building) {
    return {
      ...EMPTY_FORM,
      projectId: projectId ?? "",
    };
  }

  return {
    projectId: building.projectId,
    name: building.name,
    description: building.description ?? "",
    totalFloors:
      building.totalFloors != null ? String(building.totalFloors) : "",
    minPrice: building.minPrice != null ? String(building.minPrice) : "",
    maxPrice: building.maxPrice != null ? String(building.maxPrice) : "",
    contactName: building.contactName ?? "",
    contactPhone: building.contactPhone ?? "",
    contactEmail: building.contactEmail ?? "",
  };
}

function validateForm(
  values: BuildingFormValues,
  isEditing: boolean,
): BuildingFormErrors {
  const errors: BuildingFormErrors = {};

  if (!isEditing && !values.projectId) {
    errors.projectId = "Please select a project.";
  }

  const name = values.name.trim();

  if (!name) {
    errors.name = "Building name is required.";
  } else if (name.length < 2) {
    errors.name = "Name must contain at least 2 characters.";
  } else if (name.length > 120) {
    errors.name = "Name cannot exceed 120 characters.";
  }

  if (values.description.length > 2000) {
    errors.description = "Description cannot exceed 2000 characters.";
  }

  if (values.totalFloors.trim()) {
    const floors = Number(values.totalFloors);

    if (!Number.isInteger(floors) || floors < 1 || floors > 500) {
      errors.totalFloors = "Enter a whole number between 1 and 500.";
    }
  }

  const minPrice = values.minPrice.trim() ? Number(values.minPrice) : null;

  const maxPrice = values.maxPrice.trim() ? Number(values.maxPrice) : null;

  if (minPrice !== null && (!Number.isFinite(minPrice) || minPrice < 0)) {
    errors.minPrice = "Enter a valid non-negative price.";
  }

  if (maxPrice !== null && (!Number.isFinite(maxPrice) || maxPrice < 0)) {
    errors.maxPrice = "Enter a valid non-negative price.";
  }

  if (
    minPrice !== null &&
    maxPrice !== null &&
    Number.isFinite(minPrice) &&
    Number.isFinite(maxPrice) &&
    minPrice > maxPrice
  ) {
    errors.maxPrice = "Maximum price must be at least the minimum price.";
  }

  const phone = values.contactPhone.trim();

  if (phone && !/^[+\d][\d\s()-]{6,19}$/.test(phone)) {
    errors.contactPhone = "Enter a valid contact phone number.";
  }

  const email = values.contactEmail.trim();

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.contactEmail = "Enter a valid email address.";
  }

  if (values.contactName.trim().length > 120) {
    errors.contactName = "Contact name cannot exceed 120 characters.";
  }

  return errors;
}

function SectionHeading({
  icon: Icon,
  title,
  description,
  iconClassName,
  iconBackground,
}: {
  icon: typeof Building2;
  title: string;
  description: string;
  iconClassName: string;
  iconBackground: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconBackground}`}
      >
        <Icon className={`size-5 ${iconClassName}`} aria-hidden="true" />
      </div>

      <div className="min-w-0 pt-0.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

export function BuildingFormDialog({
  open,
  onOpenChange,
  building,
  projectId,
}: BuildingFormDialogProps) {
  const isEditing = Boolean(building);
  const toast = useToast();

  const createBuilding = useCreateBuilding();
  const updateBuilding = useUpdateBuilding();

  const isPending = createBuilding.isPending || updateBuilding.isPending;

  const [values, setValues] = useState<BuildingFormValues>(() =>
    getInitialValues(building, projectId),
  );

  const [errors, setErrors] = useState<BuildingFormErrors>({});
  const [images, setImages] = useState<File[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  const {
    data: projectsData,
    isLoading: isLoadingProjects,
    isError: isProjectsError,
  } = useProjects({
    search: "",
    page: 1,
    limit: 100,
  });

  const projects = projectsData?.projects ?? [];

  const projectOptions = useMemo(
    () =>
      projects.map((project) => ({
        label: project.name,
        value: project.id,
      })),
    [projects],
  );

  const visibleExistingImages: BuildingImage[] = (
    building?.images ?? []
  ).filter((image) => !removedImageIds.includes(image.id));

  const resetForm = useCallback(() => {
    setValues(getInitialValues(building, projectId));
    setErrors({});
    setImages([]);
    setRemovedImageIds([]);
  }, [building, projectId]);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isPending) return;

    if (!nextOpen) {
      setErrors({});
    }

    onOpenChange(nextOpen);
  };

  const updateField = <K extends keyof BuildingFormValues>(
    field: K,
    value: BuildingFormValues[K],
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => {
      if (!current[field]) return current;

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleRemoveExistingImage = (imageId: string) => {
    setRemovedImageIds((current) =>
      current.includes(imageId) ? current : [...current, imageId],
    );
  };

  const handleUndoRemoveImage = (imageId: string) => {
    setRemovedImageIds((current) => current.filter((id) => id !== imageId));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isPending) return;

    const nextErrors = validateForm(values, isEditing);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error({
        title: "Check the form",
        description: "Please correct the highlighted fields.",
      });
      return;
    }

    const commonFields: UpdateBuildingInput = {
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      totalFloors: values.totalFloors.trim()
        ? Number(values.totalFloors)
        : undefined,
      minPrice: values.minPrice.trim() ? Number(values.minPrice) : null,
      maxPrice: values.maxPrice.trim() ? Number(values.maxPrice) : null,
      contactName: values.contactName.trim() || undefined,
      contactPhone: values.contactPhone.trim() || undefined,
      contactEmail: values.contactEmail.trim() || undefined,
    };

    if (building) {
      updateBuilding.mutate(
        {
          id: building.id,
          input: commonFields,
          images,
          removedImageIds,
        },
        {
          onSuccess: () => {
            toast.success({
              title: "Building updated",
              description: "Your building changes have been saved.",
            });

            onOpenChange(false);
          },
          onError: (error) => {
            toast.error({
              title: "Update failed",
              description:
                error instanceof Error
                  ? error.message
                  : "Could not update the building. Please try again.",
            });
          },
        },
      );

      return;
    }

    const createInput: CreateBuildingInput = {
      ...commonFields,
      projectId: values.projectId,
      name: values.name.trim(),
    };

    createBuilding.mutate(
      {
        input: createInput,
        images,
      },
      {
        onSuccess: () => {
          toast.success({
            title: "Building created",
            description: "The building has been created successfully.",
          });

          onOpenChange(false);
        },
        onError: (error) => {
          toast.error({
            title: "Creation failed",
            description:
              error instanceof Error
                ? error.message
                : "Could not create the building. Please try again.",
          });
        },
      },
    );
  };

  const projectPlaceholder = isLoadingProjects
    ? "Loading projects..."
    : isProjectsError
      ? "Could not load projects"
      : projects.length === 0
        ? "No projects available"
        : "Select a project";

  return (
    <Modal
      open={open}
      onClose={() => handleOpenChange(false)}
      title={isEditing ? "Edit building" : "Add building"}
      description={
        isEditing
          ? "Update building details, contact information, and images."
          : "Add a building to a project and configure its details."
      }
      maxWidth="max-w-3xl"
      footer={
        <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="building-form"
            disabled={
              isPending ||
              (!isEditing &&
                !projectId &&
                (isLoadingProjects || projects.length === 0))
            }
          >
            {isPending && <LoaderCircle className="mr-2 size-4 animate-spin" />}

            {isPending
              ? isEditing
                ? "Saving changes..."
                : "Creating building..."
              : isEditing
                ? "Save changes"
                : "Create building"}
          </Button>
        </div>
      }
    >
      <form id="building-form" onSubmit={handleSubmit} className="space-y-7">
        {/* Building details */}
        <section>
          <SectionHeading
            icon={Building2}
            title="Building details"
            description="Provide the basic information for this building."
            iconClassName="text-blue-600"
            iconBackground="bg-blue-500/10"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Select
                label="Project"
                placeholder={projectPlaceholder}
                options={projectOptions}
                value={values.projectId}
                onChange={(value) => updateField("projectId", value)}
                searchable
                required={!isEditing && !projectId}
                disabled={
                  Boolean(building || projectId) ||
                  isLoadingProjects ||
                  projects.length === 0
                }
                error={
                  errors.projectId ||
                  (isProjectsError
                    ? "Unable to load projects. Close and retry, or check the projects API."
                    : undefined)
                }
              />

              {!isEditing &&
                !projectId &&
                !isLoadingProjects &&
                !isProjectsError &&
                projects.length === 0 && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-amber-600">
                    <CircleAlert className="size-4 shrink-0" />
                    Create a project first before adding a building.
                  </p>
                )}

              {projectId && (
                <p className="mt-2 text-xs text-muted-foreground">
                  This building will be created under the selected project.
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Building name"
                placeholder="e.g. Orchid Heights"
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                required
                maxLength={120}
                error={errors.name}
              />
            </div>

            <div className="sm:col-span-2">
              <Textarea
                label="Description"
                placeholder="Describe the building, amenities, and key features..."
                value={values.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                rows={4}
                error={errors.description}
              />
              <p className="mt-1.5 text-right text-xs text-muted-foreground">
                {values.description.length}/2000
              </p>
            </div>

            <Input
              label="Total floors"
              type="number"
              placeholder="e.g. 12"
              value={values.totalFloors}
              onChange={(event) =>
                updateField("totalFloors", event.target.value)
              }
              min={1}
              step={1}
              error={errors.totalFloors}
            />
          </div>
        </section>

        <div className="border-t border-border" />

        {/* Pricing */}
        <section>
          <SectionHeading
            icon={IndianRupee}
            title="Pricing"
            description="Set the expected price range for units in this building."
            iconClassName="text-emerald-600"
            iconBackground="bg-emerald-500/10"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Minimum price (₹)"
              type="number"
              placeholder="e.g. 5000000"
              value={values.minPrice}
              onChange={(event) => updateField("minPrice", event.target.value)}
              min={0}
              step="any"
              error={errors.minPrice}
            />

            <Input
              label="Maximum price (₹)"
              type="number"
              placeholder="e.g. 12000000"
              value={values.maxPrice}
              onChange={(event) => updateField("maxPrice", event.target.value)}
              min={0}
              step="any"
              error={errors.maxPrice}
            />
          </div>
        </section>

        <div className="border-t border-border" />

        {/* Contact */}
        <section>
          <SectionHeading
            icon={UserRound}
            title="Contact information"
            description="Optional contact details for enquiries about this building."
            iconClassName="text-violet-600"
            iconBackground="bg-violet-500/10"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Contact name"
              placeholder="e.g. Property manager"
              value={values.contactName}
              onChange={(event) =>
                updateField("contactName", event.target.value)
              }
              maxLength={120}
              error={errors.contactName}
            />

            <Input
              label="Contact phone"
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={values.contactPhone}
              onChange={(event) =>
                updateField("contactPhone", event.target.value)
              }
              error={errors.contactPhone}
            />

            <div className="sm:col-span-2">
              <Input
                label="Contact email"
                type="email"
                placeholder="e.g. manager@example.com"
                value={values.contactEmail}
                onChange={(event) =>
                  updateField("contactEmail", event.target.value)
                }
                error={errors.contactEmail}
              />
            </div>
          </div>
        </section>

        <div className="border-t border-border" />

        {/* Images */}
        <section>
          <SectionHeading
            icon={ImagePlus}
            title="Building images"
            description={`Upload up to ${MAX_IMAGES} images. Existing images can be removed when editing.`}
            iconClassName="text-pink-600"
            iconBackground="bg-pink-500/10"
          />

          <ImageUpload
            files={images}
            onChange={setImages}
            maxFiles={MAX_IMAGES}
            label="Upload building images"
            existingImages={visibleExistingImages.map((image) => ({
              id: image.id,
              url: image.imageUrl,
              name: image.alt || building?.name || "Building image",
            }))}
            onRemoveExisting={handleRemoveExistingImage}
          />

          {isEditing && removedImageIds.length > 0 && (
            <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3">
              <p className="mb-2 text-sm font-medium text-foreground">
                Images marked for removal ({removedImageIds.length})
              </p>

              <div className="space-y-2">
                {building?.images
                  .filter((image) => removedImageIds.includes(image.id))
                  .map((image) => (
                    <div
                      key={image.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="truncate text-sm text-muted-foreground">
                        {image.alt || "Building image"}
                      </span>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleUndoRemoveImage(image.id)}
                        disabled={isPending}
                      >
                        <RotateCcw className="mr-2 size-4 text-blue-600" />
                        Undo
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </section>
      </form>
    </Modal>
  );
}

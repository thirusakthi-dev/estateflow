"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Building2,
  UserRound,
  Image as ImageIcon,
  MapPin,
  IndianRupee,
} from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/components/ui/toast";

import { useCreateProject, useUpdateProject } from "../lib/projects.queries";

import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from "../lib/projects.types";

type ProjectFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
};

type ProjectFormValues = {
  name: string;
  description: string;
  address: string;
  city: string;
  status: CreateProjectInput["status"];
  minPrice: string;
  maxPrice: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
};

type FieldErrors = Partial<
  Record<
    "name" | "address" | "city" | "minPrice" | "maxPrice" | "contactEmail",
    string
  >
>;

const MAX_PROJECT_IMAGES = 10;

const initialForm: ProjectFormValues = {
  name: "",
  description: "",
  address: "",
  city: "",
  status: "ACTIVE",
  minPrice: "",
  maxPrice: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
};

const statusOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

export function ProjectFormDialog({
  open,
  onOpenChange,
  project = null,
}: ProjectFormDialogProps) {
  const isEditing = Boolean(project);

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const toast = useToast();

  const isPending = createProject.isPending || updateProject.isPending;

  const [form, setForm] = useState<ProjectFormValues>(initialForm);
  const [images, setImages] = useState<File[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});

  const existingImages = (project?.images ?? []).filter(
    (image) => !removedImageIds.includes(image.id),
  );

  const remainingImageSlots = Math.max(
    0,
    MAX_PROJECT_IMAGES - existingImages.length,
  );

  useEffect(() => {
    if (!open) return;

    if (project) {
      setForm({
        name: project.name ?? "",
        description: project.description ?? "",
        address: project.address ?? "",
        city: project.city ?? "",
        status: project.status,
        minPrice: project.minPrice == null ? "" : String(project.minPrice),
        maxPrice: project.maxPrice == null ? "" : String(project.maxPrice),
        contactName: project.contactName ?? "",
        contactPhone: project.contactPhone ?? "",
        contactEmail: project.contactEmail ?? "",
      });
    } else {
      setForm(initialForm);
    }

    setImages([]);
    setRemovedImageIds([]);
    setErrors({});
  }, [open, project]);

  function updateField(field: keyof ProjectFormValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function resetForm() {
    setForm(initialForm);
    setImages([]);
    setRemovedImageIds([]);
    setErrors({});
    createProject.reset();
    updateProject.reset();
  }

  function handleClose() {
    if (isPending) return;

    resetForm();
    onOpenChange(false);
  }

  function validateForm() {
    const nextErrors: FieldErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Project name is required.";
    }

    if (!form.address.trim()) {
      nextErrors.address = "Address is required.";
    }

    if (!form.city.trim()) {
      nextErrors.city = "City is required.";
    }

    const minPrice =
      form.minPrice.trim() === "" ? undefined : Number(form.minPrice);

    const maxPrice =
      form.maxPrice.trim() === "" ? undefined : Number(form.maxPrice);

    if (
      minPrice !== undefined &&
      (!Number.isFinite(minPrice) || minPrice < 0)
    ) {
      nextErrors.minPrice = "Enter a valid non-negative minimum price.";
    }

    if (
      maxPrice !== undefined &&
      (!Number.isFinite(maxPrice) || maxPrice < 0)
    ) {
      nextErrors.maxPrice = "Enter a valid non-negative maximum price.";
    }

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      Number.isFinite(minPrice) &&
      Number.isFinite(maxPrice) &&
      minPrice > maxPrice
    ) {
      nextErrors.maxPrice = "Maximum price must be at least the minimum price.";
    }

    if (
      form.contactEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())
    ) {
      nextErrors.contactEmail = "Enter a valid email address.";
    }

    if (existingImages.length + images.length > MAX_PROJECT_IMAGES) {
      nextErrors.name = "A project can have at most 10 images.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.warning({
        title: "Check the form",
        description: "Correct the highlighted fields and try again.",
      });

      return false;
    }

    return true;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPending || !validateForm()) return;

    const input = {
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
      minPrice: form.minPrice.trim() === "" ? null : Number(form.minPrice),
      maxPrice: form.maxPrice.trim() === "" ? null : Number(form.maxPrice),
      contactName: form.contactName.trim() || null,
      contactPhone: form.contactPhone.trim() || null,
      contactEmail: form.contactEmail.trim() || null,
    } satisfies CreateProjectInput;

    if (project) {
      const updateInput: UpdateProjectInput = { ...input };

      updateProject.mutate(
        {
          id: project.id,
          input: updateInput,
          images,
          removeImageIds: removedImageIds,
        },
        {
          onSuccess: () => {
            toast.success({
              title: "Project updated",
              description: `${input.name} was updated successfully.`,
            });

            onOpenChange(false);
          },
          onError: (error) => {
            toast.error({
              title: "Unable to update project",
              description:
                error instanceof Error ? error.message : "Please try again.",
            });
          },
        },
      );

      return;
    }

    createProject.mutate(
      { input, images },
      {
        onSuccess: () => {
          toast.success({
            title: "Project created",
            description: `${input.name} was created successfully.`,
          });

          resetForm();
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error({
            title: "Unable to create project",
            description:
              error instanceof Error ? error.message : "Please try again.",
          });
        },
      },
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEditing ? "Edit project" : "Create project"}
      description={
        isEditing
          ? "Update project details, contacts, pricing, and images."
          : "Create a project with its details, contacts, pricing, and images."
      }
      loading={isPending}
      maxWidth="max-w-2xl"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="project-form"
            loading={isPending}
            loadingText={isEditing ? "Saving..." : "Creating..."}
          >
            {isEditing ? "Save changes" : "Create project"}
          </Button>
        </>
      }
    >
      <form
        id="project-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6"
      >
        {/* Project details */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-blue-500" />
            <h3 className="text-sm font-semibold text-foreground">
              Project details
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Project name"
              placeholder="Enter project name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              error={errors.name}
              required
              maxLength={150}
            />

            <Input
              label="City"
              placeholder="Enter city"
              value={form.city}
              onChange={(event) => updateField("city", event.target.value)}
              error={errors.city}
              required
              maxLength={100}
            />

            <div className="sm:col-span-2">
              <Input
                label="Address"
                placeholder="Enter full address"
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
                error={errors.address}
                required
                maxLength={300}
              />
            </div>

            <div className="sm:col-span-2">
              <Textarea
                label="Description"
                placeholder="Describe the project (optional)"
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                rows={3}
                maxLength={2000}
              />
            </div>
          </div>
        </section>

        {/* Contact details */}
        <section className="space-y-4 border-t border-border pt-5">
          <div className="flex items-center gap-2">
            <UserRound size={18} className="text-violet-500" />
            <h3 className="text-sm font-semibold text-foreground">
              Contact information
            </h3>
            <span className="text-xs text-muted-foreground">Optional</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Contact name"
              placeholder="Contact person"
              value={form.contactName}
              onChange={(event) =>
                updateField("contactName", event.target.value)
              }
              maxLength={150}
            />

            <Input
              label="Contact phone"
              type="tel"
              placeholder="Phone number"
              value={form.contactPhone}
              onChange={(event) =>
                updateField("contactPhone", event.target.value)
              }
              maxLength={30}
            />

            <div className="sm:col-span-2">
              <Input
                label="Contact email"
                type="email"
                placeholder="name@example.com"
                value={form.contactEmail}
                onChange={(event) =>
                  updateField("contactEmail", event.target.value)
                }
                error={errors.contactEmail}
                maxLength={254}
              />
            </div>
          </div>
        </section>

        {/* Pricing and status */}
        <section className="space-y-4 border-t border-border pt-5">
          <div className="flex items-center gap-2">
            <IndianRupee size={18} className="text-emerald-500" />
            <h3 className="text-sm font-semibold text-foreground">
              Pricing and status
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Minimum price (₹)"
              type="number"
              placeholder="e.g. 5000000"
              value={form.minPrice}
              onChange={(event) => updateField("minPrice", event.target.value)}
              error={errors.minPrice}
              min={0}
              step="any"
            />

            <Input
              label="Maximum price (₹)"
              type="number"
              placeholder="e.g. 10000000"
              value={form.maxPrice}
              onChange={(event) => updateField("maxPrice", event.target.value)}
              error={errors.maxPrice}
              min={0}
              step="any"
            />

            <Select
              label="Status"
              value={form.status}
              onChange={(value) => updateField("status", value)}
              options={statusOptions}
              placeholder="Select project status"
              required
            />
          </div>
        </section>

        {/* Project images */}
        <section className="space-y-4 border-t border-border pt-5">
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-pink-500" />
            <h3 className="text-sm font-semibold text-foreground">
              Project images
            </h3>

            {/* <span className="ml-auto text-xs text-muted-foreground">
              {existingImages.length + images.length}/{MAX_PROJECT_IMAGES}
            </span> */}
          </div>

          {isEditing && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Existing images</p>

              {existingImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {existingImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative overflow-hidden rounded-xl border border-border"
                    >
                      <img
                        src={image.imageUrl}
                        alt={image.alt || project?.name || "Project image"}
                        className="h-28 w-full object-cover"
                      />

                      {image.isCover && (
                        <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
                          Cover
                        </span>
                      )}

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          setRemovedImageIds((current) =>
                            current.includes(image.id)
                              ? current
                              : [...current, image.id],
                          )
                        }
                        className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                        aria-label={`Remove ${image.alt || "project image"}`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No existing images. Upload images below.
                </p>
              )}
            </div>
          )}

          {remainingImageSlots > 0 && (
            <ImageUpload
              files={images}
              onChange={setImages}
              maxFiles={remainingImageSlots}
              label={
                isEditing ? "Add more project images" : "Upload project images"
              }
            />
          )}

          {remainingImageSlots === 0 && (
            <p className="text-sm text-muted-foreground">
              Maximum image limit reached. Remove an existing image to add
              another.
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Maximum {MAX_PROJECT_IMAGES} images per project.
          </p>
        </section>
      </form>
    </Modal>
  );
}

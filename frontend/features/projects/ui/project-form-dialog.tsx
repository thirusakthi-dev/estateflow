"use client";

import { useEffect, useState, type FormEvent } from "react";
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
};

type FieldErrors = Partial<Record<"name" | "address" | "city", string>>;

const initialForm: ProjectFormValues = {
  name: "",
  description: "",
  address: "",
  city: "",
  status: "PLANNING",
};

const statusOptions = [
  { label: "Planning", value: "PLANNING" },
  { label: "Ongoing", value: "ONGOING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "On hold", value: "ON_HOLD" },
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
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!open) return;

    if (project) {
      setForm({
        name: project.name ?? "",
        description: project.description ?? "",
        address: project.address ?? "",
        city: project.city ?? "",
        status: project.status,
      });
    } else {
      setForm(initialForm);
    }

    setImages([]);
    setErrors({});
  }, [open, project]);

  function updateField(field: keyof ProjectFormValues, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (field === "name" || field === "address" || field === "city") {
      setErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
    }
  }

  function handleClose() {
    if (isPending) return;

    setForm(initialForm);
    setImages([]);
    setErrors({});
    createProject.reset();
    updateProject.reset();
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

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.warning({
        title: "Check required fields",
        description: "Enter the project name, address, and city.",
      });

      return false;
    }

    return true;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isPending || !validateForm()) return;

    const input: CreateProjectInput = {
      name: form.name.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
    };

    if (project) {
      const updateInput: UpdateProjectInput = {
        ...input,
      };

      updateProject.mutate(
        {
          id: project.id,
          input: updateInput,
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

          setForm(initialForm);
          setImages([]);
          setErrors({});
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
          ? "Update the project details below."
          : "Add project details and upload project images."
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
        className="space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Project name"
            placeholder="Enter project name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            error={errors.name}
            required
            maxLength={120}
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
              maxLength={250}
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
              maxLength={1000}
            />
          </div>

          <div>
            <Select
              label="Status"
              value={form.status}
              onChange={(value) => updateField("status", value)}
              options={statusOptions}
              placeholder="Select project status"
              required
            />
          </div>
        </div>

        {!isEditing && (
          <div className="border-t border-border pt-5">
            <ImageUpload
              files={images}
              onChange={setImages}
              maxFiles={10}
              label="Project images"
            />
          </div>
        )}
      </form>
    </Modal>
  );
}

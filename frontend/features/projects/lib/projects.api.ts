
import { api } from "@/lib/api";
import type {
  CreateProjectInput,
  Project,
  ProjectFilters,
  ProjectsResponse,
  UpdateProjectInput,
} from "./projects.types";

export async function getProjects(
  filters: ProjectFilters = {},
): Promise<ProjectsResponse> {
  const response = await api.get("/projects", {
    params: filters,
  });

  return response.data.data;
}

export async function getProject(id: string): Promise<Project> {
  const response = await api.get(`/projects/${id}`);

  return response.data.data.project;
}

function appendFields(
  formData: FormData,
  input: Record<string, unknown>,
) {
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(
        key,
        value === null ? "" : String(value),
      );
    }
  });
}

export async function createProject(
  input: CreateProjectInput,
  images: File[] = [],
): Promise<Project> {
  const formData = new FormData();

  appendFields(formData, input);

  images.forEach((image) => {
    formData.append("images", image);
  });

  const response = await api.post("/projects", formData);

  return response.data.data.project;
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput,
  images: File[] = [],
  removeImageIds: string[] = [],
): Promise<Project> {
  const formData = new FormData();

  appendFields(formData, input);

  images.forEach((image) => {
    formData.append("images", image);
  });

  removeImageIds.forEach((imageId) => {
    formData.append("removeImageIds", imageId);
  });

  const response = await api.patch(`/projects/${id}`, formData);

  return response.data.data.project;
}

export async function deleteProject(id: string) {
  const response = await api.delete(`/projects/${id}`);

  return response.data.data;
}

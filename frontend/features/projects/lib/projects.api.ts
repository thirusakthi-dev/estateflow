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

export async function createProject(
  input: CreateProjectInput,
  images: File[] = [],
): Promise<Project> {
  const formData = new FormData();

  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      formData.append(key, String(value));
    }
  });

  images.forEach((image) => {
    formData.append("images", image);
  });

  const response = await api.post("/projects", formData);

  return response.data.data.project;
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput,
): Promise<Project> {
  const response = await api.patch(`/projects/${id}`, input);

  return response.data.data.project;
}

export async function deleteProject(id: string) {
  const response = await api.delete(`/projects/${id}`);
  return response.data.data;
}

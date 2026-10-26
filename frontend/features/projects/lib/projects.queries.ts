"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
} from "./projects.api";

import type {
  CreateProjectInput,
  ProjectFilters,
  UpdateProjectInput,
} from "./projects.types";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters: ProjectFilters) => [...projectKeys.lists(), filters] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => getProjects(filters),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProject(id),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      input,
      images,
    }: {
      input: CreateProjectInput;
      images?: File[];
    }) => createProject(input, images),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: projectKeys.all,
      }),
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) =>
      updateProject(id, input),

    onSuccess: (project) => {
      queryClient.setQueryData(projectKeys.detail(project.id), project);

      return queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),

    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: projectKeys.detail(id),
      });

      return queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      });
    },
  });
}

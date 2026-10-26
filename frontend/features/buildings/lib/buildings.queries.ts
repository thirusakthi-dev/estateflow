"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createBuilding,
  deleteBuilding,
  getBuilding,
  getBuildings,
  updateBuilding,
} from "./buildings.api";

import type {
  BuildingFilters,
  CreateBuildingInput,
  UpdateBuildingInput,
} from "./buildings.types";

export const buildingKeys = {
  all: ["buildings"] as const,
  lists: () => [...buildingKeys.all, "list"] as const,
  list: (filters: BuildingFilters) =>
    [...buildingKeys.lists(), filters] as const,
  details: () => [...buildingKeys.all, "detail"] as const,
  detail: (id: string) => [...buildingKeys.details(), id] as const,
};

export function useBuildings(filters: BuildingFilters = {}) {
  return useQuery({
    queryKey: buildingKeys.list(filters),
    queryFn: () => getBuildings(filters),
  });
}

export function useBuilding(id: string) {
  return useQuery({
    queryKey: buildingKeys.detail(id),
    queryFn: () => getBuilding(id),
    enabled: Boolean(id),
  });
}

export function useCreateBuilding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      input,
      images,
    }: {
      input: CreateBuildingInput;
      images?: File[];
    }) => createBuilding(input, images),

    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: buildingKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: ["projects"],
        }),
      ]),
  });
}

export function useUpdateBuilding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
      images,
      removedImageIds,
    }: {
      id: string;
      input: UpdateBuildingInput;
      images?: File[];
      removedImageIds?: string[];
    }) => updateBuilding(id, input, images, removedImageIds),

    onSuccess: async (building) => {
      queryClient.setQueryData(buildingKeys.detail(building.id), building);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: buildingKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: ["projects"],
        }),
      ]);
    },
  });
}

export function useDeleteBuilding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBuilding(id),

    onSuccess: async (_, id) => {
      queryClient.removeQueries({
        queryKey: buildingKeys.detail(id),
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: buildingKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: ["projects"],
        }),
      ]);
    },
  });
}

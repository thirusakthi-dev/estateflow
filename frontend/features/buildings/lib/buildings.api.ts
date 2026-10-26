import { api } from "@/lib/api";

import type {
  Building,
  BuildingFilters,
  BuildingsListResponse,
  CreateBuildingInput,
  UpdateBuildingInput,
} from "./buildings.types";

export async function getBuildings(
  filters: BuildingFilters = {},
): Promise<BuildingsListResponse> {
  const response = await api.get("/buildings", {
    params: filters,
  });

  return response.data.data;
}

export async function getBuilding(id: string): Promise<Building> {
  const response = await api.get(`/buildings/${id}`);

  return response.data.data.building;
}

export async function createBuilding(
  input: CreateBuildingInput,
  images: File[] = [],
): Promise<Building> {
  if (images.length === 0) {
    const response = await api.post("/buildings", input);
    return response.data.data.building;
  }

  const formData = new FormData();

  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  images.forEach((image) => {
    formData.append("images", image);
  });

  const response = await api.post("/buildings", formData);

  return response.data.data.building;
}

export async function updateBuilding(
  id: string,
  input: UpdateBuildingInput,
  images: File[] = [],
  removedImageIds: string[] = [],
): Promise<Building> {
  const formData = new FormData();

  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  images.forEach((image) => {
    formData.append("images", image);
  });

  formData.append("removedImageIds", JSON.stringify(removedImageIds));

  const response = await api.patch(`/buildings/${id}`, formData);

  return response.data.data.building;
}

export async function deleteBuilding(id: string): Promise<{ id: string }> {
  const response = await api.delete(`/buildings/${id}`);

  return response.data.data;
}

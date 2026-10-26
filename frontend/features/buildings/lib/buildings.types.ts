export type BuildingUnitStatus =
  | "AVAILABLE"
  | "BOOKED"
  | "SOLD"
  | "RENTED"
  | "UNAVAILABLE";

export type BuildingUnitType =
  | "APARTMENT"
  | "VILLA"
  | "HOUSE"
  | "PLOT"
  | "OFFICE"
  | "SHOP";

export type BuildingProjectStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "PLANNING"
  | "ONGOING"
  | "COMPLETED"
  | "ON_HOLD";

export type BuildingProjectSummary = {
  id: string;
  name: string;
  city: string;
  status: BuildingProjectStatus;
};

export type BuildingUnitSummary = {
  id: string;
  unitNumber: string;
  type: BuildingUnitType;
  price: number | string;
  status: BuildingUnitStatus;
};

export type BuildingImage = {
  id: string;
  imageUrl: string;
  alt?: string | null;
  isCover: boolean;
  sortOrder: number;
};

export type Building = {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  totalFloors: number | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
  project: BuildingProjectSummary;
  units: BuildingUnitSummary[];
  images: BuildingImage[];
};

export type BuildingPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type BuildingsListResponse = {
  buildings: Building[];
  pagination: BuildingPagination;
};

export type BuildingFilters = {
  search?: string;
  projectId?: string;
  page?: number;
  limit?: number;
};

export type CreateBuildingInput = {
  name: string;
  projectId: string;
  description?: string;
  totalFloors?: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
};

export type UpdateBuildingInput = {
  name?: string;
  description?: string;
  totalFloors?: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
};

export type BuildingResponse = {
  building: Building;
};

export type DeleteBuildingResponse = {
  id: string;
};

export type ProjectStatus = "ACTIVE" | "INACTIVE";

export type ProjectImage = {
  id: string;
  imageUrl: string;
  publicId?: string;
  alt: string | null;
  isCover: boolean;
  sortOrder: number;
};

export type ProjectUnit = {
  id: string;
  unitNumber: string;
  type: string;
  price: number | string;
  status: string;
};

export type ProjectBuildingImage = {
  id: string;
  imageUrl: string;
  alt: string | null;
  isCover: boolean;
  sortOrder: number;
};

export type ProjectBuildingProject = {
  id: string;
  name: string;
  city: string;
  status: ProjectStatus;
};

export type ProjectBuilding = {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  totalFloors: number | null;
  minPrice: number | string | null;
  maxPrice: number | string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
  project: ProjectBuildingProject;
  images: ProjectBuildingImage[];
  units: ProjectUnit[];
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  status: ProjectStatus;
  minPrice: number | string | null;
  maxPrice: number | string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
  images: ProjectImage[];
  buildings: ProjectBuilding[];
};

export type ProjectFilters = {
  search?: string;
  city?: string;
  status?: ProjectStatus;
  page?: number;
  limit?: number;
};

export type ProjectsResponse = {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateProjectInput = {
  name: string;
  description?: string;
  address: string;
  city: string;
  status?: ProjectStatus;
  minPrice?: number | null;
  maxPrice?: number | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
};

export type UpdateProjectInput = Partial<CreateProjectInput>;

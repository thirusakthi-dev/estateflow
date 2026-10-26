export type ProjectStatus = "ACTIVE" | "INACTIVE";
export type ProjectImage = {
  id: string;
  imageUrl: string;
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

export type ProjectBuilding = {
  id: string;
  name: string;
  units: ProjectUnit[];
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  status: ProjectStatus;
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
};

export type UpdateProjectInput = Partial<CreateProjectInput>;

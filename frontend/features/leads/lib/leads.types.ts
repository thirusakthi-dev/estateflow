export const LEAD_STAGES = [
  "NEW",
  "CONTACTED",
  "SITE_VISIT",
  "INTERESTED",
  "NEGOTIATION",
  "BOOKED",
  "LOST",
] as const;

export type LeadStage = (typeof LEAD_STAGES)[number];

export type LeadUser = {
  id: string;
  name: string;
  email: string;
};

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  source: string | null;
  stage: LeadStage;
  assignedToId: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: LeadUser | null;
  createdBy: LeadUser;
};

export type LeadFilters = {
  search?: string;
  stage?: LeadStage;
  assignedToId?: string;
  page?: number;
  limit?: number;
};

export type LeadsResponse = {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateLeadInput = {
  name: string;
  phone: string;
  email?: string;
  source?: string;
  assignedToId?: string;
};

export type UpdateLeadInput = {
  name?: string;
  phone?: string;
  email?: string | null;
  source?: string | null;
  stage?: LeadStage;
};

export type Employee = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: string;
};

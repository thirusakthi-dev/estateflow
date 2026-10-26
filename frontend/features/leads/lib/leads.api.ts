import { api } from "@/lib/api";
import type {
  CreateLeadInput,
  Employee,
  Lead,
  LeadFilters,
  LeadsResponse,
  UpdateLeadInput,
} from "./leads.types";

export async function getLeads(filters: LeadFilters): Promise<LeadsResponse> {
  const { data } = await api.get("/leads", {
    params: filters,
  });

  return data.data;
}

export async function getLead(id: string): Promise<Lead> {
  const { data } = await api.get(`/leads/${id}`);
  return data.data.lead;
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const { data } = await api.post("/leads", input);
  return data.data.lead;
}

export async function updateLead(
  id: string,
  input: UpdateLeadInput,
): Promise<Lead> {
  const { data } = await api.patch(`/leads/${id}`, input);
  return data.data.lead;
}

export async function assignLead(
  id: string,
  assignedToId: string | null,
): Promise<Lead> {
  const { data } = await api.patch(`/leads/${id}/assignment`, {
    assignedToId,
  });

  return data.data.lead;
}

export async function getEmployees(): Promise<Employee[]> {
  const { data } = await api.get("/users");
  return data.data.users;
}

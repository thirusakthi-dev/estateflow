import { api } from "@/lib/api";
import type {
  CreateFollowUpInput,
  FollowUp,
  FollowUpFilters,
  FollowUpsResponse,
  UpdateFollowUpInput,
} from "./follow-ups.types";

export async function getFollowUps(
  filters: FollowUpFilters,
): Promise<FollowUpsResponse> {
  const { data } = await api.get("/follow-ups", {
    params: filters,
  });

  return data.data;
}

export async function createFollowUp(
  input: CreateFollowUpInput,
): Promise<FollowUp> {
  const { data } = await api.post("/follow-ups", input);
  return data.data;
}

export async function updateFollowUp(
  id: string,
  input: UpdateFollowUpInput,
): Promise<FollowUp> {
  const { data } = await api.patch(`/follow-ups/${id}`, input);
  return data.data;
}

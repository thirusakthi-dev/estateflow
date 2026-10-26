import { api } from "@/lib/api";
import type {
  ProfileResponse,
  UpdateProfileInput,
  ChangePasswordInput,
} from "./profile.types";

export async function getProfile(): Promise<ProfileResponse> {
  const response = await api.get("/auth/me");
  return response.data.data;
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<ProfileResponse> {
  const response = await api.patch("/auth/me", input);
  return response.data.data;
}

export async function changePassword(
  input: ChangePasswordInput,
): Promise<void> {
  await api.patch("/auth/me/password", input);
}

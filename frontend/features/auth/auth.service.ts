import { api } from "@/lib/api";
import type {
  AuthUser,
  CurrentUserResponse,
  LoginCredentials,
  LoginResponse,
} from "./auth.type";

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", credentials);

  return data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const { data } = await api.get<CurrentUserResponse>("/auth/me");

  return data.data.user;
}

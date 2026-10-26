"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, getCurrentUser } from "./auth.service";
import type { AuthUser, LoginCredentials } from "./auth.type";
import { useToast } from "@/components/ui/toast";

const TOKEN_KEY = "estateflow_token";
const USER_KEY = "estateflow_user";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),

    onSuccess: (result) => {
      localStorage.setItem(TOKEN_KEY, result.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.data.user));

      queryClient.setQueryData<AuthUser>(authKeys.me, result.data.user);
    },
  });
}

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: getCurrentUser,
    enabled,
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  const { success, error } = useToast();

  return () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      queryClient.clear();

      success({
        title: "Logged out successfully",
        description: "You have been signed out of your account.",
        duration: 1500,
      });

      window.setTimeout(() => {
        window.location.assign("/login");
      }, 1500);
    } catch {
      error({
        title: "Logout failed",
        description: "Please try again.",
      });
    }
  };
}

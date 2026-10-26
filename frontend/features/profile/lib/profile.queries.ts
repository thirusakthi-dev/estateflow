"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";
import { getProfile, updateProfile, changePassword } from "./profile.api";
import type { UpdateProfileInput, ChangePasswordInput } from "./profile.types";

export const profileKeys = {
  me: ["profile", "me"] as const,
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response;

    if (
      typeof response === "object" &&
      response !== null &&
      "data" in response
    ) {
      const data = response.data;

      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        return data.message;
      }
    }
  }

  return fallback;
}

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.me,
    queryFn: getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),

    onSuccess: (result) => {
      queryClient.setQueryData(profileKeys.me, result);

      toast.success({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    },

    onError: (error) => {
      toast.error({
        title: "Profile update failed",
        description: getErrorMessage(error, "Unable to update your profile."),
      });
    },
  });
}

export function useChangePassword() {
  const toast = useToast();

  return useMutation({
    mutationFn: (input: ChangePasswordInput) => changePassword(input),

    onSuccess: () => {
      toast.success({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
    },

    onError: (error) => {
      toast.error({
        title: "Password change failed",
        description: getErrorMessage(error, "Unable to change your password."),
      });
    },
  });
}

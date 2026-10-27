"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";

import { getProfile, updateProfile, changePassword } from "./profile.api";

import type {
  UpdateProfileInput,
  ChangePasswordInput,
  Profile,
} from "./profile.types";

export const profileKeys = {
  me: ["profile", "me"] as const,
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return fallback;
  }

  const response = error.response;

  if (
    typeof response !== "object" ||
    response === null ||
    !("data" in response)
  ) {
    return fallback;
  }

  const data = response.data;

  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return fallback;
}

export function useProfile() {
  return useQuery<Profile>({
    queryKey: profileKeys.me,
    queryFn: async () => {
      const response = await getProfile();
      return response.user;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),

    onSuccess: async (result) => {
      // Cache the Profile object, not the { user: Profile } wrapper.
      queryClient.setQueryData<Profile>(profileKeys.me, result.user);

      // Confirm the latest saved values from the backend.
      await queryClient.invalidateQueries({
        queryKey: profileKeys.me,
      });

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

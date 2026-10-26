"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createFollowUp, getFollowUps, updateFollowUp } from "./follow-ups.api";

import type {
  CreateFollowUpInput,
  FollowUpFilters,
  UpdateFollowUpInput,
} from "./follow-ups.types";
import { useToast } from "@/components/ui/toast";
import axios from "axios";

export const followUpsQueryKey = ["follow-ups"];
export const leadsQueryKey = ["leads"];

export function useFollowUps(filters: FollowUpFilters) {
  return useQuery({
    queryKey: [...followUpsQueryKey, filters],
    queryFn: () => getFollowUps(filters),
  });
}

export function useCreateFollowUp() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: createFollowUp,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["follow-ups"],
      });

      toast.success({
        title: "Follow-up scheduled",
        description: "The follow-up has been created successfully.",
      });
    },

    onError: (error: unknown) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to schedule follow-up."
        : "Failed to schedule follow-up.";

      toast.error({
        title: "Unable to schedule follow-up",
        description: message,
      });
    },
  });
}

export function useUpdateFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFollowUpInput }) =>
      updateFollowUp(id, input),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: followUpsQueryKey,
      });

      queryClient.invalidateQueries({
        queryKey: leadsQueryKey,
      });
    },
  });
}

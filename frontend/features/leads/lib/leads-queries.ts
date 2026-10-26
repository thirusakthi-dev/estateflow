"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/toast";

import {
  assignLead,
  createLead,
  getEmployees,
  getLeads,
  updateLead,
} from "./leads.api";

import type {
  CreateLeadInput,
  LeadFilters,
  UpdateLeadInput,
} from "./leads.types";

export const leadsQueryKey = ["leads"];

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
}

export function useLeads(filters: LeadFilters) {
  return useQuery({
    queryKey: [...leadsQueryKey, filters],
    queryFn: () => getLeads(filters),
  });
}

export function useEmployees(enabled: boolean) {
  return useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
    enabled,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (input: CreateLeadInput) => createLead(input),

    onSuccess: async () => {
      toast.success({
        title: "Lead created",
        description: "The new lead has been added successfully.",
      });

      await queryClient.invalidateQueries({
        queryKey: leadsQueryKey,
      });
    },

    onError: (error) => {
      toast.error({
        title: "Unable to create lead",
        description: getErrorMessage(
          error,
          "Check the information and try again.",
        ),
      });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLeadInput }) =>
      updateLead(id, input),

    onSuccess: async () => {
      toast.success({
        title: "Lead updated",
        description: "The lead details have been saved.",
      });

      await queryClient.invalidateQueries({
        queryKey: leadsQueryKey,
      });
    },

    onError: (error) => {
      toast.error({
        title: "Unable to update lead",
        description: getErrorMessage(
          error,
          "Please check the details and try again.",
        ),
      });
    },
  });
}

export function useAssignLead() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      id,
      assignedToId,
    }: {
      id: string;
      assignedToId: string | null;
    }) => assignLead(id, assignedToId),

    onSuccess: async () => {
      toast.success({
        title: "Assignment updated",
        description: "The lead assignment has been saved.",
      });

      await queryClient.invalidateQueries({
        queryKey: leadsQueryKey,
      });
    },

    onError: (error) => {
      toast.error({
        title: "Unable to update assignment",
        description: getErrorMessage(
          error,
          "Please try assigning the lead again.",
        ),
      });
    },
  });
}

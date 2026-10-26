"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelBooking,
  createBooking,
  getBooking,
  getBookings,
  updateBookingStatus,
} from "./bookings.api";

import type {
  BookingFilters,
  BookingStatus,
  CreateBookingInput,
} from "./bookings.types";

export const bookingKeys = {
  all: ["bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  list: (filters: BookingFilters) => [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, "detail"] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
};

export function useBookings(filters: BookingFilters = {}) {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: () => getBookings(filters),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => getBooking(id),
    enabled: Boolean(id),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBookingInput) => createBooking(input),

    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: bookingKeys.all,
      }),
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelBooking(id),

    onSuccess: (booking) => {
      queryClient.setQueryData(bookingKeys.detail(booking.id), booking);

      return queryClient.invalidateQueries({
        queryKey: bookingKeys.all,
      });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      updateBookingStatus(id, status),

    onSuccess: (booking) => {
      queryClient.setQueryData(bookingKeys.detail(booking.id), booking);

      return queryClient.invalidateQueries({
        queryKey: bookingKeys.all,
      });
    },
  });
}

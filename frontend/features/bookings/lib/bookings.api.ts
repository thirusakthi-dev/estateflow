import { api } from "@/lib/api";
import type {
  Booking,
  BookingFilters,
  BookingsResponse,
  BookingStatus,
  CreateBookingInput,
} from "./bookings.types";

export async function getBookings(
  filters: BookingFilters = {},
): Promise<BookingsResponse> {
  const response = await api.get("/bookings", {
    params: filters,
  });

  return response.data.data;
}

export async function getBooking(id: string): Promise<Booking> {
  const response = await api.get(`/bookings/${id}`);
  return response.data.data.booking;
}

export async function createBooking(
  input: CreateBookingInput,
): Promise<Booking> {
  const response = await api.post("/bookings", input);
  return response.data.data.booking;
}

export async function cancelBooking(id: string): Promise<Booking> {
  const response = await api.patch(`/bookings/${id}/cancel`);
  return response.data.data.booking;
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<Booking> {
  const response = await api.patch(`/bookings/${id}/status`, {
    status,
  });

  return response.data.data.booking;
}

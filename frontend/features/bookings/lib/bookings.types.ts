export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
export type Booking = {
  id: string;
  leadId: string;
  buildingId: string;
  bookedById: string;
  status: BookingStatus;
  bookedAt: string;
  cancelledAt: string | null;

  lead: {
    id: string;
    name: string;
    phone: string;
    assignedToId: string | null;
  };

  building: {
    id: string;
    name: string;
    project: {
      id: string;
      name: string;
      city: string;
    };
  };

  bookedBy: {
    id: string;
    name: string;
    email: string;
  };
};

export type BookingFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: BookingStatus;
  leadId?: string;
  buildingId?: string;
  from?: string;
  to?: string;
};

export type BookingsResponse = {
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateBookingInput = {
  leadId: string;
  buildingId: string;
};

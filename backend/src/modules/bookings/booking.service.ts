import { Prisma, BookingStatus } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { HTTP_STATUS } from "../../constants/http-status";
import { ApiError } from "../../utils/api-error";

import {
  createBookingSchema,
  listBookingsSchema,
  updateBookingStatusSchema,
} from "./booking.validator";

const bookingSelect = {
  id: true,
  leadId: true,
  buildingId: true,
  bookedById: true,
  status: true,
  bookedAt: true,
  cancelledAt: true,

  lead: {
    select: {
      id: true,
      name: true,
      phone: true,
      assignedToId: true,
    },
  },

  building: {
    select: {
      id: true,
      name: true,
      project: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
    },
  },

  bookedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.BookingSelect;

type BookingUser = {
  id: string;
  role: string;
};

function canAccessBooking(
  user: BookingUser,
  booking: {
    bookedById: string;
    lead: {
      assignedToId: string | null;
    };
  },
) {
  return (
    user.role === "ADMIN" ||
    booking.bookedById === user.id ||
    booking.lead.assignedToId === user.id
  );
}

function hasAccessToLead(user: BookingUser, assignedToId: string | null) {
  return user.role === "ADMIN" || assignedToId === user.id;
}

/**
 * Create a pending booking.
 */
export async function createBooking(input: unknown, user: BookingUser) {
  const parsed = createBookingSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid booking data.",
      parsed.error.flatten(),
    );
  }

  const { leadId, buildingId } = parsed.data;

  return prisma.$transaction(async (tx) => {
    const lead = await tx.lead.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        assignedToId: true,
        stage: true,
      },
    });

    if (!lead) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Lead not found.");
    }

    if (!hasAccessToLead(user, lead.assignedToId)) {
      throw new ApiError(HTTP_STATUS.FORBIDDEN, "You cannot book this lead.");
    }

    if (lead.stage === "LOST") {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "A lost lead cannot be booked.",
      );
    }

    if (lead.stage === "BOOKED") {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "This lead already has a booking.",
      );
    }

    const building = await tx.building.findUnique({
      where: { id: buildingId },
      select: { id: true },
    });

    if (!building) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Building not found.");
    }

    const booking = await tx.booking.create({
      data: {
        leadId,
        buildingId,
        bookedById: user.id,
        status: BookingStatus.PENDING,
      },
      select: bookingSelect,
    });

    // The lead becomes BOOKED only after the booking is confirmed.
    return booking;
  });
}

/**
 * List bookings with filters and pagination.
 */
export async function listBookings(user: BookingUser, input: unknown) {
  const parsed = listBookingsSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid booking filters.",
      parsed.error.flatten(),
    );
  }

  const {
    page = 1,
    limit = 10,
    search,
    status,
    leadId,
    buildingId,
    from,
    to,
  } = parsed.data;

  const conditions: Prisma.BookingWhereInput[] = [];

  if (user.role !== "ADMIN") {
    conditions.push({
      OR: [{ bookedById: user.id }, { lead: { assignedToId: user.id } }],
    });
  }

  if (status) {
    conditions.push({ status });
  }

  if (leadId) {
    conditions.push({ leadId });
  }

  if (buildingId) {
    conditions.push({ buildingId });
  }

  if (from || to) {
    conditions.push({
      bookedAt: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    });
  }

  if (search) {
    conditions.push({
      OR: [
        {
          lead: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          building: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          building: {
            project: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    });
  }

  const where: Prisma.BookingWhereInput = {
    AND: conditions,
  };

  const [bookings, total] = await prisma.$transaction([
    prisma.booking.findMany({
      where,
      select: bookingSelect,
      orderBy: { bookedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),

    prisma.booking.count({ where }),
  ]);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get one booking.
 */
export async function getBookingById(id: string, user: BookingUser) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    select: bookingSelect,
  });

  if (!booking) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Booking not found.");
  }

  if (!canAccessBooking(user, booking)) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "You cannot access this booking.",
    );
  }

  return booking;
}

/**
 * Update booking status.
 *
 * PENDING   -> CONFIRMED or CANCELLED
 * CONFIRMED -> CANCELLED
 * CANCELLED -> CONFIRMED
 */
export async function updateBookingStatus(
  id: string,
  input: unknown,
  user: BookingUser,
) {
  const parsed = updateBookingStatusSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid booking status.",
      parsed.error.flatten(),
    );
  }

  const { status } = parsed.data;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.booking.findUnique({
      where: { id },
      select: {
        id: true,
        leadId: true,
        bookedById: true,
        status: true,

        lead: {
          select: {
            id: true,
            stage: true,
            assignedToId: true,
          },
        },
      },
    });

    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Booking not found.");
    }

    if (!canAccessBooking(user, existing)) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You cannot update this booking.",
      );
    }

    if (existing.status === status) {
      return tx.booking.findUniqueOrThrow({
        where: { id },
        select: bookingSelect,
      });
    }

    // Cancel a pending or confirmed booking.
    if (status === BookingStatus.CANCELLED) {
      if (existing.status === BookingStatus.CANCELLED) {
        return tx.booking.findUniqueOrThrow({
          where: { id },
          select: bookingSelect,
        });
      }

      const result = await tx.booking.updateMany({
        where: {
          id,
          status: existing.status,
        },
        data: {
          status: BookingStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      });

      if (result.count === 0) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          "Booking status has changed. Refresh and try again.",
        );
      }

      // Only a previously confirmed booking should restore the lead.
      if (existing.status === BookingStatus.CONFIRMED) {
        await tx.lead.updateMany({
          where: {
            id: existing.leadId,
            stage: "BOOKED",
          },
          data: {
            stage: "INTERESTED",
          },
        });
      }
    }

    // Confirm a pending or previously cancelled booking.
    if (status === BookingStatus.CONFIRMED) {
      const lead = existing.lead;

      if (lead.stage === "LOST") {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "A lost lead cannot be booked.",
        );
      }

      if (lead.stage === "BOOKED") {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          "This lead already has an active booking.",
        );
      }

      const otherConfirmedBooking = await tx.booking.findFirst({
        where: {
          leadId: existing.leadId,
          id: { not: id },
          status: BookingStatus.CONFIRMED,
        },
        select: { id: true },
      });

      if (otherConfirmedBooking) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          "This lead already has another confirmed booking.",
        );
      }

      const result = await tx.booking.updateMany({
        where: {
          id,
          status: existing.status,
        },
        data: {
          status: BookingStatus.CONFIRMED,
          cancelledAt: null,
        },
      });

      if (result.count === 0) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          "Booking status has changed. Refresh and try again.",
        );
      }

      await tx.lead.update({
        where: { id: existing.leadId },
        data: { stage: "BOOKED" },
      });
    }

    return tx.booking.findUniqueOrThrow({
      where: { id },
      select: bookingSelect,
    });
  });
}

export async function cancelBooking(id: string, user: BookingUser) {
  return updateBookingStatus(id, { status: BookingStatus.CANCELLED }, user);
}

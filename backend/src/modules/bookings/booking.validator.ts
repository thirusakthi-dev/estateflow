import { z } from "zod";

export const createBookingSchema = z.object({
  leadId: z.string().trim().min(1, "Lead ID is required."),
  buildingId: z.string().trim().min(1, "Building ID is required."),
  agreedPrice: z.coerce
    .number()
    .positive("Agreed price must be greater than zero.")
    .optional(),
});

export const listBookingsSchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
    leadId: z.string().trim().min(1).optional(),
    buildingId: z.string().trim().min(1).optional(),
    from: z.string().datetime({ offset: true }).optional(),
    to: z.string().datetime({ offset: true }).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .refine((data) => !data.from || !data.to || data.from <= data.to, {
    message: "from cannot be later than to.",
    path: ["from"],
  });

export const updateBookingStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]),
});

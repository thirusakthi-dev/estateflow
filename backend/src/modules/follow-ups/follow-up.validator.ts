import { z } from "zod";

export const followUpOutcomeSchema = z.enum([
  "CALL_BACK",
  "INTERESTED",
  "SITE_VISIT_PLANNED",
  "NEGOTIATION",
  "NOT_INTERESTED",
  "READY_TO_BOOK",
]);

export const createFollowUpSchema = z.object({
  leadId: z.string().trim().min(1),
  assignedToId: z.string().trim().min(1).optional(),
  scheduledAt: z.coerce.date(),
  notes: z.string().trim().max(1000).optional(),
});

export const updateFollowUpSchema = z
  .object({
    scheduledAt: z.coerce.date().optional(),
    notes: z.string().trim().max(1000).nullable().optional(),
    status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).optional(),
    outcome: followUpOutcomeSchema.optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "Provide at least one field to update.",
  );

export const listFollowUpsSchema = z
  .object({
    status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).optional(),
    leadId: z.string().trim().min(1).optional(),
    from: z.string().datetime({ offset: true }).optional(),
    to: z.string().datetime({ offset: true }).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .refine((data) => !data.from || !data.to || data.from <= data.to, {
    message: "from cannot be later than to.",
    path: ["from"],
  });

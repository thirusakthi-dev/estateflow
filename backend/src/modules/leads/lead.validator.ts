import { z } from "zod";

export const createLeadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(20),
  email: z
    .string()
    .trim()
    .email()
    .transform((v) => v.toLowerCase())
    .optional(),
  source: z.string().trim().max(100).optional(),
  assignedToId: z.string().min(1).optional(),
});

export const updateLeadSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    phone: z.string().trim().min(7).max(20).optional(),
    email: z
      .string()
      .trim()
      .email()
      .transform((v) => v.toLowerCase())
      .nullable()
      .optional(),
    source: z.string().trim().max(100).nullable().optional(),
    stage: z
      .enum([
        "NEW",
        "CONTACTED",
        "SITE_VISIT",
        "INTERESTED",
        "NEGOTIATION",
        "BOOKED",
        "LOST",
      ])
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "Provide at least one field to update.",
  );

export const assignLeadSchema = z.object({
  assignedToId: z.string().min(1).nullable(),
});

export const listLeadsSchema = z.object({
  search: z.string().trim().max(100).optional(),
  stage: z
    .enum([
      "NEW",
      "CONTACTED",
      "SITE_VISIT",
      "INTERESTED",
      "NEGOTIATION",
      "BOOKED",
      "LOST",
    ])
    .optional(),
  assignedToId: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

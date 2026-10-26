import { z } from "zod";

export const createBuildingSchema = z.object({
  projectId: z.string().trim().min(1),
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000).optional(),
  totalFloors: z.coerce.number().int().positive().optional(),
  contactName: z.string().trim().max(150).optional(),
  contactPhone: z.string().trim().max(30).optional(),
  contactEmail: z.string().trim().email().optional().or(z.literal("")),
});

export const updateBuildingSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(1000).optional(),
  totalFloors: z.coerce.number().int().positive().optional(),
  contactName: z.string().trim().max(150).optional(),
  contactPhone: z.string().trim().max(30).optional(),
  contactEmail: z.string().trim().email().optional().or(z.literal("")),
});

export const listBuildingsSchema = z.object({
  search: z.string().trim().max(100).optional(),
  projectId: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

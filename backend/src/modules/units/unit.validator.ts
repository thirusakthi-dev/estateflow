import { z } from "zod";

const unitTypeSchema = z.enum(["APARTMENT", "VILLA", "PLOT", "SHOP", "OFFICE"]);

const unitStatusSchema = z.enum(["AVAILABLE", "BLOCKED", "BOOKED"]);

export const createUnitSchema = z.object({
  buildingId: z.string().trim().min(1),
  unitNumber: z.string().trim().min(1).max(50),
  type: unitTypeSchema,
  price: z.coerce.number().positive().finite(),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  area: z.coerce.number().positive().finite().optional(),
  areaUnit: z.string().trim().min(1).max(20).optional(),
});

export const updateUnitSchema = z
  .object({
    buildingId: z.string().trim().min(1).optional(),
    unitNumber: z.string().trim().min(1).max(50).optional(),
    type: unitTypeSchema.optional(),
    price: z.coerce.number().positive().finite().optional(),
    bedrooms: z.coerce.number().int().min(0).nullable().optional(),
    bathrooms: z.coerce.number().int().min(0).nullable().optional(),
    area: z.coerce.number().positive().finite().nullable().optional(),
    areaUnit: z.string().trim().min(1).max(20).nullable().optional(),
    status: unitStatusSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update.",
  });

export const listUnitsSchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    buildingId: z.string().trim().min(1).optional(),
    projectId: z.string().trim().min(1).optional(),
    type: unitTypeSchema.optional(),
    status: unitStatusSchema.optional(),
    minPrice: z.coerce.number().min(0).finite().optional(),
    maxPrice: z.coerce.number().min(0).finite().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    {
      message: "minPrice cannot exceed maxPrice.",
      path: ["minPrice"],
    },
  );

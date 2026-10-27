
import { z } from "zod";

const optionalPrice = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : value),
  z.coerce.number().min(0).optional(),
);

const nullablePrice = z.preprocess(
  (value) => (value === "" ? null : value),
  z.coerce.number().min(0).nullable().optional(),
);

export const createBuildingSchema = z
  .object({
    projectId: z.string().trim().min(1),
    name: z.string().trim().min(2).max(150),
    description: z.string().trim().max(1000).optional(),
    totalFloors: z.coerce.number().int().positive().optional(),
    contactName: z.string().trim().max(150).optional(),
    contactPhone: z.string().trim().max(30).optional(),
    contactEmail: z.string().trim().email().optional().or(z.literal("")),
    minPrice: optionalPrice,
    maxPrice: optionalPrice,
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.maxPrice === undefined ||
      data.minPrice <= data.maxPrice,
    {
      message: "Minimum price cannot exceed maximum price.",
      path: ["maxPrice"],
    },
  );

export const updateBuildingSchema = z
  .object({
    name: z.string().trim().min(2).max(150).optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    totalFloors: z.coerce.number().int().positive().nullable().optional(),
    contactName: z.string().trim().max(150).nullable().optional(),
    contactPhone: z.string().trim().max(30).nullable().optional(),
    contactEmail: z
      .string()
      .trim()
      .email()
      .or(z.literal(""))
      .nullable()
      .optional(),
    minPrice: nullablePrice,
    maxPrice: nullablePrice,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update.",
  })
  .refine(
    (data) =>
      data.minPrice === undefined ||
      data.minPrice === null ||
      data.maxPrice === undefined ||
      data.maxPrice === null ||
      data.minPrice <= data.maxPrice,
    {
      message: "Minimum price cannot exceed maximum price.",
      path: ["maxPrice"],
    },
  );

export const listBuildingsSchema = z.object({
  search: z.string().trim().max(100).optional(),
  projectId: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

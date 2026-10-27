import { z } from "zod";

const priceFields = {
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
};

const contactFields = {
  contactName: z.string().trim().max(150).nullable().optional(),
  contactPhone: z.string().trim().max(30).nullable().optional(),
  contactEmail: z.string().trim().email().max(254).nullable().optional(),
};

function validatePriceRange(data: {
  minPrice?: number | null;
  maxPrice?: number | null;
}) {
  return (
    data.minPrice == null ||
    data.maxPrice == null ||
    data.minPrice <= data.maxPrice
  );
}

export const createProjectSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    description: z.string().trim().max(2000).optional(),
    address: z.string().trim().min(3).max(300),
    city: z.string().trim().min(2).max(100),
    ...priceFields,
    ...contactFields,
  })
  .refine(validatePriceRange, {
    message: "Minimum price cannot exceed maximum price.",
    path: ["maxPrice"],
  });

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(2).max(150).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    address: z.string().trim().min(3).max(300).optional(),
    city: z.string().trim().min(2).max(100).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    minPrice: z.coerce.number().min(0).nullable().optional(),
    maxPrice: z.coerce.number().min(0).nullable().optional(),
    ...contactFields,
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

export const listProjectsSchema = z.object({
  search: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

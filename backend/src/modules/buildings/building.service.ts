
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { HTTP_STATUS } from "../../constants/http-status";
import { ApiError } from "../../utils/api-error";
import {
  createBuildingSchema,
  listBuildingsSchema,
  updateBuildingSchema,
} from "./building.validator";
import { deleteImage, uploadImage } from "../images/image.service";

const buildingSelect = {
  id: true,
  projectId: true,
  name: true,
  description: true,
  minPrice: true,
  maxPrice: true,
  totalFloors: true,
  contactName: true,
  contactPhone: true,
  contactEmail: true,
  createdAt: true,
  updatedAt: true,

  project: {
    select: {
      id: true,
      name: true,
      city: true,
      status: true,
    },
  },

  images: {
    select: {
      id: true,
      imageUrl: true,
      alt: true,
      isCover: true,
      sortOrder: true,
    },
    orderBy: [
      { isCover: "desc" as const },
      { sortOrder: "asc" as const },
      { createdAt: "asc" as const },
    ],
  },

  units: {
    select: {
      id: true,
      unitNumber: true,
      type: true,
      price: true,
      status: true,
    },
    orderBy: {
      createdAt: "desc" as const,
    },
  },
} satisfies Prisma.BuildingSelect;

type UploadedImage = {
  imageUrl: string;
  publicId: string;
};

function validateFinalPriceRange(
  minPrice: Prisma.Decimal | number | null,
  maxPrice: Prisma.Decimal | number | null,
) {
  if (
    minPrice !== null &&
    maxPrice !== null &&
    Number(minPrice) > Number(maxPrice)
  ) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Minimum price cannot exceed maximum price.",
    );
  }
}

/**
 * Create a building with optional pricing and images.
 */
export async function createBuilding(
  input: unknown,
  files: Express.Multer.File[] = [],
) {
  const parsed = createBuildingSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid building details.",
      parsed.error.flatten(),
    );
  }

  if (files.length > 10) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Upload a maximum of 10 images per request.",
    );
  }

  const project = await prisma.project.findUnique({
    where: { id: parsed.data.projectId },
    select: {
      id: true,
      status: true,
    },
  });

  if (!project) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Project not found.");
  }

  if (project.status !== "ACTIVE") {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Cannot add a building to an inactive project.",
    );
  }

  const uploaded: UploadedImage[] = [];

  try {
    for (const file of files) {
      uploaded.push(await uploadImage(file, "buildings"));
    }

    return await prisma.$transaction((tx) =>
      tx.building.create({
        data: {
          ...parsed.data,
          images: {
            create: uploaded.map((image, index) => ({
              imageUrl: image.imageUrl,
              publicId: image.publicId,
              isCover: index === 0,
              sortOrder: index,
            })),
          },
        },
        select: buildingSelect,
      }),
    );
  } catch (error) {
    await Promise.allSettled(
      uploaded.map((image) => deleteImage(image.publicId)),
    );

    throw error;
  }
}

/**
 * List buildings with search, filters and pagination.
 */
export async function listBuildings(input: unknown) {
  const parsed = listBuildingsSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid building filters.",
      parsed.error.flatten(),
    );
  }

  const { search, projectId, page, limit } = parsed.data;

  const where: Prisma.BuildingWhereInput = {};

  if (projectId) {
    where.projectId = projectId;
  }

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        project: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        project: {
          city: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const [buildings, total] = await prisma.$transaction([
    prisma.building.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: buildingSelect,
    }),
    prisma.building.count({ where }),
  ]);

  return {
    buildings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a building by ID.
 */
export async function getBuildingById(id: string) {
  const building = await prisma.building.findUnique({
    where: { id },
    select: buildingSelect,
  });

  if (!building) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Building not found.");
  }

  return building;
}

/**
 * Update building details, pricing and images.
 */
export async function updateBuilding(
  id: string,
  input: unknown,
  files: Express.Multer.File[] = [],
) {
  const body: Record<string, unknown> =
    typeof input === "object" && input !== null && !Array.isArray(input)
      ? { ...(input as Record<string, unknown>) }
      : {};

  let removedImageIds: string[] = [];

  try {
    const rawRemovedIds = body.removedImageIds;
    delete body.removedImageIds;

    if (typeof rawRemovedIds === "string") {
      const parsedIds: unknown = JSON.parse(rawRemovedIds);

      if (
        !Array.isArray(parsedIds) ||
        !parsedIds.every((value) => typeof value === "string")
      ) {
        throw new Error("Invalid removed image IDs");
      }

      removedImageIds = parsedIds;
    } else if (Array.isArray(rawRemovedIds)) {
      if (!rawRemovedIds.every((value) => typeof value === "string")) {
        throw new Error("Invalid removed image IDs");
      }

      removedImageIds = rawRemovedIds;
    } else if (rawRemovedIds !== undefined) {
      throw new Error("Invalid removed image IDs");
    }
  } catch {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid removed image IDs.",
    );
  }

  const parsed = updateBuildingSchema.safeParse(body);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid building details.",
      parsed.error.flatten(),
    );
  }

  if (files.length > 10) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Upload a maximum of 10 images per request.",
    );
  }

  const existing = await prisma.building.findUnique({
    where: { id },
    select: {
      id: true,
      minPrice: true,
      maxPrice: true,
      images: {
        select: {
          id: true,
          publicId: true,
        },
      },
    },
  });

  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Building not found.");
  }

  // Validate the final range, including prices not supplied in this update.
  const finalMinPrice =
    parsed.data.minPrice === undefined
      ? existing.minPrice
      : parsed.data.minPrice;

  const finalMaxPrice =
    parsed.data.maxPrice === undefined
      ? existing.maxPrice
      : parsed.data.maxPrice;

  validateFinalPriceRange(finalMinPrice, finalMaxPrice);

  const uniqueRemovedIds = [...new Set(removedImageIds)];

  const removedImages = existing.images.filter((image) =>
    uniqueRemovedIds.includes(image.id),
  );

  if (removedImages.length !== uniqueRemovedIds.length) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "One or more images do not belong to this building.",
    );
  }

  if (
    Object.keys(parsed.data).length === 0 &&
    files.length === 0 &&
    removedImages.length === 0
  ) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Provide at least one field or image change to update.",
    );
  }

  const uploaded: UploadedImage[] = [];

  try {
    for (const file of files) {
      uploaded.push(await uploadImage(file, "buildings"));
    }

    const building = await prisma.$transaction(async (tx) => {
      if (removedImages.length > 0) {
        await tx.buildingImage.deleteMany({
          where: {
            id: { in: removedImages.map((image) => image.id) },
            buildingId: id,
          },
        });
      }

      if (uploaded.length > 0) {
        const remainingCount =
          existing.images.length - removedImages.length;

        await tx.buildingImage.createMany({
          data: uploaded.map((image, index) => ({
            buildingId: id,
            imageUrl: image.imageUrl,
            publicId: image.publicId,
            isCover: false,
            sortOrder: remainingCount + index,
          })),
        });
      }

      // Keep exactly one cover image whenever images exist.
      const remainingImages = await tx.buildingImage.findMany({
        where: { buildingId: id },
        select: { id: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });

      if (remainingImages.length > 0) {
        await tx.buildingImage.updateMany({
          where: { buildingId: id },
          data: { isCover: false },
        });

        await tx.buildingImage.update({
          where: { id: remainingImages[0].id },
          data: { isCover: true },
        });
      }

      return tx.building.update({
        where: { id },
        data: parsed.data,
        select: buildingSelect,
      });
    });

    // Delete removed Cloudinary images after the database update succeeds.
    await Promise.allSettled(
      removedImages.map((image) => deleteImage(image.publicId)),
    );

    return building;
  } catch (error) {
    // Clean up newly uploaded images if the database operation fails.
    await Promise.allSettled(
      uploaded.map((image) => deleteImage(image.publicId)),
    );

    throw error;
  }
}

/**
 * Delete a building and its associated images.
 */
export async function deleteBuilding(id: string) {
  const building = await prisma.building.findUnique({
    where: { id },
    select: {
      id: true,
      units: {
        select: {
          id: true,
          status: true,
        },
      },
      images: {
        select: {
          publicId: true,
        },
      },
    },
  });

  if (!building) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Building not found.");
  }

  if (building.units.some((unit) => unit.status === "BOOKED")) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Cannot delete a building containing booked units.",
    );
  }

  await prisma.building.delete({
    where: { id },
  });

  await Promise.allSettled(
    building.images.map((image) => deleteImage(image.publicId)),
  );

  return { id: building.id };
}

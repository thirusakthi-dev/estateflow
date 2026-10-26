import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/api-error";
import { HTTP_STATUS } from "../../constants/http-status";
import { uploadImage, deleteImage } from "../images/image.service";
import {
  createUnitSchema,
  updateUnitSchema,
  listUnitsSchema,
} from "./unit.validator";

const unitSelect = {
  id: true,
  buildingId: true,
  unitNumber: true,
  type: true,
  price: true,
  bedrooms: true,
  bathrooms: true,
  area: true,
  areaUnit: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  building: {
    select: {
      id: true,
      name: true,
      project: {
        select: {
          id: true,
          name: true,
          city: true,
          status: true,
        },
      },
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
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
} satisfies Prisma.PropertyUnitSelect;

// Create a unit with optional images.
export async function createUnit(
  input: unknown,
  files: Express.Multer.File[] = [],
) {
  const parsed = createUnitSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid unit details.",
      parsed.error.flatten(),
    );
  }

  if (files.length > 10) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Upload a maximum of 10 images per request.",
    );
  }

  const building = await prisma.building.findUnique({
    where: { id: parsed.data.buildingId },
    select: {
      id: true,
      project: {
        select: { status: true },
      },
    },
  });

  if (!building) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Building not found.");
  }

  if (building.project.status !== "ACTIVE") {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Cannot add units to an inactive project.",
    );
  }

  const uploaded: { imageUrl: string; publicId: string }[] = [];

  try {
    for (const file of files) {
      uploaded.push(await uploadImage(file, "units"));
    }

    return await prisma.$transaction((tx) =>
      tx.propertyUnit.create({
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
        select: unitSelect,
      }),
    );
  } catch (error) {
    await Promise.allSettled(
      uploaded.map((image) => deleteImage(image.publicId)),
    );
    throw error;
  }
}

export async function listUnits(input: unknown) {
  const parsed = listUnitsSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid unit filters.",
      parsed.error.flatten(),
    );
  }

  const {
    page,
    limit,
    search,
    buildingId,
    projectId,
    type,
    status,
    minPrice,
    maxPrice,
  } = parsed.data;

  const where: Prisma.PropertyUnitWhereInput = {};

  // Filter by building and project.
  if (buildingId) {
    where.buildingId = buildingId;
  }

  if (projectId) {
    where.building = { projectId };
  }

  // Filter by unit type and status.
  if (type) {
    where.type = type;
  }

  if (status) {
    where.status = status;
  }

  // Filter by price range.
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};

    if (minPrice !== undefined) {
      where.price.gte = minPrice;
    }

    if (maxPrice !== undefined) {
      where.price.lte = maxPrice;
    }
  }

  // Search by unit number, building name, or project name.
  if (search) {
    where.OR = [
      {
        unitNumber: {
          contains: search,
          mode: "insensitive",
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
    ];
  }

  // Fetch units and total count together.
  const [units, total] = await prisma.$transaction([
    prisma.propertyUnit.findMany({
      where,
      select: unitSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.propertyUnit.count({ where }),
  ]);

  return {
    units,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get one unit, including its images.
export async function getUnitById(id: string) {
  const unit = await prisma.propertyUnit.findUnique({
    where: { id },
    select: unitSelect,
  });

  if (!unit) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Property unit not found.");
  }

  return unit;
}

// Update unit details and return its images.
// Image uploads and removals use the separate image endpoints.
export async function updateUnit(id: string, input: unknown) {
  const parsed = updateUnitSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid unit details.",
      parsed.error.flatten(),
    );
  }

  const existing = await prisma.propertyUnit.findUnique({
    where: { id },
    select: {
      id: true,
      buildingId: true,
      status: true,
    },
  });

  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Property unit not found.");
  }

  if (existing.status === "BOOKED" && parsed.data.status !== undefined) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "A booked unit's status cannot be changed directly.",
    );
  }

  if (parsed.data.status === "BOOKED") {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Use the booking endpoint to book a unit.",
    );
  }

  if (parsed.data.buildingId) {
    const building = await prisma.building.findUnique({
      where: { id: parsed.data.buildingId },
      select: {
        id: true,
        project: {
          select: { status: true },
        },
      },
    });

    if (!building) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, "Building not found.");
    }

    if (building.project.status !== "ACTIVE") {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Cannot move a unit to an inactive project.",
      );
    }
  }

  return prisma.propertyUnit.update({
    where: { id },
    data: parsed.data,
    select: unitSelect,
  });
}

// Delete a unit and clean up its uploaded images.
export async function deleteUnit(id: string) {
  const unit = await prisma.propertyUnit.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      images: {
        select: {
          publicId: true,
        },
      },
    },
  });

  if (!unit) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Property unit not found.");
  }

  if (unit.status === "BOOKED") {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Cannot delete a booked unit.");
  }

  await prisma.propertyUnit.delete({
    where: { id },
  });

  // Remove associated images from Cloudinary.
  await Promise.allSettled(
    unit.images.map((image) => deleteImage(image.publicId)),
  );

  return { id: unit.id };
}

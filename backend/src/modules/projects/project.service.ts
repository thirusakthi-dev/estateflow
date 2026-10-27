import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { HTTP_STATUS } from "../../constants/http-status";
import { ApiError } from "../../utils/api-error";
import {
  createProjectSchema,
  updateProjectSchema,
  listProjectsSchema,
} from "./project.validator";
import { deleteImage, uploadImage } from "../images/image.service";

const MAX_PROJECT_IMAGES = 10;

const projectSelect = {
  id: true,
  name: true,
  description: true,
  address: true,
  city: true,
  status: true,
  minPrice: true,
  maxPrice: true,
  contactName: true,
  contactPhone: true,
  contactEmail: true,
  createdAt: true,
  updatedAt: true,

  images: {
    select: {
      id: true,
      imageUrl: true,
      publicId: true,
      alt: true,
      isCover: true,
      sortOrder: true,
    },
    orderBy: {
      sortOrder: "asc" as const,
    },
  },

  buildings: {
    select: {
      id: true,
      projectId: true,
      name: true,
      description: true,
      totalFloors: true,
      minPrice: true,
      maxPrice: true,
      contactName: true,
      contactPhone: true,
      contactEmail: true,
      createdAt: true,
      updatedAt: true,

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

      project: {
        select: {
          id: true,
          name: true,
          city: true,
          status: true,
        },
      },

      units: {
        select: {
          id: true,
          unitNumber: true,
          type: true,
          price: true,
          status: true,
        },
      },
    },
  },
} satisfies Prisma.ProjectSelect;

type UploadedImage = {
  imageUrl: string;
  publicId: string;
};

type OrderedImage = {
  id?: string;
  imageUrl: string;
  publicId: string;
  isCover: boolean;
  sortOrder: number;
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

function parseRemoveImageIds(value: unknown): string[] {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  const values = Array.isArray(value) ? value : [value];

  if (
    !values.every((item) => typeof item === "string" && item.trim().length > 0)
  ) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid image removal IDs.");
  }

  const ids = (values as string[]).map((item) => item.trim());

  if (new Set(ids).size !== ids.length) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Duplicate image removal IDs are not allowed.",
    );
  }

  return ids;
}

function validateImageCount(
  existingCount: number,
  removeCount: number,
  newCount: number,
) {
  const finalCount = existingCount - removeCount + newCount;

  if (finalCount > MAX_PROJECT_IMAGES) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `A project can have a maximum of ${MAX_PROJECT_IMAGES} images.`,
    );
  }
}

/**
 * Create a project with optional pricing and images.
 */
export async function createProject(
  input: unknown,
  files: Express.Multer.File[] = [],
) {
  const parsed = createProjectSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid project details.",
      parsed.error.flatten(),
    );
  }

  if (files.length > MAX_PROJECT_IMAGES) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Upload a maximum of ${MAX_PROJECT_IMAGES} images.`,
    );
  }

  const uploaded: UploadedImage[] = [];

  try {
    for (const file of files) {
      uploaded.push(await uploadImage(file, "projects"));
    }

    return await prisma.project.create({
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
      select: projectSelect,
    });
  } catch (error) {
    await Promise.allSettled(
      uploaded.map((image) => deleteImage(image.publicId)),
    );

    throw error;
  }
}

/**
 * List projects with search, filters and pagination.
 */
export async function listProjects(query: unknown) {
  const parsed = listProjectsSchema.safeParse(query);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid project filters.",
      parsed.error.flatten(),
    );
  }

  const { search, city, status, page, limit } = parsed.data;

  const where: Prisma.ProjectWhereInput = {};

  if (city) {
    where.city = {
      contains: city,
      mode: "insensitive",
    };
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
    ];
  }

  const [projects, total] = await prisma.$transaction([
    prisma.project.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: projectSelect,
    }),
    prisma.project.count({ where }),
  ]);

  return {
    projects,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a project by ID.
 */
export async function getProjectById(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    select: projectSelect,
  });

  if (!project) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Project not found.");
  }

  return project;
}

/**
 * Update project details, pricing and images.
 */
export async function updateProject(
  id: string,
  input: unknown,
  files: Express.Multer.File[] = [],
  removeImageIdsInput: unknown = [],
) {
  const parsed = updateProjectSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid project update.",
      parsed.error.flatten(),
    );
  }

  const removeImageIds = parseRemoveImageIds(removeImageIdsInput);

  if (files.length > MAX_PROJECT_IMAGES) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Upload a maximum of ${MAX_PROJECT_IMAGES} new images per request.`,
    );
  }

  const existingProject = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      minPrice: true,
      maxPrice: true,
      images: {
        select: {
          id: true,
          imageUrl: true,
          publicId: true,
          isCover: true,
          sortOrder: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!existingProject) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Project not found.");
  }

  const finalMinPrice =
    parsed.data.minPrice === undefined
      ? existingProject.minPrice
      : parsed.data.minPrice;

  const finalMaxPrice =
    parsed.data.maxPrice === undefined
      ? existingProject.maxPrice
      : parsed.data.maxPrice;

  validateFinalPriceRange(finalMinPrice, finalMaxPrice);

  const existingImageIds = new Set(
    existingProject.images.map((image) => image.id),
  );

  const invalidImageIds = removeImageIds.filter(
    (imageId) => !existingImageIds.has(imageId),
  );

  if (invalidImageIds.length > 0) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "One or more image IDs do not belong to this project.",
    );
  }

  const removeIds = new Set(removeImageIds);

  const remainingImages = existingProject.images.filter(
    (image) => !removeIds.has(image.id),
  );

  validateImageCount(
    existingProject.images.length,
    removeImageIds.length,
    files.length,
  );

  const uploaded: UploadedImage[] = [];

  try {
    for (const file of files) {
      uploaded.push(await uploadImage(file, "projects"));
    }

    const orderedImages: OrderedImage[] = [
      ...remainingImages.map((image) => ({
        id: image.id,
        imageUrl: image.imageUrl,
        publicId: image.publicId,
        isCover: image.isCover,
        sortOrder: image.sortOrder,
      })),
      ...uploaded.map((image) => ({
        imageUrl: image.imageUrl,
        publicId: image.publicId,
        isCover: false,
        sortOrder: 0,
      })),
    ];

    const existingCover =
      remainingImages.find((image) => image.isCover) ?? remainingImages[0];

    const updatedProject = await prisma.$transaction(async (tx) => {
      for (const imageId of removeImageIds) {
        await tx.projectImage.delete({
          where: { id: imageId },
        });
      }

      for (let index = 0; index < orderedImages.length; index++) {
        const image = orderedImages[index];

        if (image.id) {
          await tx.projectImage.update({
            where: { id: image.id },
            data: {
              sortOrder: index,
              isCover: image.id === existingCover?.id,
            },
          });
        } else {
          await tx.projectImage.create({
            data: {
              projectId: id,
              imageUrl: image.imageUrl,
              publicId: image.publicId,
              isCover: !existingCover && index === 0,
              sortOrder: index,
            },
          });
        }
      }

      return tx.project.update({
        where: { id },
        data: parsed.data,
        select: projectSelect,
      });
    });

    // Delete removed images from Cloudinary after the database succeeds.
    const removedImages = existingProject.images.filter((image) =>
      removeIds.has(image.id),
    );

    await Promise.allSettled(
      removedImages.map((image) => deleteImage(image.publicId)),
    );

    return updatedProject;
  } catch (error) {
    // Clean up newly uploaded files if the database update fails.
    await Promise.allSettled(
      uploaded.map((image) => deleteImage(image.publicId)),
    );

    throw error;
  }
}

/**
 * Delete a project and its associated images.
 */
export async function deleteProject(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      images: {
        select: {
          publicId: true,
        },
      },
    },
  });

  if (!project) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Project not found.");
  }

  await prisma.project.delete({
    where: { id },
  });

  await Promise.allSettled(
    project.images.map((image) => deleteImage(image.publicId)),
  );

  return { id: project.id };
}

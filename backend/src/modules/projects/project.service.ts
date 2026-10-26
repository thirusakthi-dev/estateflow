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

const projectSelect = {
  id: true,
  name: true,
  description: true,
  address: true,
  city: true,
  status: true,
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

  buildings: {
    select: {
      id: true,
      name: true,
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

  if (files.length > 10) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Upload a maximum of 10 images per request.",
    );
  }

  const uploaded: { imageUrl: string; publicId: string }[] = [];

  try {
    for (const file of files) {
      uploaded.push(await uploadImage(file, "projects"));
    }

    return await prisma.$transaction((tx) =>
      tx.project.create({
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
      }),
    );
  } catch (error) {
    await Promise.allSettled(
      uploaded.map((image) => deleteImage(image.publicId)),
    );

    throw error;
  }
}

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

export async function updateProject(id: string, input: unknown) {
  const parsed = updateProjectSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid project update.",
      parsed.error.flatten(),
    );
  }

  const existingProject = await prisma.project.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existingProject) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Project not found.");
  }

  return prisma.project.update({
    where: { id },
    data: parsed.data,
    select: projectSelect,
  });
}

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

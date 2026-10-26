import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/api-error";
import { HTTP_STATUS } from "../../constants/http-status";
import { uploadImage, deleteImage } from "./image.service";

type CurrentUser = {
  id: string;
  role: string;
};

export async function uploadProjectImages(
  projectId: string,
  files: Express.Multer.File[],
) {
  if (files.length === 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Select at least one image.");
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!project) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Project not found.");
  }

  const existingCount = await prisma.projectImage.count({
    where: { projectId },
  });

  if (existingCount + files.length > 30) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "A project can have at most 30 images.",
    );
  }

  const uploaded: { imageUrl: string; publicId: string }[] = [];

  try {
    for (const file of files) {
      uploaded.push(await uploadImage(file, "projects"));
    }

    await prisma.$transaction(async (tx) => {
      for (const [index, image] of uploaded.entries()) {
        await tx.projectImage.create({
          data: {
            projectId,
            imageUrl: image.imageUrl,
            publicId: image.publicId,
            isCover: existingCount === 0 && index === 0,
            sortOrder: existingCount + index,
          },
        });
      }
    });
  } catch (error) {
    await Promise.allSettled(
      uploaded.map((image) => deleteImage(image.publicId)),
    );
    throw error;
  }

  return prisma.projectImage.findMany({
    where: { projectId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function listProjectImages(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!project) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Project not found.");
  }

  return prisma.projectImage.findMany({
    where: { projectId },
    orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
  });
}

export async function setProjectCover(projectId: string, imageId: string) {
  const image = await prisma.projectImage.findFirst({
    where: { id: imageId, projectId },
    select: { id: true },
  });

  if (!image) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Project image not found.");
  }

  await prisma.$transaction([
    prisma.projectImage.updateMany({
      where: { projectId },
      data: { isCover: false },
    }),
    prisma.projectImage.update({
      where: { id: imageId },
      data: { isCover: true },
    }),
  ]);

  return prisma.projectImage.findUnique({ where: { id: imageId } });
}

export async function removeProjectImage(
  projectId: string,
  imageId: string,
  _user: CurrentUser,
) {
  const image = await prisma.projectImage.findFirst({
    where: { id: imageId, projectId },
  });

  if (!image) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Project image not found.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.projectImage.delete({ where: { id: imageId } });

    if (image.isCover) {
      const nextImage = await tx.projectImage.findFirst({
        where: { projectId },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });

      if (nextImage) {
        await tx.projectImage.update({
          where: { id: nextImage.id },
          data: { isCover: true },
        });
      }
    }
  });

  // Database deletion has succeeded. Cloudinary cleanup is separate.
  try {
    await deleteImage(image.publicId);
  } catch {
    // The database record is deleted; failed storage cleanup can be retried.
  }

  return { id: image.id, message: "Project image deleted." };
}

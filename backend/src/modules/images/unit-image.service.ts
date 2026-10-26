import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/api-error";
import { HTTP_STATUS } from "../../constants/http-status";
import { uploadImage, deleteImage } from "./image.service";

export async function uploadUnitImages(
  unitId: string,
  files: Express.Multer.File[],
) {
  if (files.length === 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Select at least one image.");
  }

  const unit = await prisma.propertyUnit.findUnique({
    where: { id: unitId },
    select: { id: true },
  });

  if (!unit) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Property unit not found.");
  }

  const existingCount = await prisma.propertyUnitImage.count({
    where: { unitId },
  });

  if (existingCount + files.length > 30) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "A unit can have at most 30 images.",
    );
  }

  const uploaded: { imageUrl: string; publicId: string }[] = [];

  try {
    for (const file of files) {
      uploaded.push(await uploadImage(file, "units"));
    }

    await prisma.$transaction(async (tx) => {
      for (const [index, image] of uploaded.entries()) {
        await tx.propertyUnitImage.create({
          data: {
            unitId,
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

  return prisma.propertyUnitImage.findMany({
    where: { unitId },
    orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
  });
}

export async function listUnitImages(unitId: string) {
  const unit = await prisma.propertyUnit.findUnique({
    where: { id: unitId },
    select: { id: true },
  });

  if (!unit) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Property unit not found.");
  }

  return prisma.propertyUnitImage.findMany({
    where: { unitId },
    orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
  });
}

export async function setUnitCover(unitId: string, imageId: string) {
  const image = await prisma.propertyUnitImage.findFirst({
    where: { id: imageId, unitId },
    select: { id: true },
  });

  if (!image) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Unit image not found.");
  }

  await prisma.$transaction([
    prisma.propertyUnitImage.updateMany({
      where: { unitId },
      data: { isCover: false },
    }),
    prisma.propertyUnitImage.update({
      where: { id: imageId },
      data: { isCover: true },
    }),
  ]);

  return prisma.propertyUnitImage.findUnique({
    where: { id: imageId },
  });
}

export async function removeUnitImage(unitId: string, imageId: string) {
  const image = await prisma.propertyUnitImage.findFirst({
    where: { id: imageId, unitId },
  });

  if (!image) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Unit image not found.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.propertyUnitImage.delete({ where: { id: imageId } });

    if (image.isCover) {
      const nextImage = await tx.propertyUnitImage.findFirst({
        where: { unitId },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });

      if (nextImage) {
        await tx.propertyUnitImage.update({
          where: { id: nextImage.id },
          data: { isCover: true },
        });
      }
    }
  });

  try {
    await deleteImage(image.publicId);
  } catch {
    // Storage cleanup can be retried separately.
  }

  return { id: image.id, message: "Unit image deleted." };
}

import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/api-error";
import { HTTP_STATUS } from "../../constants/http-status";
import { uploadImage, deleteImage } from "./image.service";

type CurrentUser = {
  id: string;
  role: string;
};

export async function uploadBuildingImages(
  buildingId: string,
  files: Express.Multer.File[],
) {
  if (files.length === 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Select at least one image.");
  }

  const building = await prisma.building.findUnique({
    where: { id: buildingId },
    select: { id: true },
  });

  if (!building) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Building not found.");
  }

  const existingCount = await prisma.buildingImage.count({
    where: { buildingId },
  });

  if (existingCount + files.length > 30) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "A building can have at most 30 images.",
    );
  }

  const uploaded: { imageUrl: string; publicId: string }[] = [];

  try {
    for (const file of files) {
      uploaded.push(await uploadImage(file, "buildings"));
    }

    await prisma.$transaction(async (tx) => {
      for (const [index, image] of uploaded.entries()) {
        await tx.buildingImage.create({
          data: {
            buildingId,
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

  return listBuildingImages(buildingId);
}

export async function listBuildingImages(buildingId: string) {
  const building = await prisma.building.findUnique({
    where: { id: buildingId },
    select: { id: true },
  });

  if (!building) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Building not found.");
  }

  return prisma.buildingImage.findMany({
    where: { buildingId },
    orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function setBuildingCover(buildingId: string, imageId: string) {
  const image = await prisma.buildingImage.findFirst({
    where: { id: imageId, buildingId },
    select: { id: true },
  });

  if (!image) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Building image not found.");
  }

  await prisma.$transaction([
    prisma.buildingImage.updateMany({
      where: { buildingId },
      data: { isCover: false },
    }),
    prisma.buildingImage.update({
      where: { id: imageId },
      data: { isCover: true },
    }),
  ]);

  return prisma.buildingImage.findUnique({
    where: { id: imageId },
  });
}

export async function removeBuildingImage(
  buildingId: string,
  imageId: string,
  _user: CurrentUser,
) {
  const image = await prisma.buildingImage.findFirst({
    where: { id: imageId, buildingId },
  });

  if (!image) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Building image not found.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.buildingImage.delete({
      where: { id: imageId },
    });

    if (image.isCover) {
      const nextImage = await tx.buildingImage.findFirst({
        where: { buildingId },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });

      if (nextImage) {
        await tx.buildingImage.update({
          where: { id: nextImage.id },
          data: { isCover: true },
        });
      }
    }
  });

  try {
    await deleteImage(image.publicId);
  } catch {
    // Database deletion succeeded; Cloudinary cleanup can be retried.
  }

  return {
    id: image.id,
    message: "Building image deleted.",
  };
}

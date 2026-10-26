import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { HTTP_STATUS } from "../../constants/http-status";
import * as buildingImageService from "./building-image.service";

export const uploadBuildingImages = asyncHandler(
  async (req: Request, res: Response) => {
    const files = (req.files ?? []) as Express.Multer.File[];

    const images = await buildingImageService.uploadBuildingImages(
      req.params.id as string,
      files,
    );

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: images,
    });
  },
);

export const listBuildingImages = asyncHandler(
  async (req: Request, res: Response) => {
    const images = await buildingImageService.listBuildingImages(
      req.params.id as string,
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: images,
    });
  },
);

export const setBuildingCover = asyncHandler(
  async (req: Request, res: Response) => {
    const image = await buildingImageService.setBuildingCover(
      req.params.id as string,
      req.params.imageId as string,
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: image,
    });
  },
);

export const removeBuildingImage = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await buildingImageService.removeBuildingImage(
      req.params.id as string,
      req.params.imageId as string,
      req.user!,
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  },
);

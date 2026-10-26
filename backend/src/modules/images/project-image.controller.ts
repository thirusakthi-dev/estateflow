import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { HTTP_STATUS } from "../../constants/http-status";
import * as projectImageService from "./project-image.service";

export const uploadProjectImages = asyncHandler(
  async (req: Request, res: Response) => {
    const files = (req.files ?? []) as Express.Multer.File[];

    const images = await projectImageService.uploadProjectImages(
      req.params.id as string,
      files,
    );

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: images,
    });
  },
);

export const listProjectImages = asyncHandler(
  async (req: Request, res: Response) => {
    const images = await projectImageService.listProjectImages(
      req.params.id as string,
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: images,
    });
  },
);

export const setProjectCover = asyncHandler(
  async (req: Request, res: Response) => {
    const image = await projectImageService.setProjectCover(
      req.params.id as string,
      req.params.imageId as string,
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: image,
    });
  },
);

export const removeProjectImage = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await projectImageService.removeProjectImage(
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

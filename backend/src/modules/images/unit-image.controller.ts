import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { HTTP_STATUS } from "../../constants/http-status";
import * as unitImageService from "./unit-image.service";

export const uploadUnitImages = asyncHandler(
  async (req: Request, res: Response) => {
    const files = (req.files ?? []) as Express.Multer.File[];

    const images = await unitImageService.uploadUnitImages(
      req.params.id!,
      files,
    );

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Unit images uploaded successfully.",
      data: { images },
    });
  },
);

export const listUnitImages = asyncHandler(
  async (req: Request, res: Response) => {
    const images = await unitImageService.listUnitImages(req.params.id!);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { images },
    });
  },
);

export const setUnitCover = asyncHandler(
  async (req: Request, res: Response) => {
    const image = await unitImageService.setUnitCover(
      req.params.id!,
      req.params.imageId!,
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Unit cover image updated successfully.",
      data: { image },
    });
  },
);

export const removeUnitImage = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await unitImageService.removeUnitImage(
      req.params.id!,
      req.params.imageId!,
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  },
);

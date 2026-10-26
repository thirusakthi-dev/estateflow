import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status";
import { asyncHandler } from "../../utils/async-handler";
import * as unitService from "./unit.service";

export const createUnit = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files ?? []) as Express.Multer.File[];
  const unit = await unitService.createUnit(req.body, files);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Property unit created successfully.",
    data: { unit },
  });
});

export const listUnits = asyncHandler(async (req: Request, res: Response) => {
  const result = await unitService.listUnits(req.query);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Property units retrieved successfully.",
    data: result,
  });
});

export const getUnitById = asyncHandler(async (req: Request, res: Response) => {
  const unit = await unitService.getUnitById(req.params.id!);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Property unit retrieved successfully.",
    data: { unit },
  });
});

export const updateUnit = asyncHandler(async (req: Request, res: Response) => {
  const unit = await unitService.updateUnit(req.params.id!, req.body);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Property unit updated successfully.",
    data: { unit },
  });
});

export const deleteUnit = asyncHandler(async (req: Request, res: Response) => {
  const result = await unitService.deleteUnit(req.params.id!);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Property unit deleted successfully.",
    data: result,
  });
});

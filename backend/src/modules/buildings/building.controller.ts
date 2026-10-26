import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status";
import { asyncHandler } from "../../utils/async-handler";
import * as buildingService from "./building.service";

export const createBuilding = asyncHandler(
  async (req: Request, res: Response) => {
    const files = (req.files ?? []) as Express.Multer.File[];

    const building = await buildingService.createBuilding(req.body, files);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Building created successfully.",
      data: { building },
    });
  },
);

export const listBuildings = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await buildingService.listBuildings(req.query);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Buildings retrieved successfully.",
      data: result,
    });
  },
);

export const getBuildingById = asyncHandler(
  async (req: Request, res: Response) => {
    const building = await buildingService.getBuildingById(req.params.id!);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Building retrieved successfully.",
      data: { building },
    });
  },
);

export const updateBuilding = asyncHandler(
  async (req: Request, res: Response) => {
    const building = await buildingService.updateBuilding(
      req.params.id!,
      req.body,
      req.files as Express.Multer.File[],
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Building updated successfully.",
      data: { building },
    });
  },
);

export const deleteBuilding = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await buildingService.deleteBuilding(req.params.id!);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Building deleted successfully.",
      data: result,
    });
  },
);

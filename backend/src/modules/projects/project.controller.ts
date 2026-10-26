import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status";
import { asyncHandler } from "../../utils/async-handler";
import * as projectService from "./project.service";

export const createProject = asyncHandler(
  async (req: Request, res: Response) => {
    const files = (req.files ?? []) as Express.Multer.File[];

    const project = await projectService.createProject(req.body, files);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Project created successfully.",
      data: { project },
    });
  },
);

export const listProjects = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await projectService.listProjects(req.query);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Projects retrieved successfully.",
      data: result,
    });
  },
);

export const getProjectById = asyncHandler(
  async (req: Request, res: Response) => {
    const project = await projectService.getProjectById(req.params.id!);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Project retrieved successfully.",
      data: { project },
    });
  },
);

export const updateProject = asyncHandler(
  async (req: Request, res: Response) => {
    const project = await projectService.updateProject(
      req.params.id!,
      req.body,
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Project updated successfully.",
      data: { project },
    });
  },
);
export const deleteProject = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await projectService.deleteProject(req.params.id!);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Project deleted successfully.",
      data: result,
    });
  },
);

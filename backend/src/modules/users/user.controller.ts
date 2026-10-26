import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status";
import { asyncHandler } from "../../utils/async-handler";
import * as userService from "./user.service";

export const createEmployee = asyncHandler(
  async (req: Request, res: Response) => {
    const employee = await userService.createEmployee(req.body);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Sales employee created successfully.",
      data: { user: employee },
    });
  },
);

export const listEmployees = asyncHandler(
  async (_req: Request, res: Response) => {
    const employees = await userService.listEmployees();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { users: employees },
    });
  },
);

export const getEmployeeById = asyncHandler(
  async (req: Request, res: Response) => {
    const employee = await userService.getEmployeeById(req.params.id!);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { user: employee },
    });
  },
);

export const updateEmployee = asyncHandler(
  async (req: Request, res: Response) => {
    const employee = await userService.updateEmployee(req.params.id!, req.body);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Sales employee updated successfully.",
      data: { user: employee },
    });
  },
);

export const updateEmployeeStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const employee = await userService.updateEmployeeStatus(
      req.params.id!,
      req.body,
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Sales employee status updated successfully.",
      data: { user: employee },
    });
  },
);

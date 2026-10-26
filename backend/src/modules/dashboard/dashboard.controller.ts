import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status";
import { asyncHandler } from "../../utils/async-handler";
import * as dashboardService from "./dashboard.service";

export const getDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    const dashboard = await dashboardService.getDashboard(req.user!);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { dashboard },
    });
  },
);

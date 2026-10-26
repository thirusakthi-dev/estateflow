import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status";
import { asyncHandler } from "../../utils/async-handler";
import * as followUpService from "./follow-up.service";

export const createFollowUp = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await followUpService.createFollowUp(req.user!, req.body);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: result,
    });
  },
);

export const listFollowUps = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await followUpService.listFollowUps(req.user!, req.query);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  },
);

export const updateFollowUp = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await followUpService.updateFollowUp(
      req.params.id as string,
      req.user!,
      req.body,
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  },
);

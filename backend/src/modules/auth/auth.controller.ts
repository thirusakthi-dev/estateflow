import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status";
import { asyncHandler } from "../../utils/async-handler";
import * as authService from "./auth.service";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Login successful.",
    data: result,
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getProfile(req.user!.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Current user retrieved successfully.",
    data: { user },
  });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.updateProfile(req.user!.id, req.body);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Profile updated successfully.",
    data: { user },
  });
});

export const changeMyPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await authService.changePassword(req.user!.id, req.body);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message,
    });
  },
);

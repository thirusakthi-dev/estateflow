import type { ErrorRequestHandler } from "express";
import multer from "multer";

import { env } from "../config/env";
import { ApiError } from "../utils/api-error";
import { normalizePrismaError } from "../utils/prisma-error";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
) => {
  // Handle Multer upload errors
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({
        success: false,
        message: "Image is too large. Maximum size is 10 MB per image.",
      });
      return;
    }

    if (
      error.code === "LIMIT_FILE_COUNT" ||
      error.code === "LIMIT_UNEXPECTED_FILE"
    ) {
      res.status(400).json({
        success: false,
        message: "Too many images uploaded. Maximum is 10 images.",
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // Handle Prisma errors
  const prismaError = normalizePrismaError(error);
  const normalized = prismaError ?? error;

  const statusCode =
    normalized instanceof ApiError ? normalized.statusCode : 500;

  const message =
    normalized instanceof ApiError
      ? normalized.message
      : "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(normalized instanceof ApiError && normalized.details !== undefined
      ? { details: normalized.details }
      : {}),
    ...(env.NODE_ENV === "development" && normalized instanceof Error
      ? { stack: normalized.stack }
      : {}),
  });
};

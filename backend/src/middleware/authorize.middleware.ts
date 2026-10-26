import type { RequestHandler } from "express";
import { HTTP_STATUS } from "../constants/http-status";
import { ApiError } from "../utils/api-error";

export function authorize(...allowedRoles: string[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new ApiError(HTTP_STATUS.UNAUTHORIZED, "Authentication required."));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new ApiError(
          HTTP_STATUS.FORBIDDEN,
          "You do not have permission to perform this action.",
        ),
      );
      return;
    }

    next();
  };
}

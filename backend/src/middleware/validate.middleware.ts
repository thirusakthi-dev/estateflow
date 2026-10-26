import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/api-error";

type RequestPart = "body" | "query" | "params";

export function validate(
  part: RequestPart,
  schema: ZodType
): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      next(new ApiError(400, "Validation failed.", result.error.flatten()));
      return;
    }

    req.validated ??= {};
    req.validated[part] = result.data;
    next();
  };
}
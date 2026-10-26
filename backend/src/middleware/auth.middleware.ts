import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { HTTP_STATUS } from "../constants/http-status";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/api-error";

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Authentication required.");
    }

    let decoded: string | jwt.JwtPayload;

    try {
      decoded = jwt.verify(authorization.slice(7), env.JWT_SECRET);
    } catch {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid or expired token.");
    }

    if (typeof decoded === "string" || typeof decoded.sub !== "string") {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid token payload.");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "User account is unavailable.",
      );
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

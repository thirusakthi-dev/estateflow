import { Prisma } from "../generated/prisma/client";
import { ApiError } from "./api-error";

export function normalizePrismaError(error: unknown): ApiError | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return null;
  }

  switch (error.code) {
    case "P2002":
      return new ApiError(
        409,
        "A record with this value already exists.",
        error.meta,
      );

    case "P2025":
      return new ApiError(404, "The requested record was not found.");

    case "P2003":
      return new ApiError(
        400,
        "The operation violates a related-record constraint.",
      );

    default:
      return null;
  }
}

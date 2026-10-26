import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { HTTP_STATUS } from "../../constants/http-status";
import { ApiError } from "../../utils/api-error";
import {
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "./auth.validator";

const profileSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatarUrl: true,
  linkedinUrl: true,
  websiteUrl: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function login(input: unknown) {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Valid email and password are required.",
      parsed.error.flatten(),
    );
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid email or password.");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid email or password.");
  }

  const token = jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect,
  });

  if (!user || !user.isActive) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "User account is unavailable.",
    );
  }

  return user;
}

export async function updateProfile(userId: string, input: unknown) {
  const parsed = updateProfileSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid profile details.",
      parsed.error.flatten(),
    );
  }

  const data = parsed.data;
  const email = data.email?.toLowerCase();

  if (email) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId },
      },
      select: { id: true },
    });

    if (existingUser) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "This email address is already in use.",
      );
    }
  }

  if (data.phone) {
    const existingUser = await prisma.user.findFirst({
      where: {
        phone: data.phone,
        id: { not: userId },
      },
      select: { id: true },
    });

    if (existingUser) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "This phone number is already in use.",
      );
    }
  }

  try {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        ...(email ? { email } : {}),
      },
      select: profileSelect,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "The email address or phone number is already in use.",
      );
    }

    throw error;
  }
}

export async function changePassword(userId: string, input: unknown) {
  const parsed = changePasswordSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid password details.",
      parsed.error.flatten(),
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      passwordHash: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "User account is unavailable.",
    );
  }

  const passwordMatches = await bcrypt.compare(
    currentPassword,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Current password is incorrect.",
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { message: "Password changed successfully." };
}

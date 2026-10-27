import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/api-error";
import { HTTP_STATUS } from "../../constants/http-status";
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from "./user.validator";

const employeeSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function createEmployee(input: unknown) {
  const parsed = createUserSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid employee details.",
      parsed.error.flatten(),
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Email is already registered.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  return prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "SALES_EMPLOYEE",
    },
    select: employeeSelect,
  });
}

export async function listEmployees() {
  return prisma.user.findMany({
    where: { role: "SALES_EMPLOYEE" },
    select: employeeSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getEmployeeById(id: string) {
  const employee = await prisma.user.findFirst({
    where: {
      id,
      role: "SALES_EMPLOYEE",
    },
    select: employeeSelect,
  });

  if (!employee) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Sales employee not found.");
  }

  return employee;
}

export async function updateEmployee(id: string, input: unknown) {
  const parsed = updateUserSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid employee details.",
      parsed.error.flatten(),
    );
  }

  const employee = await getEmployeeById(id);
  const { name, email, password } = parsed.data;

  if (email && email !== employee.email) {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ApiError(HTTP_STATUS.CONFLICT, "Email is already registered.");
    }
  }

  const data: {
    name?: string;
    email?: string;
    passwordHash?: string;
  } = {};

  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;

  if (password) {
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  return prisma.user.update({
    where: { id: employee.id },
    data,
    select: employeeSelect,
  });
}

export async function updateEmployeeStatus(id: string, input: unknown) {
  const parsed = updateUserStatusSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "isActive must be a boolean.");
  }

  const employee = await getEmployeeById(id);

  return prisma.user.update({
    where: { id: employee.id },
    data: { isActive: parsed.data.isActive },
    select: employeeSelect,
  });
}

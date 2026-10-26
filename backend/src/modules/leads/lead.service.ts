import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/api-error";
import { HTTP_STATUS } from "../../constants/http-status";
import type { AuthUser } from "../../types/auth.types";
import {
  createLeadSchema,
  updateLeadSchema,
  assignLeadSchema,
  listLeadsSchema,
} from "./lead.validator";

const leadSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  source: true,
  stage: true,
  assignedToId: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
  assignedTo: {
    select: { id: true, name: true, email: true },
  },
  createdBy: {
    select: { id: true, name: true, email: true },
  },
} as const;

function leadAccess(user: AuthUser) {
  return user.role === "ADMIN" ? {} : { assignedToId: user.id };
}

async function ensureEmployee(id: string) {
  const employee = await prisma.user.findFirst({
    where: {
      id,
      role: "SALES_EMPLOYEE",
      isActive: true,
    },
    select: { id: true },
  });

  if (!employee) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "An active sales employee is required.",
    );
  }

  return employee;
}

async function ensureLeadAccess(id: string, user: AuthUser) {
  const lead = await prisma.lead.findFirst({
    where: { id, ...leadAccess(user) },
    select: { id: true },
  });

  if (!lead) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Lead not found.");
  }
}

export async function createLead(input: unknown, user: AuthUser) {
  if (user.role !== "ADMIN") {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "Only admins can create leads.");
  }

  const parsed = createLeadSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid lead details.",
      parsed.error.flatten(),
    );
  }

  const { assignedToId, ...details } = parsed.data;

  if (assignedToId) {
    await ensureEmployee(assignedToId);
  }

  return prisma.lead.create({
    data: {
      ...details,
      assignedToId: assignedToId ?? null,
      createdById: user.id,
    },
    select: leadSelect,
  });
}

export async function listLeads(
  user: { id: string; role: string },
  query: unknown,
) {
  const parsed = listLeadsSchema.safeParse(query);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid lead filters.",
      parsed.error.flatten(),
    );
  }

  const { search, stage, assignedToId, page, limit } = parsed.data;

  if (user.role !== "ADMIN" && assignedToId && assignedToId !== user.id) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "You can only view your assigned leads.",
    );
  }

  const accessFilter = user.role === "ADMIN" ? {} : { assignedToId: user.id };

  const where = {
    ...accessFilter,
    ...(stage ? { stage } : {}),
    ...(assignedToId && user.role === "ADMIN" ? { assignedToId } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: "desc" },
      select: leadSelect,
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    leads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getLeadById(id: string, user: AuthUser) {
  const lead = await prisma.lead.findFirst({
    where: { id, ...leadAccess(user) },
    select: leadSelect,
  });

  if (!lead) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Lead not found.");
  }

  return lead;
}

export async function updateLead(id: string, input: unknown, user: AuthUser) {
  const parsed = updateLeadSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid lead details.",
      parsed.error.flatten(),
    );
  }

  await ensureLeadAccess(id, user);

  return prisma.lead.update({
    where: { id },
    data: parsed.data,
    select: leadSelect,
  });
}

export async function assignLead(id: string, input: unknown, user: AuthUser) {
  if (user.role !== "ADMIN") {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, "Only admins can assign leads.");
  }

  const parsed = assignLeadSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "A valid assignedToId is required.",
      parsed.error.flatten(),
    );
  }

  await getLeadById(id, user);

  const { assignedToId } = parsed.data;

  if (assignedToId !== null) {
    await ensureEmployee(assignedToId);
  }

  return prisma.lead.update({
    where: { id },
    data: { assignedToId },
    select: leadSelect,
  });
}

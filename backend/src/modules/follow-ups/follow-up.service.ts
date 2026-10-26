import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/api-error";
import { HTTP_STATUS } from "../../constants/http-status";
import {
  createFollowUpSchema,
  updateFollowUpSchema,
  listFollowUpsSchema,
} from "./follow-up.validator";

type CurrentUser = {
  id: string;
  role: string;
};

const followUpSelect = {
  id: true,
  leadId: true,
  assignedToId: true,
  scheduledAt: true,
  status: true,
  outcome: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  lead: {
    select: {
      id: true,
      name: true,
      phone: true,
      stage: true,
    },
  },
  assignedTo: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.FollowUpSelect;

const outcomeToLeadStage = {
  CALL_BACK: null,
  INTERESTED: "INTERESTED",
  SITE_VISIT_PLANNED: "SITE_VISIT",
  NEGOTIATION: "NEGOTIATION",
  NOT_INTERESTED: "LOST",
  READY_TO_BOOK: null,
} as const;

async function getAccessibleFollowUp(id: string, user: CurrentUser) {
  const followUp = await prisma.followUp.findUnique({
    where: { id },
    select: {
      id: true,
      leadId: true,
      assignedToId: true,
      status: true,
      outcome: true,
      lead: {
        select: {
          assignedToId: true,
        },
      },
    },
  });

  if (!followUp) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Follow-up not found.");
  }

  if (user.role !== "ADMIN" && followUp.lead.assignedToId !== user.id) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "You can only access follow-ups for your assigned leads.",
    );
  }

  return followUp;
}

export async function createFollowUp(user: CurrentUser, input: unknown) {
  const parsed = createFollowUpSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid follow-up data.",
      parsed.error.flatten(),
    );
  }

  const { leadId, assignedToId, scheduledAt, notes } = parsed.data;

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      id: true,
      assignedToId: true,
    },
  });

  if (!lead) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, "Lead not found.");
  }

  if (user.role !== "ADMIN" && lead.assignedToId !== user.id) {
    throw new ApiError(
      HTTP_STATUS.FORBIDDEN,
      "You can only schedule follow-ups for your assigned leads.",
    );
  }

  const targetUserId =
    user.role === "ADMIN" ? (assignedToId ?? lead.assignedToId) : user.id;

  if (!targetUserId) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Assign the lead to a sales employee before scheduling a follow-up.",
    );
  }

  const employee = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      role: true,
      isActive: true,
    },
  });

  if (!employee || employee.role !== "SALES_EMPLOYEE" || !employee.isActive) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Assigned employee is invalid or inactive.",
    );
  }

  return prisma.followUp.create({
    data: {
      leadId,
      assignedToId: targetUserId,
      scheduledAt,
      notes,
    },
    select: followUpSelect,
  });
}

export async function listFollowUps(user: CurrentUser, input: unknown) {
  const parsed = listFollowUpsSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid follow-up filters.",
      parsed.error.flatten(),
    );
  }

  const { status, leadId, from, to, page, limit } = parsed.data;

  const conditions: Prisma.FollowUpWhereInput[] = [];

  if (user.role !== "ADMIN") {
    conditions.push({
      OR: [{ assignedToId: user.id }, { lead: { assignedToId: user.id } }],
    });
  }

  if (status) {
    conditions.push({ status });
  }

  if (leadId) {
    conditions.push({ leadId });
  }

  if (from || to) {
    conditions.push({
      scheduledAt: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    });
  }

  const where: Prisma.FollowUpWhereInput = {
    AND: conditions,
  };

  const [followUps, total] = await Promise.all([
    prisma.followUp.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { scheduledAt: "asc" },
      select: followUpSelect,
    }),
    prisma.followUp.count({ where }),
  ]);

  return {
    followUps,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateFollowUp(
  id: string,
  user: CurrentUser,
  input: unknown,
) {
  const parsed = updateFollowUpSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid follow-up update.",
      parsed.error.flatten(),
    );
  }

  const existing = await getAccessibleFollowUp(id, user);
  const { outcome, status, ...otherUpdates } = parsed.data;

  const outcomeProvided = outcome !== undefined;
  const outcomeChanged = outcomeProvided && outcome !== existing.outcome;
  const finalStatus = status ?? existing.status;

  if (outcomeProvided && finalStatus !== "COMPLETED") {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Complete the follow-up before recording its outcome.",
    );
  }

  return prisma.$transaction(async (tx) => {
    const followUp = await tx.followUp.update({
      where: { id },
      data: {
        ...otherUpdates,
        ...(status !== undefined ? { status } : {}),
        ...(outcomeProvided ? { outcome } : {}),
      },
      select: followUpSelect,
    });

    if (outcomeChanged && outcome) {
      const nextStage = outcomeToLeadStage[outcome];

      if (nextStage) {
        await tx.lead.updateMany({
          where: {
            id: existing.leadId,
            stage: { notIn: ["BOOKED", "LOST"] },
          },
          data: { stage: nextStage },
        });
      }
    }

    return followUp;
  });
}

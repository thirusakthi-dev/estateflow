import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/api-error";
import { HTTP_STATUS } from "../../constants/http-status";
import { createLeadNoteSchema } from "./note.validator";

type CurrentUser = {
  id: string;
  role: string;
};

async function getAccessibleLead(leadId: string, user: CurrentUser) {
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
      "You can only access notes for your assigned leads.",
    );
  }

  return lead;
}

export async function createNote(
  leadId: string,
  user: CurrentUser,
  input: unknown,
) {
  const parsed = createLeadNoteSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid note data.",
      parsed.error.flatten(),
    );
  }

  await getAccessibleLead(leadId, user);

  return prisma.leadNote.create({
    data: {
      leadId,
      authorId: user.id,
      content: parsed.data.content,
    },
    select: {
      id: true,
      leadId: true,
      content: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function listNotes(leadId: string, user: CurrentUser) {
  await getAccessibleLead(leadId, user);

  return prisma.leadNote.findMany({
    where: { leadId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      leadId: true,
      content: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export const FOLLOW_UP_STATUSES = [
  "PENDING",
  "COMPLETED",
  "CANCELLED",
] as const;

export type FollowUpStatus = (typeof FOLLOW_UP_STATUSES)[number];

export const FOLLOW_UP_OUTCOMES = [
  "CALL_BACK",
  "INTERESTED",
  "SITE_VISIT_PLANNED",
  "NEGOTIATION",
  "NOT_INTERESTED",
  "READY_TO_BOOK",
] as const;

export type FollowUpOutcome = (typeof FOLLOW_UP_OUTCOMES)[number];

export type FollowUpLead = {
  id: string;
  name: string;
  phone: string;
  stage: string;
};

export type FollowUpEmployee = {
  id: string;
  name: string;
  email: string;
};

export type FollowUp = {
  id: string;
  leadId: string;
  assignedToId: string;
  scheduledAt: string;
  status: FollowUpStatus;
  outcome: FollowUpOutcome | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  lead: FollowUpLead;
  assignedTo: FollowUpEmployee;
};

export type FollowUpFilters = {
  status?: FollowUpStatus;
  leadId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export type FollowUpsResponse = {
  followUps: FollowUp[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type CreateFollowUpInput = {
  leadId: string;
  assignedToId?: string;
  scheduledAt: string;
  notes?: string;
};

export type UpdateFollowUpInput = {
  scheduledAt?: string;
  notes?: string | null;
  status?: FollowUpStatus;
  outcome?: FollowUpOutcome;
};

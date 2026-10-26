import { z } from "zod";

export const createLeadNoteSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

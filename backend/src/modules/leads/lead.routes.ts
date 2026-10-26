import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import {
  createLead,
  listLeads,
  getLeadById,
  updateLead,
  assignLead,
} from "./lead.controller";

export const leadRouter = Router();

leadRouter.use(authenticate);

leadRouter.post("/", authorize("ADMIN"), createLead);
leadRouter.get("/", listLeads);
leadRouter.get("/:id", getLeadById);
leadRouter.patch("/:id", updateLead);
leadRouter.patch("/:id/assignment", authorize("ADMIN"), assignLead);

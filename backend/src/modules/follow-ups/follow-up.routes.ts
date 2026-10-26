import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import {
  createFollowUp,
  listFollowUps,
  updateFollowUp,
} from "./follow-up.controller";

export const followUpRouter = Router();

followUpRouter.use(authenticate);

followUpRouter.post("/", createFollowUp);
followUpRouter.get("/", listFollowUps);
followUpRouter.patch("/:id", updateFollowUp);

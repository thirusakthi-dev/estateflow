import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { uploadImages } from "../../middleware/image-upload-middleware";
import {
  createUnit,
  listUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
} from "./unit.controller";

export const unitRouter = Router();

unitRouter.use(authenticate);

unitRouter.get("/", listUnits);
unitRouter.get("/:id", getUnitById);

unitRouter.post("/", authorize("ADMIN"), uploadImages, createUnit);
unitRouter.patch("/:id", authorize("ADMIN"), updateUnit);
unitRouter.delete("/:id", authorize("ADMIN"), deleteUnit);

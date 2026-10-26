import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { uploadImages } from "../../middleware/image-upload-middleware";

import {
  createBuilding,
  listBuildings,
  getBuildingById,
  updateBuilding,
  deleteBuilding,
} from "./building.controller";

import { buildingImageRouter } from "../images/building-image.routes";

export const buildingRouter = Router();

buildingRouter.use(authenticate);

buildingRouter.get("/", listBuildings);

// Register image routes before /:id.
buildingRouter.use("/:id/images", buildingImageRouter);

buildingRouter.get("/:id", getBuildingById);

buildingRouter.post("/", authorize("ADMIN"), uploadImages, createBuilding);
buildingRouter.patch("/:id", authorize("ADMIN"), uploadImages, updateBuilding);
buildingRouter.delete("/:id", authorize("ADMIN"), deleteBuilding);

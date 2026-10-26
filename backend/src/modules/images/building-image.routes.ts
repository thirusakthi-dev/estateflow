import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { uploadImages } from "../../middleware/image-upload-middleware";
import {
  uploadBuildingImages,
  listBuildingImages,
  setBuildingCover,
  removeBuildingImage,
} from "./building-image.controller";

export const buildingImageRouter = Router({ mergeParams: true });

buildingImageRouter.use(authenticate);

buildingImageRouter.get("/", listBuildingImages);

buildingImageRouter.post(
  "/",
  authorize("ADMIN"),
  uploadImages,
  uploadBuildingImages,
);

buildingImageRouter.patch(
  "/:imageId/cover",
  authorize("ADMIN"),
  setBuildingCover,
);

buildingImageRouter.delete(
  "/:imageId",
  authorize("ADMIN"),
  removeBuildingImage,
);

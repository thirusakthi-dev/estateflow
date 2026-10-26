import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { uploadImages } from "../../middleware/image-upload-middleware";
import {
  uploadProjectImages,
  listProjectImages,
  setProjectCover,
  removeProjectImage,
} from "./project-image.controller";

export const projectImageRouter = Router({ mergeParams: true });

projectImageRouter.use(authenticate);

projectImageRouter.get("/", listProjectImages);

projectImageRouter.post(
  "/",
  authorize("ADMIN"),
  uploadImages,
  uploadProjectImages,
);

projectImageRouter.patch(
  "/:imageId/cover",
  authorize("ADMIN"),
  setProjectCover,
);

projectImageRouter.delete("/:imageId", authorize("ADMIN"), removeProjectImage);

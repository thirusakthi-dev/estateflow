import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { uploadImages } from "../../middleware/image-upload-middleware";
import {
  uploadUnitImages,
  listUnitImages,
  setUnitCover,
  removeUnitImage,
} from "./unit-image.controller";

export const unitImageRouter = Router({ mergeParams: true });

unitImageRouter.use(authenticate);

unitImageRouter.get("/", listUnitImages);

unitImageRouter.post("/", authorize("ADMIN"), uploadImages, uploadUnitImages);

unitImageRouter.patch("/:imageId/cover", authorize("ADMIN"), setUnitCover);

unitImageRouter.delete("/:imageId", authorize("ADMIN"), removeUnitImage);

import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import { uploadImages } from "../../middleware/image-upload-middleware";
import {
  createProject,
  listProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "./project.controller";

const projectRouter = Router();

projectRouter.use(authenticate);

projectRouter.get("/", listProjects);
projectRouter.get("/:id", getProjectById);

projectRouter.post("/", authorize("ADMIN"), uploadImages, createProject);

projectRouter.patch("/:id", authorize("ADMIN"), uploadImages, updateProject);

projectRouter.delete("/:id", authorize("ADMIN"), deleteProject);

export { projectRouter };

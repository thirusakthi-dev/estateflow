import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/authorize.middleware";
import {
  createEmployee,
  listEmployees,
  getEmployeeById,
  updateEmployee,
  updateEmployeeStatus,
} from "./user.controller";

export const userRouter = Router();

userRouter.use(authenticate, authorize("ADMIN"));

userRouter.post("/", createEmployee);
userRouter.get("/", listEmployees);
userRouter.get("/:id", getEmployeeById);
userRouter.patch("/:id", updateEmployee);
userRouter.patch("/:id/status", updateEmployeeStatus);

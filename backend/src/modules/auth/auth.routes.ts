import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { login, getMe, updateMe, changeMyPassword } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/login", login);

authRouter.get("/me", authenticate, getMe);
authRouter.patch("/me", authenticate, updateMe);
authRouter.patch("/me/password", authenticate, changeMyPassword);

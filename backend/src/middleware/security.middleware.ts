import type { RequestHandler } from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "../config/env";

export const securityHeaders = helmet();

export const corsMiddleware = cors({
  origin: env.FRONTEND_URL,
  credentials: true
}) as RequestHandler;
import express from "express";
import { apiRateLimit } from "./middleware/rate-limit.middleware";
import {
  corsMiddleware,
  securityHeaders,
} from "./middleware/security.middleware";
import { notFound } from "./middleware/not-found.middleware";
import { errorHandler } from "./middleware/error.middleware";
import { healthRouter } from "./routes/health.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { userRouter } from "./modules/users/user.routes";
import { projectRouter } from "./modules/projects/project.routes";
import { buildingRouter } from "./modules/buildings/building.routes";
import { unitRouter } from "./modules/units/unit.routes";
import { bookingRouter } from "./modules/bookings/booking.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";
import { noteRouter } from "./modules/notes/note.routes";
import { followUpRouter } from "./modules/follow-ups/follow-up.routes";
import { projectImageRouter } from "./modules/images/project-image.routes";
import { unitImageRouter } from "./modules/images/unit-image.routes";
import { setupSwagger } from "./config/swagger";
import { leadRouter } from "./modules/leads/lead.routes";

export const app = express();

app.disable("x-powered-by");
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend API is running",
    health: "/api/health",
  });
});

app.use("/api", apiRateLimit);
app.use("/api/auth", authRouter);
app.use("/api/health", healthRouter);
app.use("/api/users", userRouter);
app.use("/api/projects", projectRouter);
app.use("/api/buildings", buildingRouter);
app.use("/api/units", unitRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/leads", leadRouter);
app.use("/api/leads", noteRouter);
app.use("/api/follow-ups", followUpRouter);
app.use("/api/projects/:id/images", projectImageRouter);
app.use("/api/units/:id/images", unitImageRouter);

setupSwagger(app);

app.use(notFound);
app.use(errorHandler);

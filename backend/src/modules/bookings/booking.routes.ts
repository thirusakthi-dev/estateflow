import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import {
  createBooking,
  listBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
} from "./booking.controller";

export const bookingRouter = Router();

bookingRouter.use(authenticate);

bookingRouter.post("/", createBooking);
bookingRouter.get("/", listBookings);
bookingRouter.get("/:id", getBookingById);
bookingRouter.patch("/:id/cancel", cancelBooking);

bookingRouter.patch("/:id/status", authenticate, updateBookingStatus);

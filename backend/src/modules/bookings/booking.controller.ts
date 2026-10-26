import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status";
import { asyncHandler } from "../../utils/async-handler";
import * as bookingService from "./booking.service";

export const createBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const booking = await bookingService.createBooking(req.body, req.user!);

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Booking created successfully.",
      data: { booking },
    });
  },
);

export const listBookings = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await bookingService.listBookings(req.user!, req.query);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Bookings retrieved successfully.",
      data: result,
    });
  },
);

export const getBookingById = asyncHandler(
  async (req: Request, res: Response) => {
    const booking = await bookingService.getBookingById(
      req.params.id!,
      req.user!,
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Booking retrieved successfully.",
      data: { booking },
    });
  },
);

export const cancelBooking = asyncHandler(
  async (req: Request, res: Response) => {
    const booking = await bookingService.cancelBooking(
      req.params.id!,
      req.user!,
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Booking cancelled successfully.",
      data: { booking },
    });
  },
);

export const updateBookingStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const booking = await bookingService.updateBookingStatus(
      req.params.id!,
      req.body,
      req.user!,
    );

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Booking status updated successfully.",
      data: { booking },
    });
  },
);

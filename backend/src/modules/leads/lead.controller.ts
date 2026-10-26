import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status";
import { asyncHandler } from "../../utils/async-handler";
import * as leadService from "./lead.service";

export const createLead = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadService.createLead(req.body, req.user!);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Lead created successfully.",
    data: { lead },
  });
});

export const listLeads = asyncHandler(async (req: Request, res: Response) => {
  const result = await leadService.listLeads(req.user!, req.query);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

export const getLeadById = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadService.getLeadById(req.params.id!, req.user!);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { lead },
  });
});

export const updateLead = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadService.updateLead(
    req.params.id!,
    req.body,
    req.user!,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Lead updated successfully.",
    data: { lead },
  });
});

export const assignLead = asyncHandler(async (req: Request, res: Response) => {
  const lead = await leadService.assignLead(
    req.params.id!,
    req.body,
    req.user!,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Lead assignment updated successfully.",
    data: { lead },
  });
});

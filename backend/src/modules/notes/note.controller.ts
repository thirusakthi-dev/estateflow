import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../constants/http-status";
import { asyncHandler } from "../../utils/async-handler";
import * as noteService from "./note.service";

export const createNote = asyncHandler(async (req: Request, res: Response) => {
  const note = await noteService.createNote(
    req.params.id as string,
    req.user!,
    req.body,
  );

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: note,
  });
});

export const listNotes = asyncHandler(async (req: Request, res: Response) => {
  const notes = await noteService.listNotes(req.params.id as string, req.user!);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: notes,
  });
});

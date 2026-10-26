import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { createNote, listNotes } from "./note.controller";

export const noteRouter = Router();

noteRouter.use(authenticate);

noteRouter.post("/:id/notes", createNote);
noteRouter.get("/:id/notes", listNotes);

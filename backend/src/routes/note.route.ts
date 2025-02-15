import {Router} from "express"
import {
  createNoteController,
  updateNoteController,
  getAllNotesController,
  searchNotesController,
  moveToTrashController,
  deleteNoteController,
  restoreOrDeleteNoteController,
  updateNotePinnedController,
} from "../controllers/note.controller"

const noteRoutes = Router();

noteRoutes.post("/add", createNoteController)
noteRoutes.post("/edit/:noteId", updateNoteController)
noteRoutes.get("/all", getAllNotesController)
noteRoutes.put("/update-note-pinned/:noteId", updateNotePinnedController)
noteRoutes.get("/delete", deleteNoteController);
noteRoutes.put("/trash/:noteId", moveToTrashController);
noteRoutes.get("/search", searchNotesController)
noteRoutes.delete(
  "/delete-restore/:id?", restoreOrDeleteNoteController);

export default noteRoutes

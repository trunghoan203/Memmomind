import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  createNoteSchema,
  noteIdSchema,
  updateNoteSchema,
} from "../validation/note.validation";

import {
  createNoteService,
  deleteNoteService,
  getAllNotesService,
  getNoteByIdService,
  updateNoteService,
  searchNotesService,
  moveToTrashService,
  restoreOrDeleteNoteService,
  updateNotePinnedService
} from "../services/note.service";
import { HTTPSTATUS } from "../config/http.config";

export const createNoteController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = createNoteSchema.parse(req.body);

    const { note } = await createNoteService(userId, body);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Tạo Note mới thành công!",
      note,
    });
  }
);

export const updateNoteController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    try {
      const body = updateNoteSchema.parse(req.body);
      const noteId = noteIdSchema.parse(req.params.noteId);

      const { note } = await updateNoteService(userId, noteId, body);

      return res.status(HTTPSTATUS.OK).json({
        success: true,
        message: "Cập nhật Note thành công!",
        note,
      });
    } catch (error) {
      console.error("Validation Error:", error);
      return res.status(400).json({ message: "Validation failed", error });
    }
  }
);

export const updateNotePinnedController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      const noteId = noteIdSchema.parse(req.params.noteId);

      // Gọi service để cập nhật trạng thái isPinned
      const { note } = await updateNotePinnedService(userId, noteId);

      return res.status(HTTPSTATUS.OK).json({
        success: true,
        message: `Ghi chú đã được ${note.isPinned ? "ghim" : "bỏ ghim"} thành công!`,
        note,
      });
    } catch (error) {
      console.error("Error updating isPinned:", error);
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: "Lỗi khi cập nhật trạng thái ghim!",
        error: (error as Error).message,
      });
    }
  }
);

export const getAllNotesController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(HTTPSTATUS.UNAUTHORIZED).json({
          message: "User not authenticated",
        });
      }
      const filters: Record<string, any> = {
        keyword: req.query.keyword as string | undefined,
        tags: req.query.tags ? (req.query.tags as string).split(",") : undefined,
      };

      if (req.query.isPinned !== undefined) {
        filters.isPinned = req.query.isPinned === "true";
      }
      if (req.query.isDeleted !== undefined) {
        filters.isDeleted = req.query.isDeleted === "true";
      }

      console.log("Filters applied:", filters);

      const result = await getAllNotesService(userId, filters);

      console.log("Notes fetched:", result.notes.length); // Log số lượng note tìm thấy

      return res.status(HTTPSTATUS.OK).json({
        success: true,
        message: "All notes fetched successfully",
        ...result,
      });
    } catch (error) {
      console.error("Error in getAllNotesController:", error);
      return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: "Internal Server Error",
        error: (error as Error).message,
      });
    }
  }
);


export const getNoteByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const noteId = noteIdSchema.parse(req.params.id);

    const note = await getNoteByIdService(userId, noteId);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Note fetched successfully",
      note,
    });
  }
);

export const deleteNoteController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const noteId = noteIdSchema.parse(req.params.id);

    await deleteNoteService(userId, noteId);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Xóa Note thành công!",
    });
  }
);

export const searchNotesController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const keyword = req.query.keyword as string;

    const notes = await searchNotesService(userId, keyword);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Notes searched successfully",
      notes,
    });
  }
);

export const moveToTrashController = asyncHandler(
  async (req: Request, res: Response) => {
    const noteId = req.params.noteId;
    
    console.log("moveToTrashController - noteId:", noteId);

    try {
      await moveToTrashService(noteId);

      return res.status(HTTPSTATUS.OK).json({
        success: true,
        message: "Note đã được chuyển vào thùng rác!",
      });
    } catch (error) {
      console.error("Error in moveToTrashController:", error);
      return res.status(HTTPSTATUS.NOT_FOUND).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export const restoreOrDeleteNoteController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { actionType } = req.query;

    await restoreOrDeleteNoteService(id, actionType as string);

    return res.status(HTTPSTATUS.OK).json({
      success: true,
      message: "Operation performed successfully",
    });
  }
);

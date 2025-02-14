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
  restoreOrDeleteNoteService
} from "../services/note.service";
import { HTTPSTATUS } from "../config/http.config";

export const createNoteController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const body = createNoteSchema.parse(req.body);

    const { note } = await createNoteService(userId, body);

    return res.status(HTTPSTATUS.OK).json({
      message: "Note created successfully",
      note,
    });
  }
);

export const updateNoteController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    console.log("Request body received:", req.body);

    try {
      const body = updateNoteSchema.parse(req.body);
      const noteId = noteIdSchema.parse(req.params.noteId);

      const { note } = await updateNoteService(userId, noteId, body);

      return res.status(HTTPSTATUS.OK).json({
        message: "Note updated successfully",
        note,
      });
    } catch (error) {
      console.error("Validation Error:", error);
      return res.status(400).json({ message: "Validation failed", error });
    }
  }
);


export const getAllNotesController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;

      // Nếu không có userId, báo lỗi Unauthorized
      if (!userId) {
        return res.status(HTTPSTATUS.UNAUTHORIZED).json({
          message: "User not authenticated",
        });
      }

      // Xử lý các bộ lọc
      const filters: Record<string, any> = {
        keyword: req.query.keyword as string | undefined,
        tags: req.query.tags ? (req.query.tags as string).split(",") : undefined,
      };

      // Kiểm tra nếu query có giá trị hợp lệ
      if (req.query.isPinned !== undefined) {
        filters.isPinned = req.query.isPinned === "true";
      }
      if (req.query.isDeleted !== undefined) {
        filters.isDeleted = req.query.isDeleted === "true";
      }

      console.log("Filters applied:", filters); // Log kiểm tra filter

      // Gọi service để lấy danh sách ghi chú
      const result = await getAllNotesService(userId, filters);

      console.log("Notes fetched:", result.notes.length); // Log số lượng note tìm thấy

      return res.status(HTTPSTATUS.OK).json({
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
      message: "Note deleted successfully",
    });
  }
);

export const searchNotesController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const keyword = req.query.keyword as string;

    const notes = await searchNotesService(userId, keyword);

    return res.status(HTTPSTATUS.OK).json({
      message: "Notes searched successfully",
      notes,
    });
  }
);

export const moveToTrashController = asyncHandler(
  async (req: Request, res: Response) => {
    const noteId = req.params.noteId; // Đảm bảo lấy đúng `noteId`
    
    console.log("moveToTrashController - noteId:", noteId); // Debug ID

    try {
      await moveToTrashService(noteId);

      return res.status(HTTPSTATUS.OK).json({
        message: "Note moved to trash successfully",
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
      message: "Operation performed successfully",
    });
  }
);

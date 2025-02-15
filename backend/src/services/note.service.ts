import NoteModel from "../models/note.model";
import { NotFoundException } from "../utils/appError";
import mongoose from "mongoose";

export const createNoteService = async (
  userId: string,
  body: {
    title: string;
    content: string;
    tags?: string[];
    isPinned?: boolean;
  }
) => {
  const { title, content, tags, isPinned } = body;

  const note = new NoteModel({
    title,
    content,
    tags: tags || [],
    isPinned: isPinned || false,
    userId,
  });

  await note.save();
  return { note };
};

export const updateNoteService = async (
  userId: string,
  noteId: string,
  body: {
    title?: string;
    content?: string;
    tags?: string[];
    isPinned?: boolean;
    isDeleted?: boolean;
  }
) => {
  const note = await NoteModel.findOne({ _id: noteId, userId });
  if (!note) throw new NotFoundException("Note not found");

  Object.assign(note, body);
  await note.save();
  return { note };
};

export const getAllNotesService = async (
  userId: string,
  filters: {
    keyword?: string;
    tags?: string[];
    isPinned?: boolean;
    isDeleted?: boolean;
  }
) => {
  const query: Record<string, any> = { userId };

  if (filters.keyword) {
    query.title = { $regex: filters.keyword, $options: "i" };
  }
  if (filters.tags) {
    query.tags = { $in: filters.tags };
  }
  if (filters.isPinned !== undefined) {
    query.isPinned = filters.isPinned;
  }
  if (filters.isDeleted !== undefined) {
    query.isDeleted = filters.isDeleted;
  }

  const notes = await NoteModel.find(query).sort({ isPinned: -1, createdAt: -1 });

  return { notes };
};

export const updateNotePinnedService = async (userId: string, noteId: string) => {
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    throw new NotFoundException("Invalid note ID.");
  }

  const note = await NoteModel.findOne({ _id: noteId, userId });
  if (!note) throw new NotFoundException("Note not found.");

  note.isPinned = !note.isPinned;

  await note.save();

  return { note };
};

export const getNoteByIdService = async (userId: string, noteId: string) => {
  const note = await NoteModel.findOne({ _id: noteId, userId });
  if (!note) throw new NotFoundException("Note not found.");
  return note;
};

export const deleteNoteService = async (userId: string, noteId: string) => {
  const note = await NoteModel.findOneAndDelete({ _id: noteId, userId });
  if (!note) throw new NotFoundException("Note not found.");
};

// Service để tìm kiếm ghi chú theo từ khóa
export const searchNotesService = async (userId: string, keyword: string) => {
  const notes = await NoteModel.find({
    userId,
    $or: [
      { title: { $regex: keyword, $options: "i" } },
      { content: { $regex: keyword, $options: "i" } },
    ],
  }).sort({ createdAt: -1 });

  return notes;
};

// Service để di chuyển ghi chú vào thùng rác

export const moveToTrashService = async (noteId: string) => {
  // Kiểm tra xem noteId có phải ObjectId hợp lệ không
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    throw new NotFoundException("Invalid note ID.");
  }

  // Kiểm tra ghi chú có tồn tại không
  const note = await NoteModel.findById(noteId);
  if (!note) throw new NotFoundException("Note not found.");

  // Cập nhật trạng thái isDeleted
  note.isDeleted = true;
  await note.save();
};


// Service để khôi phục hoặc xóa vĩnh viễn ghi chú
export const restoreOrDeleteNoteService = async (noteId: string, actionType: string) => {
  const note = await NoteModel.findById(noteId);
  if (!note) throw new NotFoundException("Note not found.");

  if (actionType === "restore") {
    note.isDeleted = false;
    await note.save();
  } else if (actionType === "delete") {
    await NoteModel.findByIdAndDelete(noteId);
  } else {
    throw new Error("Invalid action type");
  }
};

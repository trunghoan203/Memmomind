import { z } from "zod";

export const titleSchema = z.string().trim().min(1).max(255);
export const contentSchema = z.string().trim().min(1);
export const tagsSchema = z.array(z.string().trim()).optional();
export const isPinnedSchema = z.boolean().optional();
export const isDeletedSchema = z.boolean().optional();
export const userIdSchema = z.string().trim().min(1);
export const noteIdSchema = z.string().trim().min(1);

export const createNoteSchema = z.object({
  title: titleSchema,
  content: contentSchema,
  tags: tagsSchema,
  // isPinned: isPinnedSchema,
  // userId: userIdSchema,
});

export const updateNoteSchema = z.object({
  title: titleSchema.optional(),  
  content: contentSchema.optional(), 
  tags: tagsSchema.optional(),
  // isPinned: isPinnedSchema.optional(),
});

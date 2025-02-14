import mongoose, { Document, Schema } from "mongoose";

export interface NoteDocument extends Document {
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isDeleted: boolean;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema < NoteDocument > (
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const NoteModel = mongoose.model < NoteDocument > ("Note", noteSchema);
export default NoteModel;

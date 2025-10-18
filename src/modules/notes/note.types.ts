import { z } from "zod";
import { Note } from "../../entities/Note";

export const CreateNoteSchema = z.object({
  patientId: z.coerce.number().int().positive("Patient ID must be a positive integer"),
  inputType: z.enum(["TEXT", "AUDIO"]).default("TEXT"),
  rawText: z.string().min(1, "Raw text must be valid").optional(),
  summary: z.string().optional(),
  audioUrl: z.string().url("Audio URL must be a valid URL").optional(),
  aiMeta: z.record(z.any()).optional()
});

export const UpdateNoteSchema = z.object({
  rawText: z.string().min(1, "Raw text is required").optional(),
  summary: z.string().optional(),
  audioUrl: z.string().url("Audio URL must be a valid URL").optional(),
  aiMeta: z.record(z.any()).optional(),
  status: z.enum(["CREATED", "PROCESSED", "FAILED"]).optional()
});

export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;

export interface NoteResponse {
  success: boolean;
  data?: Note;
  message?: string;
}

export interface NotesListResponse {
  success: boolean;
  data?: Note[];
  message?: string;
  total?: number;
}
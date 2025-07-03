import { z } from "zod";

// Case Note validation schema for forms
export const insertCaseNoteSchema = z.object({
  caseNumber: z.string().min(1, "Case number is required"),
  programArea: z.enum(["RCA", "Microfinance", "Legal Aid", "Community Outreach", "Emergency Response"], {
    required_error: "Program area is required",
  }),
  caseworkerId: z.string().min(1, "Caseworker is required"),
  clientName: z.string().min(1, "Client name is required"),
  clientAge: z.number().int().min(0).max(150).optional(),
  clientGender: z.enum(["Male", "Female", "Other", "Prefer not to say"]).optional(),
  notes: z.string().min(1, "Notes are required"),
  translationProvided: z.boolean().default(false),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]).default("Medium"),
});

// Attachment validation schema
export const insertAttachmentSchema = z.object({
  caseNoteId: z.number(),
  fileName: z.string().min(1),
  originalName: z.string().min(1),
  mimeType: z.string().min(1),
  fileSize: z.number().int().min(0),
});

// Types
export type InsertCaseNote = z.infer<typeof insertCaseNoteSchema>;
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;

// API response types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface CaseNote {
  id: number;
  caseNumber: string;
  programArea: string;
  caseworkerId: string;
  clientName: string;
  clientAge?: number;
  clientGender?: string;
  notes: string;
  translationProvided: boolean;
  followUpRequired: boolean;
  followUpDate?: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: number;
  caseNoteId: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface CaseNoteWithDetails extends CaseNote {
  caseworker: Pick<User, 'id' | 'firstName' | 'lastName' | 'role'> | null;
  attachments: Attachment[];
}
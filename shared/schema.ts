import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("caseworker"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Case notes table
export const caseNotes = pgTable("case_notes", {
  id: serial("id").primaryKey(),
  programArea: varchar("program_area").notNull(),
  caseworkerId: varchar("caseworker_id").notNull(),
  translationProvided: boolean("translation_provided").notNull(),
  narrative: text("narrative").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// File attachments table
export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  caseNoteId: integer("case_note_id").notNull(),
  fileName: varchar("file_name").notNull(),
  originalName: varchar("original_name").notNull(),
  mimeType: varchar("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Relations
export const caseNotesRelations = relations(caseNotes, ({ one, many }) => ({
  caseworker: one(users, {
    fields: [caseNotes.caseworkerId],
    references: [users.id],
  }),
  attachments: many(attachments),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  caseNote: one(caseNotes, {
    fields: [attachments.caseNoteId],
    references: [caseNotes.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  caseNotes: many(caseNotes),
}));

// Schemas
export const insertCaseNoteSchema = createInsertSchema(caseNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAttachmentSchema = createInsertSchema(attachments).omit({
  id: true,
  uploadedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertCaseNote = z.infer<typeof insertCaseNoteSchema>;
export type CaseNote = typeof caseNotes.$inferSelect;
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;
export type Attachment = typeof attachments.$inferSelect;

// Extended types for API responses
export type CaseNoteWithDetails = CaseNote & {
  caseworker: Pick<User, 'id' | 'firstName' | 'lastName' | 'role'> | null;
  attachments: Attachment[];
};

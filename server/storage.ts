import {
  users,
  caseNotes,
  attachments,
  type User,
  type UpsertUser,
  type InsertCaseNote,
  type CaseNote,
  type CaseNoteWithDetails,
  type InsertAttachment,
  type Attachment,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, ilike, gte, lte, count } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Case note operations
  createCaseNote(caseNote: InsertCaseNote): Promise<CaseNote>;
  getCaseNotes(filters?: {
    programArea?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    sortBy?: 'newest' | 'oldest' | 'program' | 'caseworker';
    limit?: number;
    offset?: number;
  }): Promise<{ notes: CaseNoteWithDetails[]; total: number }>;
  getCaseNote(id: number): Promise<CaseNoteWithDetails | undefined>;
  updateCaseNote(id: number, updates: Partial<InsertCaseNote>): Promise<CaseNote>;
  deleteCaseNote(id: number): Promise<void>;

  // Attachment operations
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  getAttachments(caseNoteId: number): Promise<Attachment[]>;
  deleteAttachment(id: number): Promise<void>;

  // Statistics
  getDashboardStats(caseworkerId?: string): Promise<{
    totalNotes: number;
    todayNotes: number;
    rcaCases: number;
    translationsProvided: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Case note operations
  async createCaseNote(caseNoteData: InsertCaseNote): Promise<CaseNote> {
    const [caseNote] = await db
      .insert(caseNotes)
      .values(caseNoteData)
      .returning();
    return caseNote;
  }

  async getCaseNotes(filters: {
    programArea?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    sortBy?: 'newest' | 'oldest' | 'program' | 'caseworker';
    limit?: number;
    offset?: number;
  } = {}): Promise<{ notes: CaseNoteWithDetails[]; total: number }> {
    const {
      programArea,
      search,
      startDate,
      endDate,
      sortBy = 'newest',
      limit = 10,
      offset = 0,
    } = filters;

    const conditions = [];
    
    if (programArea) {
      conditions.push(eq(caseNotes.programArea, programArea));
    }
    
    if (search) {
      conditions.push(ilike(caseNotes.narrative, `%${search}%`));
    }
    
    if (startDate) {
      conditions.push(gte(caseNotes.createdAt, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(caseNotes.createdAt, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Determine sort order
    let orderBy;
    switch (sortBy) {
      case 'oldest':
        orderBy = asc(caseNotes.createdAt);
        break;
      case 'program':
        orderBy = asc(caseNotes.programArea);
        break;
      case 'caseworker':
        orderBy = asc(users.lastName);
        break;
      default:
        orderBy = desc(caseNotes.createdAt);
    }

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(caseNotes)
      .where(whereClause);

    // Get notes with details
    const notes = await db
      .select({
        id: caseNotes.id,
        programArea: caseNotes.programArea,
        caseworkerId: caseNotes.caseworkerId,
        translationProvided: caseNotes.translationProvided,
        narrative: caseNotes.narrative,
        createdAt: caseNotes.createdAt,
        updatedAt: caseNotes.updatedAt,
        caseworker: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
        },
      })
      .from(caseNotes)
      .leftJoin(users, eq(caseNotes.caseworkerId, users.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get attachments for each note
    const notesWithAttachments = await Promise.all(
      notes.map(async (note) => {
        const noteAttachments = await this.getAttachments(note.id);
        return {
          ...note,
          attachments: noteAttachments,
        } as CaseNoteWithDetails;
      })
    );

    return { notes: notesWithAttachments, total };
  }

  async getCaseNote(id: number): Promise<CaseNoteWithDetails | undefined> {
    const [note] = await db
      .select({
        id: caseNotes.id,
        programArea: caseNotes.programArea,
        caseworkerId: caseNotes.caseworkerId,
        translationProvided: caseNotes.translationProvided,
        narrative: caseNotes.narrative,
        createdAt: caseNotes.createdAt,
        updatedAt: caseNotes.updatedAt,
        caseworker: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
        },
      })
      .from(caseNotes)
      .leftJoin(users, eq(caseNotes.caseworkerId, users.id))
      .where(eq(caseNotes.id, id));

    if (!note) return undefined;

    const noteAttachments = await this.getAttachments(id);
    return {
      ...note,
      attachments: noteAttachments,
    } as CaseNoteWithDetails;
  }

  async updateCaseNote(id: number, updates: Partial<InsertCaseNote>): Promise<CaseNote> {
    const [caseNote] = await db
      .update(caseNotes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(caseNotes.id, id))
      .returning();
    return caseNote;
  }

  async deleteCaseNote(id: number): Promise<void> {
    // Delete attachments first
    await db.delete(attachments).where(eq(attachments.caseNoteId, id));
    // Delete case note
    await db.delete(caseNotes).where(eq(caseNotes.id, id));
  }

  // Attachment operations
  async createAttachment(attachmentData: InsertAttachment): Promise<Attachment> {
    const [attachment] = await db
      .insert(attachments)
      .values(attachmentData)
      .returning();
    return attachment;
  }

  async getAttachments(caseNoteId: number): Promise<Attachment[]> {
    return await db
      .select()
      .from(attachments)
      .where(eq(attachments.caseNoteId, caseNoteId));
  }

  async deleteAttachment(id: number): Promise<void> {
    await db.delete(attachments).where(eq(attachments.id, id));
  }

  // Statistics
  async getDashboardStats(caseworkerId?: string): Promise<{
    totalNotes: number;
    todayNotes: number;
    rcaCases: number;
    translationsProvided: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const conditions = caseworkerId ? [eq(caseNotes.caseworkerId, caseworkerId)] : [];

    // Total notes
    const [{ totalNotes }] = await db
      .select({ totalNotes: count() })
      .from(caseNotes)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Today's notes
    const todayConditions = [
      gte(caseNotes.createdAt, today),
      lte(caseNotes.createdAt, tomorrow),
      ...conditions,
    ];
    const [{ todayNotes }] = await db
      .select({ todayNotes: count() })
      .from(caseNotes)
      .where(and(...todayConditions));

    // RCA cases today
    const rcaConditions = [
      eq(caseNotes.programArea, 'RCA'),
      gte(caseNotes.createdAt, today),
      lte(caseNotes.createdAt, tomorrow),
      ...conditions,
    ];
    const [{ rcaCases }] = await db
      .select({ rcaCases: count() })
      .from(caseNotes)
      .where(and(...rcaConditions));

    // Translations provided today
    const translationConditions = [
      eq(caseNotes.translationProvided, true),
      gte(caseNotes.createdAt, today),
      lte(caseNotes.createdAt, tomorrow),
      ...conditions,
    ];
    const [{ translationsProvided }] = await db
      .select({ translationsProvided: count() })
      .from(caseNotes)
      .where(and(...translationConditions));

    return {
      totalNotes,
      todayNotes,
      rcaCases,
      translationsProvided,
    };
  }
}

export const storage = new DatabaseStorage();

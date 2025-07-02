import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertCaseNoteSchema, insertAttachmentSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and image files are allowed.'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Case notes routes
  app.get('/api/case-notes', isAuthenticated, async (req: any, res) => {
    try {
      const {
        programArea,
        search,
        startDate,
        endDate,
        sortBy = 'newest',
        limit = 10,
        offset = 0,
      } = req.query;

      const filters = {
        programArea: programArea || undefined,
        search: search || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        sortBy: sortBy as 'newest' | 'oldest' | 'program' | 'caseworker',
        limit: parseInt(limit as string) || 10,
        offset: parseInt(offset as string) || 0,
      };

      const result = await storage.getCaseNotes(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching case notes:", error);
      res.status(500).json({ message: "Failed to fetch case notes" });
    }
  });

  app.get('/api/case-notes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const caseNote = await storage.getCaseNote(id);
      
      if (!caseNote) {
        return res.status(404).json({ message: "Case note not found" });
      }
      
      res.json(caseNote);
    } catch (error) {
      console.error("Error fetching case note:", error);
      res.status(500).json({ message: "Failed to fetch case note" });
    }
  });

  app.post('/api/case-notes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertCaseNoteSchema.parse({
        ...req.body,
        caseworkerId: userId,
      });

      const caseNote = await storage.createCaseNote(validatedData);
      res.status(201).json(caseNote);
    } catch (error) {
      console.error("Error creating case note:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid data", errors: (error as any).errors });
      }
      res.status(500).json({ message: "Failed to create case note" });
    }
  });

  app.put('/api/case-notes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if the case note exists and belongs to the user
      const existingNote = await storage.getCaseNote(id);
      if (!existingNote) {
        return res.status(404).json({ message: "Case note not found" });
      }
      
      if (existingNote.caseworkerId !== userId) {
        return res.status(403).json({ message: "Not authorized to edit this case note" });
      }

      const validatedData = insertCaseNoteSchema.partial().parse(req.body);
      const updatedCaseNote = await storage.updateCaseNote(id, validatedData);
      res.json(updatedCaseNote);
    } catch (error) {
      console.error("Error updating case note:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid data", errors: (error as any).errors });
      }
      res.status(500).json({ message: "Failed to update case note" });
    }
  });

  app.delete('/api/case-notes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if the case note exists and belongs to the user
      const existingNote = await storage.getCaseNote(id);
      if (!existingNote) {
        return res.status(404).json({ message: "Case note not found" });
      }
      
      if (existingNote.caseworkerId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this case note" });
      }

      await storage.deleteCaseNote(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting case note:", error);
      res.status(500).json({ message: "Failed to delete case note" });
    }
  });

  // File upload routes
  app.post('/api/case-notes/:id/attachments', isAuthenticated, upload.array('files', 5), async (req: any, res) => {
    try {
      const caseNoteId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if the case note exists and belongs to the user
      const existingNote = await storage.getCaseNote(caseNoteId);
      if (!existingNote) {
        return res.status(404).json({ message: "Case note not found" });
      }
      
      if (existingNote.caseworkerId !== userId) {
        return res.status(403).json({ message: "Not authorized to add attachments to this case note" });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files provided" });
      }

      const attachments = [];
      for (const file of files) {
        const attachmentData = {
          caseNoteId,
          fileName: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
        };

        const attachment = await storage.createAttachment(attachmentData);
        attachments.push(attachment);
      }

      res.status(201).json(attachments);
    } catch (error) {
      console.error("Error uploading attachments:", error);
      res.status(500).json({ message: "Failed to upload attachments" });
    }
  });

  app.get('/api/attachments/:id/download', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const attachments = await storage.getAttachments(0); // This would need refinement
      
      // Find attachment and verify ownership through case note
      // Implementation would check if user owns the case note that has this attachment
      
      res.status(501).json({ message: "Download functionality not implemented yet" });
    } catch (error) {
      console.error("Error downloading attachment:", error);
      res.status(500).json({ message: "Failed to download attachment" });
    }
  });

  app.delete('/api/attachments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      // Implementation would verify ownership and delete file from disk
      await storage.deleteAttachment(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting attachment:", error);
      res.status(500).json({ message: "Failed to delete attachment" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

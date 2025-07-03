import type { CaseNoteWithDetails } from "@/types";

// Mock case notes data for demo purposes
export const mockCaseNotes: CaseNoteWithDetails[] = [
  {
    id: 1,
    caseNumber: "RCA-2025-001",
    programArea: "RCA",
    caseworkerId: "cw-001",
    clientName: "Ahmed Hassan",
    clientAge: 34,
    clientGender: "Male",
    notes: "Initial assessment completed. Client requires assistance with housing documentation and legal status verification. Language barrier noted - Arabic interpreter needed for future sessions.",
    translationProvided: true,
    followUpRequired: true,
    followUpDate: "2025-01-10",
    priority: "High",
    createdAt: "2025-01-03T10:30:00Z",
    updatedAt: "2025-01-03T10:30:00Z",
    caseworker: {
      id: "cw-001",
      firstName: "Sarah",
      lastName: "Johnson",
      role: "Senior Caseworker"
    },
    attachments: [
      {
        id: 1,
        caseNoteId: 1,
        fileName: "id_document.pdf",
        originalName: "ID Document.pdf",
        mimeType: "application/pdf",
        fileSize: 245760,
        uploadedAt: "2025-01-03T10:35:00Z"
      }
    ]
  },
  {
    id: 2,
    caseNumber: "RCA-2025-002",
    programArea: "Legal Aid",
    caseworkerId: "cw-002",
    clientName: "Fatima Al-Zahra",
    clientAge: 28,
    clientGender: "Female",
    notes: "Legal consultation regarding family reunification process. Documentation review scheduled for next week. Client expressed concerns about timeline and process complexity.",
    translationProvided: false,
    followUpRequired: true,
    followUpDate: "2025-01-08",
    priority: "Medium",
    createdAt: "2025-01-02T14:15:00Z",
    updatedAt: "2025-01-02T14:15:00Z",
    caseworker: {
      id: "cw-002",
      firstName: "Michael",
      lastName: "Chen",
      role: "Legal Aid Specialist"
    },
    attachments: []
  },
  {
    id: 3,
    caseNumber: "RCA-2025-003",
    programArea: "Community Outreach",
    caseworkerId: "cw-001",
    clientName: "Omar Nasser",
    clientAge: 45,
    clientGender: "Male",
    notes: "Community integration workshop attendance. Client showing good progress in language learning and job search activities. Connected with local employment services.",
    translationProvided: false,
    followUpRequired: false,
    priority: "Low",
    createdAt: "2025-01-01T09:00:00Z",
    updatedAt: "2025-01-01T09:00:00Z",
    caseworker: {
      id: "cw-001",
      firstName: "Sarah",
      lastName: "Johnson",
      role: "Senior Caseworker"
    },
    attachments: [
      {
        id: 2,
        caseNoteId: 3,
        fileName: "workshop_certificate.jpg",
        originalName: "Workshop Certificate.jpg",
        mimeType: "image/jpeg",
        fileSize: 156800,
        uploadedAt: "2025-01-01T09:15:00Z"
      }
    ]
  },
  {
    id: 4,
    caseNumber: "RCA-2024-156",
    programArea: "Emergency Response",
    caseworkerId: "cw-003",
    clientName: "Leila Mahmoud",
    clientAge: 22,
    clientGender: "Female",
    notes: "Emergency housing assistance provided. Medical evaluation scheduled due to reported health concerns. Coordinating with healthcare providers for comprehensive assessment.",
    translationProvided: true,
    followUpRequired: true,
    followUpDate: "2025-01-05",
    priority: "Urgent",
    createdAt: "2024-12-28T16:45:00Z",
    updatedAt: "2024-12-28T16:45:00Z",
    caseworker: {
      id: "cw-003",
      firstName: "Elena",
      lastName: "Rodriguez",
      role: "Emergency Response Coordinator"
    },
    attachments: []
  },
  {
    id: 5,
    caseNumber: "RCA-2024-142",
    programArea: "Microfinance",
    caseworkerId: "cw-004",
    clientName: "Yusuf Ibrahim",
    clientAge: 38,
    clientGender: "Male",
    notes: "Microfinance loan application review completed. Business plan approved for small grocery store. Loan disbursement scheduled pending final documentation review.",
    translationProvided: false,
    followUpRequired: true,
    followUpDate: "2025-01-12",
    priority: "Medium",
    createdAt: "2024-12-20T11:20:00Z",
    updatedAt: "2024-12-20T11:20:00Z",
    caseworker: {
      id: "cw-004",
      firstName: "David",
      lastName: "Thompson",
      role: "Microfinance Advisor"
    },
    attachments: [
      {
        id: 3,
        caseNoteId: 5,
        fileName: "business_plan.docx",
        originalName: "Business Plan.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        fileSize: 524288,
        uploadedAt: "2024-12-20T11:25:00Z"
      }
    ]
  }
];

// Mock dashboard statistics
export const mockDashboardStats = {
  totalNotes: 5,
  todayNotes: 2,
  rcaCases: 3,
  translationsProvided: 2
};
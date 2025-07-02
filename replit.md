# RCA Case Notes Management System

## Overview

This is a full-stack web application for managing refugee case notes in a humanitarian assistance context. The system provides secure case documentation, advanced search capabilities, file attachments, and comprehensive reporting features for caseworkers and administrators.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for development and production
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **File Uploads**: Multer middleware with local file storage

### Database Design
- **Primary Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle with type-safe schema definitions
- **Schema Location**: `shared/schema.ts` for shared types
- **Migrations**: Drizzle Kit for schema management

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with OIDC
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Authorization**: Route-level protection with authentication middleware
- **User Management**: Automatic user creation and profile management

### Data Models
- **Users**: Profile information, roles, and authentication data
- **Case Notes**: Program area categorization, caseworker assignment, translation tracking, narrative content
- **Attachments**: File metadata and relationships to case notes
- **Sessions**: Secure session management for authentication

### File Management
- **Upload Handling**: Multer configuration with file type validation
- **Storage**: Local filesystem storage in uploads directory
- **Validation**: File type restrictions (PDF, DOCX, images)
- **Size Limits**: 10MB maximum file size

### API Structure
- **RESTful Design**: Standard HTTP methods and status codes
- **Authentication Routes**: Login, logout, user profile endpoints
- **Case Notes CRUD**: Full create, read, update, delete operations
- **File Operations**: Upload, download, and deletion endpoints
- **Dashboard Analytics**: Statistics and reporting endpoints

## Data Flow

### Authentication Flow
1. User accesses protected route
2. Middleware checks session validity
3. Redirects to Replit Auth if unauthenticated
4. OIDC callback creates/updates user profile
5. Session established with PostgreSQL storage

### Case Note Management
1. Form submission with validation (React Hook Form + Zod)
2. API request with file uploads (multipart/form-data)
3. Database transaction for note creation and file metadata
4. File system storage for attachments
5. Real-time UI updates via React Query cache invalidation

### Search and Filtering
1. Client-side filter state management
2. Dynamic query parameter construction
3. Server-side database queries with Drizzle ORM
4. Paginated results with total count
5. Real-time search with debounced input

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **wouter**: Lightweight routing solution

### Development Tools
- **Vite**: Fast build tool with HMR
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Fast JavaScript bundling

### Authentication & Security
- **openid-client**: OIDC authentication
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite dev server with express middleware mode
- **Database**: Neon serverless PostgreSQL
- **File Storage**: Local filesystem with uploads directory
- **Environment**: Environment variables for database and auth configuration

### Production Build
- **Frontend**: Vite build to static assets
- **Backend**: ESBuild bundling for Node.js deployment
- **Database**: Drizzle migrations for schema deployment
- **Assets**: Static file serving through Express

### Configuration Management
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPL_ID
- **Build Scripts**: Separate dev/build/start commands
- **Database Migrations**: `db:push` command for schema updates

## Changelog

```
Changelog:
- July 02, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
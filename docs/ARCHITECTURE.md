# Architecture — Aureon Quality Document Control System

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                            │
│  (React / TypeScript / Tailwind CSS / Lucide React)             │
│  Supabase Auth Client → JWT Token                               │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API (JSON)
                             │ Authorization: Bearer <JWT>
┌────────────────────────────▼────────────────────────────────────┐
│                     FastAPI Backend                              │
│  JWT Verification → User Context → Authorization Middleware      │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Auth Router  │  │ Doc Router   │  │ Admin Router │  ...     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                    │
│  ┌──────▼─────────────────▼─────────────────▼───────────────┐  │
│  │              Business Service Layer                       │  │
│  │  AuthService │ DocumentService │ WorkflowService │ ...   │  │
│  └──────┬─────────────────┬─────────────────┬───────────────┘  │
│         │                 │                 │                    │
└─────────┼─────────────────┼─────────────────┼──────────────────┘
          │                 │                 │
┌─────────▼──┐  ┌──────────▼──┐  ┌──────────▼──────────────────┐
│ PostgreSQL │  │ Supabase    │  │ Redis + ARQ Workers          │
│ (Supabase) │  │ Storage     │  │ OCR / AI / Embeddings        │
│ + pgvector │  │ (S3)        │  │ Text Extraction / Indexing   │
└────────────┘  └─────────────┘  └──────────────────────────────┘
```

## 2. Frontend Architecture (Next.js)

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth layout group
│   │   │   └── login/
│   │   ├── (dashboard)/        # Dashboard layout group (sidebar + topbar)
│   │   │   ├── dashboard/
│   │   │   ├── documents/
│   │   │   ├── reviews/
│   │   │   ├── search/
│   │   │   ├── intelligence/
│   │   │   ├── notifications/
│   │   │   ├── admin/
│   │   │   └── profile/
│   │   ├── layout.tsx
│   │   └── page.tsx            # Redirect to /dashboard
│   ├── components/
│   │   ├── layout/             # Sidebar, Topbar, AppShell
│   │   ├── ui/                 # Buttons, Badges, Inputs, Cards, Tables
│   │   ├── documents/          # Document-specific components
│   │   ├── workflows/          # Workflow timeline, step indicators
│   │   ├── ai/                 # AI suggestion cards, RAG chat
│   │   └── admin/              # Admin-specific components
│   ├── lib/
│   │   ├── api.ts              # API client (fetch wrapper)
│   │   ├── supabase.ts         # Supabase client
│   │   ├── auth.ts             # Auth utilities
│   │   ├── permissions.ts      # Permission checking utilities
│   │   └── constants.ts        # Document statuses, types, etc.
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript types/interfaces
│   └── styles/                 # Global CSS
├── tailwind.config.ts          # Stitch design tokens
├── next.config.js
├── tsconfig.json
└── package.json
```

## 3. Backend Architecture (FastAPI)

```
backend/
├── app/
│   ├── main.py                 # FastAPI app entry
│   ├── config.py               # Environment config
│   ├── database.py             # SQLAlchemy engine/session
│   ├── dependencies.py         # Common dependencies (get_db, get_current_user)
│   ├── middleware/
│   │   ├── auth.py             # JWT verification middleware
│   │   └── tenant.py           # Organization isolation middleware
│   ├── models/                 # SQLAlchemy ORM models
│   │   ├── organization.py
│   │   ├── user.py
│   │   ├── role.py
│   │   ├── document.py
│   │   ├── version.py
│   │   ├── workflow.py
│   │   ├── audit.py
│   │   └── ...
│   ├── schemas/                # Pydantic request/response schemas
│   ├── routers/                # API route handlers
│   │   ├── auth.py
│   │   ├── documents.py
│   │   ├── workflows.py
│   │   ├── admin.py
│   │   ├── search.py
│   │   ├── ai.py
│   │   └── ...
│   ├── services/               # Business logic layer
│   │   ├── auth_service.py
│   │   ├── document_service.py
│   │   ├── workflow_service.py
│   │   ├── storage_service.py
│   │   ├── search_service.py
│   │   ├── ai_service.py
│   │   ├── ocr_service.py
│   │   ├── audit_service.py
│   │   └── ...
│   ├── providers/              # External service abstractions
│   │   ├── ai/
│   │   │   ├── base.py         # BaseLLMProvider interface
│   │   │   └── openai.py       # OpenAI implementation
│   │   ├── ocr/
│   │   │   ├── base.py
│   │   │   └── tesseract.py
│   │   └── storage/
│   │       ├── base.py
│   │       └── supabase.py
│   ├── workers/                # ARQ background tasks
│   │   ├── worker.py
│   │   ├── text_extraction.py
│   │   ├── ocr_task.py
│   │   ├── ai_classification.py
│   │   ├── embeddings.py
│   │   └── ...
│   └── seed/                   # Demo data seeding
│       └── seed_data.py
├── migrations/                 # Alembic migrations
├── tests/
├── requirements.txt
├── alembic.ini
└── Dockerfile
```

## 4. Service Boundaries

| Service | Responsibility |
|---|---|
| AuthService | Login, logout, JWT verification, session management |
| OrganizationService | Organization CRUD, tenant context |
| UserService | User CRUD, profile management |
| RoleService | Role CRUD, permission assignment |
| PermissionService | Permission checking, access scope validation |
| DocumentService | Document CRUD, lifecycle management |
| FolderService | Folder hierarchy management |
| StorageService | File upload/download, signed URLs |
| MetadataService | Document metadata CRUD, type-specific fields |
| VersionService | Version creation, history, comparison |
| WorkflowService | Template management, instance creation, step progression |
| ApprovalService | Review actions (approve/reject/request changes) |
| SearchService | Full-text search, filtering, semantic search |
| OCRService | Text extraction from scanned documents |
| AIService | Classification, metadata extraction, summarization, RAG |
| EmbeddingService | Chunk creation, vector embedding, storage |
| SharingService | Document sharing, secure link generation |
| NotificationService | In-app notification creation and management |
| AuditService | Audit event recording and querying |

## 5. Authentication Flow

```
1. User enters credentials on Login page
2. Frontend calls Supabase Auth signIn
3. Supabase returns JWT
4. Frontend stores JWT, includes in API requests
5. FastAPI middleware verifies JWT with Supabase
6. Middleware resolves user_id → User record → organization_id
7. Request context populated with user, org, permissions
8. Route handler calls service with authorized context
```

## 6. Multi-Tenancy

Every database query that touches organizational data MUST include:
```sql
WHERE organization_id = :current_org_id
```

This is enforced at TWO levels:
1. **PostgreSQL RLS policies** — Database-level enforcement
2. **FastAPI middleware** — Application-level enforcement in service layer

The `organization_id` is NEVER sourced from the frontend request body. It is ALWAYS resolved from the authenticated user's database record.

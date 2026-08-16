# Aureon Quality Document Control System — Implementation Plan

## 1. Project Status

**Repository**: `e:\Demo_DMS` — Empty (`.git` only + `docs/` from Phase 0 analysis)
**Stitch Project**: "Aureon Quality Document Control System" (ID: `12697992536796995080`) — **30 screens confirmed**
**Status**: Ready for scaffolding and implementation

## 2. Stitch Design Analysis — Complete Screen Inventory

| # | Screen Title | Stitch ID | Route |
|---|---|---|---|
| 1 | Login - Aureon Pharmaceuticals | `2c6c657b` | `/login` |
| 2 | Dashboard - Quality Document Control | `5faa4406` | `/dashboard` |
| 3 | Document Repository - Aureon DMS | `f45c54cd` | `/documents` |
| 4 | Document Grid - Aureon DMS | `185a303a` | `/documents/grid` |
| 5 | Document Details - SOP-QA-014 | `9b8c3d10` | `/documents/[id]` |
| 6 | Document Preview - SOP-QA-014 | `a07de3a1` | `/documents/[id]/preview` |
| 7 | Document Processing - SOP-QA-014 | `d658291c` | `/documents/[id]/processing` |
| 8 | Document Metadata - SOP-QA-014 | `e03ff4df` | `/documents/[id]/metadata` |
| 9 | Version History - SOP-QA-014 | `9aa2443e` | `/documents/[id]/versions` |
| 10 | Document Workflow - SOP-QA-014 | `016c74da` | `/documents/[id]/workflow` |
| 11 | Approval Review - SOP-QA-014 | `1b48347c` | `/documents/[id]/review` |
| 12 | Pending Reviews - Work Queue | `4e948015` | `/reviews/pending` |
| 13 | Periodic Review - Compliance Monitoring | `846c2078` | `/reviews/periodic` |
| 14 | Archived Documents - Superseded & Obsolete | `beda171f` | `/documents/archived` |
| 15 | Global Search - Results | `8e4209d1` | `/search` |
| 16 | Advanced Search - Filtered Repository | `05552708` | `/search/advanced` |
| 17 | Document Intelligence - Aureon DMS | `14d6f4e4` | `/intelligence` |
| 18 | Ask Your Documents - AI Workspace | `8359925c` | `/intelligence/ask` |
| 19 | AI Document Summary - SOP-QA-014 | `958e40d0` | `/intelligence/[documentId]` |
| 20 | Secure Sharing - SOP-QA-014 | `29beb7fb` | `/documents/[id]/sharing` |
| 21 | Notification Center - Activity Alerts | `ca9b75f7` | `/notifications` |
| 22 | User Management - Administration | `1945532e` | `/admin/users` |
| 23 | User Profile - Rahul Sharma | `8a2ddadf` | `/admin/users/[id]` |
| 24 | Roles & Permissions - Administration | `55ac6fb3` | `/admin/roles` |
| 25 | Department Management - Administration | `3c2cfc50` | `/admin/departments` |
| 26 | Document Type Management - Administration | `541199ae` | `/admin/document-types` |
| 27 | Workflow Templates - Administration | `6f6cf716` | `/admin/workflows` |
| 28 | System Settings - Configuration | `72d0e33b` | `/admin/settings` |
| 29 | Audit Trail - Compliance Traceability | `b747d911` | `/admin/audit` |
| 30 | User Profile (variant) | `9fa5e7d7` | `/profile` |

## 3. Stitch Design System Tokens (Extracted from HTML)

### Colors
- **Primary**: `#000000` (rendered as `#0f172a` navy in practice for CTA/navigation)
- **Primary Container**: `#131b2e`
- **Surface**: `#f7f9fb`
- **Surface Container Lowest**: `#ffffff`
- **Surface Container Low**: `#f2f4f6`
- **Surface Container**: `#eceef0`
- **On Surface**: `#191c1e`
- **On Surface Variant**: `#45464d`
- **Outline**: `#76777d`
- **Outline Variant**: `#c6c6cd`
- **Error**: `#ba1a1a`
- **Error Container**: `#ffdad6`
- **Secondary Container**: `#d0e1fb`
- **Status Colors**: Emerald `#059669`/`#10b981` (effective), Amber `#d97706` (pending), Red `#ba1a1a` (error/overdue), Teal `#0d9488` (approved)

### Typography
- **Display LG**: Inter 32px/40px, weight 700, ls -0.02em
- **Headline MD**: Inter 24px/32px, weight 600, ls -0.01em
- **Title SM**: Inter 18px/24px, weight 600
- **Body MD**: Inter 14px/20px, weight 400
- **Body SM**: Inter 13px/18px, weight 400
- **Label CAPS**: Inter 11px/16px, weight 600, ls 0.05em
- **Code Data**: JetBrains Mono 12px/16px, weight 400

### Spacing
- Base: 8px | XS: 4px | SM: 8px | MD: 16px | LG: 24px | XL: 40px
- Sidebar Width: 260px | Container Max: 1440px

### Border Radius
- DEFAULT: 0.125rem | LG: 0.25rem | XL: 0.5rem | Full: 0.75rem

### Layout
- Top header bar (h-14, sticky)
- Left sidebar (260px, fixed height, scrollable nav)
- Main content area (flex-1, scrollable, p-lg)
- Active nav: `bg-secondary-container`, `border-l-4 border-primary`, `font-semibold`
- Table headers: `bg-[#F1F5F9]`
- Status badges: `border-l-2`, tinted backgrounds, `label-caps` font
- Input height: 36px
- Button height: 40px (primary)

## 4. Technology Stack (Confirmed)

| Layer | Technology |
|---|---|
| Frontend | Next.js 14+, React 18, TypeScript, Tailwind CSS 3 |
| Icons | Lucide React |
| Animations | Framer Motion (selective) |
| Backend | Python 3.11+, FastAPI |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Search | PostgreSQL FTS → pgvector |
| Background | Redis + ARQ |
| OCR | Tesseract (abstracted) |
| AI | OpenAI (abstracted via provider pattern) |
| Doc Processing | PyMuPDF, python-docx, openpyxl |

## 5. Implementation Phases

### Phase 1: Foundation
- Next.js project scaffold with Tailwind config matching Stitch tokens
- FastAPI project scaffold with service architecture
- PostgreSQL schema design and initial migration
- Environment configuration (.env.example)
- Application shell (sidebar, topbar, routing)
- Stitch design system as Tailwind config + reusable components

### Phase 2: Organization + RBAC
- Organizations, Departments, Users tables
- Roles, Permissions, Role-Permission mapping
- Supabase Auth integration
- JWT verification in FastAPI
- Tenant isolation (RLS + middleware)
- Login page implementation

### Phase 3: Core DMS
- Documents, Folders, Document Types tables
- Secure file storage via Supabase Storage
- Upload pipeline (validate → store → record)
- Document Repository, Grid, Details screens
- Document Preview component
- Metadata management

### Phase 4: Document Control
- Version control system
- Document lifecycle state machine
- Workflow templates and instances
- Review and Approval system
- Periodic review tracking
- Superseding and obsolete document handling

### Phase 5: Search + Audit
- Full-text search with PostgreSQL tsvector
- Advanced filter UI
- Audit event logging for all critical actions
- Audit Trail screen

### Phase 6: Document Processing
- Redis + ARQ worker setup
- Text extraction pipeline
- OCR service (Tesseract)
- Processing state tracking

### Phase 7: AI
- AI provider abstraction layer
- Document classification
- Metadata extraction
- Summary generation
- pgvector embeddings + semantic search
- RAG pipeline (Ask Documents)

### Phase 8: Collaboration
- Document sharing (users, departments, secure links)
- In-app notification system

### Phase 9: Administration
- User Management screen
- Roles & Permissions screen
- Department Management screen
- Document Type Management screen
- Workflow Templates screen
- System Settings screen

### Phase 10: QA + Polish
- Visual QA against Stitch
- Responsive design
- Error/Loading/Empty states
- Security testing
- E2E test of hero workflow

### Phase 11: Demo Data
- Seed Aureon Pharmaceuticals org
- Create demo users with correct roles
- Create demo documents with versions
- Create workflow instances and audit records

## 6. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| AI processing blocking uploads | ARQ background workers from Phase 6 |
| Tenant data leakage | RLS policies + FastAPI middleware double-check |
| Stitch fidelity drift | Browser-based visual QA after each phase |
| Schema migration conflicts | Alembic with ordered migrations |

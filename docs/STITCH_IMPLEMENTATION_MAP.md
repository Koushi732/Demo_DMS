# Stitch Implementation Map — Aureon Quality Document Control System

Stitch Project: **Aureon Quality Document Control System**
Project ID: **12697992536796995080**

## Complete Screen-to-Route Mapping

| # | Stitch Screen Title | Stitch Screen ID | Route | React Component | Required API | Required Data | Required Permissions | Related Workflows |
|---|---|---|---|---|---|---|---|---|
| 1 | Login - Aureon Pharmaceuticals | `2c6c657b5c394dc6` | `/login` | `LoginPage` | `POST /api/v1/auth/login` | email, password | Public | — |
| 2 | Dashboard - Quality Document Control | `5faa4406b5584b95` | `/dashboard` | `DashboardPage` | `GET /api/v1/documents` (stats), `GET /api/v1/reviews/pending`, `GET /api/v1/reviews/periodic` | KPI stats, pending approvals, periodic reviews, recent activity | DOCUMENT_VIEW | Document lifecycle overview |
| 3 | Document Repository - Aureon DMS | `f45c54cd69094748` | `/documents` | `DocumentRepositoryPage` | `GET /api/v1/documents`, `GET /api/v1/folders` | Documents list, folder tree, filters | DOCUMENT_VIEW | — |
| 4 | Document Grid - Aureon DMS | `185a303a95f04c4a` | `/documents/grid` | `DocumentGridPage` | `GET /api/v1/documents` | Documents as cards, status, metadata | DOCUMENT_VIEW | — |
| 5 | Document Details - SOP-QA-014 | `9b8c3d1026ed4e10` | `/documents/[id]` | `DocumentDetailsPage` | `GET /api/v1/documents/{id}`, `GET /api/v1/documents/{id}/versions` | Document record, current version, metadata summary, workflow status | DOCUMENT_VIEW | Submit for review |
| 6 | Document Preview - SOP-QA-014 | `a07de3a194e74582` | `/documents/[id]/preview` | `DocumentPreviewPage` | `GET /api/v1/documents/{id}/preview-url` | Document file preview URL, metadata panel | DOCUMENT_VIEW, DOCUMENT_DOWNLOAD | — |
| 7 | Document Processing - SOP-QA-014 | `d658291c78314fe2` | `/documents/[id]/processing` | `DocumentProcessingPage` | `GET /api/v1/documents/{id}` (processing_status polling) | Processing state, step progress, AI results preview | DOCUMENT_VIEW | Upload → Processing pipeline |
| 8 | Document Metadata - SOP-QA-014 | `e03ff4df9e9f408e` | `/documents/[id]/metadata` | `DocumentMetadataPage` | `GET /api/v1/documents/{id}/metadata`, `PUT /api/v1/documents/{id}/metadata` | Common metadata, type-specific metadata, AI suggestions | DOCUMENT_VIEW, DOCUMENT_EDIT | Metadata verification |
| 9 | Version History - SOP-QA-014 | `9aa2443e43544cac` | `/documents/[id]/versions` | `VersionHistoryPage` | `GET /api/v1/documents/{id}/versions` | All versions with status, created_by, change_reason | DOCUMENT_VERSION_VIEW | Version comparison |
| 10 | Document Workflow - SOP-QA-014 | `016c74da544f4b1d` | `/documents/[id]/workflow` | `DocumentWorkflowPage` | `GET /api/v1/documents/{id}/workflow` | Workflow instance, all steps with status/assignees/timestamps | DOCUMENT_VIEW | Full approval workflow |
| 11 | Approval Review - SOP-QA-014 | `1b48347c10234b86` | `/documents/[id]/review` | `ApprovalReviewPage` | `GET /api/v1/documents/{id}/workflow`, `POST .../approve`, `POST .../reject`, `POST .../request-changes` | Document preview, workflow context, approval form | DOCUMENT_REVIEW, DOCUMENT_APPROVE | Approve/Reject/Request Changes |
| 12 | Pending Reviews - Work Queue | `4e94801501be4fad` | `/reviews/pending` | `PendingReviewsPage` | `GET /api/v1/reviews/pending` | List of documents pending current user's review action | DOCUMENT_REVIEW | Step-level review actions |
| 13 | Periodic Review - Compliance Monitoring | `846c2078f0304a08` | `/reviews/periodic` | `PeriodicReviewPage` | `GET /api/v1/reviews/periodic` | Documents due/overdue for periodic review | DOCUMENT_VIEW | Continue/Revise/Obsolete |
| 14 | Archived Documents - Superseded & Obsolete | `beda171fd1184c0c` | `/documents/archived` | `ArchivedDocumentsPage` | `GET /api/v1/documents?status=SUPERSEDED,OBSOLETE,ARCHIVED` | Archived/superseded/obsolete documents with traceability | DOCUMENT_VIEW | — |
| 15 | Global Search - Results | `8e4209d1ac0e4906` | `/search` | `SearchPage` | `GET /api/v1/search` | Search results with highlights, filters | DOCUMENT_VIEW | — |
| 16 | Advanced Search - Filtered Repository | `0555270896794d4b` | `/search/advanced` | `AdvancedSearchPage` | `GET /api/v1/search/advanced` | Multi-filter search with facets | DOCUMENT_VIEW | — |
| 17 | Document Intelligence - Aureon DMS | `14d6f4e4a1fe45a9` | `/intelligence` | `IntelligencePage` | `GET /api/v1/documents` (with AI data) | Documents with AI classification, summaries | DOCUMENT_VIEW | AI processing |
| 18 | Ask Your Documents - AI Workspace | `8359925c0a4649ec` | `/intelligence/ask` | `AskDocumentsPage` | `POST /api/v1/intelligence/ask` | Question, answer, source citations, conversation history | DOCUMENT_VIEW | RAG pipeline (access-controlled) |
| 19 | AI Document Summary - SOP-QA-014 | `958e40d08ce846ab` | `/intelligence/[documentId]` | `AISummaryPage` | `GET /api/v1/intelligence/summary/{documentId}` | Summary, key points, dates, responsibilities, issues | DOCUMENT_VIEW | AI summary generation |
| 20 | Secure Sharing - SOP-QA-014 | `29beb7fb05e24db4` | `/documents/[id]/sharing` | `SecureSharingPage` | `GET /api/v1/documents/{id}/shares`, `POST /api/v1/documents/{id}/shares` | Active shares, share form, secure link generation | DOCUMENT_SHARE | Share lifecycle |
| 21 | Notification Center - Activity Alerts | `ca9b75f7d4334e10` | `/notifications` | `NotificationsPage` | `GET /api/v1/notifications` | Notification list, read/unread, types | Authenticated | — |
| 22 | User Management - Administration | `1945532e6b20484f` | `/admin/users` | `UserManagementPage` | `GET /api/v1/admin/users` | User list with dept, role, status | USER_CREATE, USER_EDIT | — |
| 23 | User Profile (Admin) - Rahul Sharma | `8a2ddadf41554f0d` | `/admin/users/[id]` | `AdminUserProfilePage` | `GET /api/v1/admin/users/{id}` | User info, department, position, DMS role, permissions, access scope, account status, recent activity, admin actions | USER_EDIT | User administration |
| 24 | Roles & Permissions - Administration | `55ac6fb31a7a4e1b` | `/admin/roles` | `RolesPermissionsPage` | `GET /api/v1/admin/roles`, `GET /api/v1/permissions` | Roles list, permission matrix | ROLE_ASSIGN | — |
| 25 | Department Management - Administration | `3c2cfc5083e54d02` | `/admin/departments` | `DepartmentManagementPage` | `GET /api/v1/admin/departments` | Departments list, head user, document counts | SYSTEM_CONFIGURE | — |
| 26 | Document Type Management - Administration | `541199aea0c14f9f` | `/admin/document-types` | `DocumentTypeManagementPage` | `GET /api/v1/admin/document-types` | Document types, prefixes, metadata schemas | SYSTEM_CONFIGURE | — |
| 27 | Workflow Templates - Administration | `6f6cf716dc874eb9` | `/admin/workflows` | `WorkflowTemplatesPage` | `GET /api/v1/workflows/templates` | Workflow templates, steps, assignee rules | WORKFLOW_CREATE | — |
| 28 | System Settings - Configuration | `72d0e33b06034701` | `/admin/settings` | `SystemSettingsPage` | `GET /api/v1/admin/settings`, `PATCH /api/v1/admin/settings` | System config, storage, AI settings | SYSTEM_CONFIGURE | — |
| 29 | Audit Trail - Compliance Traceability | `b747d9117c6f4456` | `/admin/audit` | `AuditTrailPage` | `GET /api/v1/audit` | Audit events, filters, export | AUDIT_VIEW | — |
| 30 | User Profile (Self) | `9fa5e7d73a6a4514` | `/profile` | `ProfilePage` | `GET /api/v1/auth/me` | Personal info, department, position, role, notification prefs, security settings, personal activity | Authenticated | — |

## Upload Flow (No Dedicated Stitch Screen)

The Stitch project does not include a dedicated upload screen. Upload will be implemented as a full-page route at `/documents/upload` using the existing Stitch design system patterns (form fields, buttons, drag-and-drop area following the `surface-container-lowest` card pattern).

**Upload Flow:**
```
/documents/upload → file upload + basic metadata
    → /documents/[id]/processing → processing progress
    → /documents/[id]/metadata → metadata verification
    → /documents/[id] → document details / submit for review
```

## Shared Layout Components

| Component | Description | Used In |
|---|---|---|
| `AppShell` | Top header (h-14) + sidebar (260px) + scrollable main content area | All authenticated pages |
| `Sidebar` | 260px left nav: org branding block, navigation items with Material icons, active state (secondary-container bg, border-l-4 primary) | All authenticated pages |
| `TopBar` | h-14 bar: brand text, breadcrumb nav, global search input (36px), notification bell (with badge), help, user avatar | All authenticated pages |
| `PageHeader` | display-lg title + body-md subtitle + action buttons row, border-b separator | All content pages |
| `DataTable` | Sortable table: sticky headers (bg-[#F1F5F9]), label-caps headers, body-sm rows, code-data for IDs, hover:bg-surface-container-low | Repository, Grid, Users, Audit, Reviews |
| `StatusBadge` | Inline-flex badge: border-l-2 colored border, 10% tinted bg, label-caps text, rounded-sm | Tables, detail pages |
| `KPICard` | surface-container-lowest card with label-caps title, display-lg value, optional border-t-2 color accent | Dashboard |
| `ActivityTimeline` | Vertical timeline: colored dots (emerald/navy/slate), body-sm text, label-caps timestamp | Dashboard, Audit |
| `WorkflowStepper` | Horizontal/vertical step indicators: completed (solid emerald), current (pulse navy ring), future (dashed slate) | Workflow, Processing |
| `DocumentCard` | Card with doc icon, code-data number, title, status badge, metadata row | Grid view |
| `FilterPanel` | Filter bar with select dropdowns, date pickers, search input | Search, Repository |
| `Modal` | Centered overlay: surface-container-lowest bg, outline-variant border, 40% navy backdrop | Various confirmations |
| `FormField` | label-caps label, 36px input with outline-variant border, body-sm text, focus ring | All forms |

## Screen Access Matrix

| Screen | Admin | QA Mgr | QA DC | QC Mgr | Dept Mgr | Author | Reg Mgr | Val Mgr | Auditor |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Document Repository | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Document Details | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Approval Review | | ✓ | ✓ | ✓ | ✓ | view | ✓ | ✓ | view |
| Pending Reviews | | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | |
| Document Intelligence | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| User Management | ✓ | | | | | | | | |
| Roles & Permissions | ✓ | | | | | | | | |
| Audit Trail | ✓ | ✓ | ✓ | | | | | | ✓ |
| System Settings | ✓ | | | | | | | | |

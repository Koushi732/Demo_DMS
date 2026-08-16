# API Reference — Aureon Quality Document Control System

Base URL: `/api/v1`

All endpoints require `Authorization: Bearer <JWT>` unless specified.

## Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Login with email/password (proxied to Supabase) |
| POST | `/auth/logout` | Logout, invalidate session |
| GET | `/auth/me` | Get current user profile with permissions |
| POST | `/auth/refresh` | Refresh JWT token |

## Documents

| Method | Endpoint | Description |
|---|---|---|
| GET | `/documents` | List documents (paginated, filtered) |
| POST | `/documents` | Create document record |
| GET | `/documents/{id}` | Get document details |
| PATCH | `/documents/{id}` | Update document metadata |
| DELETE | `/documents/{id}` | Soft-delete document |
| POST | `/documents/{id}/upload` | Upload file for document |
| GET | `/documents/{id}/download` | Get signed download URL |
| POST | `/documents/{id}/submit` | Submit for review |
| GET | `/documents/{id}/preview-url` | Get preview URL |

## Document Versions

| Method | Endpoint | Description |
|---|---|---|
| GET | `/documents/{id}/versions` | List all versions |
| POST | `/documents/{id}/versions` | Create new version |
| GET | `/documents/{id}/versions/{versionId}` | Get version details |
| GET | `/documents/{id}/versions/{versionId}/download` | Download specific version |

## Document Metadata

| Method | Endpoint | Description |
|---|---|---|
| GET | `/documents/{id}/metadata` | Get all metadata |
| PUT | `/documents/{id}/metadata` | Update metadata |
| POST | `/documents/{id}/metadata/verify` | Verify AI-suggested metadata |

## Workflows

| Method | Endpoint | Description |
|---|---|---|
| GET | `/workflows/templates` | List workflow templates |
| POST | `/workflows/templates` | Create workflow template |
| GET | `/workflows/templates/{id}` | Get template details |
| GET | `/documents/{id}/workflow` | Get active workflow for document |
| POST | `/documents/{id}/workflow/approve` | Approve current step |
| POST | `/documents/{id}/workflow/reject` | Reject current step |
| POST | `/documents/{id}/workflow/request-changes` | Request changes |
| POST | `/documents/{id}/workflow/comment` | Add comment |

## Reviews

| Method | Endpoint | Description |
|---|---|---|
| GET | `/reviews/pending` | Get pending reviews for current user |
| GET | `/reviews/periodic` | Get documents due for periodic review |

## Search

| Method | Endpoint | Description |
|---|---|---|
| GET | `/search` | Full-text search with filters |
| GET | `/search/advanced` | Advanced search with multiple filters |
| POST | `/search/semantic` | Semantic search using embeddings |

## AI / Intelligence

| Method | Endpoint | Description |
|---|---|---|
| GET | `/intelligence/summary/{documentId}` | Get AI summary |
| POST | `/intelligence/ask` | Ask a question (RAG) |
| GET | `/intelligence/classification/{documentId}` | Get AI classification |
| POST | `/intelligence/reprocess/{documentId}` | Re-run AI processing |

## Sharing

| Method | Endpoint | Description |
|---|---|---|
| GET | `/documents/{id}/shares` | List shares for document |
| POST | `/documents/{id}/shares` | Create share |
| DELETE | `/documents/{id}/shares/{shareId}` | Revoke share |
| POST | `/documents/{id}/shares/link` | Generate secure link |

## Notifications

| Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications` | List notifications for current user |
| PATCH | `/notifications/{id}/read` | Mark as read |
| POST | `/notifications/mark-all-read` | Mark all as read |
| GET | `/notifications/unread-count` | Get unread count |

## Audit Trail

| Method | Endpoint | Description |
|---|---|---|
| GET | `/audit` | List audit events (paginated, filtered) |
| GET | `/audit/document/{documentId}` | Audit events for specific document |
| GET | `/audit/export` | Export audit log |

## Administration

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/users` | List users |
| POST | `/admin/users` | Create user |
| GET | `/admin/users/{id}` | Get user details |
| PATCH | `/admin/users/{id}` | Update user |
| POST | `/admin/users/{id}/deactivate` | Deactivate user |
| GET | `/admin/roles` | List roles |
| POST | `/admin/roles` | Create role |
| PATCH | `/admin/roles/{id}` | Update role permissions |
| GET | `/admin/departments` | List departments |
| POST | `/admin/departments` | Create department |
| PATCH | `/admin/departments/{id}` | Update department |
| GET | `/admin/document-types` | List document types |
| POST | `/admin/document-types` | Create document type |
| PATCH | `/admin/document-types/{id}` | Update document type |
| GET | `/admin/settings` | Get system settings |
| PATCH | `/admin/settings` | Update system settings |

## Folders

| Method | Endpoint | Description |
|---|---|---|
| GET | `/folders` | List root folders |
| POST | `/folders` | Create folder |
| GET | `/folders/{id}` | Get folder with children |
| PATCH | `/folders/{id}` | Rename/move folder |
| DELETE | `/folders/{id}` | Delete empty folder |

## Common Query Parameters

- `page` — Page number (default: 1)
- `page_size` — Items per page (default: 25, max: 100)
- `sort_by` — Sort field
- `sort_order` — asc/desc
- `search` — Full-text search query
- `status` — Filter by document status
- `department_id` — Filter by department
- `document_type_id` — Filter by document type
- `date_from` / `date_to` — Date range filter

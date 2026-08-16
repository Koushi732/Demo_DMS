# Database Schema — Aureon Quality Document Control System

All tables with organizational data include `organization_id` for multi-tenant isolation.
PostgreSQL RLS policies enforce tenant boundaries at the database level.

## Entity Relationship Overview

```
organizations ─┬─ departments
               ├─ users ─── roles ─── role_permissions ─── permissions
               ├─ folders
               ├─ document_types
               ├─ documents ─┬─ document_versions ─── document_chunks
               │             ├─ document_metadata
               │             ├─ document_tags
               │             └─ document_shares
               ├─ workflow_templates ─── workflow_template_steps
               ├─ workflow_instances ─── workflow_steps ─── workflow_comments
               ├─ notifications
               └─ audit_logs
```

## Core Tables

### organizations
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, DEFAULT gen_random_uuid() |
| name | VARCHAR(255) | NOT NULL |
| slug | VARCHAR(100) | UNIQUE, NOT NULL |
| settings | JSONB | DEFAULT '{}' |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### departments
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK → organizations, NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| code | VARCHAR(20) | NOT NULL (e.g., QA, QC, PRD) |
| description | TEXT | |
| head_user_id | UUID | FK → users |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | |

### users
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK (matches Supabase Auth UID) |
| organization_id | UUID | FK → organizations, NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| department_id | UUID | FK → departments |
| position | VARCHAR(255) | |
| role_id | UUID | FK → roles |
| avatar_url | TEXT | |
| is_active | BOOLEAN | DEFAULT true |
| last_login_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### roles
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK → organizations |
| name | VARCHAR(100) | NOT NULL |
| description | TEXT | |
| is_system | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | |

### permissions
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(100) | UNIQUE, NOT NULL |
| category | VARCHAR(50) | NOT NULL |
| description | TEXT | |

### role_permissions
| Column | Type | Constraints |
|---|---|---|
| role_id | UUID | FK → roles |
| permission_id | UUID | FK → permissions |
| | | PK (role_id, permission_id) |

## Document Tables

### document_types
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK → organizations |
| name | VARCHAR(255) | NOT NULL |
| prefix | VARCHAR(20) | NOT NULL (e.g., SOP, VAL) |
| category | VARCHAR(100) | NOT NULL |
| description | TEXT | |
| metadata_schema | JSONB | Type-specific metadata fields |
| default_workflow_template_id | UUID | FK → workflow_templates |
| default_review_period_days | INTEGER | DEFAULT 365 |
| is_active | BOOLEAN | DEFAULT true |

### folders
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK → organizations |
| parent_id | UUID | FK → folders (self-ref) |
| name | VARCHAR(255) | NOT NULL |
| path | TEXT | Materialized path |
| created_by | UUID | FK → users |
| created_at | TIMESTAMPTZ | |

### documents
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK → organizations, NOT NULL |
| document_number | VARCHAR(50) | UNIQUE within org, NOT NULL |
| title | VARCHAR(500) | NOT NULL |
| description | TEXT | |
| document_type_id | UUID | FK → document_types |
| department_id | UUID | FK → departments |
| folder_id | UUID | FK → folders |
| owner_id | UUID | FK → users |
| classification | VARCHAR(50) | (Confidential, Internal, Public) |
| status | VARCHAR(50) | NOT NULL (DRAFT, EFFECTIVE, etc.) |
| current_version_id | UUID | FK → document_versions |
| effective_date | DATE | |
| review_period_days | INTEGER | |
| next_review_date | DATE | |
| superseded_by_id | UUID | FK → documents (self-ref) |
| tags | TEXT[] | Array of tag strings |
| processing_status | VARCHAR(50) | (UPLOADED, PROCESSING, READY, FAILED) |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### document_versions
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| document_id | UUID | FK → documents, NOT NULL |
| version_number | INTEGER | NOT NULL |
| storage_path | TEXT | NOT NULL |
| filename | VARCHAR(500) | NOT NULL |
| mime_type | VARCHAR(100) | |
| size_bytes | BIGINT | |
| checksum_sha256 | VARCHAR(64) | |
| status | VARCHAR(50) | (DRAFT, APPROVED, EFFECTIVE, SUPERSEDED) |
| change_reason | TEXT | |
| created_by | UUID | FK → users |
| created_at | TIMESTAMPTZ | |
| | | UNIQUE (document_id, version_number) |

### document_metadata
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| document_id | UUID | FK → documents |
| key | VARCHAR(100) | NOT NULL |
| value | TEXT | |
| is_ai_generated | BOOLEAN | DEFAULT false |
| verified_by | UUID | FK → users |
| verified_at | TIMESTAMPTZ | |

### document_extracted_text
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| document_version_id | UUID | FK → document_versions, UNIQUE |
| extracted_text | TEXT | |
| extraction_method | VARCHAR(50) | (NATIVE, OCR) |
| search_vector | TSVECTOR | GIN indexed |
| created_at | TIMESTAMPTZ | |

### document_chunks
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| document_version_id | UUID | FK → document_versions |
| chunk_index | INTEGER | NOT NULL |
| chunk_text | TEXT | NOT NULL |
| page_number | INTEGER | |
| embedding | VECTOR(1536) | pgvector |
| created_at | TIMESTAMPTZ | |

## Workflow Tables

### workflow_templates
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK → organizations |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| document_type_id | UUID | FK → document_types |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | |

### workflow_template_steps
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| template_id | UUID | FK → workflow_templates |
| step_order | INTEGER | NOT NULL |
| name | VARCHAR(255) | NOT NULL |
| step_type | VARCHAR(50) | (REVIEW, APPROVAL) |
| assigned_role_id | UUID | FK → roles |
| assigned_department | BOOLEAN | DEFAULT false |
| is_required | BOOLEAN | DEFAULT true |

### workflow_instances
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| document_id | UUID | FK → documents |
| document_version_id | UUID | FK → document_versions |
| template_id | UUID | FK → workflow_templates |
| current_step_order | INTEGER | |
| status | VARCHAR(50) | (ACTIVE, COMPLETED, CANCELLED, REJECTED) |
| started_by | UUID | FK → users |
| started_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |

### workflow_steps
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| workflow_instance_id | UUID | FK → workflow_instances |
| template_step_id | UUID | FK → workflow_template_steps |
| step_order | INTEGER | |
| assigned_user_id | UUID | FK → users |
| status | VARCHAR(50) | (PENDING, IN_PROGRESS, APPROVED, REJECTED, CHANGES_REQUESTED) |
| decision | VARCHAR(50) | |
| comments | TEXT | |
| decided_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

## Collaboration Tables

### document_shares
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| document_id | UUID | FK → documents |
| shared_by | UUID | FK → users |
| shared_with_user_id | UUID | FK → users |
| shared_with_department_id | UUID | FK → departments |
| permission_level | VARCHAR(20) | (VIEW, DOWNLOAD) |
| link_token | VARCHAR(100) | UNIQUE (for secure links) |
| password_hash | VARCHAR(255) | |
| expires_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

### notifications
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users, NOT NULL |
| organization_id | UUID | FK → organizations |
| title | VARCHAR(255) | |
| message | TEXT | |
| type | VARCHAR(50) | (REVIEW_REQUEST, APPROVAL, REJECTION, etc.) |
| reference_type | VARCHAR(50) | (DOCUMENT, WORKFLOW, SYSTEM) |
| reference_id | UUID | |
| is_read | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | |

## Audit Tables

### audit_logs
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| organization_id | UUID | FK → organizations, NOT NULL |
| user_id | UUID | FK → users |
| action | VARCHAR(50) | NOT NULL |
| entity_type | VARCHAR(50) | (DOCUMENT, USER, WORKFLOW, etc.) |
| entity_id | UUID | |
| document_id | UUID | FK → documents |
| version_id | UUID | FK → document_versions |
| details | JSONB | |
| ip_address | INET | |
| user_agent | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### document_processing_jobs
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| document_version_id | UUID | FK → document_versions |
| job_type | VARCHAR(50) | (TEXT_EXTRACTION, OCR, CLASSIFICATION, EMBEDDING) |
| status | VARCHAR(50) | (QUEUED, PROCESSING, COMPLETED, FAILED) |
| error_message | TEXT | |
| attempts | INTEGER | DEFAULT 0 |
| started_at | TIMESTAMPTZ | |
| completed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |

## Key Indexes
- `documents(organization_id, status)`
- `documents(organization_id, document_number)` UNIQUE
- `documents(organization_id, department_id)`
- `document_versions(document_id, version_number)` UNIQUE
- `document_extracted_text(search_vector)` GIN
- `document_chunks(embedding)` ivfflat or HNSW
- `audit_logs(organization_id, created_at)`
- `audit_logs(organization_id, document_id)`
- `notifications(user_id, is_read)`
- `workflow_steps(assigned_user_id, status)`

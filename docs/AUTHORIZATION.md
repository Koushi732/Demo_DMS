# Authorization — Aureon Quality Document Control System

## 1. Multi-Tenant Isolation (Absolute Rule)

Every API request is validated against `organization_id` derived from the authenticated user.
A user from Organization A can NEVER interact with Organization B data.

Enforcement layers:
1. **PostgreSQL RLS** — Row-level security policies on all org-scoped tables
2. **FastAPI Middleware** — `get_current_user()` dependency resolves org context
3. **Service Layer** — All queries include `organization_id` filter

The `organization_id` is NEVER sourced from request parameters. It is ALWAYS resolved from the JWT → user DB record.

## 2. System Roles

| Role | Key Capabilities |
|---|---|
| System Administrator | User/role/dept management, system config. NO pharma approval authority |
| QA Manager | Final approval authority, QA review, lifecycle oversight |
| QA Document Controller | Document numbering, metadata, routing, lifecycle management |
| QC Manager | Lab documentation review, specifications, test methods |
| Department Manager | Department-level reviews, submit to QA |
| Document Author | Create, upload, edit drafts, submit for review. Cannot self-approve |
| Regulatory Manager | Regulatory document management and review |
| Validation Manager | Validation protocols, reports, qualification documents |
| Auditor / Read-Only | View documents, versions, approvals, audit trails. No modifications |

## 3. Granular Permissions

### Document Permissions
- `DOCUMENT_CREATE` — Create new document records
- `DOCUMENT_VIEW` — View document details and content
- `DOCUMENT_EDIT` — Edit document metadata and drafts
- `DOCUMENT_DELETE` — Soft-delete documents (restricted)
- `DOCUMENT_DOWNLOAD` — Download document files

### Document Control Permissions
- `DOCUMENT_SUBMIT` — Submit documents for review
- `DOCUMENT_REVIEW` — Perform review actions
- `DOCUMENT_APPROVE` — Approve documents (final authority)
- `DOCUMENT_REJECT` — Reject documents
- `DOCUMENT_REQUEST_CHANGES` — Request changes during review

### Version Permissions
- `DOCUMENT_VERSION_CREATE` — Create new versions
- `DOCUMENT_VERSION_VIEW` — View version history
- `DOCUMENT_VERSION_RESTORE` — Restore previous versions

### Collaboration
- `DOCUMENT_SHARE` — Share documents with users/departments

### Workflow Permissions
- `WORKFLOW_CREATE` — Create workflow templates
- `WORKFLOW_ASSIGN` — Assign workflow participants
- `WORKFLOW_REVIEW` — Participate in workflow reviews
- `WORKFLOW_APPROVE` — Approve workflow steps

### Audit
- `AUDIT_VIEW` — View audit trail records

### Administration
- `USER_CREATE` — Create user accounts
- `USER_EDIT` — Edit user accounts
- `USER_DEACTIVATE` — Deactivate user accounts
- `ROLE_ASSIGN` — Assign roles to users
- `SYSTEM_CONFIGURE` — Modify system settings

## 4. Role-Permission Matrix

| Permission | Admin | QA Mgr | QA DC | QC Mgr | Dept Mgr | Author | Reg Mgr | Val Mgr | Auditor |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| DOCUMENT_CREATE | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| DOCUMENT_VIEW | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| DOCUMENT_EDIT | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| DOCUMENT_DELETE | | | ✓ | | | | | | |
| DOCUMENT_DOWNLOAD | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| DOCUMENT_SUBMIT | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| DOCUMENT_REVIEW | | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | |
| DOCUMENT_APPROVE | | ✓ | | ✓ | ✓ | | ✓ | ✓ | |
| DOCUMENT_REJECT | | ✓ | | ✓ | ✓ | | ✓ | ✓ | |
| DOCUMENT_REQUEST_CHANGES | | ✓ | ✓ | ✓ | ✓ | | ✓ | ✓ | |
| DOCUMENT_VERSION_CREATE | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| DOCUMENT_VERSION_VIEW | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| DOCUMENT_SHARE | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| WORKFLOW_CREATE | ✓ | ✓ | ✓ | | | | | | |
| WORKFLOW_APPROVE | | ✓ | | ✓ | ✓ | | ✓ | ✓ | |
| AUDIT_VIEW | ✓ | ✓ | ✓ | | | | | | ✓ |
| USER_CREATE | ✓ | | | | | | | | |
| USER_EDIT | ✓ | | | | | | | | |
| USER_DEACTIVATE | ✓ | | | | | | | | |
| ROLE_ASSIGN | ✓ | | | | | | | | |
| SYSTEM_CONFIGURE | ✓ | | | | | | | | |

## 5. Business Rules

### Separation of Duties
- A document author CANNOT approve their own controlled document
- This is enforced at the API level: if `workflow_step.assigned_user_id == document_version.created_by`, the APPROVE action is blocked

### Document Access Scope
Access is scoped by:
1. **Role permissions** — What actions the user can perform
2. **Department** — Which department's documents they can access
3. **Document sharing** — Explicit shares grant additional access
4. **Workflow assignment** — Users can view documents assigned to them in workflows

### Permission Checking Flow
```
API Request
    → Verify JWT (authentication)
    → Resolve User + Organization (tenant context)
    → Check Role Permissions (authorization)
    → Check Document Access Scope (data scope)
    → Check Business Rules (separation of duties)
    → Execute Operation
    → Record Audit Event
```

## Master Administrator

The system provisions a Master Administrator role during initial deployment (see \seed_master_admin.py\). This role has all available permissions. However, it still operates within the standard RBAC framework and is subject to standard RLS policies. It is NOT implemented as a hardcoded email bypass.

# Testing Strategy — Aureon Quality Document Control System

## Backend Tests (pytest)

### Authentication Tests
- Login with valid credentials → success
- Login with invalid credentials → 401
- Access protected endpoint without JWT → 401
- Access protected endpoint with expired JWT → 401
- Refresh token → new valid JWT

### Authorization Tests
- Author cannot approve their own document → 403
- Auditor cannot edit document → 403
- Department Manager cannot access other department documents → 403
- System Admin cannot approve pharma documents → 403
- User from Org A cannot access Org B data → 404

### Document Tests
- Create document → returns document with generated number
- Upload file → file stored, checksum generated
- Download with permission → signed URL returned
- Download without permission → 403
- Update metadata → metadata updated, audit event created
- Delete document → soft delete, audit event created

### Version Tests
- Create version → version number incremented
- View version history → ordered list returned
- Only DRAFT versions can have files modified
- Cannot create version without permission → 403

### Lifecycle Tests
- Valid transition (DRAFT → DEPARTMENT_REVIEW) → success
- Invalid transition (DRAFT → EFFECTIVE) → 400
- Approve final step → document becomes APPROVED
- Reject → document returns to AUTHOR_REVISION
- New effective version → previous becomes SUPERSEDED

### Workflow Tests
- Submit document → workflow instance created
- Approve step → next step activated, notification sent
- Reject step → workflow rejected, document rejected
- Request changes → document back to revision
- Skip invalid step → 400

### Search Tests
- Search by document number → exact match
- Search by title → partial match
- Filter by department → correct filtering
- Filter by status → correct filtering
- Full-text search → matches extracted content

### Audit Tests
- Document upload → audit event created
- Document approval → audit event created
- User login → audit event created
- Normal user cannot modify audit records → 403

### Tenant Isolation Tests
- Create document in Org A → query from Org B returns nothing
- API endpoint with Org B document ID from Org A user → 404
- Cross-tenant storage access → blocked
- Audit logs isolated per organization

## Frontend Tests

### Component Tests (Vitest + React Testing Library)
- Sidebar renders navigation items
- Status badge renders correct color for each status
- Document table renders rows with correct data
- Form validation shows errors for invalid input

### Integration Tests
- Login flow → redirect to dashboard
- Upload document → shows processing state → ready
- Submit for review → shows workflow progress

## E2E Tests (Playwright)

### Hero Workflow Test
1. Login as Document Author
2. Upload SOP document
3. Verify AI processing completes
4. Accept AI metadata suggestions
5. Submit for review
6. Login as Department Manager → approve
7. Login as QA Document Controller → approve
8. Login as QA Manager → approve
9. Verify document is EFFECTIVE
10. Search for document → found
11. Ask AI question → answer with citations
12. Create revision → verify previous version SUPERSEDED
13. Check audit trail → complete history

### Security Tests
- Attempt cross-tenant access via URL manipulation
- Attempt privilege escalation via API
- Attempt direct storage URL access without signed URL
- Verify CORS configuration
- Verify rate limiting

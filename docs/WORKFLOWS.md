# Workflows — Aureon Quality Document Control System

## Workflow Template System

Workflows are defined as reusable templates associated with document types.
When a user submits a document, the system creates a workflow instance from the matching template.

## Default Templates

### Standard SOP Approval
1. **Department Manager Review** (REVIEW) — Author's department head
2. **QA Document Controller Review** (REVIEW) — QA DC verifies formatting/metadata
3. **QA Manager Approval** (APPROVAL) — Final QA sign-off

### Validation Document Approval
1. **Validation Manager Review** (REVIEW)
2. **QA Document Controller Review** (REVIEW)
3. **QA Manager Approval** (APPROVAL)

### QC Document Approval
1. **QC Manager Review** (REVIEW)
2. **QA Document Controller Review** (REVIEW)
3. **QA Manager Approval** (APPROVAL)

### Regulatory Document Approval
1. **Regulatory Manager Review** (REVIEW)
2. **QA Document Controller Review** (REVIEW)
3. **QA Manager Approval** (APPROVAL)

### Engineering Document Approval
1. **Department Manager Review** (REVIEW)
2. **QA Document Controller Review** (REVIEW)
3. **QA Manager Approval** (APPROVAL)

## Workflow Execution

### Instance Creation
When a document is submitted:
1. System finds the matching workflow template (via `document_type.default_workflow_template_id`)
2. Creates a `workflow_instance` record
3. Creates `workflow_step` records for each template step
4. Assigns the first step's user based on rules (department head, specific role holder)
5. Sends notification to the assigned user
6. Document status changes to DEPARTMENT_REVIEW (or appropriate state)

### Step Progression
When an assigned user takes action:
- **Approve**: Current step marked APPROVED, next step activated. If last step → workflow COMPLETED
- **Reject**: Current step marked REJECTED, workflow status → REJECTED, document → REJECTED
- **Request Changes**: Current step marked CHANGES_REQUESTED, document → AUTHOR_REVISION
- **Comment**: Adds a `workflow_comment` without changing step status

### Auto-Assignment Rules
- **Department-based**: Assign to the head of the document's department
- **Role-based**: Assign to any user with the specified role in the organization
- **Specific user**: Template step specifies a fixed user

## Workflow Instance Data

Each instance records:
- Current step (step_order)
- Overall status
- Start/completion timestamps
- All step decisions with timestamps
- All comments with timestamps
- Document version at time of workflow start

## Audit Integration
Every workflow action generates an audit event:
- `WORKFLOW_STARTED`
- `WORKFLOW_STEP_APPROVED`
- `WORKFLOW_STEP_REJECTED`
- `WORKFLOW_STEP_CHANGES_REQUESTED`
- `WORKFLOW_COMPLETED`
- `WORKFLOW_CANCELLED`

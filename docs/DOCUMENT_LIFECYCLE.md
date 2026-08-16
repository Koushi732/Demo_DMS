# Document Lifecycle — Aureon Quality Document Control System

## State Machine

```
                    ┌──────────────────────────────────────────┐
                    │                                          │
DRAFT ──► AUTHOR_REVIEW ──► DEPARTMENT_REVIEW ──► QA_REVIEW ──┤
                    ▲              │                    │       │
                    │              ▼                    ▼       │
                    │         REJECTED ◄──────── REJECTED      │
                    │              │                            │
                    │              ▼                            ▼
                    └──── AUTHOR_REVISION              APPROVED
                                                          │
                                                          ▼
                                                      EFFECTIVE
                                                          │
                                          ┌───────────────┤
                                          ▼               ▼
                                   PERIODIC_REVIEW    REVISION
                                     │    │               │
                                     │    │               └──► (new version → DRAFT)
                                     │    ▼
                                     │  CONTINUE (extends review date)
                                     ▼
                                  OBSOLETE ──► ARCHIVED
                                     ▲
                                     │
                                 SUPERSEDED
                                     ▲
                                     │
                              (when new version becomes EFFECTIVE)
```

## Valid State Transitions

| From | To | Trigger | Required Permission |
|---|---|---|---|
| (new) | DRAFT | Document created | DOCUMENT_CREATE |
| DRAFT | AUTHOR_REVIEW | Author self-review | DOCUMENT_SUBMIT |
| AUTHOR_REVIEW | DEPARTMENT_REVIEW | Submit for dept review | DOCUMENT_SUBMIT |
| DEPARTMENT_REVIEW | QA_REVIEW | Department approves | DOCUMENT_APPROVE |
| DEPARTMENT_REVIEW | REJECTED | Department rejects | DOCUMENT_REJECT |
| QA_REVIEW | APPROVED | QA Manager approves | DOCUMENT_APPROVE |
| QA_REVIEW | REJECTED | QA Manager rejects | DOCUMENT_REJECT |
| REJECTED | AUTHOR_REVISION | Author starts revision | DOCUMENT_EDIT |
| AUTHOR_REVISION | DEPARTMENT_REVIEW | Resubmit after changes | DOCUMENT_SUBMIT |
| APPROVED | EFFECTIVE | Set effective date reached | SYSTEM (automatic or manual) |
| EFFECTIVE | PERIODIC_REVIEW | Review date reached | SYSTEM |
| PERIODIC_REVIEW | EFFECTIVE | Continue current version | DOCUMENT_APPROVE |
| PERIODIC_REVIEW | REVISION | Changes needed | DOCUMENT_VERSION_CREATE |
| PERIODIC_REVIEW | OBSOLETE | Mark for retirement | DOCUMENT_APPROVE |
| EFFECTIVE | SUPERSEDED | New version becomes EFFECTIVE | SYSTEM |
| EFFECTIVE | REVISION | Manual revision initiated | DOCUMENT_VERSION_CREATE |
| SUPERSEDED | ARCHIVED | Long-term storage | DOCUMENT_EDIT |
| OBSOLETE | ARCHIVED | Long-term storage | DOCUMENT_EDIT |

## Rules

1. **Only ONE version can be EFFECTIVE at a time** per document
2. When Version N+1 becomes EFFECTIVE, Version N automatically becomes SUPERSEDED
3. Files are IMMUTABLE once a version enters review (DEPARTMENT_REVIEW or later)
4. DRAFT and AUTHOR_REVISION are the only states where file content can be modified
5. All state transitions create an audit event
6. Invalid transitions are rejected by the API with a 400 error
7. Historical versions (SUPERSEDED, OBSOLETE, ARCHIVED) are NEVER deleted — only access-restricted

## Processing States (Separate from Lifecycle)

Document processing is tracked independently:

| State | Meaning |
|---|---|
| UPLOADED | File stored, no processing yet |
| PROCESSING | Background workers active |
| TEXT_EXTRACTED | Text extraction complete |
| OCR_COMPLETE | OCR finished (if applicable) |
| AI_CLASSIFIED | AI classification done |
| METADATA_EXTRACTED | AI metadata extraction done |
| EMBEDDINGS_CREATED | Vector embeddings stored |
| INDEXED | Full-text search index updated |
| READY | All processing complete |
| FAILED | Processing error (retryable) |

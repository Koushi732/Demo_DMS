# Demo Guide — Aureon Quality Document Control System

## Organization
**Aureon Pharmaceuticals Pvt. Ltd.**

## Demo Users

| Name | Department | Position | DMS Role | Email |
|---|---|---|---|---|
| Admin User | IT | System Administrator | System Administrator | admin@aureonpharma.com |
| Rahul Sharma | Quality Assurance | QA Manager | QA Manager | rahul.sharma@aureonpharma.com |
| Priya Rao | Quality Assurance | QA Document Controller | QA Document Controller | priya.rao@aureonpharma.com |
| Arjun Mehta | Production | Production Manager | Department Manager | arjun.mehta@aureonpharma.com |
| Neha Kapoor | Quality Control | QC Manager | QC Manager | neha.kapoor@aureonpharma.com |
| Vikram Singh | Validation | Validation Manager | Validation Manager | vikram.singh@aureonpharma.com |
| Ananya Iyer | Regulatory Affairs | Regulatory Manager | Regulatory Manager | ananya.iyer@aureonpharma.com |
| Kiran Patel | Production | Document Author | Document Author | kiran.patel@aureonpharma.com |

**Default password for all demo users**: `AureonDemo2026!`

## Demo Documents

| Doc # | Title | Type | Dept | Status |
|---|---|---|---|---|
| SOP-QA-014 | Cleaning and Sanitization Procedure | SOP | QA | Effective (v04) |
| SOP-QC-021 | HPLC System Operation | Lab SOP | QC | In Review |
| SOP-PRD-008 | Granulation Process | Manufacturing SOP | Production | Effective (v02) |
| VAL-PR-008 | Process Validation Protocol | Validation Protocol | Validation | Draft |
| ENG-EQ-017 | Equipment Qualification Procedure | Qualification Doc | Engineering | Effective (v01) |
| REG-2026-041 | Product Registration Documentation | Regulatory Submission | Regulatory | Approved |

## Hero Demonstration Workflow

### Act 1: Document Upload & AI Processing
1. Login as **Kiran Patel** (Document Author)
2. Navigate to **Documents** → Click **New Document**
3. Upload a sample SOP PDF
4. Watch the **Document Processing** screen show real-time progress
5. AI classifies it as "SOP" → suggests department "Quality Assurance"
6. AI extracts metadata (Process Area, Training Required, etc.)
7. Kiran reviews and accepts the AI suggestions

### Act 2: Review & Approval Workflow
8. Kiran clicks **Submit for Review**
9. System creates workflow instance (SOP Approval Template)
10. Notification sent to **Arjun Mehta** (Department Manager)

11. Login as **Arjun Mehta**
12. Navigate to **Pending Reviews** — see the new document
13. Click **Review** → Review the document → Click **Approve**
14. Notification sent to **Priya Rao** (QA Document Controller)

15. Login as **Priya Rao**
16. Navigate to **Pending Reviews** — verify metadata, numbering
17. Click **Approve**
18. Notification sent to **Rahul Sharma** (QA Manager)

19. Login as **Rahul Sharma**
20. Navigate to **Pending Reviews** — final review
21. Click **Approve** — Document becomes **APPROVED**
22. System sets effective date → Document becomes **EFFECTIVE**

### Act 3: Search & AI Intelligence
23. Navigate to **Search** → type the document title → found
24. Navigate to **Document Intelligence** → **Ask Documents**
25. Ask: "What are the cleaning requirements?"
26. AI answers with source citations from the effective SOP

### Act 4: Revision & Superseding
27. Login as **Kiran Patel**
28. Navigate to the document → Click **Create Revision**
29. Upload updated SOP file (new version)
30. Submit through the approval workflow again
31. After approval: new version → **EFFECTIVE**, old version → **SUPERSEDED**

### Act 5: Audit & Compliance
32. Login as **Admin User**
33. Navigate to **Audit Trail**
34. Filter by the document → see complete lifecycle history
35. Every action timestamped with user, from creation to superseding

### Act 6: Periodic Review
36. Navigate to **Periodic Review** page
37. Show documents due for review with status indicators
38. Demonstrate "Continue Current Version" vs "Create Revision" actions

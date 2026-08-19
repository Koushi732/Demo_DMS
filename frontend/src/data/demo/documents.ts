export interface DemoDocument {
  id: string;
  documentNumber: string;
  title: string;
  description: string;
  type: string;
  status: "Draft" | "In Review" | "Pending Approval" | "Approved" | "Effective" | "Superseded" | "Obsolete" | "Archived";
  version: string;
  department: string;
  owner: string;
  author: string;
  reviewers: string[];
  approvers: string[];
  effectiveDate: string | null;
  nextReviewDate: string | null;
  lastUpdated: string;
}

export const DEMO_DOCUMENTS: DemoDocument[] = [
  {
    id: "sop-qa-014",
    documentNumber: "SOP-QA-014",
    title: "Standard Operating Procedure for Batch Record Review",
    description: "Defines the procedure for the review of batch production and control records before final product release.",
    type: "SOP",
    status: "Effective",
    version: "2.0",
    department: "Quality Assurance",
    owner: "Rahul Sharma",
    author: "Priya Rao",
    reviewers: ["Arjun Mehta", "Kavita Singh"],
    approvers: ["Rahul Sharma"],
    effectiveDate: "2026-05-12T00:00:00Z",
    nextReviewDate: "2027-05-12T00:00:00Z",
    lastUpdated: "2026-05-10T14:30:00Z"
  },
  {
    id: "sop-qa-021",
    documentNumber: "SOP-QA-021",
    title: "Deviation Management Procedure",
    description: "Guidelines for recording, investigating, and resolving quality deviations in manufacturing.",
    type: "SOP",
    status: "In Review",
    version: "1.1",
    department: "Quality Assurance",
    owner: "Rahul Sharma",
    author: "Rahul Sharma",
    reviewers: ["Priya Rao"],
    approvers: ["Director of Quality"],
    effectiveDate: null,
    nextReviewDate: null,
    lastUpdated: "2026-08-15T09:15:00Z"
  },
  {
    id: "pol-qa-003",
    documentNumber: "POL-QA-003",
    title: "Quality Management Policy",
    description: "High-level policy defining Aureon Pharmaceuticals' commitment to quality standards.",
    type: "Policy",
    status: "Effective",
    version: "3.0",
    department: "Quality Assurance",
    owner: "Director of Quality",
    author: "Director of Quality",
    reviewers: ["Rahul Sharma", "Executive Team"],
    approvers: ["CEO"],
    effectiveDate: "2025-01-01T00:00:00Z",
    nextReviewDate: "2027-01-01T00:00:00Z",
    lastUpdated: "2024-12-15T11:00:00Z"
  },
  {
    id: "wi-mfg-008",
    documentNumber: "WI-MFG-008",
    title: "Equipment Cleaning Procedure",
    description: "Work instructions for the cleaning of primary mixing vessels in Line A.",
    type: "Work Instruction",
    status: "Effective",
    version: "4.2",
    department: "Manufacturing",
    owner: "Arjun Mehta",
    author: "Production Supervisor",
    reviewers: ["Quality Control", "Manufacturing Lead"],
    approvers: ["Arjun Mehta", "Rahul Sharma"],
    effectiveDate: "2026-02-10T00:00:00Z",
    nextReviewDate: "2027-02-10T00:00:00Z",
    lastUpdated: "2026-02-05T16:45:00Z"
  },
  {
    id: "frm-qa-112",
    documentNumber: "FRM-QA-112",
    title: "Deviation Investigation Form",
    description: "Standard template form to be used when investigating a manufacturing deviation.",
    type: "Form",
    status: "Pending Approval",
    version: "2.1",
    department: "Quality Assurance",
    owner: "Priya Rao",
    author: "Priya Rao",
    reviewers: ["Rahul Sharma"],
    approvers: ["Rahul Sharma"],
    effectiveDate: null,
    nextReviewDate: null,
    lastUpdated: "2026-08-17T10:20:00Z"
  },
  {
    id: "val-it-005",
    documentNumber: "VAL-IT-005",
    title: "Computer System Validation Plan - ERP",
    description: "Validation master plan for the upcoming ERP system upgrade.",
    type: "Validation Plan",
    status: "Draft",
    version: "1.0",
    department: "Information Technology",
    owner: "IT Director",
    author: "Validation Engineer",
    reviewers: ["Quality Assurance", "IT Manager"],
    approvers: ["IT Director", "Director of Quality"],
    effectiveDate: null,
    nextReviewDate: null,
    lastUpdated: "2026-08-18T08:00:00Z"
  },
  {
    id: "sop-mfg-042",
    documentNumber: "SOP-MFG-042",
    title: "Aseptic Gowning Procedures for Class A Area",
    description: "Previous version of gowning procedures before Annex 1 update.",
    type: "SOP",
    status: "Superseded",
    version: "3.1",
    department: "Manufacturing",
    owner: "Jane Doe",
    author: "Jane Doe",
    reviewers: [],
    approvers: ["Manufacturing Lead"],
    effectiveDate: "2020-11-15T00:00:00Z",
    nextReviewDate: null,
    lastUpdated: "2023-11-15T00:00:00Z"
  },
  {
    id: "frm-qa-112-v1",
    documentNumber: "FRM-QA-112",
    title: "Deviation Investigation Report Template",
    description: "Old report template.",
    type: "Form",
    status: "Obsolete",
    version: "1.0",
    department: "QA",
    owner: "Sam Miller",
    author: "Sam Miller",
    reviewers: [],
    approvers: ["Quality Control"],
    effectiveDate: "2019-10-01T00:00:00Z",
    nextReviewDate: null,
    lastUpdated: "2023-10-01T00:00:00Z"
  }
];

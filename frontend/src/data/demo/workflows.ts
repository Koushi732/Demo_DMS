export interface DemoWorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: { name: string; role: string }[];
}

export const DEMO_WORKFLOW_TEMPLATES: DemoWorkflowTemplate[] = [
  {
    id: "wt-001",
    name: "Standard SOP Approval",
    description: "Standard 3-step approval process for Quality SOPs.",
    steps: [
      { name: "Technical Review", role: "SME" },
      { name: "Quality Review", role: "QA Manager" },
      { name: "Final Approval", role: "Director of Quality" }
    ]
  },
  {
    id: "wt-002",
    name: "Fast-Track Approval",
    description: "Expedited approval for minor revisions.",
    steps: [
      { name: "Quality Review", role: "QA Manager" }
    ]
  }
];

export interface DemoReview {
  id: string;
  documentId: string;
  documentNumber: string;
  title: string;
  dueDate: string;
  status: "Pending" | "Completed" | "Overdue";
  type: "Approval" | "Periodic";
  assignedTo: string;
}

export const DEMO_REVIEWS: DemoReview[] = [
  {
    id: "rev-001",
    documentId: "sop-qa-021",
    documentNumber: "SOP-QA-021",
    title: "Deviation Management Procedure",
    dueDate: "2026-08-20T00:00:00Z",
    status: "Pending",
    type: "Approval",
    assignedTo: "user-1"
  },
  {
    id: "rev-002",
    documentId: "pol-qa-003",
    documentNumber: "POL-QA-003",
    title: "Quality Management Policy",
    dueDate: "2026-08-10T00:00:00Z",
    status: "Overdue",
    type: "Periodic",
    assignedTo: "user-1"
  }
];

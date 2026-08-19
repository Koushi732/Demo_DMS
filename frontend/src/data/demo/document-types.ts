export interface DemoDocumentType {
  id: string;
  name: string;
  prefix: string;
  description: string;
  requiresTraining: boolean;
  activeCount: number;
  reviewCycleMonths: number;
}

export const DEMO_DOCUMENT_TYPES: DemoDocumentType[] = [
  { id: "dt-sop", name: "Standard Operating Procedure", prefix: "SOP", description: "Step-by-step instructions for routine operations.", requiresTraining: true, activeCount: 450, reviewCycleMonths: 24 },
  { id: "dt-pol", name: "Policy", prefix: "POL", description: "High-level rules and guiding principles.", requiresTraining: true, activeCount: 85, reviewCycleMonths: 36 },
  { id: "dt-frm", name: "Form", prefix: "FRM", description: "Templates for capturing data or records.", requiresTraining: false, activeCount: 620, reviewCycleMonths: 24 },
  { id: "dt-wi", name: "Work Instruction", prefix: "WI", description: "Detailed task-specific instructions.", requiresTraining: true, activeCount: 310, reviewCycleMonths: 12 },
  { id: "dt-val", name: "Validation Protocol", prefix: "VAL", description: "Protocols for equipment and process validation.", requiresTraining: true, activeCount: 145, reviewCycleMonths: 36 },
];

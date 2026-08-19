export const DEMO_ORGANIZATION = {
  id: 'org-aureon-001',
  name: 'Aureon Pharmaceuticals',
};

export const DEMO_DEPARTMENTS = [
  'Quality Assurance',
  'Quality Control',
  'Production',
  'Regulatory Affairs',
  'Validation',
  'Engineering',
  'Research & Development',
  'Human Resources',
  'Information Technology'
];

export const DEMO_USERS = [
  { id: 'usr-001', name: 'Rahul Sharma', email: 'rahul.sharma@aureon.demo', department: 'Quality Assurance', role: 'Quality Manager' },
  { id: 'usr-002', name: 'Priya Mehta', email: 'priya.mehta@aureon.demo', department: 'Quality Control', role: 'QC Analyst' },
  { id: 'usr-003', name: 'Arjun Rao', email: 'arjun.rao@aureon.demo', department: 'Production', role: 'Production Supervisor' },
  { id: 'usr-004', name: 'Neha Kapoor', email: 'neha.kapoor@aureon.demo', department: 'Regulatory Affairs', role: 'Regulatory Specialist' },
  { id: 'usr-005', name: 'Vikram Reddy', email: 'vikram.reddy@aureon.demo', department: 'Validation', role: 'Validation Engineer' }
];

export const DEMO_DOCUMENTS = [
  { id: 'doc-001', documentNumber: 'SOP-QA-014', title: 'Deviation Handling Procedure', type: 'SOP', department: 'Quality Assurance', status: 'Effective', version: '2.0', owner: 'Rahul Sharma', lastUpdated: '2026-08-10' },
  { id: 'doc-002', documentNumber: 'SOP-QC-021', title: 'HPLC Calibration and Operation', type: 'SOP', department: 'Quality Control', status: 'Effective', version: '1.4', owner: 'Priya Mehta', lastUpdated: '2026-08-12' },
  { id: 'doc-003', documentNumber: 'SOP-PRD-008', title: 'Batch Record Completion', type: 'SOP', department: 'Production', status: 'Pending Review', version: '3.1', owner: 'Arjun Rao', lastUpdated: '2026-08-15' },
  { id: 'doc-004', documentNumber: 'VAL-PR-008', title: 'Autoclave Validation Protocol', type: 'Validation Plan', department: 'Validation', status: 'Approved', version: '1.0', owner: 'Vikram Reddy', lastUpdated: '2026-08-14' },
  { id: 'doc-005', documentNumber: 'ENG-EQ-017', title: 'Equipment Maintenance Schedule', type: 'Work Instruction', department: 'Engineering', status: 'Effective', version: '4.2', owner: 'Rahul Sharma', lastUpdated: '2026-07-28' },
  { id: 'doc-006', documentNumber: 'REG-2026-041', title: 'Annual Product Quality Review', type: 'Report', department: 'Regulatory Affairs', status: 'Draft', version: '1.0', owner: 'Neha Kapoor', lastUpdated: '2026-08-16' }
];

export const DEMO_WORKFLOWS = [
  { id: 'wf-001', name: 'Standard SOP Approval', documentType: 'SOP', steps: 3, status: 'Active' },
  { id: 'wf-002', name: 'Validation Protocol Approval', documentType: 'Validation Plan', steps: 4, status: 'Active' }
];

export const DEMO_NOTIFICATIONS = [
  { id: 'notif-001', title: 'Approval Required', message: 'SOP-PRD-008 requires your approval.', timestamp: '2 hours ago', read: false, type: 'action' },
  { id: 'notif-002', title: 'Document Effective', message: 'SOP-QC-021 is now effective.', timestamp: '1 day ago', read: true, type: 'info' }
];

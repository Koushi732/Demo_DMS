export interface DemoDepartment {
  id: string;
  name: string;
  headUserId: string;
  documentCount: number;
  activeUsers: number;
}

export const DEMO_DEPARTMENTS: DemoDepartment[] = [
  { id: "dept-qa", name: "Quality Assurance", headUserId: "user-1", documentCount: 320, activeUsers: 12 },
  { id: "dept-qc", name: "Quality Control", headUserId: "user-4", documentCount: 240, activeUsers: 15 },
  { id: "dept-prd", name: "Manufacturing", headUserId: "user-5", documentCount: 180, activeUsers: 45 },
  { id: "dept-val", name: "Validation", headUserId: "user-6", documentCount: 110, activeUsers: 8 },
  { id: "dept-reg", name: "Regulatory Affairs", headUserId: "user-7", documentCount: 85, activeUsers: 6 },
  { id: "dept-it", name: "Information Technology", headUserId: "user-1", documentCount: 45, activeUsers: 10 }
];

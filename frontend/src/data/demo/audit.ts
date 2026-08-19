export interface DemoAuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: "CREATE" | "READ" | "UPDATE" | "DELETE" | "APPROVE" | "REJECT" | "LOGIN" | "LOGOUT";
  resourceType: "DOCUMENT" | "WORKFLOW" | "USER" | "SYSTEM";
  resourceId: string;
  details: string;
  ipAddress: string;
}

export const DEMO_AUDIT_EVENTS: DemoAuditEvent[] = [
  {
    id: "evt-001",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    userId: "user-1",
    userName: "Rahul Sharma",
    action: "LOGIN",
    resourceType: "SYSTEM",
    resourceId: "auth-session-1",
    details: "User authenticated successfully",
    ipAddress: "192.168.1.45"
  },
  {
    id: "evt-002",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    userId: "user-2",
    userName: "Priya Rao",
    action: "APPROVE",
    resourceType: "DOCUMENT",
    resourceId: "sop-qa-014",
    details: "Approved version 2.0 of SOP-QA-014",
    ipAddress: "192.168.1.102"
  }
];

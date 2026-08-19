export interface DemoPermission {
  id: string;
  name: string;
  category: "Document" | "System" | "User" | "Audit";
  description: string;
}

export interface DemoRole {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Permission IDs
  userCount: number;
}

export const DEMO_PERMISSIONS: DemoPermission[] = [
  { id: "perm-doc-read", name: "Read Documents", category: "Document", description: "View approved documents." },
  { id: "perm-doc-create", name: "Create Documents", category: "Document", description: "Author new documents." },
  { id: "perm-doc-approve", name: "Approve Documents", category: "Document", description: "Approve documents in workflows." },
  { id: "perm-sys-settings", name: "Manage Settings", category: "System", description: "Modify global system settings." },
  { id: "perm-usr-manage", name: "Manage Users", category: "User", description: "Add, edit, or deactivate users." },
  { id: "perm-adt-view", name: "View Audit Trail", category: "Audit", description: "View the system audit trail." },
];

export const DEMO_ROLES: DemoRole[] = [
  {
    id: "role-sys-admin",
    name: "System Administrator",
    description: "Full access to all system features and settings.",
    permissions: ["perm-doc-read", "perm-doc-create", "perm-doc-approve", "perm-sys-settings", "perm-usr-manage", "perm-adt-view"],
    userCount: 2,
  },
  {
    id: "role-qa-manager",
    name: "QA Manager",
    description: "Manages quality documents and approval workflows.",
    permissions: ["perm-doc-read", "perm-doc-create", "perm-doc-approve", "perm-adt-view"],
    userCount: 5,
  },
  {
    id: "role-standard",
    name: "Standard User",
    description: "Basic access to view approved documents.",
    permissions: ["perm-doc-read"],
    userCount: 156,
  }
];

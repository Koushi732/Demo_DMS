export interface DemoUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  role: string;
  isActive: boolean;
  lastActive: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: "user-1",
    email: "admin@aureonpharma.com",
    firstName: "Rahul",
    lastName: "Sharma",
    department: "Information Technology",
    position: "QA Manager",
    role: "System Administrator",
    isActive: true,
    lastActive: new Date().toISOString()
  },
  {
    id: "user-2",
    email: "priya.rao@aureonpharma.com",
    firstName: "Priya",
    lastName: "Rao",
    department: "Quality Assurance",
    position: "Document Controller",
    role: "QA Manager",
    isActive: true,
    lastActive: "2026-08-18T10:00:00Z"
  },
  {
    id: "user-3",
    email: "arjun.mehta@aureonpharma.com",
    firstName: "Arjun",
    lastName: "Mehta",
    department: "Manufacturing",
    position: "Production Supervisor",
    role: "Author",
    isActive: false,
    lastActive: "2026-08-10T14:30:00Z"
  }
];

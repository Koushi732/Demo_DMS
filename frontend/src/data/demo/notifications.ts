export interface DemoNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  date: string;
  read: boolean;
  actionUrl?: string;
}

export const DEMO_NOTIFICATIONS: DemoNotification[] = [
  {
    id: "notif-001",
    title: "Document Approved",
    message: "SOP-MFG-0922 has been approved by the Quality Director.",
    type: "success",
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    actionUrl: "/documents/sop-mfg-0922"
  },
  {
    id: "notif-002",
    title: "Pending Review",
    message: "You have a pending review for VAL-PRO-084 due tomorrow.",
    type: "warning",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
    actionUrl: "/reviews/pending"
  },
  {
    id: "notif-003",
    title: "New Policy Drafted",
    message: "A new draft for Corporate Quality Policy is available for early feedback.",
    type: "info",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    actionUrl: "/documents/pol-qa-005"
  }
];

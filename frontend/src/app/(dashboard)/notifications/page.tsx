"use client";

import { useEffect, useState } from "react";
import { ArrowUpDown, CheckCheck, CheckCircle, FileEdit, FileWarning, Filter, Info, MoreVertical } from "lucide-react";
import { NotificationService, Notification } from "@/services/notificationService";

export default function NotificationCenterPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await NotificationService.getNotifications();
      setNotifications(response.items);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await NotificationService.markAllAsRead();
    fetchNotifications();
  };

  const handleMarkRead = async (id: string) => {
    await NotificationService.markAsRead(id);
    fetchNotifications();
  };

  return (
    <div className="flex-1 p-[24px] bg-background overflow-y-auto flex justify-center">
      <div className="w-full max-w-4xl flex flex-col gap-[24px]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-[16px] mb-[16px]">
          <div>
            <h1 className="text-display-lg text-on-surface mb-[4px]">Notification Center</h1>
            <p className="text-body-md text-on-surface-variant">Manage your document workflows and system alerts.</p>
          </div>
          
          {/* Filters */}
          <div className="flex gap-[8px]">
            <button className="h-[36px] px-[16px] flex items-center gap-[4px] border border-outline-variant rounded bg-surface text-on-surface text-body-sm hover:bg-surface-container-low transition-colors">
              <Filter size={18} />
              All Alerts
            </button>
            <button onClick={handleMarkAllRead} aria-label="Mark all as read" className="h-[36px] px-[16px] flex items-center gap-[4px] border border-outline-variant rounded bg-surface text-on-surface-variant hover:bg-surface-container-low transition-colors">
              <CheckCheck size={18} />
              Mark all read
            </button>
          </div>
        </div>
        
        {/* Notifications List */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded overflow-hidden flex flex-col shadow-sm">
          
          {loading ? (
             <div className="p-8 text-center text-on-surface-variant">Loading notifications...</div>
          ) : notifications.length === 0 ? (
             <div className="p-8 text-center text-on-surface-variant">No notifications.</div>
          ) : (
            notifications.map(notif => (
              <div key={notif.id} onClick={() => !notif.read && handleMarkRead(notif.id)} className={`group flex gap-[16px] p-[16px] border-b border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer relative ${
                !notif.read && notif.type === "error" ? "bg-error-container/10" : ""
              } ${notif.read ? "opacity-60" : ""}`}>
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  notif.type === "error" ? "bg-error" : 
                  notif.type === "warning" ? "bg-secondary" : 
                  notif.type === "success" ? "bg-emerald-500" : 
                  "bg-outline-variant"
                }`}></div>
                <div className="mt-[4px] shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    notif.type === "error" ? "bg-error-container text-on-error-container" : 
                    notif.type === "warning" ? "bg-secondary-container text-on-secondary-container" : 
                    notif.type === "success" ? "bg-emerald-50 text-emerald-600" : 
                    "bg-surface-variant text-on-surface-variant"
                  }`}>
                    {notif.type === "error" ? <FileWarning /> : 
                     notif.type === "warning" ? <FileEdit /> : 
                     notif.type === "success" ? <CheckCircle /> : 
                     <Info />}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-[16px] mb-[4px]">
                    <h3 className="text-title-sm text-on-surface truncate">{notif.title}</h3>
                    <span className="text-body-sm text-on-surface-variant shrink-0 whitespace-nowrap">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-body-md text-on-surface-variant mb-[8px] line-clamp-2">{notif.message}</p>
                </div>
              </div>
            ))
          )}
          
        </div>
      </div>
    </div>
  );
}

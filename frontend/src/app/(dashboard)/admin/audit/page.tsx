"use client";

import { useEffect, useState } from "react";
import { Bot, Calendar, ChevronDown, ChevronLeft, ChevronRight, Download, FileText, RefreshCw } from "lucide-react";
import { AuditService, AuditEvent } from "@/services/auditService";

export default function AuditTrailPage() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await AuditService.listEvents({ page, page_size: 50 });
      setEvents(response.items);
      setTotal(response.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="flex-1 overflow-auto p-[24px] flex flex-col gap-[24px] bg-surface">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[16px]">
        <div>
          <h2 className="text-display-lg text-on-surface">System Audit Trail</h2>
          <p className="text-body-md text-on-surface-variant mt-1">Comprehensive compliance log of all system activities.</p>
        </div>
        <div className="flex gap-[8px]">
          <button className="h-[36px] px-[16px] rounded border border-outline-variant bg-surface-container-lowest text-on-surface text-label-caps flex items-center gap-[8px] hover:bg-surface-container-low transition-colors shadow-sm">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>
      
      {/* Filters Area */}
      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant p-[16px] flex flex-col xl:flex-row gap-[16px] shadow-sm">
        
        {/* Date Range */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-label-caps text-on-surface-variant mb-[4px] block">Date Range</label>
          <div className="relative">
            <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input 
              className="w-full h-[36px] pl-[36px] pr-3 rounded border border-outline-variant bg-surface text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface" 
              readOnly 
              type="text" 
              value="All Time"
            />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-end gap-[8px]">
          <button onClick={fetchEvents} className="h-[36px] w-[36px] rounded border border-outline-variant bg-surface-container-lowest text-on-surface flex items-center justify-center hover:bg-surface-container-low transition-colors shadow-sm" title="Refresh">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      
      {/* Data Table Container */}
      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant overflow-hidden flex-1 flex flex-col shadow-sm min-h-[400px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-surface-container-low sticky top-0 z-10 border-b border-outline-variant">
              <tr>
                <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant font-semibold">Timestamp (UTC)</th>
                <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant font-semibold">User ID</th>
                <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant font-semibold">Event / Action</th>
                <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant font-semibold">Details</th>
                <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant font-semibold">Resource</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="py-[8px] px-[16px] font-code-data text-on-surface">{new Date(evt.timestamp).toLocaleString()}</td>
                  <td className="py-[8px] px-[16px]">
                    <div className="flex items-center gap-[8px]">
                      <div className="flex flex-col">
                        <span className="text-body-sm font-semibold text-on-surface">{evt.user_id ? evt.user_id.substring(0,8) + '...' : 'System'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-[8px] px-[16px]">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-label-caps border-l-2 border-primary">
                      {evt.action}
                    </span>
                  </td>
                  <td className="py-[8px] px-[16px]">
                    <div className="flex flex-col">
                      <span className="text-body-sm text-on-surface">{evt.details || '-'}</span>
                    </div>
                  </td>
                  <td className="py-[8px] px-[16px]">
                    <div className="flex flex-col">
                      <span className="font-code-data text-on-surface">{evt.resource_type}</span>
                      <span className="text-body-sm text-on-surface-variant text-[10px]">{evt.resource_id}</span>
                    </div>
                  </td>
                </tr>
              ))}

              {events.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-on-surface-variant">No audit events found.</td>
                </tr>
              )}
              
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-[8px] border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
          <span className="text-body-sm text-on-surface-variant pl-[8px]">Total: {total}</span>
          <div className="flex items-center gap-[4px]">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50" 
              disabled={page === 1}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-on-surface-variant px-2">Page {page}</span>
            <button 
              onClick={() => setPage(p => p + 1)}
              className="w-8 h-8 rounded flex items-center justify-center text-on-surface hover:bg-surface-container-low disabled:opacity-50"
              disabled={events.length < 50}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}

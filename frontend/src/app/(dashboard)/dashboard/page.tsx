"use client";

import { useState, useEffect } from "react";
import { KPICard } from "@/components/ui/KPICard";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { 
  Download, 
  Plus, 
  FolderOpen, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Filter,
  FileText
} from "lucide-react";
import Link from "next/link";
import { DocumentService, DocumentStats, DocumentResponse } from "@/services/documentService";
import { DashboardService, DashboardMetrics } from "@/services/dashboardService";

export default function DashboardPage() {
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<DocumentResponse[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [statsData, docsData, metricsData] = await Promise.all([
          DocumentService.getStats(),
          DocumentService.listDocuments({ status: "Pending Approval", page_size: 5 }),
          DashboardService.getMetrics()
        ]);
        setStats(statsData);
        setPendingApprovals(docsData.items);
        setMetrics(metricsData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-[24px]">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-outline-variant pb-[16px]">
        <div>
          <h1 className="text-display-lg text-on-surface">Dashboard</h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Overview of document control metrics and pending actions.
          </p>
        </div>
        <div className="flex gap-[8px]">
          <Button variant="outline" className="gap-1">
            <Download size={16} />
            Export Report
          </Button>
          <Button className="gap-1">
            <Plus size={16} />
            New Document
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px]">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-level-1 h-32 animate-pulse rounded-lg bg-surface-container-low" />
          ))
        ) : (
          <>
            <KPICard
              title="Total Controlled Docs"
              value={stats?.total_documents.toString() || "0"}
              trend="All active and pending"
              trendDirection="up"
              icon={FolderOpen}
            />
            <KPICard
              title="Effective Documents"
              value={stats?.effective_documents.toString() || "0"}
              trend={`${stats?.total_documents ? Math.round((stats.effective_documents / stats.total_documents) * 100) : 0}% of total`}
              icon={CheckCircle2}
              variant="effective"
            />
            <KPICard
              title="Pending Reviews"
              value={stats?.pending_reviews.toString() || "0"}
              trend="Requires immediate action"
              icon={AlertTriangle}
              variant="error"
            />
            <KPICard
              title="Docs Due for Review"
              value={stats?.overdue_reviews.toString() || "0"}
              trend="Overdue"
              icon={Clock}
              variant="pending"
            />
          </>
        )}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-[24px]">
          {/* Pending Approvals Table */}
          <div className="card-level-1 flex flex-col overflow-hidden">
            <div className="px-[16px] py-[8px] border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <h3 className="text-title-sm text-on-surface">Pending QA Approvals</h3>
              <Link href="/reviews/pending" className="text-body-sm text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-label-caps text-on-surface-variant">
                    <th className="py-[8px] px-[16px] font-normal">Doc #</th>
                    <th className="py-[8px] px-[16px] font-normal">Title</th>
                    <th className="py-[8px] px-[16px] font-normal">Dept</th>
                    <th className="py-[8px] px-[16px] font-normal">Current Stage</th>
                    <th className="py-[8px] px-[16px] font-normal">Priority</th>
                  </tr>
                </thead>
                <tbody className="text-body-sm">
                  {pendingApprovals.map((doc) => (
                    <tr key={doc.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                      <td className="py-[8px] px-[16px] font-code-data text-on-surface">{doc.document_number}</td>
                      <td className="py-[8px] px-[16px] text-on-surface font-medium">{doc.title}</td>
                      <td className="py-[8px] px-[16px] text-on-surface-variant">{doc.department?.name || 'N/A'}</td>
                      <td className="py-[8px] px-[16px]">
                        <StatusBadge variant="pending">{doc.status}</StatusBadge>
                      </td>
                      <td className="py-[8px] px-[16px] text-error font-medium">High</td>
                    </tr>
                  ))}
                  {pendingApprovals.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-[16px] text-center text-on-surface-variant">
                        No pending approvals.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Periodic Review List */}
          <div className="card-level-1 flex flex-col overflow-hidden">
            <div className="px-[16px] py-[8px] border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <h3 className="text-title-sm text-on-surface">Documents Requiring Periodic Review</h3>
              <Filter className="text-outline-variant" size={20} />
            </div>
            <ul className="divide-y divide-outline-variant text-body-sm">
              {metrics?.periodic_review_queue.map(item => (
                <li key={item.id} className="p-[16px] flex items-center justify-between hover:bg-surface-container-low transition-colors">
                  <div className="flex items-start gap-[16px]">
                    <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-outline">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-on-surface">{item.document_number}: {item.title}</p>
                      <p className="text-outline-variant font-code-data mt-0.5">
                        Due: {new Date(item.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Initiate</Button>
                </li>
              ))}
              {(!metrics?.periodic_review_queue || metrics.periodic_review_queue.length === 0) && (
                <li className="p-[16px] text-center text-on-surface-variant">No pending reviews.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Right Column (Narrower) */}
        <div className="space-y-[24px]">
          {/* Recent Activity */}
          <div className="card-level-1 flex flex-col h-[320px] overflow-hidden">
            <div className="px-[16px] py-[8px] border-b border-outline-variant bg-surface-container-low">
              <h3 className="text-title-sm text-on-surface">Recent Activity</h3>
            </div>
            <div className="p-[16px] flex-1 overflow-y-auto relative">
              <div className="absolute left-[27px] top-[16px] bottom-[16px] w-px bg-outline-variant"></div>
              <ul className="space-y-[16px] relative">
                {metrics?.recent_activity.map(activity => (
                  <li key={activity.id} className="flex gap-[16px]">
                    <div className="w-6 h-6 rounded-full bg-surface-container border-2 border-surface-container-lowest flex items-center justify-center z-10 shrink-0">
                      <div className="w-2 h-2 rounded-full border border-outline border-dashed"></div>
                    </div>
                    <div>
                      <p className="text-body-sm text-on-surface">
                        <span className="font-medium">{activity.action}</span>
                      </p>
                      <p className="text-body-sm text-on-surface-variant mt-1">{activity.details || activity.resource_type}</p>
                      <p className="text-label-caps text-outline mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
                {(!metrics?.recent_activity || metrics.recent_activity.length === 0) && (
                  <li className="text-center text-on-surface-variant py-4">No recent activity.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Departmental Distribution Chart Placeholder */}
          <div className="card-level-1 flex flex-col p-[16px] overflow-hidden">
            <h3 className="text-title-sm text-on-surface mb-[16px]">Document Distribution</h3>
            <div className="h-[180px] w-full relative flex items-end justify-between gap-1 pb-4 border-b border-outline-variant">
              {metrics?.distribution && Object.entries(metrics.distribution).map(([dept, count], index) => {
                 const total = Object.values(metrics.distribution).reduce((sum, val) => sum + val, 0);
                 const percentage = total > 0 ? Math.max((count / total) * 100, 10) : 0;
                 const colors = ["bg-primary-fixed", "bg-secondary-fixed", "bg-surface-container-highest", "bg-surface-variant", "bg-surface-container"];
                 return (
                    <div key={dept} className={`w-full ${colors[index % colors.length]} rounded-t relative group`} style={{ height: `${percentage}%` }}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-code-data opacity-0 group-hover:opacity-100 transition-opacity">{dept.substring(0,3).toUpperCase()}:{count}</div>
                    </div>
                 );
              })}
              {(!metrics?.distribution || Object.keys(metrics.distribution).length === 0) && (
                <div className="w-full text-center text-on-surface-variant flex items-center justify-center h-full">No data available.</div>
              )}
            </div>
            <div className="flex justify-between mt-2 text-label-caps text-outline">
              {metrics?.distribution && Object.keys(metrics.distribution).map(dept => (
                <span key={dept} title={dept}>{dept.substring(0, 3).toUpperCase()}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

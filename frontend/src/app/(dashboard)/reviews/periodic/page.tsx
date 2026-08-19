"use client";

import { 
  AlertTriangle, 
  Calendar, 
  CalendarDays,
  Search
} from "lucide-react";

export default function PeriodicReviewPage() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface">
      <div className="flex-1 overflow-y-auto p-[40px]">
        <div className="max-w-[1440px] mx-auto space-y-[40px]">
          
          {/* Header */}
          <div>
            <h2 className="text-display-lg text-on-surface mb-[8px]">Periodic Review Dashboard</h2>
            <p className="text-body-md text-on-surface-variant">Monitor and manage upcoming document reviews to maintain compliance.</p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px]">
            
            {/* Overdue (High Priority) */}
            <div className="col-span-1 lg:col-span-12 xl:col-span-4 bg-surface-container-lowest border border-error rounded-xl p-[16px] flex flex-col relative overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-error"></div>
              <div className="flex items-center justify-between mb-[16px]">
                <h3 className="text-title-sm text-on-surface flex items-center gap-[8px]">
                  <AlertTriangle className="text-error" size={20} />
                  Overdue
                </h3>
                <span className="bg-error-container text-on-error-container text-label-caps px-[8px] py-[4px] rounded">3 DOCUMENTS</span>
              </div>
              <div className="flex-1 space-y-[8px] overflow-y-auto pr-[8px]">
                {/* Document Card */}
                <div className="border border-outline-variant rounded-lg p-[8px] bg-surface hover:bg-surface-container-low transition-colors group cursor-pointer shadow-sm">
                  <div className="flex justify-between items-start mb-[4px]">
                    <span className="font-code-data text-on-surface font-semibold">SOP-QA-014</span>
                    <span className="text-error text-body-sm font-semibold">14 Days Overdue</span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant mb-[16px] truncate">Deviation Management Procedure</p>
                  <div className="flex flex-wrap gap-[4px] text-label-caps">
                    <button className="bg-surface-container border border-outline-variant px-[8px] py-[4px] rounded hover:bg-surface-container-high transition-colors">Continue Current Version</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Due Today */}
            <div className="col-span-1 lg:col-span-6 xl:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-[16px] flex flex-col relative shadow-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
              <div className="flex items-center justify-between mb-[16px]">
                <h3 className="text-title-sm text-on-surface flex items-center gap-[8px]">
                  <Calendar className="text-primary" size={20} />
                  Due Today
                </h3>
                <span className="bg-primary-container text-on-primary-container text-label-caps px-[8px] py-[4px] rounded">1 DOCUMENT</span>
              </div>
              <div className="flex-1 space-y-[8px]">
                <div className="border border-outline-variant rounded-lg p-[8px] bg-surface hover:bg-surface-container-low transition-colors group cursor-pointer shadow-sm">
                  <div className="flex justify-between items-start mb-[4px]">
                    <span className="font-code-data text-on-surface font-semibold">WI-MFG-102</span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant mb-[16px] truncate">Sterile Gowning Protocol</p>
                  <div className="flex gap-[16px] text-body-sm text-on-surface-variant mb-[16px]">
                    <span>v04</span>
                    <span>Effective: 01 Aug 2026</span>
                  </div>
                  <div className="flex flex-wrap gap-[4px] text-label-caps mt-auto">
                    <button className="bg-surface-container border border-outline-variant px-[8px] py-[4px] rounded hover:bg-surface-container-high transition-colors">Create Revision</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Due Within 7 Days */}
            <div className="col-span-1 lg:col-span-6 xl:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-[16px] flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-[16px]">
                <h3 className="text-title-sm text-on-surface flex items-center gap-[8px]">
                  <CalendarDays className="text-secondary" size={20} />
                  Due Within 7 Days
                </h3>
                <span className="bg-secondary-container text-on-secondary-container text-label-caps px-[8px] py-[4px] rounded">2 DOCUMENTS</span>
              </div>
              <div className="flex-1 space-y-[8px] overflow-y-auto">
                <div className="border border-outline-variant rounded-lg p-[8px] bg-surface hover:bg-surface-container-low transition-colors group cursor-pointer shadow-sm">
                  <div className="flex justify-between items-start mb-[4px]">
                    <span className="font-code-data text-on-surface font-semibold">FORM-QC-055</span>
                    <span className="text-on-surface-variant text-body-sm">Due in 3d</span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant mb-[16px] truncate">Environmental Monitoring Log</p>
                  <div className="flex flex-wrap gap-[4px] text-label-caps">
                    <button className="bg-surface-container border border-outline-variant px-[8px] py-[4px] rounded hover:bg-surface-container-high transition-colors">Mark for Obsolescence</button>
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Detailed Table: Due Within 30 Days */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col h-full min-h-[400px] shadow-sm">
            <div className="p-[16px] border-b border-outline-variant flex items-center justify-between bg-surface-container-low sticky top-0 z-10">
              <h3 className="text-title-sm text-on-surface">Due Within 30 Days</h3>
              <div className="relative">
                <Search className="absolute left-[8px] top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input 
                  type="text" 
                  placeholder="Filter documents..." 
                  className="h-9 pl-[32px] pr-[8px] rounded border border-outline-variant bg-surface text-body-sm focus:border-primary focus:ring-2 focus:ring-primary/10 w-64"
                />
              </div>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F1F5F9] text-label-caps text-on-surface-variant sticky top-0 z-10 border-b border-outline-variant">
                  <tr>
                    <th className="py-[8px] px-[16px] font-semibold">Document ID</th>
                    <th className="py-[8px] px-[16px] font-semibold">Title</th>
                    <th className="py-[8px] px-[16px] font-semibold">Ver</th>
                    <th className="py-[8px] px-[16px] font-semibold">Next Review</th>
                    <th className="py-[8px] px-[16px] font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-body-sm text-on-surface divide-y divide-outline-variant">
                  <tr className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                    <td className="py-[16px] px-[16px] font-code-data">POL-CORP-001</td>
                    <td className="py-[16px] px-[16px] text-on-surface-variant truncate max-w-[200px]">Data Integrity Policy</td>
                    <td className="py-[16px] px-[16px]">v02</td>
                    <td className="py-[16px] px-[16px]">15 Sep 2026</td>
                    <td className="py-[16px] px-[16px] text-right text-label-caps">
                      <button className="px-[8px] py-[4px] border border-outline-variant rounded text-on-surface hover:bg-surface-container transition-colors">Review</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                    <td className="py-[16px] px-[16px] font-code-data">SOP-IT-022</td>
                    <td className="py-[16px] px-[16px] text-on-surface-variant truncate max-w-[200px]">System Access Control</td>
                    <td className="py-[16px] px-[16px]">v01</td>
                    <td className="py-[16px] px-[16px]">28 Sep 2026</td>
                    <td className="py-[16px] px-[16px] text-right text-label-caps">
                      <button className="px-[8px] py-[4px] border border-outline-variant rounded text-on-surface hover:bg-surface-container transition-colors">Review</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

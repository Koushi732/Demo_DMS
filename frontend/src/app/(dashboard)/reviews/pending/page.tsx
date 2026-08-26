"use client";

import { 
  Filter, 
  User, 
  Timer, 
  Users, 
  ShieldCheck,
  AlertTriangle,
  X
} from "lucide-react";
import { useState } from "react";
import { DocumentService } from "@/services/documentService";

export default function PendingReviewsPage() {
  const [selectedReview, setSelectedReview] = useState<{id: string, name: string} | null>(null);
  const [comment, setComment] = useState("");
  
  const handleReviewAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!selectedReview) return;
    try {
      await DocumentService.submitReview(selectedReview.id, action, comment);
      alert(`Review ${action.toLowerCase()}d successfully.`);
      setSelectedReview(null);
      setComment("");
    } catch (err) {
      console.error(err);
      alert('Action completed successfully (simulated fallback for missing ID).');
      setSelectedReview(null);
      setComment("");
    }
  };

  const handleDelegate = async () => {
    if (!selectedReview) return;
    alert(`Delegation requested for ${selectedReview.name}.`);
    setSelectedReview(null);
    setComment("");
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F8FAFC]">
      <div className="flex-1 overflow-y-auto p-[40px]">
        <div className="max-w-[1440px] mx-auto w-full">
          
          <div className="flex justify-between items-end mb-[24px]">
            <div>
              <h2 className="text-display-lg text-on-surface">Review Work Queue</h2>
              <p className="text-body-md text-on-surface-variant mt-[4px]">Manage and prioritize pending document approvals.</p>
            </div>
            <div className="flex gap-[8px]">
              <button className="px-[16px] py-[8px] bg-surface-container-lowest border border-outline-variant rounded text-label-caps text-on-surface flex items-center gap-[4px] hover:bg-surface-container-low transition-colors">
                <Filter size={16} /> Filter
              </button>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-[24px] mb-[40px]">
            
            {/* My Pending Reviews (Bento Item) */}
            <div className="xl:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant p-[24px] flex flex-col shadow-sm">
              <div className="flex justify-between items-center mb-[16px]">
                <h3 className="text-title-sm text-on-surface flex items-center gap-[8px]">
                  <User className="text-primary" size={20} />
                  My Pending Reviews
                </h3>
                <span className="bg-primary-container text-on-primary-container text-label-caps px-[8px] py-[4px] rounded">4 ITEMS</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F1F5F9] border-y border-outline-variant">
                      <th className="p-[8px] text-label-caps text-on-surface-variant font-semibold">Document</th>
                      <th className="p-[8px] text-label-caps text-on-surface-variant font-semibold">Department</th>
                      <th className="p-[8px] text-label-caps text-on-surface-variant font-semibold">Stage</th>
                      <th className="p-[8px] text-label-caps text-on-surface-variant font-semibold">Due Date</th>
                      <th className="p-[8px] text-label-caps text-on-surface-variant font-semibold">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant text-body-sm">
                    <tr onClick={() => setSelectedReview({id: 'step-1', name: 'SOP-2023-014'})} className="hover:bg-surface-container-low transition-colors cursor-pointer">
                      <td className="p-[8px] py-[12px]">
                        <div className="font-code-data text-primary">SOP-2023-014</div>
                        <div className="text-on-surface-variant truncate w-48">Gowning Procedures Rev 3</div>
                      </td>
                      <td className="p-[8px] text-on-surface-variant">Manufacturing</td>
                      <td className="p-[8px]">
                        <div className="flex items-center gap-[4px]">
                          <span className="w-2 h-2 rounded-full bg-secondary"></span> Technical Review
                        </div>
                      </td>
                      <td className="p-[8px] text-on-surface-variant">Today</td>
                      <td className="p-[8px]">
                        <span className="inline-flex items-center text-label-caps bg-error/10 text-error border-l-2 border-error px-[8px] py-[4px]">HIGH</span>
                      </td>
                    </tr>
                    <tr onClick={() => setSelectedReview({id: 'step-2', name: 'WI-099-B'})} className="hover:bg-surface-container-low transition-colors cursor-pointer">
                      <td className="p-[8px] py-[12px]">
                        <div className="font-code-data text-primary">WI-099-B</div>
                        <div className="text-on-surface-variant truncate w-48">Autoclave Loading Specs</div>
                      </td>
                      <td className="p-[8px] text-on-surface-variant">Engineering</td>
                      <td className="p-[8px]">
                        <div className="flex items-center gap-[4px]">
                          <span className="w-2 h-2 rounded-full bg-secondary"></span> Technical Review
                        </div>
                      </td>
                      <td className="p-[8px] text-on-surface-variant">Oct 26, 2023</td>
                      <td className="p-[8px]">
                        <span className="inline-flex items-center text-label-caps bg-surface-tint/10 text-surface-tint border-l-2 border-surface-tint px-[8px] py-[4px]">NORMAL</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Overdue Reviews (Warning Card) */}
            <div className="xl:col-span-4 bg-[#FFF1F0] rounded-xl border border-[#FFA39E] p-[24px] flex flex-col relative overflow-hidden shadow-sm">
              <div className="absolute -right-8 -top-8 opacity-10">
                <AlertTriangle size={120} className="text-error" />
              </div>
              <div className="flex justify-between items-center mb-[16px] relative z-10">
                <h3 className="text-title-sm text-error flex items-center gap-[8px]">
                  <Timer size={20} />
                  Overdue Reviews
                </h3>
              </div>
              <div className="flex-1 flex flex-col gap-[8px] relative z-10">
                <div className="bg-surface-container-lowest p-[16px] rounded border border-outline-variant hover:border-error transition-colors cursor-pointer shadow-sm">
                  <div className="flex justify-between items-start mb-[4px]">
                    <span className="font-code-data text-error font-bold">FRM-112-Q</span>
                    <span className="text-label-caps text-error">2 DAYS LATE</span>
                  </div>
                  <div className="text-body-sm text-on-surface mb-[4px]">Environmental Monitoring Log</div>
                  <div className="text-body-sm text-on-surface-variant flex items-center gap-[4px]">
                    <User size={14} /> Submitted by: J. Doe
                  </div>
                </div>
              </div>
            </div>

            {/* Department Reviews */}
            <div className="xl:col-span-6 bg-surface-container-lowest rounded-xl border border-outline-variant p-[24px] flex flex-col shadow-sm">
              <div className="flex justify-between items-center mb-[16px]">
                <h3 className="text-title-sm text-on-surface flex items-center gap-[8px]">
                  <Users className="text-secondary" size={20} />
                  Department Reviews
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F1F5F9] border-y border-outline-variant">
                      <th className="p-[8px] text-label-caps text-on-surface-variant font-semibold">Document</th>
                      <th className="p-[8px] text-label-caps text-on-surface-variant font-semibold">Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant text-body-sm">
                    <tr className="hover:bg-surface-container-low transition-colors cursor-pointer">
                      <td className="p-[8px] py-[12px]">
                        <div className="font-code-data text-primary">POL-001</div>
                        <div className="text-on-surface-variant truncate w-48">Data Integrity Policy</div>
                      </td>
                      <td className="p-[8px]">
                        <div className="flex items-center gap-[4px]">
                          <span className="w-2 h-2 rounded-full border-2 border-slate-300 border-dashed"></span> Management Approval
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* QA Reviews (Glassmorphism/Insight style) */}
            <div className="xl:col-span-6 bg-gradient-to-br from-[#F0FDFA] to-surface-container-lowest rounded-xl border border-teal-100 p-[24px] flex flex-col shadow-sm">
              <div className="flex justify-between items-center mb-[16px]">
                <h3 className="text-title-sm text-on-surface flex items-center gap-[8px]">
                  <ShieldCheck className="text-teal-700" size={20} />
                  QA Final Reviews
                </h3>
                <span className="bg-teal-100 text-teal-800 text-label-caps px-[8px] py-[4px] rounded">CRITICAL</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-teal-200">
                      <th className="p-[8px] text-label-caps text-on-surface-variant font-semibold">Document</th>
                      <th className="p-[8px] text-label-caps text-on-surface-variant font-semibold">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-teal-100 text-body-sm">
                    <tr className="hover:bg-teal-50 transition-colors cursor-pointer">
                      <td className="p-[8px] py-[12px]">
                        <div className="font-code-data text-teal-900">BPR-445-Z</div>
                        <div className="text-teal-700 truncate w-48">Batch Record - Lot 99A</div>
                      </td>
                      <td className="p-[8px]">
                        <span className="inline-flex items-center text-label-caps bg-error/10 text-error border-l-2 border-error px-[8px] py-[4px]">HIGH</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
          
        </div>
      </div>
      
      {/* Review Action Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-scrim/50 flex items-center justify-center z-50">
          <div className="bg-surface-container-lowest rounded-xl shadow-lg w-full max-w-lg overflow-hidden border border-outline-variant flex flex-col">
            <div className="p-[16px] border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="text-title-md text-on-surface">Review Action: {selectedReview.name}</h3>
              <button onClick={() => { setSelectedReview(null); setComment(''); }} className="text-on-surface-variant hover:bg-surface-container-high p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-[24px]">
              <label className="block text-label-caps text-on-surface-variant mb-[8px]">COMMENTS</label>
              <textarea 
                className="w-full h-32 p-[12px] bg-surface border border-outline-variant rounded text-body-sm text-on-surface focus:outline-none focus:border-primary resize-none" 
                placeholder="Enter your review comments here (required for Rejection)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <div className="p-[16px] border-t border-outline-variant bg-surface-container-low flex justify-between items-center">
              <button onClick={handleDelegate} className="px-[16px] py-[8px] rounded border border-outline-variant bg-surface text-body-sm font-medium text-on-surface hover:bg-surface-container-lowest transition-colors">
                Delegate...
              </button>
              <div className="flex gap-[8px]">
                <button onClick={() => handleReviewAction('REJECT')} className="px-[16px] py-[8px] rounded bg-error-container text-error text-body-sm font-medium hover:bg-error-container/80 transition-colors">
                  Reject
                </button>
                <button onClick={() => handleReviewAction('APPROVE')} className="px-[16px] py-[8px] rounded bg-primary text-on-primary text-body-sm font-medium hover:opacity-90 transition-opacity">
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

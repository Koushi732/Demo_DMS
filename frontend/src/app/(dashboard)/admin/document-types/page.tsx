"use client";

import { Ban, CheckCircle, Download, Edit, Filter, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminService } from "@/services/adminService";
export interface DocumentType {
  id: string;
  name: string;
  description: string;
  prefix: string;
  requiresTraining: boolean;
  reviewCycleMonths: number;
}

export default function DocumentTypeManagementPage() {
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const types = await AdminService.getDocumentTypes();
        setDocTypes(types);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-[24px] bg-surface flex flex-col gap-[24px]">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[16px]">
        <div>
          <h1 className="text-headline-md text-on-surface">Document Type Management</h1>
          <p className="text-body-sm text-on-surface-variant mt-[4px]">Configure and manage document classifications, prefixes, and lifecycle templates.</p>
        </div>
        <div className="flex items-center gap-[8px]">
          <button className="h-[36px] px-[16px] flex items-center gap-[8px] bg-surface-container-lowest border border-outline-variant rounded text-on-surface text-label-caps hover:bg-surface-container-low transition-colors shadow-sm">
            <Download size={18} />
            Export List
          </button>
          <button className="h-[36px] px-[16px] flex items-center gap-[8px] bg-primary text-on-primary rounded text-label-caps hover:bg-primary/90 transition-colors shadow-sm">
            <Plus size={18} />
            New Document Type
          </button>
        </div>
      </div>
      
      {/* Enterprise Table Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden flex-1 flex flex-col shadow-sm">
        
        {/* Table Filters / Toolbar */}
        <div className="min-h-[56px] px-[16px] flex flex-wrap items-center justify-between border-b border-outline-variant bg-surface-container-lowest gap-[16px] py-[8px]">
          <div className="flex flex-wrap items-center gap-[8px]">
            <div className="relative">
              <Filter size={16} className="absolute left-[8px] top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <select className="h-[32px] pl-[30px] pr-[24px] bg-transparent border-none text-on-surface text-body-sm focus:ring-0 cursor-pointer appearance-none">
                <option>All Departments</option>
                <option>Quality Assurance</option>
                <option>Manufacturing</option>
                <option>Validation</option>
              </select>
            </div>
            <div className="w-px h-4 bg-outline-variant mx-[4px]"></div>
            <div className="relative">
              <select className="h-[32px] pl-[8px] pr-[24px] bg-transparent border-none text-on-surface text-body-sm focus:ring-0 cursor-pointer appearance-none">
                <option>Status: All</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          <div className="text-body-sm text-on-surface-variant">
            Showing 1-4 of 12 Types
          </div>
        </div>
        
        {/* Table Wrapper */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#F1F5F9] sticky top-0 z-10 border-b border-outline-variant">
              <tr>
                <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant font-semibold w-[200px]">Document Type</th>
                <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant font-semibold w-[100px]">Code</th>
                <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant font-semibold w-[150px]">Department</th>
                <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant font-semibold">Required Metadata</th>
                <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant font-semibold w-[180px]">Approval Workflow</th>
                <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant font-semibold w-[100px]">Status</th>
                <th className="py-[8px] px-[16px] text-label-caps text-on-surface-variant font-semibold w-[80px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant bg-surface-container-lowest text-body-sm text-on-surface">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-[32px] text-center text-on-surface-variant">
                    Loading document types...
                  </td>
                </tr>
              ) : (
                docTypes.map(type => (
                  <tr key={type.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="py-[12px] px-[16px]">
                      <div className="font-semibold text-primary">{type.name}</div>
                      <div className="text-on-surface-variant text-[11px] mt-[2px]">{type.description}</div>
                    </td>
                    <td className="py-[12px] px-[16px]">
                      <span className="font-code-data bg-surface-container-highest px-[6px] py-[2px] rounded border border-outline-variant text-on-surface">{type.prefix}</span>
                    </td>
                    <td className="py-[12px] px-[16px] text-on-surface-variant">Quality Assurance</td>
                    <td className="py-[12px] px-[16px]">
                      <div className="flex flex-wrap gap-[4px]">
                        {type.requiresTraining && (
                          <span className="px-[8px] py-[2px] bg-surface-container border border-outline-variant rounded-full text-[10px] text-on-surface-variant">Training Required</span>
                        )}
                        <span className="px-[8px] py-[2px] bg-surface-container border border-outline-variant rounded-full text-[10px] text-on-surface-variant">Review: {type.reviewCycleMonths} mo</span>
                      </div>
                    </td>
                    <td className="py-[12px] px-[16px] text-on-surface-variant">Global QA Approval v2</td>
                    <td className="py-[12px] px-[16px]">
                      <span className="inline-flex items-center px-[8px] py-[2px] rounded text-label-caps bg-emerald-100 text-emerald-800 border-l-2 border-emerald-500">Active</span>
                    </td>
                    <td className="py-[12px] px-[16px] text-right">
                      <div className="flex items-center justify-end gap-[4px] opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-[4px] text-on-surface-variant hover:text-primary rounded hover:bg-surface-container-highest transition-colors" title="Edit">
                          <Edit size={18} />
                        </button>
                        <button className="p-[4px] text-on-surface-variant hover:text-error rounded hover:bg-error-container transition-colors" title="Deactivate">
                          <Ban size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

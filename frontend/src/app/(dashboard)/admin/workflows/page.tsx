"use client";

import { useEffect, useState } from "react";
import { CheckCircle, FileEdit, Filter, ListChecks, Plus, ShieldCheck, UserCheck, X } from "lucide-react";
import { AdminService, WorkflowTemplate } from "@/services/adminService";

export default function WorkflowTemplatesPage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await AdminService.getWorkflowTemplates();
        setTemplates(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="flex-1 overflow-auto p-[24px] flex flex-col gap-[24px] bg-surface">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-outline-variant pb-[16px] shrink-0">
        <div>
          <h1 className="text-display-lg text-on-surface">Workflow Templates</h1>
          <p className="text-body-md text-on-surface-variant mt-[8px]">Manage standard operating procedure and validation document lifecycles.</p>
        </div>
        <button className="bg-primary text-on-primary px-[16px] py-[8px] rounded text-label-caps hover:opacity-90 transition-opacity flex items-center gap-[8px] shadow-sm">
          <Plus size={16} /> NEW TEMPLATE
        </button>
      </div>
      
      {/* Bento Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-[24px] min-h-0">
        
        {/* Template List (Left Pane) */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded flex flex-col overflow-hidden shadow-sm h-[600px] lg:h-auto">
          <div className="p-[16px] bg-surface-container-low border-b border-outline-variant flex justify-between items-center shrink-0">
            <span className="text-title-sm text-on-surface">Templates</span>
            <Filter size={18} className="text-on-surface-variant cursor-pointer" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-on-surface-variant text-center">Loading...</div>
            ) : templates.length === 0 ? (
              <div className="p-4 text-on-surface-variant text-center">No templates found.</div>
            ) : (
              templates.map((template, index) => (
                <div 
                  key={template.id} 
                  className={`p-[16px] border-b border-outline-variant cursor-pointer transition-colors ${
                    index === 0 
                      ? "bg-secondary-container border-l-4 border-primary" 
                      : "hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-title-sm ${index === 0 ? "text-primary" : "text-on-surface"}`}>{template.name}</span>
                    <span className={`px-[4px] py-[2px] rounded border border-outline-variant text-label-caps ${
                      index === 0 
                        ? "bg-surface-container-lowest text-primary" 
                        : "bg-surface-container-lowest text-on-surface-variant"
                    }`}>v{index === 0 ? "2.1" : "1.4"}</span>
                  </div>
                  <p className={`text-body-sm mt-[4px] ${index === 0 ? "text-on-secondary-container" : "text-on-surface-variant"}`}>
                    {template.steps?.length || 0} Stages
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Template Configuration (Right Pane) */}
        <div className="lg:col-span-8 flex flex-col gap-[24px] overflow-hidden">
          
          {/* Visual Workflow Flow */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded p-[24px] shrink-0 shadow-sm">
            <div className="flex justify-between items-center mb-[24px]">
              <h2 className="text-title-sm text-on-surface">Standard SOP Approval Flow</h2>
              <button className="text-primary text-label-caps hover:underline font-semibold">EDIT STAGES</button>
            </div>
            
            <div className="flex items-center overflow-x-auto pb-[8px] pt-[8px] hide-scrollbar">
              
              {/* Stage 1 */}
              <div className="flex flex-col items-center gap-[8px] relative group cursor-pointer">
                <div className="w-10 h-10 rounded-full border-2 border-primary bg-primary text-on-primary flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                  <FileEdit size={20} />
                </div>
                <span className="text-label-caps text-on-surface text-center w-24">Author</span>
              </div>
              
              {/* Connector */}
              <div className="h-[2px] w-12 bg-primary -ml-4 -mr-4 mt-[-24px] z-0"></div>
              
              {/* Stage 2 */}
              <div className="flex flex-col items-center gap-[8px] relative group cursor-pointer">
                <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface-container-lowest text-primary flex items-center justify-center z-10 group-hover:scale-110 transition-transform shadow-[0_4px_12px_rgba(15,23,42,0.05)]">
                  <UserCheck size={20} />
                </div>
                <span className="text-label-caps text-on-surface text-center w-24">Dept Manager</span>
              </div>
              
              {/* Connector */}
              <div className="h-[2px] w-12 bg-outline-variant -ml-4 -mr-4 mt-[-24px] z-0"></div>
              
              {/* Stage 3 (Active Selection) */}
              <div className="flex flex-col items-center gap-[8px] relative group cursor-pointer">
                <div className="w-12 h-12 rounded-full border-2 border-primary bg-secondary-container text-primary flex items-center justify-center z-10 shadow-[0_4px_12px_rgba(15,23,42,0.05)] ring-4 ring-primary-fixed">
                  <ListChecks size={24} />
                </div>
                <span className="text-label-caps text-primary text-center w-28 font-bold">QA Controller</span>
              </div>
              
              {/* Connector */}
              <div className="h-[2px] w-12 bg-outline-variant -ml-4 -mr-4 mt-[-28px] z-0"></div>
              
              {/* Stage 4 */}
              <div className="flex flex-col items-center gap-[8px] relative group cursor-pointer">
                <div className="w-10 h-10 rounded-full border-2 border-outline-variant bg-surface-container-lowest text-outline-variant flex items-center justify-center z-10 border-dashed group-hover:border-solid transition-all">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-label-caps text-on-surface-variant text-center w-24">QA Manager</span>
              </div>
              
              {/* Connector */}
              <div className="h-[2px] w-12 bg-outline-variant -ml-4 -mr-4 mt-[-24px] z-0"></div>
              
              {/* Stage 5 */}
              <div className="flex flex-col items-center gap-[8px] relative group cursor-pointer">
                <div className="w-10 h-10 rounded-full border-2 border-outline-variant bg-surface-container-lowest text-outline-variant flex items-center justify-center z-10 border-dashed group-hover:border-solid transition-all">
                  <CheckCircle size={20} />
                </div>
                <span className="text-label-caps text-on-surface-variant text-center w-24">Effective</span>
              </div>
              
            </div>
          </div>
          
          {/* Stage Configuration (Bento Bottom Right) */}
          <div className="flex-1 bg-surface-container-lowest border border-outline-variant rounded overflow-y-auto shadow-sm">
            <div className="p-[24px] border-b border-outline-variant sticky top-0 bg-surface-container-lowest z-10">
              <div className="flex items-center gap-[8px] mb-[4px]">
                <ListChecks size={20} className="text-primary" />
                <h3 className="text-title-sm text-on-surface">QA Controller Configuration</h3>
              </div>
              <p className="text-body-sm text-on-surface-variant">Configure role requirements and SLA for this stage.</p>
            </div>
            
            <div className="p-[24px] space-y-[40px]">
              {/* Role Assignment */}
              <div>
                <label className="block text-label-caps text-on-surface-variant mb-[8px]">ASSIGNED ROLES</label>
                <div className="border border-outline-variant rounded p-[8px] flex flex-wrap gap-[8px]">
                  <div className="bg-surface-container-low px-[8px] py-[4px] rounded flex items-center gap-[4px] border border-outline-variant">
                    <span className="text-body-sm text-on-surface">QA Specialist I</span>
                    <X size={14} className="cursor-pointer text-on-surface-variant hover:text-error" />
                  </div>
                  <div className="bg-surface-container-low px-[8px] py-[4px] rounded flex items-center gap-[4px] border border-outline-variant">
                    <span className="text-body-sm text-on-surface">QA Specialist II</span>
                    <X size={14} className="cursor-pointer text-on-surface-variant hover:text-error" />
                  </div>
                  <button className="px-[8px] py-[4px] border border-dashed border-primary text-primary rounded text-body-sm flex items-center gap-[4px] hover:bg-surface-container-low">
                    <Plus size={14} /> Add Role
                  </button>
                </div>
              </div>
              
              {/* Settings Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[24px]">
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-[8px]">MINIMUM APPROVERS</label>
                  <input className="w-full h-[36px] border border-outline-variant rounded px-[8px] text-body-md focus:border-primary focus:ring-2 focus:ring-primary-fixed focus:outline-none bg-surface-container-lowest text-on-surface" type="number" defaultValue="1" />
                </div>
                <div>
                  <label className="block text-label-caps text-on-surface-variant mb-[8px]">SLA TIMEOUT (DAYS)</label>
                  <input className="w-full h-[36px] border border-outline-variant rounded px-[8px] text-body-md focus:border-primary focus:ring-2 focus:ring-primary-fixed focus:outline-none bg-surface-container-lowest text-on-surface" type="number" defaultValue="3" />
                </div>
              </div>
              
              {/* Toggles */}
              <div className="space-y-[16px]">
                <label className="flex items-center gap-[16px] cursor-pointer">
                  <input defaultChecked className="w-4 h-4 text-primary focus:ring-primary border-outline-variant rounded bg-surface-container-lowest" type="checkbox" />
                  <span className="text-body-md text-on-surface">Require Re-authentication (21 CFR Part 11)</span>
                </label>
                <label className="flex items-center gap-[16px] cursor-pointer">
                  <input className="w-4 h-4 text-primary focus:ring-primary border-outline-variant rounded bg-surface-container-lowest" type="checkbox" />
                  <span className="text-body-md text-on-surface">Allow Return to Previous Stage</span>
                </label>
              </div>
              
            </div>
          </div>
          
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
